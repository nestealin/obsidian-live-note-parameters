const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseDocument, resolveText, SessionStore, protectedPath } = require('../src/core.cjs');
const note = '<!-- doc-vars {"PROJECT_ID":"demo-project","REGION":"us-central1"} -->\n正文 {{PROJECT_ID}}\n\n```bash docvars\ngcloud --project="{{PROJECT_ID}}" --region="{{REGION}}"\n```\n\n```bash\necho "{{PROJECT_ID}}"\n```';
test('opt-in blocks and prose resolve while static examples stay literal', () => {
  const parsed = parseDocument(note);
  assert.equal(parsed.error, null);
  assert.equal(parsed.tokens.length, 3);
  assert.equal(parsed.blocks.filter(b => b.enabled).length, 1);
});
test('same leaf synchronizes, a new leaf starts with defaults, navigation resets', () => {
  const store = new SessionStore(); const a = {}, b = {};
  const defaults = {PROJECT_ID:'demo-project'};
  const first = store.get(a, 'demo.md', defaults);
  first.values.set('PROJECT_ID','synthetic-team');
  assert.equal(resolveText('{{PROJECT_ID}}', store.get(a,'demo.md', defaults)), 'synthetic-team');
  assert.equal(resolveText('{{PROJECT_ID}}', store.get(b,'demo.md', defaults)), 'demo-project');
  store.get(a,'other.md', defaults);
  assert.equal(resolveText('{{PROJECT_ID}}',store.get(a,'demo.md', defaults)), 'demo-project');
});
test('empty values, replacement metacharacters and unknown names are preserved safely', () => {
  const session={defaults:{A:'default',B:'value'},values:new Map([['A',''],['B','<img>$&`']])};
  assert.equal(resolveText('{{A}}/{{B}}/{{UNKNOWN}}',session), '/<img>$&`/{{UNKNOWN}}');
});
test('declarations inside fences, malformed JSON and prototype keys fail closed', () => {
  assert.equal(parseDocument('```html\n<!-- doc-vars {"A":"x"} -->\n```').defaults, null);
  assert.ok(parseDocument('<!-- doc-vars {bad} -->').error);
  assert.ok(parseDocument('<!-- doc-vars {"__proto__":"x"} -->').error);
});
test('CRLF, longer fences, inline syntax and single-line input validation', () => {
  const p=parseDocument('<!-- doc-vars {"A":"x"} -->\r\n~~~~bash docvars\r\necho {{A}}\r\n~~~~\r\n`{{A}}`');
  assert.equal(p.tokens.length,2);
  assert.equal(p.blocks[0].body,'echo {{A}}\r\n');
  assert.ok(parseDocument('<!-- doc-vars {"A":"line\\nnext"} -->').error);
});

test('protected Markdown paths are excluded before content access', () => {
  for (const path of ['.PRIVATE/a.md','a/.secrets/b.md','a/note--private.md','a/note-private.md','.ssh/example.md','a/credentials.md','a/.env.example']) assert.equal(protectedPath(path),true);
  assert.equal(protectedPath('docs/normal.md'),false);
});
