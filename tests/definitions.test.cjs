const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseDocument,editDefinitions,SessionStore,resolveText}=require('../src/core.cjs');
const header='---\ntitle: Keep me # keep comment\ndoc_vars:\n  PROJECT_ID: "demo-project"\n  REGION: "us-central1"\nother: [a, b]\n---\n';
const body='正文 {{PROJECT_ID}} 与 `p="{{PROJECT_ID}}"`\n\n```bash docvars\necho "{{PROJECT_ID}}" "{{REGION}}"\n```\n\n```bash\necho "{{PROJECT_ID}}"\n```\n';
const source=header+body;
const rows=[{original:'PROJECT_ID',key:'PROJECT_ID',value:'new-default'},{original:'REGION',key:'REGION',value:'us-central1'}];
test('Frontmatter defaults and references exclude YAML and static example',()=>{
 const p=parseDocument(source);assert.equal(p.error,null);assert.equal(p.defaults.PROJECT_ID,'demo-project');assert.equal(p.tokens.length,4);
});
test('quoted dates, empty strings, colon and CJK remain strings',()=>{
 const s='---\ndoc_vars: {DATE: "2026-10-16", EMPTY: "", VALUE: "中文: $&"}\n---\n{{DATE}} {{EMPTY}} {{VALUE}}';
 assert.deepEqual(parseDocument(s).defaults,{DATE:'2026-10-16',EMPTY:'',VALUE:'中文: $&'});
});
test('duplicate YAML keys, non-string defaults and conflicting declarations fail closed',()=>{
 for(const s of ['---\ndoc_vars:\n  A: x\n  A: y\n---\n','---\ndoc_vars: {A: 123}\n---\n','---\ndoc_vars: {}\ndoc_vars: {}\n---\n',header+'<!-- doc-vars {"A":"x"} -->'])assert.ok(parseDocument(s).error,s);
});
test('definition save preserves unrelated frontmatter and body verbatim',()=>{
 const next=editDefinitions(source,source,rows).source;
 assert.ok(next.includes('title: Keep me # keep comment\n'));assert.ok(next.includes('other: [a, b]\n'));assert.ok(next.endsWith(body));assert.equal(parseDocument(next).defaults.PROJECT_ID,'new-default');
});
test('renaming changes eligible references atomically and leaves static examples alone',()=>{
 const next=editDefinitions(source,source,[{original:'PROJECT_ID',key:'PROJECT',value:'demo-project'},rows[1]]).source;
 assert.equal(parseDocument(next).defaults.PROJECT,'demo-project');assert.equal((next.match(/\{\{PROJECT\}\}/g)||[]).length,3);assert.ok(next.includes('```bash\necho "{{PROJECT_ID}}"\n```'));
});
test('renaming swaps names once without cascading replacements',()=>{
 const s='---\ndoc_vars: {A: "a", B: "b"}\n---\n{{A}} {{B}}';
 const next=editDefinitions(s,s,[{original:'A',key:'B',value:'a'},{original:'B',key:'A',value:'b'}]).source;
 assert.ok(next.endsWith('{{B}} {{A}}'));
});
test('referenced deletion, duplicate names, prototype names and multiline values are refused',()=>{
 assert.throws(()=>editDefinitions(source,source,[rows[1]]),/引用|reference/);
 for(const invalid of [[{key:'A',value:'x'},{key:'A',value:'y'}],[{key:'__proto__',value:'x'}],[{key:'A',value:'line\nnext'}]])assert.throws(()=>editDefinitions('', '',invalid));
});
test('stale definition drafts cannot overwrite a concurrent change',()=>{
 assert.throws(()=>editDefinitions(source.replace('demo-project','external'),source,rows),/变化|changed|冲突/);
 const next=editDefinitions(source+'Unrelated edit\n',source,rows).source;assert.ok(next.endsWith('Unrelated edit\n'));
});
test('rename detects a stale body instead of replacing unseen references',()=>{
 assert.throws(()=>editDefinitions(source+'{{PROJECT_ID}}',source,[{original:'PROJECT_ID',key:'NEW',value:'x'},rows[1]]),/变化|changed|冲突/);
});
test('comment migration is explicit, removes the old declaration and preserves body',()=>{
 const s='<!-- doc-vars {"A":"old"} -->\nText {{A}}\n';
 assert.throws(()=>editDefinitions(s,s,[{original:'A',key:'A',value:'old'}]),/迁移|migration/);
 const next=editDefinitions(s,s,[{original:'A',key:'A',value:'old'}],{migrate:true}).source;
 assert.ok(next.startsWith('---\n'));assert.ok(!next.includes('<!-- doc-vars'));assert.ok(next.endsWith('\nText {{A}}\n'));assert.equal(parseDocument(next).defaults.A,'old');
});
test('new definitions insert into existing frontmatter without rewriting other fields',()=>{
 const s='---\ntitle: existing\n---\nBody';const next=editDefinitions(s,s,[{key:'A',value:'x'}]).source;
 assert.ok(next.includes('title: existing\n'));assert.ok(next.endsWith('Body'));assert.equal(parseDocument(next).defaults.A,'x');
});
test('CRLF and YAML closing delimiter remain intact',()=>{
 const s=source.replace(/\n/g,'\r\n');const next=editDefinitions(s,s,rows).source;
 assert.ok(!/(?<!\r)\n/.test(next));assert.ok(next.endsWith(body.replace(/\n/g,'\r\n')));
});
test('default edits preserve tab overrides and update untouched keys',()=>{
 const store=new SessionStore(),a={},b={};const session=store.get(a,'x.md',{A:'a',B:'b'});session.values.set('A','override');
 assert.equal(store.get(a,'x.md',{A:'new-a',B:'new-b'}),session);
 assert.equal(resolveText('{{A}}/{{B}}',session),'override/new-b');
 assert.equal(resolveText('{{A}}',store.get(b,'x.md',{A:'new-a'})),'new-a');
 store.get(a,'x.md',{B:'b'});assert.equal(session.values.has('A'),false);
});
test('unknown references are diagnosed only within eligible contexts',()=>{
 const p=parseDocument('---\ndoc_vars: {A: "a"}\n---\n{{UNKNOWN}}\n```text\n{{STATIC}}\n```');assert.deepEqual(p.unknown,['UNKNOWN']);
});
