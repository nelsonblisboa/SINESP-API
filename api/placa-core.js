const normalizePlate = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

function normalizePayload(payload) {
  const source = payload.data || payload;
  return {
    modelo: source.modelo || source.modeloCarro || source.marcaModelo,
    marcaModelo: source.marcaModelo,
    marca: source.marca,
    anoModelo: source.anoModelo || source.ano,
    anoFabricacao: source.anoFabricacao,
    cor: source.cor,
    municipio: source.municipio,
    uf: source.uf,
    chassi: source.chassi || source.numeroChassi,
    situacao: source.situacao || source.status
  };
}

async function handlePlateRequest(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const raw = req.params?.placa || req.query?.placa || '';
  const plate = normalizePlate(raw);
  if (!/^(?:[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z0-9][0-9]{2})$/.test(plate)) {
    return res.status(400).json({ erro: 'Placa inválida.' });
  }

  const baseUrl = process.env.PLATE_API_URL || 'https://brasilapi.com.br/api/placas/v1';
  const headers = { Accept: 'application/json' };
  if (process.env.PLATE_API_TOKEN) headers.Authorization = `Bearer ${process.env.PLATE_API_TOKEN}`;

  try {
    const separator = baseUrl.includes('?') ? '&' : '/';
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${separator}${plate}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ erro: payload.message || payload.erro || 'Placa não encontrada ou serviço indisponível.' });
    return res.status(200).json(normalizePayload(payload));
  } catch {
    return res.status(502).json({ erro: 'Não foi possível consultar o serviço de placas.' });
  }
}

module.exports = { handlePlateRequest, normalizePayload, normalizePlate };
