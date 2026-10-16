import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
const license=await readFile('LICENSE','utf8');
const yamlLicense=await readFile('node_modules/yaml/LICENSE','utf8');
await build({entryPoints:['src/plugin.cjs'],bundle:true,outfile:'main.js',format:'cjs',platform:'browser',target:'es2022',minify:true,external:['obsidian','@codemirror/view','@codemirror/language','@codemirror/state','@codemirror/commands'],legalComments:'eof',banner:{js:'/* Live Note Parameters — generated from src/\n'+license+'\nBundled yaml:\n'+yamlLicense+'\n*/'}});
console.log('Built main.js');
