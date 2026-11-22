import re,json
p='app/index.html';s=open(p).read()
seed=open('app/produtos.json').read().replace('</','<\\/')
js=open('scripts/regras.js').read().split("if(typeof module")[0]+open('scripts/fichas.js').read()+open('scripts/app.js').read()
s=re.sub(r'(<script id="seed" type="application/json">).*?(</script>)\n','',s,flags=re.S)
s=re.sub(r'<script>\n\{.*\n\}\n</script>',lambda m:f'<script id="seed" type="application/json">{seed}</script>\n<script>\n{{\n{js}\n}}\n</script>',s,flags=re.S)
open(p,'w').write(s)
