# App Consulta de Produtos — Nova Química

App web (PWA) que roda na TV touch da loja, no celular e no computador: o cliente escreve a sujeira e o app mostra os produtos em estoque, com uso, preço e cuidados.
Publicado no Netlify (site `nova-quimica-consulta`, repositório GitHub `nova-quimica-app`, id `cee2fab3-eb68-4313-a60c-673392c96dfc`), pasta publicada: `app/`. Cada push no `main` publica sozinho — e CADA publicação gasta 15 créditos do Netlify (plano Personal: 1.000/mês). Junte as mudanças e faça no máximo 1 push por dia/sessão; commits só de documentação levam `[skip netlify]` na mensagem para não publicar.

## Como o app é montado
- `scripts/regras.js` — PROBLEMS (problemas/sujeiras: id, label, kw = palavras de busca, inc/exc = regex no NOME do produto, top = lista de regex do MAIS INDICADO em ordem. Regra do dono para a lista: 1º o produto Spartan mais indicado, 2º um Start, 3º um Audax, depois as demais marcas; evitar repetir o mesmo produto como destaque em vários problemas (leadsAll em app.js); tamanhos E fragrâncias do mesmo produto viram um cartão só (famOf/FRAG em app.js); mostra todos, 6 por vez com "Ver mais"), EXTRA (linhas com nome técnico → problemas), USO (modo de uso por tipo), BRANDS (ordem de preferência: Spartan, Start, Audax, depois as outras).
- `scripts/fotos-site.js` — FOTOSITE: código NossoERP → [foto, página] no site da loja (novaquimica.commercesuite.com.br, plataforma Tray). Usado para a foto do produto e para o botão "Comprar no site". Buscar a foto pelo og:image da página do produto, uma página por vez (o site limita).
- `scripts/fichas.js` — fichas oficiais dos fabricantes (foto, "para que serve", uso). Fonte: `fichas/*.tsv`.
- `scripts/app.js` — lógica da tela (busca tolerante a erros, cartões, registro de buscas no Netlify Forms "buscas").
- `dados/estoque-linhas.json` — linhas da planilha "Estoque x Vendas" do NossoERP (sem custo). NUNCA colocar custo no repositório.
- Depois de mudar regras: `node scripts/rebuild.js && python3 scripts/build.py` (recria `app/produtos.json` e embute tudo em `app/index.html`). Conferir com `node --check` no script extraído.

## Revisão semanal (aprender novas sujeiras)
1. Ler as buscas da semana no formulário "buscas" do site (Netlify → forms → submissions): campos termo, resultado (id do problema, `nome-produto` ou `NAO_ENCONTRADO`), origem (tv/web).
2. Para buscas NAO_ENCONTRADO que se repetem ou fazem sentido: adicionar palavras em `kw` de um problema existente, ou criar um problema novo com produtos que existam no estoque (`dados/estoque-linhas.json`, est > 0). Nunca inventar produto; conferir a função de produtos de nome técnico antes de classificar.
3. Rodar rebuild + build, testar algumas buscas, commitar e dar push (publica sozinho).
4. Mandar ao dono um resumo curto em português: o que os clientes buscaram, o que foi ensinado ao app, e o que não deu para resolver (sem produto no estoque = oportunidade de compra).

## Fotos dos problemas (galeria)
- Ficam em `app/fotos-problemas/`, listadas em `app/fotos-problemas/lista.json` no campo `fotos`: `{"piso": [{"src":"piso-1.jpg","rotulo":"Antes"},{"src":"piso-2.jpg","rotulo":"Depois"}]}` (id = id do problema em `scripts/regras.js`).
- A primeira foto também vira a imagem do quadro do problema na tela inicial.
- Só use fotos que a loja tem direito de usar (fotos próprias, de clientes que autorizaram, compradas ou com licença livre). Não use fotos tiradas de sites sem licença.
- Redimensione para no máximo ~1200 px de largura e JPG ~80% antes de commitar.

## Repositório público
Este repositório é PÚBLICO (necessário para o Netlify grátis publicar sozinho). Não coloque aqui custos, quantidades vendidas, dados de clientes ou senhas. Em `dados/estoque-linhas.json`, o campo `vend` é só uma posição relativa de vendas (maior = vende mais), usada para ordenar a lista.
