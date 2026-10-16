"""Scoped real-host helpers. Only explicitly selected synthetic fixtures are used."""
import argparse,hashlib,json,subprocess,time
from pathlib import Path
CLI='/Applications/Obsidian.app/Contents/MacOS/obsidian-cli'
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--vault',default='NesDev')
parser.add_argument('--vault-path',required=True,type=Path)
parser.add_argument('--fixture',default='zz-live-note-parameters-mvp.md')
args=parser.parse_args()
NOTE=args.vault_path/args.fixture
assert NOTE.is_file() and args.fixture=='zz-live-note-parameters-mvp.md','Use only the dedicated synthetic fixture'
(ROOT/'evidence').mkdir(exist_ok=True)

def cli(*items):
    r=subprocess.run([CLI,'vault='+args.vault,*items],capture_output=True,text=True,timeout=25)
    out=r.stdout.strip()
    if r.returncode or out.startswith('Error:'):raise RuntimeError(out[:400] or r.stderr[:400])
    return out

def js(code):
    out=cli('eval','code='+code)
    if not out.startswith('=> '):raise RuntimeError(out[:400])
    return json.loads(out[3:])

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def view(leaf):return 'app.workspace.getLeafById('+json.dumps(leaf)+').view'
def create():
    return js("(async()=>{const l=app.workspace.getLeaf('tab');await l.setViewState({type:'markdown',state:{file:"+json.dumps(args.fixture)+",mode:'preview'},active:true});return JSON.stringify(l.id);})()")
def activate(leaf):
    js('(()=>{app.workspace.setActiveLeaf('+view(leaf)+'.leaf);return true;})()');time.sleep(.15)
def mode(leaf,kind,source=False):
    activate(leaf)
    js("(async()=>{const v="+view(leaf)+";const s=v.leaf.getViewState();await v.leaf.setViewState({...s,state:{...s.state,mode:"+json.dumps(kind)+",source:"+json.dumps(source)+"}});return true;})()")
    time.sleep(.25)
def root(leaf):return '(('+view(leaf)+").getMode()==='preview'?"+view(leaf)+'.previewMode.containerEl:'+view(leaf)+'.editor.cm.dom)'
def scroll_code(leaf):
    js("(()=>{const v="+view(leaf)+";if(v.getMode()==='source'){const at=v.editor.getValue().indexOf('gcloud compute');v.editor.scrollIntoView({from:v.editor.offsetToPos(at),to:v.editor.offsetToPos(at+50)},true);}return true;})()")
    time.sleep(.15)
def values(leaf,key='PROJECT_ID'):
    activate(leaf)
    return js('JSON.stringify([...'+root(leaf)+".querySelectorAll('input[data-ndv-key="+key+"]')].map(e=>e.value))")
def type_value(leaf,text,key='PROJECT_ID'):
    activate(leaf);scroll_code(leaf)
    js("(()=>{const r="+root(leaf)+";const e=r.querySelector('pre input[data-ndv-key="+key+"],.HyperMD-codeblock input[data-ndv-key="+key+"]');if(!e)throw Error('Missing code input');e.focus();e.select();return true;})()")
    cli('dev:cdp','method=Input.insertText','params='+json.dumps({'text':text},ensure_ascii=False));time.sleep(.15)
def copied(leaf,kind='block'):
    activate(leaf)
    js('(async()=>{await navigator.clipboard.writeText("__LNP_COPY_PENDING__");return true;})()')
    code="""(()=>{const v=VIEW,r=ROOT;let button;
if(KIND==='block')button=v.getMode()==='preview'?r.querySelector('pre:has(input.ndv-input) .copy-code-button'):r.querySelector('.code-block-flair');
else if(v.getMode()==='preview'){const codes=[...r.querySelectorAll('code')].filter(c=>!c.closest('pre'));button=codes.find(c=>c.textContent.includes(KIND==='inline'?'gcloud --project':'ordinary-inline-code'))?.querySelector('.copy-to-clipboard-icon');}
else button=[...r.querySelectorAll('.copy-to-clipboard-icon')].find(e=>e.closest('.cm-line')?.textContent.includes(KIND==='inline'?'行内命令':'普通行内代码'));
if(!button)throw Error('Missing '+KIND+' copy button');button.click();return true;})()""".replace('VIEW',view(leaf)).replace('ROOT',root(leaf)).replace('KIND',json.dumps(kind))
    js(code);time.sleep(.08)
    return js('(async()=>JSON.stringify(await navigator.clipboard.readText()))()')
def cleanup(leaves,previous):
    cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':False}))
    js("(()=>{for(const id of "+json.dumps(leaves)+"){app.workspace.getLeafById(id)?.detach();}const old=app.workspace.getLeafById("+json.dumps(previous)+");if(old)app.workspace.setActiveLeaf(old);return true;})()")
