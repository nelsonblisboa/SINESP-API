const form = document.getElementById('formConsulta');
const input = document.getElementById('inputPlaca');
const botao = document.getElementById('botaoConsultar');
const resultado = document.getElementById('resultado');
const mensagem = document.getElementById('mensagem');
const historyCard = document.getElementById('historicoCard');
const historyList = document.getElementById('historico');

function normalizePlate(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

function formatPlate(value) {
  const normalized = normalizePlate(value);
  if (/^[A-Z]{3}[0-9]{4}$/.test(normalized)) return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  return normalized;
}

function validPlate(value) {
  const plate = normalizePlate(value);
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) || /^[A-Z]{3}[0-9]{4}$/.test(plate);
}

function showMessage(text) {
  mensagem.textContent = text;
  mensagem.classList.remove('hidden');
}

function clearMessage() { mensagem.classList.add('hidden'); }

function valueOrDash(value) {
  if (value === undefined || value === null || value === '') return '—';
  return value;
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem('consultaVeicularHistorico')) || []; }
  catch { return []; }
}

function saveHistory(plate, data) {
  const history = getHistory().filter(item => item.placa !== plate);
  history.unshift({ placa: plate, data });
  localStorage.setItem('consultaVeicularHistorico', JSON.stringify(history.slice(0, 5)));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  historyList.replaceChildren();
  historyCard.classList.toggle('hidden', history.length === 0);

  history.forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history-item';
    button.textContent = formatPlate(item.placa);
    button.addEventListener('click', () => fillResult(item.placa, item.data));
    historyList.appendChild(button);
  });
}

function fillResult(plate, data) {
  document.getElementById('placaResultado').textContent = formatPlate(plate);
  document.getElementById('modelo').textContent = valueOrDash(data.modelo || data.marcaModelo || data.marca);
  document.getElementById('ano').textContent = `${valueOrDash(data.anoModelo)} / ${valueOrDash(data.anoFabricacao)}`;
  document.getElementById('cor').textContent = valueOrDash(data.cor);
  document.getElementById('local').textContent = `${valueOrDash(data.municipio)} - ${valueOrDash(data.uf)}`;
  document.getElementById('chassi').textContent = valueOrDash(data.chassi);
  document.getElementById('situacao').textContent = valueOrDash(data.situacao);

  const situacao = String(data.situacao || '').toLowerCase();
  const badge = document.getElementById('badgeStatus');
  badge.className = 'badge';
  if (/roubo|furto|restri/.test(situacao)) {
    badge.textContent = 'Alerta de roubo/furto'; badge.classList.add('alert');
  } else if (situacao) {
    badge.textContent = 'Sem restrições';
  } else {
    badge.textContent = 'Situação não informada'; badge.classList.add('neutral');
  }
  resultado.classList.remove('hidden');
}

input.addEventListener('input', () => {
  input.value = normalizePlate(input.value);
  input.setCustomValidity(validPlate(input.value) ? '' : 'Informe uma placa válida.');
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  clearMessage();

  const plate = normalizePlate(input.value);
  if (!validPlate(plate)) {
    showMessage('Informe uma placa válida no formato AAA0A00 ou AAA-0000.');
    input.focus();
    return;
  }

  const configuredUrl = window.PLATE_API_URL && window.PLATE_API_URL.trim();
  if (!configuredUrl) {
    showMessage('Configure a URL do backend em docs/config.js antes de consultar.');
    return;
  }

  botao.disabled = true;
  botao.textContent = 'Consultando…';
  resultado.classList.add('hidden');

  try {
    const endpoint = `${configuredUrl.replace(/\/$/, '')}/${plate}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    window.clearTimeout(timeout);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) throw new Error('Placa não encontrada ou não disponível no provedor consultado.');
      if (response.status === 429) throw new Error('Limite de consultas do provedor foi atingido. Tente novamente mais tarde.');
      throw new Error(data.erro || data.message || `O serviço retornou erro HTTP ${response.status}.`);
    }

    const normalized = {
      modelo: data.modelo || data.modeloCarro || data.marcaModelo || data.marca,
      marcaModelo: data.marcaModelo,
      marca: data.marca,
      anoModelo: data.anoModelo || data.ano || data.ano_veiculo,
      anoFabricacao: data.anoFabricacao,
      cor: data.cor,
      municipio: data.municipio || data.municipioEmplacamento,
      uf: data.uf,
      chassi: data.chassi || data.numeroChassi,
      situacao: data.situacao || data.status
    };
    fillResult(plate, normalized);
    saveHistory(plate, normalized);
  } catch (error) {
    if (error.name === 'AbortError') {
      showMessage('A consulta demorou demais. Verifique sua conexão e tente novamente.');
    } else if (error instanceof TypeError) {
      showMessage('Não foi possível conectar ao serviço de placas. Verifique sua conexão ou se o provedor permite consultas pelo navegador.');
    } else {
      showMessage(error.message || 'Não foi possível consultar a placa.');
    }
  } finally {
    botao.disabled = false;
    botao.textContent = 'Consultar';
  }
});

document.getElementById('limparHistorico').addEventListener('click', () => {
  localStorage.removeItem('consultaVeicularHistorico');
  renderHistory();
});

renderHistory();
