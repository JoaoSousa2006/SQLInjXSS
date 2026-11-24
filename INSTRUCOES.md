# Neverend Lab — rodar local

**GitHub guarda o projeto; o app e o MySQL rodam no seu computador.** Instale Node.js LTS e Docker Desktop, depois:

1. Descompacte o projeto e abra um terminal nessa pasta.
2. Copie `.env.example` para `.env` (`copy .env.example .env` no Windows; `cp .env.example .env` no macOS/Linux).
3. Rode `npm install` — instala `express`, `mysql2` e `dotenv`.
4. Rode `npm run db:up` para iniciar o MySQL local.
5. Rode `npm run dev` e abra `http://127.0.0.1:3000`.

SQLi: na busca vulnerável, tente `Alice`, `' OR 1=1 -- ` e `'; SHOW DATABASES; -- `. Compare com SQLi Fixed. XSS: preencha o exemplo e compare as páginas vulnerável e corrigida. Apague comentários de teste com o botão na página XSS.

**Não publique o app nem o arquivo `.env`.** O servidor escuta apenas em `127.0.0.1`; os exemplos vulneráveis são intencionais.

Para parar o MySQL: `npm run db:down`. Para apagar o banco e seus dados locais, rode `docker compose down -v` (irreversível) e depois `npm run db:up`.
