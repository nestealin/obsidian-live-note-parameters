const TOKEN = /\{\{([A-Za-z_][A-Za-z0-9_]*)\}\}/g;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
function parseDocument(source) {
  const blocks = [];
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) || [];
  let offset = 0, open = null;
  for (const raw of lines) {
    const text = raw.replace(/\r?\n$/, '');
    const match = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(text);
    if (!open && match) {
      open = {from:offset, bodyFrom:offset+raw.length, fence:match[1], enabled:/(?:^|\s)docvars(?:\s|$)/.test(match[2])};
    } else if (open && match && match[1][0] === open.fence[0] && match[1].length >= open.fence.length && !match[2].trim()) {
      blocks.push({...open, bodyTo:offset, to:offset+raw.length, body:source.slice(open.bodyFrom,offset)});
      open = null;
    }
    offset += raw.length;
  }
  if (open) blocks.push({...open, bodyTo:source.length, to:source.length, body:source.slice(open.bodyFrom), enabled:false});
  const comments = [...source.matchAll(/<!--[\s\S]*?-->/g)].map(m=>({from:m.index,to:m.index+m[0].length,text:m[0]}));
  const declarations=comments.filter(c=>/^<!--\s*doc-vars\s/.test(c.text) && !blocks.some(b=>c.from>=b.from && c.from<b.to));
  let defaults=null, error=null;
  if (declarations.length) {
    try {
      if(declarations.length!==1) throw new Error('只允许一个 doc-vars 声明');
      const d=JSON.parse(declarations[0].text.replace(/^<!--\s*doc-vars\s*/, '').replace(/-->$/, '').trim());
      if (!d || Array.isArray(d) || typeof d!=='object') throw new Error('默认值必须是 JSON 对象');
      for (const [key,value] of Object.entries(d)) {
        if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || ['__proto__','prototype','constructor'].includes(key)) throw new Error('变量名不合法');
        if(typeof value!=='string' || /[\x00-\x1f\x7f]/.test(value) || value.length>512) throw new Error('值必须是 512 字以内的单行文本');
      }
      defaults=d;
    } catch(e) { error=e.message; }
  }
  const tokens=[];
  if(defaults) for(const match of source.matchAll(TOKEN)) {
    const from=match.index,to=from+match[0].length;
    if(!own(defaults,match[1]) || comments.some(c=>from>=c.from&&from<c.to)) continue;
    const block=blocks.find(b=>from>=b.from&&from<b.to);
    if(block && (!block.enabled || from<block.bodyFrom || to>block.bodyTo)) continue;
    tokens.push({from,to,key:match[1]});
  }
  return {defaults,error,blocks,tokens};
}
function getValue(session,key) {
  return session.values.has(key)?session.values.get(key):session.defaults[key];
}
function resolveText(text,session) {
  return text.replace(TOKEN,(raw,key)=>own(session.defaults,key)?getValue(session,key):raw);
}
class SessionStore {
  constructor(){this.sessions=new WeakMap();}
  get(leaf,path,defaults){
    let session=this.sessions.get(leaf);const signature=JSON.stringify(defaults);
    if(!session || session.path!==path || session.signature!==signature) {
      session={path,signature,defaults,values:new Map()};this.sessions.set(leaf,session);
    }
    return session;
  }
  forget(leaf){this.sessions.delete(leaf);}
}
function protectedPath(path){return /(?:^|\/)(?:\.private|\.secrets|\.ssh|\.aws|\.kube|\.azure|\.gnupg)(?:\/|$)|(?:^|\/)(?:\.env(?:\..*)?|\.netrc|\.npmrc|\.edgerc|credentials(?:\..*)?)$|(?:--private|-private)\.md$/i.test(path);}
module.exports={TOKEN,parseDocument,resolveText,getValue,SessionStore,protectedPath};
