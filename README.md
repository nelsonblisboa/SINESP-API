# Consulta Veicular

Interface estática para consulta de placas brasileira, publicada na pasta `docs` e preparada para GitHub Pages.

## Estrutura

- `docs/index.html`: interface responsiva
- `docs/style.css`: estilos
- `docs/config.js`: URL do backend
- `docs/script.js`: validação, consulta e histórico local
- `api/placa-core.js`: integração normalizada com o provedor
- `api/placa.js`: handler serverless
- `server.js`: servidor Express local

## Execução local

```bash
npm install
npm start
```

A interface estará em `http://localhost:3000` e a API em `http://localhost:3000/api/placa/AAA0A00`.

## Configuração do provedor

O backend aceita um provedor compatível configurado por `PLATE_API_URL`:

```text
PLATE_API_URL=https://provedor.exemplo/placas
PLATE_API_TOKEN=token-opcional
```

Também pode usar a APIBrasil com:

```text
APIBRASIL_TOKEN=token-bearer
```

Atenção: APIs públicas podem ter disponibilidade, cobertura e limites diferentes.

## GitHub Pages

1. Em **Settings > Pages**, escolha **Deploy from a branch**.
2. Selecione `main` e `/docs`.
3. Hospede o backend separadamente em Vercel ou outro provedor HTTPS.
4. Ajuste `docs/config.js`:

```javascript
window.PLATE_API_URL = 'https://seu-backend.exemplo/api/placa';
```

GitHub Pages não executa Node.js nem elimina as exigências de CORS ou credenciais do provedor externo.
