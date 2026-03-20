// api base URL
const API = "https://69bace02b3dcf7e0b4be2359.mockapi.io/api/UnyPneus";

// atribuição de elementos as variáveis

const tbody = document.querySelector('.tabela-pneus tbody');
const btnNovo = document.getElementById('btnNovoPneu');
const modal = document.getElementById('modalCadastro');
const fechar = document.getElementById('fecharModal');
const form = document.getElementById('formCadastro');
const modalTitle = modal.querySelector('.modal-conteudo h2');
const submitBtn = form ? form.querySelector('.btn-salvar') : null;
let _lastActive = null;

// receber a data e alterar para o formato dd/mm/yyyy

function formatDate(value) {
  if (value === null || value === undefined || value === '') return '';
  const asNum = Number(value);
  let date;
  if (!Number.isNaN(asNum) && String(value).trim() !== '') {
    if (asNum > 1e12) date = new Date(asNum);
    else date = new Date(asNum * 1000);
  } else {
    date = new Date(value);
  }
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
}

// receber em true/false e formatar o status para Ativo ou Inativo

function formatStatus(s) {
  if (s === true || s === 1 || s === '1' || String(s).toLowerCase() === 'true') return 'Ativo';
  if (s === false || s === 0 || s === '0' || String(s).toLowerCase() === 'false') return 'Inativo';
  const str = String(s ?? '').trim();
  if (!str) return '';
  if (str.toLowerCase() === 'ativo' || str.toLowerCase() === 'inativo') return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return str;
}

// função para mostrar o modais: novo cadastro e edição

function mostrarModal(mode = 'new') {
  if (mode === 'new') {
    form.removeAttribute('data-edit-id');
    if (modalTitle) modalTitle.textContent = 'Cadastro de Pneu';
    if (submitBtn) submitBtn.textContent = 'Salvar';
  } else {
    if (modalTitle) modalTitle.textContent = 'Editar Pneu';
    if (submitBtn) submitBtn.textContent = 'Atualizar';
  }
// efeito de foco para o modal

  _lastActive = document.activeElement;
  modal.style.display = 'flex';
  requestAnimationFrame(() => modal.classList.add('ativo'));

  const first = form.querySelector('input,select,textarea,button');
  if (first) first.focus();
}
// função para esconder o modal
function esconderModal() {
  modal.classList.remove('ativo');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 180);
  form.reset();
  form.removeAttribute('data-edit-id');
  if (modalTitle) modalTitle.textContent = 'Cadastro de Pneu';
  if (submitBtn) submitBtn.textContent = 'Salvar';
  if (_lastActive && _lastActive.focus) _lastActive.focus();
  _lastActive = null;
}

// fechar no ESC
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && modal.classList.contains('ativo')) {
    esconderModal();
  }
});

// trazer a tabela de pneus, se não tiver pneu, mostrar a mensagem "Nenhum pneu encontrado"

function renderPneus(pneus = []) {
  if (!Array.isArray(pneus) || pneus.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#5f6d7a;">Nenhum pneu encontrado.</td></tr>';
    return;
  }

    tbody.innerHTML = pneus.map(p => {
      const top = (p.marca || p.modelo) ? `${p.marca ?? ''}` : (p.produto ?? '');
      const bottom = (p.marca || p.modelo) ? `${p.modelo ?? ''}` : '';
      const dateStr = formatDate(p.data ?? p.data_cadastro ?? '');
      const statusStr = formatStatus(p.status ?? p.ativo ?? '');
      return `
      <tr>
        <td headers="th-id">${p.id ?? ''}</td>
        <td headers="th-produto" style="color: var(--gray); font-weight: bold; display:">
          <div class="produto-cell">
            <div class="produto-top">${top}</div>
            <div class="produto-bottom">${bottom}</div>
          </div>
        </td>
        <td headers="th-medida">${p.medida ?? ''}</td>
        <td headers="th-data">${dateStr}</td>
        <td headers="th-status">${statusStr}</td>
        <td headers="th-acoes"><button class="btn-excluir" data-id="${p.id}">Excluir</button><button class="btn-editar" data-id="${p.id}">Editar</button></td>
      </tr>`
    }).join('');
}

function carregarPneus() {
  fetch(API)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => renderPneus(data))
    .catch(err => {
      console.error('Erro ao carregar pneus:', err);
      tbody.innerHTML = '<tr><td colspan="6" style="color:#c0392b;text-align:center;">Erro ao carregar dados.</td></tr>';
    });
}

function salvarPneu(e) {
  e.preventDefault();
  const payload = {
    marca: form.marca.value,
    modelo: form.modelo.value,
    medida: form.medida.value,
    data: form.data.value,
    status: form.status.value
  };

  const editId = form.dataset.editId;
  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `${API}/${editId}` : API;

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(() => {
      carregarPneus();
      esconderModal();
    })
    .catch(err => {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar pneu.');
    });
}


btnNovo && btnNovo.addEventListener('click', () => mostrarModal('new'));
fechar && fechar.addEventListener('click', esconderModal);
modal && modal.addEventListener('click', (ev) => { if (ev.target === modal) esconderModal(); });
form && form.addEventListener('submit', salvarPneu);



tbody && tbody.addEventListener('click', (ev) => {
  const btnExcluir = ev.target.closest && ev.target.closest('.btn-excluir');
  if (btnExcluir) {
    const id = btnExcluir.dataset.id;
    if (!id) return;

  fetch(`${API}/${id}`, { method: 'DELETE' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(() => carregarPneus())
    .catch(err => {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir pneu.');
    });
  }
  const btnEditar = ev.target.closest && ev.target.closest('.btn-editar');
  if (btnEditar) {
    const id = btnEditar.dataset.id;
    if (!id) return;

    fetch(`${API}/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        form.marca.value = data.marca ?? data.produto ?? '';
        form.modelo.value = data.modelo ?? '';
        form.medida.value = data.medida ?? '';
        form.data.value = data.data ?? data.data_cadastro ?? '';
        form.status.value = data.status ?? data.ativo ?? '';
        form.dataset.editId = id;
        mostrarModal('edit');
      })
      .catch(err => {
        console.error('Erro ao buscar pneu:', err);
        alert('Erro ao abrir edição.');
      });
  }
});

document.addEventListener('DOMContentLoaded', carregarPneus);
