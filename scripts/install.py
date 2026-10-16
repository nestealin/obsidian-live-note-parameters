"""Install immutable release code assets only; defaults to dry-run."""
import argparse,datetime,hashlib,json,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser()
p.add_argument('--vault-path',required=True,type=Path)
p.add_argument('--assets-dir',required=True,type=Path)
p.add_argument('--config-dir',default='.obsidian')
p.add_argument('--apply',action='store_true')
a=p.parse_args()
assert a.vault_path.is_dir(),'Vault directory missing'
assert not Path(a.config_dir).is_absolute() and '..' not in Path(a.config_dir).parts,'Invalid config directory'
assert (a.vault_path/a.config_dir).is_dir(),'Obsidian config directory missing'
manifest=json.loads((a.assets_dir/'manifest.json').read_text())
assert manifest['id']=='live-note-parameters','Unexpected plugin ID'
expected={line.split('  ',1)[1]:line.split('  ',1)[0] for line in (a.assets_dir/'SHA256SUMS').read_text().splitlines()}
assets={}
for name in ['main.js','manifest.json','styles.css']:
    data=(a.assets_dir/name).read_bytes();digest=hashlib.sha256(data).hexdigest()
    assert expected[name]==digest,'Asset checksum mismatch: '+name
    assets[name]={'sha256':digest,'bytes':len(data)}
dest=a.vault_path/a.config_dir/'plugins/live-note-parameters'
if (dest/'manifest.json').exists():assert json.loads((dest/'manifest.json').read_text())['id']=='live-note-parameters'
record={'version':manifest['version'],'target':str(dest),'apply':a.apply,'assets':assets}
if a.apply:
    stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f')
    receipt=ROOT/'run-data/install'/a.vault_path.name/stamp
    receipt.mkdir(parents=True,exist_ok=False)
    dest.mkdir(parents=True,exist_ok=True)
    for name in assets:
        target=dest/name
        if target.exists() and target.read_bytes()!=(a.assets_dir/name).read_bytes():shutil.copyfile(target,receipt/name)
        shutil.copyfile(a.assets_dir/name,target)
        assert hashlib.sha256(target.read_bytes()).hexdigest()==assets[name]['sha256']
    (receipt/'receipt.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
