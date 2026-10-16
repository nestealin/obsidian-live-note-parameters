"""Dual-mode runtime and existing Copy Inline Code compatibility on synthetic data."""
from host import *
results={}
def check(name,condition):
    if not condition:raise AssertionError(name)
    results[name]=True
before=sha(NOTE);previous=js('JSON.stringify(app.workspace.activeLeaf?.id||null)');leaves=[]
try:
    cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':True}))
    first=create();leaves.append(first);time.sleep(.3)
    expected=NOTE.read_text().count('{{PROJECT_ID}}')
    for kind in ['preview','source']:
        mode(first,kind);scroll_code(first)
        check(kind+'_widgets',len(values(first))>=3)
        value=kind+'-中文-team';type_value(first,value)
        check(kind+'_native_input_sync',all(v==value for v in values(first)))
        block=copied(first)
        if not (('--project="'+value+'"') in block and '--regions="us-central1"' in block and '{{' not in block):raise AssertionError({'mode':kind,'copied':block})
        check(kind+'_native_block_copy',True)
        check(kind+'_existing_inline_copy',copied(first,'inline')=='gcloud --project="'+value+'" --region="us-central1"')
        ordinary=copied(first,'ordinary')
        if ordinary!='ordinary-inline-code':raise AssertionError({'mode':kind,'ordinaryCopied':ordinary})
        check(kind+'_ordinary_inline_copy',True)
        check(kind+'_runtime_source_unchanged',sha(NOTE)==before)
        second=create();leaves.append(second);time.sleep(.2)
        check(kind+'_new_tab_defaults',values(second)==['demo-project']*expected)
        check(kind+'_original_tab_retains_override',all(v==value for v in values(first)))
        mode(first,'preview');check(kind+'_mode_switch_retains_value',all(v==value for v in values(first)))
    mode(first,'source',True);check('source_mode_no_widgets',values(first)==[])
    check('source_mode_original_tokens',js('JSON.stringify('+view(first)+".editor.getValue().includes('{{PROJECT_ID}}'))"))
    mode(first,'source',False);check('return_to_live_retains_value',all(v=='source-中文-team' for v in values(first)))
    check('no_plugin_data_file',not (args.vault_path/'.obsidian/plugins/live-note-parameters/data.json').exists())
    check('source_bytes_unchanged',sha(NOTE)==before)
    report={'fixtureSha256':before,'bundleSha256':sha(ROOT/'main.js'),'checks':results,'vault':args.vault}
    (ROOT/'evidence/runtime.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'passed':len(results),'checks':results},ensure_ascii=False,indent=2))
finally:cleanup(leaves,previous)
