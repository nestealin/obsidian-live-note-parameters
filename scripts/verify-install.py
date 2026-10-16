"""Read-only main-vault acceptance using the project's synthetic usage note."""
import argparse,hashlib,json,subprocess,time
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--vault',default='NesVault');p.add_argument('--vault-path',required=True,type=Path);a=p.parse_args()
ROOT=Path(__file__).resolve().parents[1];PATH='09_自研项目/live-note-parameters/live-note-parameters--使用示例.md';NOTE=a.vault_path/PATH
CLI='/Applications/Obsidian.app/Contents/MacOS/obsidian-cli'
def cli(*items):
 r=subprocess.run([CLI,'vault='+a.vault,*items],capture_output=True,text=True,timeout=25);out=r.stdout.strip()
 if r.returncode or out.startswith('Error:'):raise RuntimeError(out[:300] or r.stderr[:300])
 return out
def js(code):
 out=cli('eval','code='+code);lines=[line for line in out.splitlines() if line.startswith('=> ')];assert lines,out;return json.loads(lines[-1][3:])
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
checks={};previous=js('JSON.stringify(app.workspace.activeLeaf?.id||null)');leaves=[];before=sha(NOTE)
def check(name,value):
 assert value,name;checks[name]=True
try:
 cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':True}))
 first=js("(async()=>{const l=app.workspace.getLeaf('tab');await l.setViewState({type:'markdown',state:{file:"+json.dumps(PATH)+",mode:'preview'},active:true});return JSON.stringify(l.id);})()");leaves.append(first)
 v='app.workspace.getLeafById('+json.dumps(first)+').view'
 for mode in ['preview','source']:
  js("(async()=>{const v="+v+";const s=v.leaf.getViewState();await v.leaf.setViewState({...s,state:{...s.state,mode:"+json.dumps(mode)+",source:false}});app.workspace.setActiveLeaf(v.leaf);return true;})()");time.sleep(.4)
  root='('+v+".getMode()==='preview'?"+v+'.previewMode.containerEl:'+v+'.editor.cm.dom)'
  if mode=='source':js('(()=>{const v='+v+';const at=v.editor.getValue().indexOf("gcloud compute");v.editor.scrollIntoView({from:v.editor.offsetToPos(at),to:v.editor.offsetToPos(at+40)},true);return true;})()');time.sleep(.2)
  check(mode+'_fields',js('JSON.stringify('+root+'.querySelectorAll("input[data-ndv-key=PROJECT_ID]").length>=3)'))
  value=mode+'-main-中文'
  js('(()=>{const e='+root+'.querySelector("pre input[data-ndv-key=PROJECT_ID],.HyperMD-codeblock input[data-ndv-key=PROJECT_ID]");if(!e)throw Error("Missing field");e.focus();e.select();return true;})()')
  cli('dev:cdp','method=Input.insertText','params='+json.dumps({'text':value},ensure_ascii=False));time.sleep(.15)
  actual=js('JSON.stringify({values:[...'+root+'.querySelectorAll("input[data-ndv-key=PROJECT_ID]")].map(e=>e.value),active:document.activeElement?.className,focused:document.hasFocus(),session:[...app.plugins.plugins["live-note-parameters"].sessions.sessions.get('+v+'.leaf).values]})')
  if not all(text==value for text in actual['values']):raise AssertionError(actual)
  check(mode+'_same_tab_sync',True)
  for kind in ['block','inline','ordinary']:
   js('(async()=>{await navigator.clipboard.writeText("__LNP_COPY_PENDING__");return true;})()')
   code="""(()=>{const v=VIEW,r=ROOT;let b;
if(KIND==='block')b=v.getMode()==='preview'?r.querySelector('pre:has(input.ndv-input) .copy-code-button'):r.querySelector('.code-block-flair');
else if(v.getMode()==='preview')b=[...r.querySelectorAll('code')].filter(c=>!c.closest('pre')).find(c=>c.textContent.includes(KIND==='inline'?'gcloud --project':'ordinary-inline-code'))?.querySelector('.copy-to-clipboard-icon');
else b=[...r.querySelectorAll('.copy-to-clipboard-icon')].find(e=>e.closest('.cm-line')?.textContent.includes(KIND==='inline'?'行内命令':'普通行内代码'));
if(!b)throw Error('Missing '+KIND+' copy');b.click();return true;})()""".replace('VIEW',v).replace('ROOT',root).replace('KIND',json.dumps(kind))
   js(code);text=js('(async()=>JSON.stringify(await navigator.clipboard.readText()))()')
   if kind=='ordinary':check(mode+'_ordinary_copy',text=='ordinary-inline-code')
   elif kind=='block':check(mode+'_block_copy','--project="'+value+'"' in text and '--regions="us-central1"' in text and '{{' not in text)
   else:check(mode+'_inline_copy',text=='gcloud --project="'+value+'" --region="us-central1"')
  if mode=='source':check('main_parameter_manager',js('JSON.stringify(!!'+v+'.containerEl.querySelector(".lnp-manager"))'))
 second=js("(async()=>{const l=app.workspace.getLeaf('tab');await l.setViewState({type:'markdown',state:{file:"+json.dumps(PATH)+",mode:'preview'},active:true});return JSON.stringify(l.id);})()");leaves.append(second);time.sleep(.25)
 check('main_new_tab_defaults',js('JSON.stringify([...app.workspace.getLeafById('+json.dumps(second)+').view.previewMode.containerEl.querySelectorAll("input[data-ndv-key=PROJECT_ID]")].every(e=>e.value==="demo-project"))'))
 check('main_source_unchanged',sha(NOTE)==before)
 check('original_copy_plugin_loaded',js('JSON.stringify(!!app.plugins.plugins["copy-inline-code"])'))
 for asset in ['main.js','manifest.json','styles.css']:check('installed_'+asset,sha(a.vault_path/'.obsidian/plugins/live-note-parameters'/asset)==sha(ROOT/'dist/0.1.0'/asset))
 report={'vault':a.vault,'checks':checks,'sourceUnchanged':True,'bundleSha256':sha(ROOT/'dist/0.1.0/main.js')}
 (ROOT/'evidence/main-install.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'passed':len(checks),'checks':checks},ensure_ascii=False,indent=2))
finally:
 cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':False}))
 js('(()=>{for(const id of '+json.dumps(leaves)+'){app.workspace.getLeafById(id)?.detach();}const old=app.workspace.getLeafById('+json.dumps(previous)+');if(old)app.workspace.setActiveLeaf(old);return true;})()')
