const YAML = require('yaml');
const TOKEN = /\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function validateDefaults(value) {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('默认值必须是字符串映射');
  for (const [key, text] of Object.entries(value)) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || ['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('参数名不合法');
    if (typeof text !== 'string' || /[\x00-\x1f\x7f]/.test(text) || text.length > 512) throw new Error('值必须是 512 字以内的单行文本');
  }
  return value;
}
function frontmatter(source) {
  const start = /^(?:\uFEFF)?---[ \t]*\r?\n/.exec(source);
  if (!start) return null;
  const end = /^(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/gm;
  end.lastIndex = start[0].length;
  const close = end.exec(source);
  if (!close) throw new Error('Frontmatter 缺少结束分隔线');
  return {from: 0, contentFrom: start[0].length, contentTo: close.index, to: end.lastIndex};
}
function parseDocument(source) {
  const blocks = [], lines = source.match(/[^\n]*\n|[^\n]+$/g) || [];
  let offset = 0, open = null;
  for (const raw of lines) {
    const text = raw.replace(/\r?\n$/, ''), match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(text);
    if (!open && match) open = {from: offset, bodyFrom: offset + raw.length, fence: match[1], enabled: /(?:^|\s)docvars(?:\s|$)/.test(match[2])};
    else if (open && match && match[1][0] === open.fence[0] && match[1].length >= open.fence.length && !match[2].trim()) {
      blocks.push({...open, bodyTo: offset, to: offset + raw.length, body: source.slice(open.bodyFrom, offset)}); open = null;
    }
    offset += raw.length;
  }
  if (open) blocks.push({...open, bodyTo: source.length, to: source.length, body: source.slice(open.bodyFrom), enabled: false});
  const comments = [...source.matchAll(/<!--[\s\S]*?-->/g)].map(m => ({from: m.index, to: m.index + m[0].length, text: m[0]}));
  let defaults = null, error = null, header = null, definition = null, legacy = null;
  try {
    header = frontmatter(source);
    if (header) {
      const doc = YAML.parseDocument(source.slice(header.contentFrom, header.contentTo), {uniqueKeys: true});
      if (doc.errors.length) throw new Error('Frontmatter YAML 无效或有重复键');
      if (doc.contents && !YAML.isMap(doc.contents)) throw new Error('Frontmatter 必须是映射');
      const pair = doc.contents?.items.find(p => p.key?.value === 'doc_vars');
      if (pair) {
        if (!YAML.isMap(pair.value)) throw new Error('doc_vars 必须是字符串映射');
        if (pair.value.anchor || pair.value.items.some(p => p.value?.anchor || YAML.isAlias(p.value))) throw new Error('doc_vars 不支持 YAML 锚点或别名');
        defaults = validateDefaults(pair.value.toJSON());
        const from = header.contentFrom + pair.key.range[0];
        definition = {from: source.lastIndexOf('\n', from - 1) + 1, to: header.contentFrom + pair.value.range[2], kind: 'frontmatter'};
      }
    }
    const declarations = comments.filter(c => /^<!--\s*doc-vars\s/.test(c.text) && (!header || c.from >= header.to) && !blocks.some(b => c.from >= b.from && c.from < b.to));
    if (declarations.length > 1 || (declarations.length && defaults)) throw new Error('定义冲突：只保留一份 doc_vars 或旧版声明');
    if (declarations.length) {
      legacy = declarations[0];
      defaults = validateDefaults(JSON.parse(legacy.text.replace(/^<!--\s*doc-vars\s*/, '').replace(/-->$/, '').trim()));
      definition = {...legacy, kind: 'legacy'};
    }
  } catch (e) { error = e.message; defaults = null; }
  const references = [];
  if (defaults) for (const match of source.matchAll(TOKEN)) {
    const from = match.index, to = from + match[0].length;
    if ((header && from < header.to) || comments.some(c => from >= c.from && from < c.to)) continue;
    const block = blocks.find(b => from >= b.from && from < b.to);
    if (block && (!block.enabled || from < block.bodyFrom || to > block.bodyTo)) continue;
    references.push({from, to, key: match[1]});
  }
  return {defaults, error, header, definition, legacy, blocks, references, tokens: references.filter(t => own(defaults, t.key)), unknown: [...new Set(references.filter(t => !own(defaults, t.key)).map(t => t.key))]};
}
function definitionStamp(parsed, source) {
  return JSON.stringify([parsed.error, parsed.defaults, parsed.definition && source.slice(parsed.definition.from, parsed.definition.to)]);
}
function editDefinitions(source, baseSource, rows, {migrate = false} = {}) {
  const current = parseDocument(source), base = parseDocument(baseSource);
  if (current.error) throw new Error(current.error);
  if (definitionStamp(current, source) !== definitionStamp(base, baseSource)) throw new Error('参数定义已变化，请取消草稿后重新编辑');
  if (current.legacy && !migrate) throw new Error('请先预览并迁移旧版声明');
  const defaults = {}, originals = new Set(), renames = new Map();
  for (const row of rows) {
    if (own(defaults, row.key)) throw new Error('参数名重复');
    validateDefaults({[row.key]: row.value});
    defaults[row.key] = row.value;
    if (row.original) {
      if (!own(current.defaults || {}, row.original) || originals.has(row.original)) throw new Error('原参数已变化');
      originals.add(row.original);
      if (row.original !== row.key) renames.set(row.original, row.key);
    }
  }
  for (const key of Object.keys(current.defaults || {})) {
    if (!originals.has(key) && current.references.some(t => t.key === key)) throw new Error('参数仍有引用，不能删除：' + key);
  }
  if (renames.size && source.slice(current.header?.to || 0) !== baseSource.slice(base.header?.to || 0)) throw new Error('引用内容已变化，请重新检查重命名范围');
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const mapping = Object.keys(defaults).length ? 'doc_vars:' + eol + Object.entries(defaults).map(([key, value]) => '  ' + key + ': ' + JSON.stringify(value)).join(eol) + eol : 'doc_vars: {}' + eol;
  const changes = current.references.filter(t => renames.has(t.key)).map(t => ({from: t.from, to: t.to, text: '{{' + renames.get(t.key) + '}}'}));
  if (current.definition?.kind === 'frontmatter') changes.push({...current.definition, text: mapping});
  else {
    if (current.legacy) changes.push({...current.legacy, text: ''});
    if (current.header) changes.push({from: current.header.contentTo, to: current.header.contentTo, text: mapping});
    else changes.push({from: 0, to: 0, text: '---' + eol + mapping + '---' + eol});
  }
  let next = source;
  for (const change of changes.sort((a, b) => b.from - a.from)) next = next.slice(0, change.from) + change.text + next.slice(change.to);
  const verified = parseDocument(next);
  if (verified.error || JSON.stringify(verified.defaults) !== JSON.stringify(defaults)) throw new Error('新定义未通过解析验证');
  return {source: next, changes: changes.sort((a,b) => a.from-b.from), renames: [...renames]};
}
function getValue(session, key) { return session.values.has(key) ? session.values.get(key) : session.defaults[key]; }
function resolveText(text, session) { return text.replace(TOKEN, (raw, key) => own(session.defaults, key) ? getValue(session, key) : raw); }
class SessionStore {
  constructor() { this.sessions = new WeakMap(); }
  get(leaf, path, defaults) {
    let session = this.sessions.get(leaf);
    if (!session || session.path !== path) { session = {path, defaults, values: new Map()}; this.sessions.set(leaf, session); }
    else {
      session.defaults = defaults;
      for (const key of session.values.keys()) if (!own(defaults, key)) session.values.delete(key);
    }
    return session;
  }
  forget(leaf) { this.sessions.delete(leaf); }
}
function protectedPath(path) { return /(?:^|\/)(?:\.private|\.secrets|\.ssh|\.aws|\.kube|\.azure|\.gnupg)(?:\/|$)|(?:^|\/)(?:\.env(?:\..*)?|\.netrc|\.npmrc|\.edgerc|credentials(?:\..*)?)$|(?:--private|-private)\.md$/i.test(path); }
module.exports = {TOKEN, parseDocument, editDefinitions, definitionStamp, validateDefaults, resolveText, getValue, SessionStore, protectedPath};
