# Consulta Veicular

Interface estática para consulta de placas brasileira, preparada para GitHub Pages, com proxy opcional em Node.js.

## Estrutura

- `docs/index.html`: interface responsiva publicada pelo GitHub Pages
- `docs/style.css`: estilos da página
- `docs/config.js`: configuração da URL do backend
- `docs/script.js`: validação, consulta e histórico local
- `api/placa.js`: proxy serverless compatível com Vercel
- `server.js`: servidor Express local
- `package.json`: dependências do backend

## Desenvolvimento local

```bash
npm install
npm start
```

Abra `http://localhost:3000` para a interface e a API em `http://localhost:3000/api/placa/AAA0A00`.

## Publicar no GitHub Pages

1. Faça o push deste repositório na branch `main`.
2. Em **Settings > Pages**, selecione **Deploy from a branch**.
3. Escolha `main` e a pasta `/docs`.
4. Configure `docs/config.js` com a URL pública do backend.

GitHub Pages hospeda apenas arquivos estáticos. A consulta precisa de um backend ou provedor externo acessível por CORS.

## Backend

O arquivo `api/placa.js` usa uma API de placas definida pela variável `PLATE_API_URL`. Defina também um valor opcional em `PLATE_API_TOKEN`, enviado como Bearer token.

Exemplo padrão:

```text
PLATE_API_URL=https://brasilapi.com.br/api/placas/v1
```

Devido às mudanças e bloqueios das APIs públicas, confirme a disponibilidade e os termos do provedor antes do uso.
