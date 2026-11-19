const normalizePlate = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

function normalizePayload(payload) {
  const source = payload.data || payload;
  const vehicle = source.resultados?.find(item => item.principal) ||
    source.resultados?.[0] ||
    source.veiculo ||
    source;
  return {
    modelo: vehicle.modelo || vehicle.modeloCarro || vehicle.marcaModelo,
    marcaModelo: vehicle.marcaModelo,
    marca: vehicle.marca,
    anoModelo: vehicle.anoModelo || vehicle.ano || vehicle.ano_veiculo,
    anoFabricacao: vehicle.anoFabricacao,
    cor: vehicle.cor,
    municipio: vehicle.municipio || vehicle.municipioEmplacamento,
    uf: vehicle.uf,
    chassi: vehicle.chassi || vehicle.numeroChassi,
    situacao: vehicle.situacao || vehicle.status
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

  const baseUrl = process.env.PLATE_API_URL ||
    (process.env.APIBRASIL_TOKEN
      ? 'https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits'
      : '');
  if (!baseUrl) {
    return res.status(503).json({
      erro: 'Configuração do servidor incompleta: falta o token do provedor de placas.'
    });
  }

  const headers = { Accept: 'application/json' };
  if (process.env.PLATE_API_TOKEN) headers.Authorization = `Bearer ${process.env.PLATE_API_TOKEN}`;
  if (!process.env.PLATE_API_TOKEN && process.env.APIBRASIL_TOKEN) {
    headers.Authorization = `Bearer ${process.env.APIBRASIL_TOKEN}`;
  }

  try {
    let response;
    if (process.env.APIBRASIL_TOKEN && !process.env.PLATE_API_URL) {
      response = await fetch(baseUrl, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'fipe-chassi', placa: plate, homolog: false })
      });
    } else {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}/${plate}`, { headers });
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status >= 400 ? response.status : 502).json({
        erro: payload.message || payload.erro || 'Placa não encontrada ou serviço indisponível.'
      });
    }
    return res.status(200).json(normalizePayload(payload));
  } catch {
    return res.status(502).json({ erro: 'Não foi possível consultar o serviço de placas.' });
  }
}

module.exports = { handlePlateRequest, normalizePayload, normalizePlate };
