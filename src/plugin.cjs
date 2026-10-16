const {Plugin,MarkdownView,MarkdownRenderChild,Notice,editorInfoField,editorLivePreviewField}=require('obsidian');
const {ViewPlugin,Decoration,WidgetType}=require('@codemirror/view');
const {parseDocument,resolveText,getValue,SessionStore,protectedPath}=Core;

class VariableWidget extends WidgetType {
  constructor(plugin,owner,session,key){super();this.plugin=plugin;this.owner=owner;this.session=session;this.key=key;}
  eq(other){return other.session===this.session && other.key===this.key;}
  toDOM(view){return this.plugin.input(this.owner,this.session,this.key,view.dom.ownerDocument);}
  ignoreEvent(){return true;}
}
class ReadingVariables extends MarkdownRenderChild {
  constructor(el,plugin,ctx){super(el);this.plugin=plugin;this.ctx=ctx;this.cancelled=false;}
  async onload(){
    // Post-processing can run before the section is attached to a workspace leaf.
    for(let attempt=0;attempt<4&&!this.cancelled;attempt++){
      const owner=this.plugin.ownerOf(this.containerEl,this.ctx.sourcePath);
      if(owner){await this.plugin.decorateReading(this.containerEl,owner,this.ctx,this);return;}
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
  }
  onunload(){this.cancelled=true;}
}
module.exports=class DocVariablesDemo extends Plugin {
  async onload(){
    this.active=true;this.sessions=new SessionStore();this.preSources=new WeakMap();this.editorByDom=new WeakMap();
    const plugin=this;
    this.registerEditorExtension(ViewPlugin.fromClass(class {
      constructor(view){this.view=view;plugin.editorByDom.set(view.dom,view);this.decorations=this.build(view);}
      update(update){
        if(update.docChanged||update.viewportChanged||update.selectionSet||update.transactions.some(t=>t.reconfigured)) this.decorations=this.build(update.view);
      }
      build(view){
        if(!view.state.field(editorLivePreviewField,false))return Decoration.none;
        const info=view.state.field(editorInfoField,false);
        if(!(info instanceof MarkdownView)||!info.file||protectedPath(info.file.path))return Decoration.none;
        const parsed=parseDocument(view.state.doc.toString());
        if(!parsed.defaults)return Decoration.none;
        const session=plugin.sessions.get(info.leaf,info.file.path,parsed.defaults);
        const ranges=[];
        for(const token of parsed.tokens){
          if(!view.visibleRanges.some(r=>token.from>=r.from&&token.to<=r.to))continue;
          // A caret inside a token reveals the original Markdown for authoring.
          if(view.state.selection.ranges.some(r=>r.empty&&r.from>token.from&&r.from<token.to))continue;
          ranges.push(Decoration.replace({widget:new VariableWidget(plugin,info,session,token.key)}).range(token.from,token.to));
        }
        return Decoration.set(ranges,true);
      }
      destroy(){plugin.editorByDom.delete(this.view.dom);}
    },{decorations:v=>v.decorations}));
    this.registerMarkdownPostProcessor((el,ctx)=>{
      if(!protectedPath(ctx.sourcePath))ctx.addChild(new ReadingVariables(el,this,ctx));
    },100);
    this.registerEvent(this.app.workspace.on('file-open',()=>{
      this.app.workspace.getLeavesOfType('markdown').forEach(leaf=>{
        const old=this.sessions.sessions.get(leaf);
        if(old&&old.path!==leaf.view.file?.path)this.sessions.forget(leaf);
      });
    }));
    this.registerEvent(this.app.workspace.on('layout-change',()=>{
      const live=new Set(this.app.workspace.getLeavesOfType('markdown'));
      // Only retained leaf objects own state; no path-global or workspace state is serialized.
      for(const leaf of live)if(!leaf.view.file)this.sessions.forget(leaf);
      this.scheduleSync();
    }));
    this.registerEvent(this.app.workspace.on('active-leaf-change',()=>this.scheduleSync()));
    this.bindDocument(this.app.workspace.containerEl.ownerDocument);
    this.addCommand({id:'reset-tab',name:'重置当前标签页变量',callback:()=>{
      const view=this.app.workspace.getActiveViewOfType(MarkdownView);if(!view?.file)return;
      const session=this.sessions.sessions.get(view.leaf);if(!session)return;
      session.values.clear();this.syncInputs(view,session);new Notice('已恢复本标签页默认值');
    }});
  }
  scheduleSync(){
    // Obsidian may cache Reading DOM outside containerEl while Live Preview is active.
    // Reconcile controls when the cached view is attached again, retaining tab state.
    requestAnimationFrame(()=>{
      if(!this.active)return;
      this.app.workspace.getLeavesOfType('markdown').forEach(leaf=>{
        const session=this.sessions.sessions.get(leaf);
        if(session&&leaf.view.file?.path===session.path)this.syncInputs(leaf.view,session);
      });
    });
  }
  ownerOf(el,path){
    return this.app.workspace.getLeavesOfType('markdown').map(l=>l.view).find(v=>v instanceof MarkdownView && v.file?.path===path && v.containerEl.contains(el));
  }
  input(owner,session,key,document){
    const input=document.createElement('input');input.type='text';input.className='ndv-input';input.dataset.ndvKey=key;
    input.value=getValue(session,key);input.placeholder=key;input.setAttribute('aria-label',key+'（仅本标签页）');
    input.setAttribute('title',key+' · 仅本标签页；Esc 恢复默认值');input.autocomplete='off';input.spellcheck=false;input.maxLength=512;
    input.addEventListener('input',()=>{session.values.set(key,input.value);this.syncInputs(owner,session,input);});
    input.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();session.values.delete(key);this.syncInputs(owner,session);}
      if(e.key==='Enter'){e.preventDefault();input.blur();}
      e.stopPropagation();
    });
    input.addEventListener('pointerdown',e=>e.stopPropagation());
    input.addEventListener('click',e=>e.stopPropagation());
    return input;
  }
  syncInputs(owner,session,except){
    owner.containerEl.querySelectorAll('input.ndv-input').forEach(input=>{
      if(input===except)return;const key=input.dataset.ndvKey;
      if(!Object.prototype.hasOwnProperty.call(session.defaults,key))return;
      input.value=getValue(session,key);
    });
  }
  async decorateReading(el,owner,ctx,component){
    if(!owner.file||protectedPath(owner.file.path))return;
    const path=owner.file.path;
    const source=await this.app.vault.cachedRead(owner.file);
    if(!this.active||component.cancelled||owner.file?.path!==path||!el.isConnected)return;
    const parsed=parseDocument(source);if(!parsed.defaults)return;
    const session=this.sessions.get(owner.leaf,path,parsed.defaults);
    // Code blocks retain native <pre>/<code> structure and copy controls.
    const pres=[...(el.matches?.('pre')?[el]:[]),...el.querySelectorAll('pre')];
    for(const pre of pres){
      const code=pre.querySelector('code');if(!code||this.preSources.has(pre))continue;
      const raw=code.textContent;
      const info=ctx.getSectionInfo(pre);
      let block;
      if(info){
        const lines=source.split('\n');
        const from=lines.slice(0,info.lineStart).join('\n').length+(info.lineStart?1:0);
        const to=lines.slice(0,info.lineEnd+1).join('\n').length+1;
        block=parsed.blocks.find(b=>b.from>=from&&b.from<to);
      }
      if(!block){
        const matches=parsed.blocks.filter(b=>b.body.replace(/\r?\n$/,'')===raw.replace(/\r?\n$/,''));
        // Ambiguous source stays raw rather than touching an unrelated example.
        if(matches.length===1)block=matches[0];
      }
      if(!block?.enabled)continue;
      this.preSources.set(pre,{raw,owner,session});
      const decorate=()=>this.replaceTextNodes(code,owner,session);
      // Obsidian highlights code asynchronously after post-processors. Decorating earlier
      // makes Prism read input.textContent (empty), destroying both token and control.
      if(code.classList.contains('is-loaded')||!code.className.includes('language-'))decorate();
      else {
        const observer=new MutationObserver(()=>{
          if(code.classList.contains('is-loaded')){observer.disconnect();decorate();}
        });
        observer.observe(code,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});
        component.register(()=>observer.disconnect());
      }
    }
    // Only prose/inline-code text, excluding links, HTML, examples, and interactive controls.
    const document=el.ownerDocument;const walker=document.createTreeWalker(el,4);const nodes=[];
    while(walker.nextNode()){
      const node=walker.currentNode,parent=node.parentElement;
      if(parent&&!parent.closest('pre,input,button,a,script,style,textarea,.ndv-input')&&/\{\{/.test(node.nodeValue))nodes.push(node);
    }
    for(const node of nodes)this.replaceNode(node,owner,session);
  }
  replaceTextNodes(el,owner,session){
    const document=el.ownerDocument,walker=document.createTreeWalker(el,4),nodes=[];
    let source='';
    while(walker.nextNode()){
      const node=walker.currentNode;nodes.push({node,from:source.length,to:source.length+node.nodeValue.length});source+=node.nodeValue;
    }
    const matches=[...source.matchAll(/\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g)].filter(m=>Object.prototype.hasOwnProperty.call(session.defaults,m[1]));
    for(const m of matches.reverse()){
      const from=m.index,to=from+m[0].length;
      const start=nodes.find(n=>n.from<=from&&n.to>from),end=nodes.find(n=>n.from<to&&n.to>=to);
      if(!start||!end)continue;
      const range=document.createRange();range.setStart(start.node,from-start.from);range.setEnd(end.node,to-end.from);
      range.deleteContents();range.insertNode(this.input(owner,session,m[1],document));range.detach();
    }
  }
  replaceNode(node,owner,session){
    const text=node.nodeValue,document=node.ownerDocument,fragment=document.createDocumentFragment();let offset=0,changed=false;
    for(const m of text.matchAll(/\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g)){
      if(!Object.prototype.hasOwnProperty.call(session.defaults,m[1]))continue;
      fragment.append(document.createTextNode(text.slice(offset,m.index)),this.input(owner,session,m[1],document));offset=m.index+m[0].length;changed=true;
    }
    if(changed){fragment.append(document.createTextNode(text.slice(offset)));node.replaceWith(fragment);}
  }
  bindDocument(document){
    this.registerDomEvent(document,'click',event=>{
      const target=event.target?.closest?.('.copy-code-button,.code-block-flair');if(!target)return;
      const pre=target.closest('pre'),record=pre&&this.preSources.get(pre);
      if(record){this.copy(event,resolveText(record.raw,record.session),record.owner.containerEl.ownerDocument);return;}
      const editorDom=target.closest('.cm-editor'),cm=editorDom&&this.editorByDom.get(editorDom);if(!cm)return;
      const info=cm.state.field(editorInfoField,false);if(!(info instanceof MarkdownView)||!info.file||protectedPath(info.file.path))return;
      const parsed=parseDocument(cm.state.doc.toString());if(!parsed.defaults)return;
      let pos;try{pos=cm.posAtDOM(target);}catch{return;}
      const line=cm.state.doc.lineAt(pos),block=parsed.blocks.find(b=>line.from>=b.from&&line.from<b.to);
      if(!block?.enabled)return;
      this.copy(event,resolveText(block.body.replace(/\r?\n$/,''),this.sessions.get(info.leaf,info.file.path,parsed.defaults)),document);
    },true);
  }
  copy(event,text,document){
    event.preventDefault();event.stopImmediatePropagation();
    document.defaultView.navigator.clipboard.writeText(text).then(()=>new Notice('已复制渲染后的代码'),()=>new Notice('复制失败，请重试'));
  }
  onunload(){
    this.active=false;
    this.app.workspace.getLeavesOfType('markdown').forEach(leaf=>{
      const view=leaf.view;if(!(view instanceof MarkdownView))return;
      view.containerEl.querySelectorAll('input.ndv-input').forEach(input=>input.replaceWith(input.ownerDocument.createTextNode('{{'+input.dataset.ndvKey+'}}')));
    });
  }
};
