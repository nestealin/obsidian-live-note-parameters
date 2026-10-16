"""Verify focus decoration cannot paint over adjacent source quotes."""
import base64,hashlib,json,subprocess,time
from pathlib import Path
CLI='/Applications/Obsidian.app/Contents/MacOS/obsidian-cli'
ROOT=Path(__file__).resolve().parents[1]
NOTE=ROOT.parents[2]/'zz-doc-vars-demo.md'
def cli(*args):
    r=subprocess.run([CLI,'vault=NesDev',*args],capture_output=True,text=True,timeout=25)
    out=r.stdout.strip()
    if r.returncode or out.startswith('Error:'):raise RuntimeError(out[:400] or r.stderr[:400])
    return out

def js(code):
    out=cli('eval','code='+code)
    if not out.startswith('=> '):raise RuntimeError(out[:400])
    return json.loads(out[3:])

before=hashlib.sha256(NOTE.read_bytes()).hexdigest()
previous=js('JSON.stringify(app.workspace.activeLeaf?.id||null)')
leaf=js("(async()=>{const l=app.workspace.getLeaf('tab');await l.setViewState({type:'markdown',state:{file:'zz-doc-vars-demo.md',mode:'preview'},active:true});return JSON.stringify(l.id);})()")
owner='app.workspace.getLeafById('+json.dumps(leaf)+')'
cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':True}))
results=[]
try:
    for mode in ['preview','source']:
        js("(async()=>{const l="+owner+";const state=l.getViewState();await l.setViewState({...state,state:{...state.state,mode:"+json.dumps(mode)+",source:false}});return true;})()")
        time.sleep(.15)
        code=r"""(()=>{const v=OWNER.view,r=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;
const input=r.querySelector('pre input[data-ndv-key=REGION],.HyperMD-codeblock input[data-ndv-key=REGION]');
if(!input)throw Error('Missing code input');input.focus();input.select();
const scope=input.closest('pre,.HyperMD-codeblock'),rect=input.getBoundingClientRect(),style=getComputedStyle(input);
const walker=input.ownerDocument.createTreeWalker(scope,4),quotes=[];
while(walker.nextNode()){const node=walker.currentNode;for(let i=0;i<node.nodeValue.length;i++)if(node.nodeValue[i]==='"'){
const range=input.ownerDocument.createRange();range.setStart(node,i);range.setEnd(node,i+1);const q=range.getBoundingClientRect();
if(Math.abs(q.y-rect.y)<rect.height)quotes.push({left:q.left,right:q.right});range.detach();}}
const left=quotes.filter(q=>q.right<=rect.left+.5).sort((a,b)=>b.right-a.right)[0];
const right=quotes.filter(q=>q.left>=rect.right-.5).sort((a,b)=>a.left-b.left)[0];
const outset=style.outlineStyle==='none'?0:parseFloat(style.outlineWidth)+Math.max(0,parseFloat(style.outlineOffset));
return JSON.stringify({documentFocused:input.ownerDocument.hasFocus(),focusPseudo:input.matches(':focus'),focused:input===input.ownerDocument.activeElement,selected:input.selectionStart===0&&input.selectionEnd===input.value.length,leftQuote:!!left,rightQuote:!!right,leftGap:left?rect.left-left.right:null,rightGap:right?right.left-rect.right:null,outset,shadow:style.boxShadow});})()""".replace('OWNER',owner)
        result=js(code);results.append({'mode':mode,**result})
        assert result['documentFocused'] and result['focusPseudo'] and result['focused'] and result['selected'] and result['leftQuote'] and result['rightQuote'],result
        assert result['outset']<=min(result['leftGap'],result['rightGap'])+.5,result
        assert 'inset' in result['shadow'],result
        clip=js("(()=>{const v="+owner+".view,root=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;const input=root.querySelector('pre input[data-ndv-key=REGION],.HyperMD-codeblock input[data-ndv-key=REGION]');const r=input.closest('pre,.HyperMD-codeblock').getBoundingClientRect();const x=Math.max(0,r.x-4),y=Math.max(0,r.y-(v.getMode()==='preview'?8:46));return JSON.stringify({x,y,width:Math.min(900,r.width+8,v.containerEl.getBoundingClientRect().right-x,innerWidth-x),height:Math.min(innerHeight-y,v.getMode()==='preview'?r.height+16:100),scale:1});})()")
        capture=cli('dev:cdp','method=Page.captureScreenshot','params='+json.dumps({'format':'png','captureBeyondViewport':False,'clip':clip}))
        if capture.startswith('=> '):capture=capture[3:]
        (ROOT/'evidence'/('focus-'+mode+'.png')).write_bytes(base64.b64decode(json.loads(capture)['data']))
        # Native code copy must still include both source quotes while the variable is selected.
        js("(()=>{const v="+owner+".view;const r=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;const button=v.getMode()==='preview'?[...r.querySelectorAll('pre')].find(p=>p.querySelector('input.ndv-input')).querySelector('.copy-code-button'):r.querySelector('.code-block-flair');button.click();return true;})()")
        copied=js('(async()=>JSON.stringify(await navigator.clipboard.readText()))()')
        assert '--regions="us-central1"' in copied,copied
    assert hashlib.sha256(NOTE.read_bytes()).hexdigest()==before
    receipt={'date':'2026-10-16','focusCondition':'CDP focus emulation with :focus asserted','stylesheetSha256':hashlib.sha256((ROOT/'styles.css').read_bytes()).hexdigest(),'modes':results,'sourceUnchanged':True,'nativeCopyQuotesPreserved':True}
    (ROOT/'evidence/focus.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(receipt,ensure_ascii=False,indent=2))
finally:
    cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':False}))
    js("(()=>{const l="+owner+";if(l)l.detach();const old=app.workspace.getLeafById("+json.dumps(previous)+");if(old)app.workspace.setActiveLeaf(old);return true;})()")
