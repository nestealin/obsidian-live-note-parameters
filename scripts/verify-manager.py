"""Exercise the visible Live Preview manager and native undo on the synthetic fixture."""
from host import *
original=NOTE.read_text();before=sha(NOTE);results={};leaves=[];previous=js('JSON.stringify(app.workspace.activeLeaf?.id||null)')
def check(name,condition):
    if not condition:raise AssertionError(name)
    results[name]=True
leaf=None
try:
    cli('dev:cdp','method=Emulation.setFocusEmulationEnabled','params='+json.dumps({'enabled':True}))
    peer=create();leaves.append(peer);time.sleep(.2);type_value(peer,'peer-override')
    leaf=create();leaves.append(leaf);mode(leaf,'source');scroll_code(leaf)
    type_value(leaf,'local-override')
    manager=view(leaf)+'.containerEl.querySelector(".lnp-manager")'
    js('(()=>{const p='+manager+';if(!p)throw Error("Missing manager");p.open=true;return true;})()')
    check('manager_available_in_live_preview',js('JSON.stringify(!!'+manager+')'))
    # Refuse a referenced delete through the actual visible button.
    js('(()=>{'+manager+'.querySelector(".lnp-delete").click();return true;})()')
    check('referenced_delete_refused',js('JSON.stringify('+manager+'.querySelector(".lnp-message").textContent.includes("引用"))'))
    def set_default(value):
        js('(()=>{const e='+manager+'.querySelector(".lnp-definition-value");e.value='+json.dumps(value)+';e.dispatchEvent(new Event("input",{bubbles:true}));return true;})()')
    def save():
        js('(()=>{'+manager+'.querySelector(".lnp-save").click();return true;})()');time.sleep(.25)
    def source():return js('JSON.stringify('+view(leaf)+'.editor.getValue())')
    set_default('new-default');save()
    if 'PROJECT_ID: "new-default"' not in source():raise AssertionError({'source':source(),'state':js('JSON.stringify({message:'+manager+'.querySelector(".lnp-message").textContent,rows:app.plugins.plugins["live-note-parameters"].manager.records.get('+view(leaf)+').rows})')})
    check('visible_default_save',True)
    check('same_tab_override_retained',all(v=='local-override' for v in values(leaf)))
    time.sleep(1.5)
    check('peer_tab_override_retained',all(v=='peer-override' for v in values(peer)))
    fresh=create();leaves.append(fresh);time.sleep(.2)
    check('new_tab_uses_changed_default',all(v=='new-default' for v in values(fresh)))
    activate(leaf)
    js('(()=>{'+view(leaf)+'.editor.undo();return true;})()');time.sleep(.3)
    check('one_undo_restores_definition',source()==original)
    js('(()=>{'+view(leaf)+'.editor.redo();return true;})()');time.sleep(.3)
    check('one_redo_reapplies_definition','PROJECT_ID: "new-default"' in source())
    # Save/cancel works without changing mode or editing YAML manually.
    set_default('cancelled');js('(()=>{'+manager+'.querySelector(".lnp-cancel").click();return true;})()')
    check('cancel_discards_draft','cancelled' not in source())
    # Rename via the visible key input and preview.
    js('(()=>{const e='+manager+'.querySelector(".lnp-definition-key");e.value="PROJECT";e.dispatchEvent(new Event("input",{bubbles:true}));return true;})()')
    check('rename_preview_shown',js('JSON.stringify('+manager+'.querySelector(".lnp-message").textContent.includes("重命名预览"))'))
    save();renamed=source();check('rename_updates_definition_and_references','PROJECT:' in renamed and '{{PROJECT_ID}}' not in renamed and '{{PROJECT}}' in renamed)
    check('rename_retains_runtime_override',all(v=='local-override' for v in values(leaf,'PROJECT')))
    # Add and then remove an unreferenced definition.
    js('(()=>{'+manager+'.querySelector(".lnp-add").click();return true;})()');save()
    check('add_unreferenced_parameter','NEW_PARAM: ""' in source())
    js('(()=>{const rows='+manager+'.querySelectorAll("tbody tr");rows[rows.length-1].querySelector(".lnp-delete").click();return true;})()');save()
    check('delete_unreferenced_parameter','NEW_PARAM' not in source())
    # A concurrent definition edit must not be overwritten by a stale draft.
    set_default('draft-value')
    js('(()=>{const v='+view(leaf)+';const s=v.editor.getValue(),at=s.indexOf("new-default");v.editor.cm.dispatch({changes:{from:at,to:at+11,insert:"external-default"},filter:false});return true;})()');save()
    check('stale_draft_save_refused','external-default' in source() and 'draft-value' not in source())
    check('stale_draft_message',js('JSON.stringify('+manager+'.querySelector(".lnp-message").textContent.includes("变化"))'))
    # Manual YAML changes refresh untouched parameters without clearing overrides.
    js('(()=>{'+manager+'.querySelector(".lnp-cancel").click();const v='+view(leaf)+';const s=v.editor.getValue(),at=s.indexOf("us-central1");v.editor.cm.dispatch({changes:{from:at,to:at+11,insert:"asia-east1"},filter:false});return true;})()');time.sleep(.3)
    check('manual_yaml_refreshes_untouched_parameter',all(v=='asia-east1' for v in values(leaf,'REGION')))
    # Missing definitions block adapted copy instead of copying unresolved commands.
    js('(()=>{const v='+view(leaf)+';const s=v.editor.getValue();const start=s.indexOf("  REGION:"),end=s.indexOf("\\n",start)+1;v.editor.cm.dispatch({changes:{from:start,to:end,insert:""},filter:false});return true;})()');time.sleep(.3)
    check('undefined_parameter_blocks_copy',copied(leaf)=='__LNP_COPY_PENDING__')
    # Explicit migration preview and one native undo back to the legacy source.
    legacy='<!-- doc-vars '+json.dumps({'PROJECT_ID':'demo-project','REGION':'us-central1','NAMESPACE':'default'},separators=(',',':'))+' -->'+original.split('---',2)[2]
    js('(()=>{const v='+view(leaf)+';v.editor.cm.dispatch({changes:{from:0,to:v.editor.cm.state.doc.length,insert:'+json.dumps(legacy,ensure_ascii=False)+'},filter:false});return true;})()');time.sleep(.3)
    js('(()=>{'+manager+'.querySelector(".lnp-save").click();return true;})()')
    modal='[...document.querySelectorAll(".modal")].find(m=>m.querySelector(".modal-title")?.textContent==="迁移参数定义")'
    check('migration_preview_shows_frontmatter',js('JSON.stringify(!!('+modal+')?.querySelector("pre")?.textContent.includes("doc_vars:"))'))
    js('(()=>{('+modal+').querySelector("button.mod-cta").click();return true;})()');time.sleep(.3)
    migrated=source();check('explicit_migration_removes_legacy_declaration',migrated.startswith('---\n') and 'doc_vars:' in migrated and '<!-- doc-vars' not in migrated)
    js('(()=>{'+view(leaf)+'.editor.undo();return true;})()');time.sleep(.2)
    check('migration_one_undo_restores_legacy',source()==legacy)

finally:
    try:
        if leaf:
            # Restore only this dedicated synthetic fixture, including hidden YAML.
            js('(()=>{const v='+view(leaf)+';v.editor.cm.dispatch({changes:{from:0,to:v.editor.cm.state.doc.length,insert:'+json.dumps(original,ensure_ascii=False)+'},filter:false});return JSON.stringify(v.editor.getValue()===('+json.dumps(original,ensure_ascii=False)+'));})()')
            deadline=time.monotonic()+6
            while sha(NOTE)!=before and time.monotonic()<deadline:time.sleep(.2)
    finally:cleanup(leaves,previous)
    assert sha(NOTE)==before,'Synthetic fixture restoration did not reach disk'
report={'checks':results,'vault':args.vault,'bundleSha256':sha(ROOT/'main.js'),'sourceRestored':True}
(ROOT/'evidence/manager.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':len(results),'checks':results,'sourceRestored':True},ensure_ascii=False,indent=2))
