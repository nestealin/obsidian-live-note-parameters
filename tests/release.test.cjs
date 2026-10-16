const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('release identity and compatibility metadata are consistent',()=>{
 const pkg=require('../package.json'),manifest=require('../manifest.json'),versions=require('../versions.json');
 assert.equal(manifest.id,'live-note-parameters');assert.equal(manifest.name,'Live Note Parameters');assert.equal(pkg.version,manifest.version);assert.equal(versions[manifest.version],manifest.minAppVersion);assert.equal(manifest.isDesktopOnly,true);
 assert.ok(fs.readFileSync('CHANGELOG.md','utf8').includes('## '+manifest.version+' '));
});
