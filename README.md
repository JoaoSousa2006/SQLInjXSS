# Neverend Security Lab

Laboratório local de SQL Injection e XSS com **Node.js + Express + MySQL**. GitHub guarda o código; a execução ocorre localmente. O servidor fica preso a `127.0.0.1`.

## Executar

Pré-requisitos: Node.js LTS e Docker Desktop. Copie `.env.example` para `.env`, então:

```bash
npm install
npm run db:up
npm run dev
```

Abra `http://127.0.0.1:3000`. Para encerrar o banco: `npm run db:down`.

O `npm install` instala `express`, `mysql2` e `dotenv`. Veja [INSTRUCOES.md](INSTRUCOES.md) para exemplos de teste. Não publique o app vulnerável nem envie `.env` ao GitHub.
