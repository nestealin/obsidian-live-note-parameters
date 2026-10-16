import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const hash=data=>createHash('sha256').update(data).digest('hex');
const manifest=JSON.parse(await readFile('manifest.json','utf8'));
const pkg=JSON.parse(await readFile('package.json','utf8'));
const versions=JSON.parse(await readFile('versions.json','utf8'));
if(manifest.id!=='live-note-parameters'||pkg.version!==manifest.version||versions[manifest.version]!==manifest.minAppVersion)throw Error('Version metadata mismatch');
const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dir='dist/'+manifest.version;
await mkdir(dir,{recursive:true});
async function immutable(path,bytes){
  let existing;try{existing=await readFile(path);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(existing&&!existing.equals(Buffer.from(bytes)))throw Error('Refusing to replace an existing release asset: '+path);
  if(!existing)await writeFile(path,bytes,{flag:'wx'});
}
const assets=[];
for(const name of ['main.js','manifest.json','styles.css']){
 const bytes=await readFile(name);await immutable(dir+'/'+name,bytes);assets.push({name,sha256:hash(bytes),bytes:bytes.length});
}
await immutable(dir+'/SHA256SUMS',assets.map(a=>a.sha256+'  '+a.name).join('\n')+'\n');
const record={schemaVersion:1,version:manifest.version,sourceCommit:source,assets};
await immutable(dir+'/artifact.json',JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record,null,2));
