// Recria app/produtos.json a partir de dados/estoque-linhas.json usando scripts/regras.js
const fs=require('fs');const R=require('./regras.js');
const rows=JSON.parse(fs.readFileSync(__dirname+'/../dados/estoque-linhas.json','utf8'));
const cat=R.buildCatalog(rows);
const old=JSON.parse(fs.readFileSync(__dirname+'/../app/produtos.json','utf8'));
fs.writeFileSync(__dirname+'/../app/produtos.json',JSON.stringify({ts:Date.now(),fonte:old.fonte,itens:cat}));
const by={};cat.forEach(i=>i.k.forEach(k=>by[k]=(by[k]||0)+1));
console.log(cat.length+' produtos, '+Object.keys(by).length+' problemas');
