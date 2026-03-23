// api base URL
const API = "https://69bace02b3dcf7e0b4be2359.mockapi.io/api/UnyPneus";
const FOTO_PADRAO = "/src/img/icons8-pneu-50.png";

// atribuição de elementos as variáveis

const tbody = document.querySelector('.tabela-pneus tbody');
const btnNovo = document.getElementById('btnNovoPneu');
const modal = document.getElementById('modalCadastro');
const fechar = document.getElementById('fecharModal');
const modalDetalhesProduto = document.getElementById('modalDetalhesProduto');
const fecharDetalhesProduto = document.getElementById('fecharDetalhesProduto');
const form = document.getElementById('formCadastro');
const inputFoto = document.getElementById('foto');
const modalTitle = modal.querySelector('.modal-conteudo h2');
const submitBtn = form ? form.querySelector('.btn-salvar') : null;
const modalConfirmacao = document.getElementById('modalConfirmacao');
const fecharConfirmacao = document.getElementById('fecharConfirmacao');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelarConfirmacao = document.getElementById('btnCancelarConfirmacao');
const confirmacaoTitulo = document.getElementById('confirmacaoTitulo');
const confirmacaoMensagem = document.getElementById('confirmacaoMensagem');
let _lastActive = null;
let fotoSelecionada = '';
let fotoAtualEdicao = '';
let confirmacaoCallback = null;
let confirmacaoTipo = '';

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

function abrirConfirmacao(tipo, mensagem, callback) {
  confirmacaoTipo = tipo;
  confirmacaoCallback = callback;
  if (tipo === 'excluir') {
    confirmacaoTitulo.textContent = 'Excluir Pneu';
    confirmacaoMensagem.textContent = mensagem;
  } else if (tipo === 'editar') {
    confirmacaoTitulo.textContent = 'Editar Pneu';
    confirmacaoMensagem.textContent = mensagem;
  }
  _lastActive = document.activeElement;
  modalConfirmacao.style.display = 'flex';
  requestAnimationFrame(() => modalConfirmacao.classList.add('ativo'));
}

function fecharConfirmacaoModal() {
  modalConfirmacao.classList.remove('ativo');
  setTimeout(() => {
    modalConfirmacao.style.display = 'none';
  }, 180);
  confirmacaoCallback = null;
  confirmacaoTipo = '';
  if (_lastActive && _lastActive.focus) _lastActive.focus();
  _lastActive = null;
}

function abrirDetalhesProduto(pneu) {
  const produto = ((pneu.marca ?? '') + ' ' + (pneu.modelo ?? '')).trim() || pneu.produto || '-';
  const dataFormatada = formatDate(pneu.data ?? pneu.data_cadastro ?? '') || '-';
  const statusFormatado = formatStatus(pneu.status ?? pneu.ativo ?? '') || '-';
  const foto = (pneu.foto || pneu.imagem || '').trim();

  const imgEl = document.getElementById('detalheFotoProduto');
  const semImgEl = document.getElementById('detalheSemImagem');

  if (foto) {
    imgEl.src = foto;
    imgEl.style.display = 'block';
    semImgEl.style.display = 'none';
  } else {
    imgEl.removeAttribute('src');
    imgEl.style.display = 'none';
    semImgEl.style.display = 'flex';
  }

  document.getElementById('detalheId').textContent = pneu.id ?? '-';
  document.getElementById('detalheProduto').textContent = produto;
  document.getElementById('detalheMedida').textContent = pneu.medida ?? '-';
  document.getElementById('detalheData').textContent = dataFormatada;
  document.getElementById('detalheStatus').textContent = statusFormatado;

  _lastActive = document.activeElement;
  modalDetalhesProduto.style.display = 'flex';
  requestAnimationFrame(() => modalDetalhesProduto.classList.add('ativo'));
}

function fecharModalDetalhesProduto() {
  modalDetalhesProduto.classList.remove('ativo');
  setTimeout(() => {
    modalDetalhesProduto.style.display = 'none';
  }, 180);

  if (_lastActive && _lastActive.focus) _lastActive.focus();
  _lastActive = null;
}

// função para mostrar o modais: novo cadastro e edição

function mostrarModal(mode = 'new') {
  if (mode === 'new') {
    form.removeAttribute('data-edit-id');
    if (modalTitle) modalTitle.textContent = 'Cadastro de Pneu';
    if (submitBtn) submitBtn.textContent = 'Salvar';
    fotoAtualEdicao = '';
    fotoSelecionada = '';
    if (inputFoto) inputFoto.value = '';
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
  fotoSelecionada = '';
  fotoAtualEdicao = '';
  if (inputFoto) inputFoto.value = '';
  if (modalTitle) modalTitle.textContent = 'Cadastro de Pneu';
  if (submitBtn) submitBtn.textContent = 'Salvar';
  if (_lastActive && _lastActive.focus) _lastActive.focus();
  _lastActive = null;
}

function lerImagemComoBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || '');
    reader.onerror = () => reject(new Error('Falha ao ler a imagem'));
    reader.readAsDataURL(file);
  });
}

// fechar no ESC
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && modal.classList.contains('ativo')) {
    esconderModal();
  }

  if (ev.key === 'Escape' && modalDetalhesProduto && modalDetalhesProduto.classList.contains('ativo')) {
    fecharModalDetalhesProduto();
  }
});

// trazer a tabela de pneus, se não tiver pneu, mostrar a mensagem "Nenhum pneu encontrado"

