# Nutriplanner

Este é um projeto desenvolvido em React com Vite. 
Para rodar o projeto é necessário ter o [Node.js](https://nodejs.org/) instalado 
(versão LTS recomendada, ex: 18+) e também o [npm](https://www.npmjs.com/). 
Você pode verificar se estão instalados rodando `node -v` e `npm -v` no terminal.

Para começar, clone este repositório com `git clone https://github.com/davimtg/Nutriplanner` 
e entre na pasta do projeto com `cd Nutriplanner/client` ou `cd Nutriplanner\client`. 
Depois instale as dependências usando `npm install`.

Com tudo instalado, inicie o servidor de desenvolvimento rodando `npm start`. 
O projeto ficará disponível no navegador em `http://localhost:3000`. 


## Estrutura
A estrutura básica do projeto segue a seguinte organização:  

src/assets
Tudo que está aqui dentro são arquivos estáticos GLOBAIS (serão usadas em todas as páginas), 
como css, js, images, fonts, videos, audio e o que mais for usado dentro do 
projeto (com excessão do favicon).

src/components
Aqui fica tudo que pode ser reaproveitado em outras páginas, para criar um novo 
componente, crie o nome dele (letra inicial maiuscula, camelCase) e crie o arquivo com .js
(letra inicial maiuscula, camelCase) e crie o css (Nome.module.css).

src/pages
Aqui fica as paginas de exibição (telas), para criar uma nova página, crie o pasta 
(letra inicial minúscula, camelCase) e crie o arquivo com .js (letra inicial 
maiuscula, camelCase) e crie o css (Nome.module.css). Para adicionar uma nova página adicione 
`import nome from "./pages/nome/nome";` e `<Route path="/nome" element={<nome />} />` no app.js.


## Convenções
- Utilize `import styles from 'escreva-aqui-o-diretório'` para importar o css.
- Utilize (não necessariamente, mas seria bom) a convenção BEM para css.
- Nomeie arquivos estáticos globais com kebab-case.
- Como temos 4 Tipos (cliente, mediador, nutricionista e admin), nomeie as páginas as variaveis
e pastas com `clienteDashboard.js`, `mediadorDashboard.js`, para entedermos para quem é cada página.
- Para a url, o ideal é que se `url/cliente-dashboard`, `url/mediador-dashboard`.