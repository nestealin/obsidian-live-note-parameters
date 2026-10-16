"""Measure actual Demo input geometry in isolated test tabs; no note writes."""
import hashlib,json,subprocess,time
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
leaf=None;samples=[]
try:
    leaf=js("(async()=>{const l=app.workspace.getLeaf('tab');await l.setViewState({type:'markdown',state:{file:'zz-doc-vars-demo.md',mode:'preview'},active:true});return JSON.stringify(l.id);})()")
    owner="app.workspace.getLeavesOfType('markdown').find(l=>l.id==="+json.dumps(leaf)+')'
    cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':True}))
    for mode in ['preview','source']:
        js("(async()=>{const l="+owner+";const s=l.getViewState();await l.setViewState({...s,state:{...s.state,mode:"+json.dumps(mode)+",source:false}});return true;})()")
        time.sleep(.2)
        if mode=='source':
            # CM only mounts widgets inside its viewport. Make the first syntax block visible.
            js("(()=>{const v="+owner+".view,source=v.editor.getValue(),at=source.indexOf('gcloud compute');const line=source.slice(0,at).split('\\n').length-1;v.editor.scrollIntoView({from:{line,ch:0},to:{line:line+3,ch:0}},true);return true;})()")
            time.sleep(.12)
        for value in ['demo-234','us-central1','ops','iiiWWW','中文项目','']:
            # Geometry checks use the real input handler without changing keyboard focus.
            js("(()=>{const v="+owner+".view;const r=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;const e=r.querySelector('pre input[data-ndv-key=PROJECT_ID],.HyperMD-codeblock input[data-ndv-key=PROJECT_ID]');if(!e)throw Error(JSON.stringify({mode:v.getMode(),keys:[...r.querySelectorAll('input.ndv-input')].map(x=>x.dataset.ndvKey),selection:v.editor?.cm?.state?.selection?.main?.head}));e.value="+json.dumps(value,ensure_ascii=False)+";e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()")
            rows=js("(()=>{const v="+owner+".view;const r=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;return JSON.stringify([...r.querySelectorAll('input[data-ndv-key=PROJECT_ID]')].filter(e=>e.offsetWidth>0).map(e=>{const s=getComputedStyle(e),c=e.ownerDocument.createElement('canvas').getContext('2d');c.font=s.font;const width=c.measureText(e.value||e.placeholder).width;return {value:e.value,inCode:!!e.closest('pre,.HyperMD-codeblock'),gap:parseFloat(s.width)-width,padding:parseFloat(s.paddingLeft)+parseFloat(s.paddingRight),width:e.getBoundingClientRect().width,scrollLeft:e.scrollLeft};}));})()")
            assert len(rows)>=2 and any(r['inCode'] for r in rows),(mode,value,len(rows))
            assert all(r['value']==value for r in rows),(mode,value,'sync')
            assert all(-.75<=r['gap']<=2 and r['padding']<=2 for r in rows),(mode,value,rows)
            samples.append({'mode':mode,'value':value,'maxContentGapPx':max(r['gap'] for r in rows),'inputs':len(rows)})
    assert hashlib.sha256(NOTE.read_bytes()).hexdigest()==before
    receipt={'date':'2026-10-16','samples':samples,'noteUnchanged':True,'cases':len(samples),'bounds':'content gap <= 2px, horizontal padding <= 2px'}
    (ROOT/'evidence/width.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(receipt,ensure_ascii=False,indent=2))
finally:
    if leaf:
        cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':False}))
        js("(()=>{const l="+owner+";if(l)l.detach();const old=app.workspace.getLeafById("+json.dumps(previous)+");if(old)app.workspace.setActiveLeaf(old);return true;})()")