function renderPneus(pneus = []) {
  if (!Array.isArray(pneus) || pneus.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#5f6d7a;">Nenhum pneu encontrado.</td></tr>';
    return;
  }

// criar as linhas da tabela com os dados dos pneus, formatando a data e o status, e adicionando os botões de excluir e editar
  
    tbody.innerHTML = pneus.map(p => {
      const top = (p.marca || p.modelo) ? `${p.marca ?? ''}` : (p.produto ?? '');
      const bottom = (p.marca || p.modelo) ? `${p.modelo ?? ''}` : '';
      const dateStr = formatDate(p.data ?? p.data_cadastro ?? '');
      const statusStr = formatStatus(p.status ?? p.ativo ?? '');
      const statusClass = statusStr.toLowerCase() === 'ativo' ? 'status-ativo' : statusStr.toLowerCase() === 'inativo' ? 'status-inativo' : '';
      const iconLixeira = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;
      const iconLapis = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
      return `
      <tr>
        <td headers="th-id">${p.id ?? ''}</td>
        <td headers="th-produto">
          <div class="produto-cell" data-id="${p.id ?? ''}">
            <div class="produto-top">${top}</div>
            <div class="produto-bottom">${bottom}</div>
          </div>
        </td>
        <td headers="th-medida">${p.medida ?? ''}</td>
        <td headers="th-data">${dateStr}</td>
        <td headers="th-status"><span class="status-badge ${statusClass}">${statusStr}</span></td>
        <td headers="th-acoes"><button class="btn-excluir" data-id="${p.id}" title="Excluir">${iconLixeira}</button><button class="btn-editar" data-id="${p.id}" title="Editar">${iconLapis}</button></td>
      </tr>`
    }).join('');
}
// função para carregar os pneus da API e renderizar na tabela
function carregarPneus() {
  fetch(API)
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(data => renderPneus(data))
    .catch(err => {
      console.error('Erro ao carregar pneus:', err);
      tbody.innerHTML = '<tr><td colspan="6" style="color:#c0392b;text-align:center;">Erro ao carregar dados.</td></tr>';
    });
}
// função para salvar o pneu, tanto para novo cadastro quanto para edição, enviando os dados para a API e atualizando a tabela
function salvarPneu(e) {
  e.preventDefault();

  const montarPayload = () => ({
    marca: form.marca.value,
    modelo: form.modelo.value,
    medida: form.medida.value,
    data: form.data.value,
    status: form.status.value,
    foto: fotoSelecionada || fotoAtualEdicao || ''
  });

  const continuarSalvar = () => {
    const payload = montarPayload();

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
  };

  const editId = form.dataset.editId;
  if (editId) {
    abrirConfirmacao('editar', 'Tem certeza que deseja atualizar este pneu com as alterações?', continuarSalvar);
    return;
  }

  if (inputFoto && inputFoto.files && inputFoto.files[0]) {
    lerImagemComoBase64(inputFoto.files[0])
      .then((base64) => {
        fotoSelecionada = base64;
        continuarSalvar();
      })
      .catch((err) => {
        console.error('Erro ao processar imagem:', err);
        alert('Nao foi possivel ler a imagem selecionada.');
      });
    return;
  }

  continuarSalvar();
}

// eventos dos botões e do formulário

btnNovo && btnNovo.addEventListener('click', () => mostrarModal('new'));
fechar && fechar.addEventListener('click', esconderModal);
fecharDetalhesProduto && fecharDetalhesProduto.addEventListener('click', fecharModalDetalhesProduto);
modal && modal.addEventListener('click', (ev) => { if (ev.target === modal) esconderModal(); });
modalDetalhesProduto && modalDetalhesProduto.addEventListener('click', (ev) => {
  if (ev.target === modalDetalhesProduto) fecharModalDetalhesProduto();
});
form && form.addEventListener('submit', salvarPneu);

tbody && tbody.addEventListener('click', (ev) => {
  const produtoCell = ev.target.closest && ev.target.closest('.produto-cell');
  if (produtoCell) {
    const id = produtoCell.dataset.id;
    if (!id) return;

    fetch(`${API}/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => abrirDetalhesProduto(data))
      .catch(err => {
        console.error('Erro ao abrir detalhes:', err);
      });

    return;
  }

  const btnExcluir = ev.target.closest && ev.target.closest('.btn-excluir');
  if (btnExcluir) {
    const id = btnExcluir.dataset.id;
    if (!id) return;

    abrirConfirmacao('excluir', 'Tem certeza que deseja excluir este pneu? Esta ação não pode ser desfeita.', () => {
      fetch(`${API}/${id}`, { method: 'DELETE' })
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(() => carregarPneus())
        .catch(err => {
          console.error('Erro ao excluir:', err);
          alert('Erro ao excluir pneu.');
        });
    });
    return;
  }

// evento para o botão de editar, buscar os dados do pneu selecionado e preencher o formulário do modal para edição

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
        fotoAtualEdicao = data.foto ?? data.imagem ?? '';
        fotoSelecionada = '';
        if (inputFoto) inputFoto.value = '';
        form.dataset.editId = id;
        mostrarModal('edit');
      })
      .catch(err => {
        console.error('Erro ao buscar pneu:', err);
        alert('Erro ao abrir edição.');
      });
  }
});

fecharConfirmacao && fecharConfirmacao.addEventListener('click', fecharConfirmacaoModal);
btnCancelarConfirmacao && btnCancelarConfirmacao.addEventListener('click', fecharConfirmacaoModal);
btnConfirmar && btnConfirmar.addEventListener('click', () => {
  if (confirmacaoCallback) {
    confirmacaoCallback();
    fecharConfirmacaoModal();
  }
});
modalConfirmacao && modalConfirmacao.addEventListener('click', (ev) => { 
  if (ev.target === modalConfirmacao) fecharConfirmacaoModal(); 
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && modalConfirmacao && modalConfirmacao.classList.contains('ativo')) {
    fecharConfirmacaoModal();
  }
});

document.addEventListener('DOMContentLoaded', carregarPneus);
