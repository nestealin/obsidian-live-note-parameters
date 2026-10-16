const {Modal,Notice,editorLivePreviewField}=require('obsidian');
const {parseDocument,definitionStamp,editDefinitions,protectedPath}=require('./core.cjs');
function element(document,tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
class ParameterManager {
  constructor(plugin){this.plugin=plugin;this.records=new WeakMap();this.actions=new Map();}
  source(owner){return owner.editor.getValue();}
  open(owner){
    if(!owner?.file||protectedPath(owner.file.path))return;
    if(owner.getMode()!=='source'||!owner.editor.cm?.state.field(editorLivePreviewField,false)){new Notice('请在实时预览模式中管理参数');return;}
    this.sync(owner,true);const record=this.records.get(owner);record.root.open=true;
  }
  sync(owner,force=false){
    if(!owner?.file||protectedPath(owner.file.path))return;
    if(!this.actions.has(owner))this.actions.set(owner,owner.addAction('sliders-horizontal','管理笔记参数',()=>this.open(owner)));
    const cm=owner.editor.cm;if(owner.getMode()!=='source'||!cm?.state.field(editorLivePreviewField,false)){this.records.get(owner)?.root.remove();return;}
    const source=this.source(owner),parsed=parseDocument(source);
    let record=this.records.get(owner);
    if(!parsed.defaults&&!parsed.error&&!force&&!record)return;
    if(!record){
      record={root:element(cm.dom.ownerDocument,'details','lnp-manager'),dirty:false,force,baseSource:source};
      this.records.set(owner,record);cm.dom.parentElement.insertBefore(record.root,cm.dom);
    }else if(!record.root.isConnected)cm.dom.parentElement.insertBefore(record.root,cm.dom);
    if(record.path&&record.path!==owner.file.path){record.dirty=false;record.stamp=null;record.root.open=false;}
    record.path=owner.file.path;
    const stamp=definitionStamp(parsed,source);
    if(record.dirty){if(stamp!==record.stamp)record.message.textContent='定义已在其它位置变化；保存会被阻止，请取消草稿后重新编辑。';return;}
    if(record.stamp===stamp&&record.baseSource===source&&!force)return;
    record.baseSource=source;record.stamp=stamp;record.parsed=parsed;
    record.rows=Object.entries(parsed.defaults||{}).map(([key,value])=>({original:key,key,value}));
    this.render(owner,record);
  }
  render(owner,record){
    const root=record.root,document=root.ownerDocument,open=root.open;root.replaceChildren();root.open=open;
    const summary=element(document,'summary',null,'笔记参数 · '+record.rows.length+' 个');root.append(summary);
    root.append(element(document,'p','lnp-help','正文中的输入仅用于本标签页；这里维护笔记中保存的默认值。'));
    record.message=element(document,'p','lnp-message');record.message.setAttribute('aria-live','polite');root.append(record.message);
    if(record.parsed.error){record.message.textContent=record.parsed.error;return;}
    if(record.parsed.legacy)root.append(element(document,'p','lnp-help','当前使用旧版注释声明；保存前请预览并迁移到 Frontmatter。'));
    const table=element(document,'table','lnp-definitions'),head=element(document,'thead'),tr=element(document,'tr');
    for(const label of ['参数名','默认值','引用','操作'])tr.append(element(document,'th',null,label));head.append(tr);table.append(head);
    const body=element(document,'tbody');table.append(body);root.append(table);
    const mark=()=>{record.dirty=true;summary.textContent='笔记参数 · '+record.rows.length+' 个 · 未保存';this.preview(record);};
    for(const row of record.rows){
      const line=element(document,'tr');
      for(const [field,cls,label]of [['key','lnp-definition-key','参数名'],['value','lnp-definition-value','默认值']]){
        const cell=element(document,'td'),input=element(document,'input',cls);input.type='text';input.value=row[field];input.maxLength=field==='key'?128:512;input.setAttribute('aria-label',label);input.spellcheck=false;
        input.addEventListener('input',()=>{row[field]=input.value;mark();});cell.append(input);line.append(cell);
      }
      const refs=record.parsed.references.filter(t=>t.key===row.original),count=element(document,'td');count.append(this.button(document,String(refs.length),()=>{
        const latest=parseDocument(this.source(owner)),token=latest.references.find(t=>t.key===(row.original||row.key));if(!token)return;
        owner.editor.setSelection(owner.editor.offsetToPos(token.from),owner.editor.offsetToPos(token.to));owner.editor.scrollIntoView({from:owner.editor.offsetToPos(token.from),to:owner.editor.offsetToPos(token.to)},true);owner.editor.focus();
      },'lnp-locate'));line.append(count);
      const actions=element(document,'td','lnp-row-actions');
      actions.append(this.button(document,'插入',()=>{
        if(record.dirty||!row.original){record.message.textContent='请先保存定义，再插入引用。';return;}
        owner.editor.replaceSelection('{{'+row.key+'}}');owner.editor.focus();
      }));
      actions.append(this.button(document,'删除',()=>{
        if(refs.length){record.message.textContent='参数仍有 '+refs.length+' 处引用，请先处理引用。';return;}
        record.rows=record.rows.filter(item=>item!==row);record.dirty=true;this.render(owner,record);this.preview(record);
      },'lnp-delete'));line.append(actions);body.append(line);
    }
    const actions=element(document,'div','lnp-manager-actions');root.append(actions);
    actions.append(this.button(document,'新增参数',()=>{
      let n=1,key='NEW_PARAM';while(record.rows.some(r=>r.key===key))key='NEW_PARAM_'+n++;
      record.rows.push({key,value:''});record.dirty=true;this.render(owner,record);this.preview(record);
    },'lnp-add'));
    actions.append(this.button(document,record.parsed.legacy?'预览迁移':'保存定义',()=>{
      if(record.parsed.legacy)this.migrate(owner,record);else this.save(owner,record,false);
    },'lnp-save'));
    actions.append(this.button(document,'取消',()=>{record.dirty=false;record.stamp=null;this.sync(owner,true);},'lnp-cancel'));
    this.preview(record);
  }
  button(document,text,callback,cls){const b=element(document,'button',cls,text);b.type='button';b.addEventListener('click',callback);return b;}
  preview(record){
    if(!record.dirty)return;
    const changes=record.rows.filter(r=>r.original&&r.original!==r.key).map(r=>r.original+' 改为 '+r.key+'（'+record.parsed.references.filter(t=>t.key===r.original).length+' 处引用）');
    record.message.textContent=changes.length?'重命名预览：'+changes.join('；'):'草稿未保存';
  }
  save(owner,record,migrate){
    if(record.path!==owner.file?.path){record.message.textContent='当前笔记已变化，请重新打开参数管理。';return false;}
    try{
      const result=editDefinitions(this.source(owner),record.baseSource,record.rows,{migrate});
      this.plugin.applyDefinitionEdit(owner,result);
      record.dirty=false;record.stamp=null;this.sync(owner,true);record.message.textContent='定义已保存，可使用撤销恢复。';return true;
    }catch(error){record.message.textContent=error.message;return false;}
  }
  migrate(owner,record){
    let result;try{result=editDefinitions(this.source(owner),record.baseSource,record.rows,{migrate:true});}catch(e){record.message.textContent=e.message;return;}
    const modal=new Modal(this.plugin.app);modal.titleEl.textContent='迁移参数定义';
    modal.contentEl.append(element(modal.contentEl.ownerDocument,'p',null,'将删除旧版 doc-vars 注释，并写入以下 Frontmatter 默认值。可通过一次撤销恢复。'));
    const pre=element(modal.contentEl.ownerDocument,'pre','lnp-migration-preview');pre.textContent=result.source.slice(0,parseDocument(result.source).header.to);modal.contentEl.append(pre);
    modal.contentEl.append(this.button(modal.contentEl.ownerDocument,'迁移并保存',()=>{if(this.save(owner,record,true))modal.close();},'mod-cta'));
    modal.open();
  }
  destroy(){
    for(const [owner,action]of this.actions){this.records.get(owner)?.root.remove();action.remove();}
    this.actions.clear();
  }
}
module.exports={ParameterManager};
