"""Controlled NesDev-only smoke test; never runs commands from Markdown."""
import hashlib,json,subprocess,time
from pathlib import Path
CLI='/Applications/Obsidian.app/Contents/MacOS/obsidian-cli'
ROOT=Path(__file__).resolve().parents[1]
NOTE=ROOT.parents[2]/'zz-doc-vars-demo.md'
PATH='zz-doc-vars-demo.md'
results={}
def cli(*args):
    result=subprocess.run([CLI,'vault=NesDev',*args],capture_output=True,text=True,timeout=25)
    out=result.stdout.strip()
    if result.returncode or out.startswith('Error:'): raise RuntimeError(out[:400] or result.stderr[:400])
    return out

def js(code):
    out=cli('eval','code='+code)
    if not out.startswith('=> '): raise RuntimeError(out[:400])
    return json.loads(out[3:])

def check(name,condition):
    if not condition: raise AssertionError(name)
    results[name]=True

base=hashlib.sha256(NOTE.read_bytes()).hexdigest()
owner="app.workspace.getLeavesOfType('markdown').find(l=>l.id==="
previous=js('JSON.stringify(app.workspace.activeLeaf?.id||null)')
first=js("(async()=>{const leaf=app.workspace.getLeaf('tab');await leaf.setViewState({type:'markdown',state:{file:'zz-doc-vars-demo.md',mode:'preview'},active:true});return JSON.stringify(leaf.id);})()")
second=None
expected=NOTE.read_text().count('{{PROJECT_ID}}')
def view(leaf):return owner+json.dumps(leaf)+').view'
def mode(leaf,kind,source=False):
    js("(async()=>{const v="+view(leaf)+";const l=v.leaf,s=l.getViewState();await l.setViewState({...s,state:{...s.state,mode:"+json.dumps(kind)+",source:"+json.dumps(source)+"}});app.workspace.setActiveLeaf(l);return true;})()")
    time.sleep(.2)
def values(leaf):
    # Obsidian unloads Reading DOM for background tabs; activate before a UI assertion.
    js("(()=>{const v="+view(leaf)+";app.workspace.setActiveLeaf(v.leaf);return true;})()")
    time.sleep(.12)
    return js("(()=>{const v="+view(leaf)+";const el=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;return JSON.stringify([...el.querySelectorAll('input[data-ndv-key=PROJECT_ID]')].map(e=>e.value));})()")
def type_into_code(leaf,text):
    js("(()=>{const v="+view(leaf)+";const root=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;const e=root.querySelector('pre input[data-ndv-key=PROJECT_ID],.HyperMD-codeblock input[data-ndv-key=PROJECT_ID]');if(!e)throw Error('Missing input');e.focus();e.select();return true;})()")
    cli('dev:cdp','method=Input.insertText','params='+json.dumps({'text':text},ensure_ascii=False))
    time.sleep(.1)
def copy(leaf,block):
    js("(()=>{const v="+view(leaf)+";const root=v.getMode()==='preview'?v.previewMode.containerEl:v.editor.cm.dom;let buttons;if(v.getMode()==='preview')buttons=[...root.querySelectorAll('pre')].filter(p=>p.querySelector('code.language-bash')).map(p=>p.querySelector('.copy-code-button'));else buttons=[...root.querySelectorAll('.code-block-flair')];buttons["+str(block)+"].click();return true;})()")
    return js('(async()=>JSON.stringify(await navigator.clipboard.readText()))()')
try:
    mode(first,'preview')
    check('reading_code_widgets',len(values(first))==expected)
    type_into_code(first,'reading-中文-team')
    check('reading_native_input_sync',values(first)==['reading-中文-team']*expected)
    text=copy(first,0)
    check('reading_native_copy_resolved','reading-中文-team' in text and '{{PROJECT_ID}}' not in text)
    check('static_example_copy','example-project' in copy(first,1))
    second=js("(async()=>{const leaf=app.workspace.getLeaf('tab');await leaf.setViewState({type:'markdown',state:{file:'zz-doc-vars-demo.md',mode:'preview'},active:true});return JSON.stringify(leaf.id);})()")
    time.sleep(.3)
    check('new_tab_default',values(second)==['demo-project']*expected)
    check('first_tab_retains_value',values(first)==['reading-中文-team']*expected)
    mode(second,'source')
    check('reading_to_live_preview_preserves_default',values(second)==['demo-project']*expected)
    type_into_code(second,'live-中文-team')
    check('live_native_input_sync',values(second)==['live-中文-team']*expected)
    check('two_tabs_isolated',values(first)==['reading-中文-team']*expected)
    text=copy(second,0)
    check('live_native_copy_resolved','live-中文-team' in text and '{{PROJECT_ID}}' not in text)
    mode(second,'preview')
    check('live_to_reading_preserves_value',values(second)==['live-中文-team']*expected)
    mode(second,'source',True)
    check('source_mode_has_no_widgets',values(second)==[])
    check('source_mode_keeps_tokens',js("JSON.stringify("+view(second)+".editor.getValue().includes('{{PROJECT_ID}}'))"))
    mode(second,'source',False)
    check('return_to_live_preserves_value',values(second)==['live-中文-team']*expected)
    check('note_bytes_unchanged',hashlib.sha256(NOTE.read_bytes()).hexdigest()==base)
    # The fixture and source remain for the user; reset only runtime values after testing.
    js("(()=>{const plugin=app.plugins.plugins['nes-doc-vars-demo'];for(const id of "+json.dumps([first,second])+"){const v=app.workspace.getLeavesOfType('markdown').find(l=>l.id===id).view;const session=plugin.sessions.sessions.get(v.leaf);session.values.clear();plugin.syncInputs(v,session);}return true;})()")
    check('no_plugin_data_file',not (ROOT/'data.json').exists())
    report={'date':'2026-10-16','obsidian':'1.13.7','fixtureSha256':base,'bundleSha256':hashlib.sha256((ROOT/'main.js').read_bytes()).hexdigest(),'checks':results,'demoLeaves':[first,second]}
    (ROOT/'evidence/runtime.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2))
finally:
    js("(()=>{for(const id of "+json.dumps([first,second])+"){const l=app.workspace.getLeafById(id);if(l)l.detach();}const previous=app.workspace.getLeafById("+json.dumps(previous)+");if(previous)app.workspace.setActiveLeaf(previous);return true;})()")
