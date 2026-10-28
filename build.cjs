const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'dist');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync(path.join(root,'style.css'),'utf8')+'</style>');
html=html.replace('href="icon.svg"',()=>`href="data:image/svg+xml;base64,${fs.readFileSync(path.join(root,'icon.svg')).toString('base64')}"`);
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>'<script>'+fs.readFileSync(path.join(root,file),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
fs.writeFileSync(path.join(__dirname,'试玩.html'),html);
console.log('Offline preview written: '+path.join(__dirname,'试玩.html'));

// Version every production asset so an HTML refresh cannot reuse old game rules.
const crypto=require('node:crypto');
const publishDir=path.join(__dirname,'docs');
fs.mkdirSync(publishDir,{recursive:true});
for(const file of fs.readdirSync(root))if(fs.statSync(path.join(root,file)).isFile())fs.copyFileSync(path.join(root,file),path.join(publishDir,file));
let published=fs.readFileSync(path.join(root,'index.html'),'utf8');
published=published.replace(/(src|href)="([^"?]+\.(?:js|css|svg))(?:\?[^" ]*)?"/g,(_,attr,file)=>{const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,12);return `${attr}="${file}?v=${hash}"`;});
fs.writeFileSync(path.join(publishDir,'index.html'),published);
