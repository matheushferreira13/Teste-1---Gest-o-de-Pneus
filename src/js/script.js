const API_BASE = "https://69bace02b3dcf7e0b4be2359.mockapi.io/api/UnyPneus";

const state = {
    pneus: []
};

const elements = {
    tbody: document.querySelector(".tabela-pneus tbody"),
    btnNovoPneu: document.getElementById("btnNovoPneu"),
    modal: document.getElementById("modalCadastro"),
    fecharModal: document.getElementById("fecharModal"),
    form: document.getElementById("formCadastro"),
    produto: document.getElementById("produto"),
    medida: document.getElementById("medida"),
    data: document.getElementById("data"),
    status: document.getElementById("status")
};

function abrirModal() {
    elements.modal.style.display = "flex";
}

function fecharModal() {
    elements.modal.style.display = "none";
    elements.form.reset();
}

function criarCelula(texto, headerId) {
    const td = document.createElement("td");
    td.setAttribute("headers", headerId);
    td.textContent = texto ?? "-";
    return td;
}

function renderTabela() {
    const { tbody } = elements;
    tbody.innerHTML = "";

    if (!state.pneus.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; color:#5f6d7a;">
                    Nenhum pneu encontrado.
                </td>
            </tr>
        `;
        return;
    }

    state.pneus.forEach((pneu) => {
        const tr = document.createElement("tr");

        tr.appendChild(criarCelula(pneu.id, "th-id"));
        tr.appendChild(criarCelula(pneu.marca, "th-marca"));
        tr.appendChild(criarCelula(pneu.modelo, "th-produto"));
        tr.appendChild(criarCelula(pneu.medida, "th-medida"));
        tr.appendChild(criarCelula(pneu.data_cadastro, "th-data"));
        tr.appendChild(criarCelula(pneu.ativo, "th-status"));

        tbody.appendChild(tr);
    });
}

async function carregarPneus() {
    try {
        const response = await fetch(API_BASE);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const data = await response.json();
        state.pneus = Array.isArray(data) ? data : [];
        renderTabela();
    } catch (error) {
        console.error("Erro ao carregar pneus:", error);
        elements.tbody.innerHTML = `
            <tr>
                <td colspan="6" style="color:#c0392b; text-align:center;">
                    Erro ao carregar dados: ${error.message}
                </td>
            </tr>
        `;
    }
}

async function salvarPneu(event) {
    event.preventDefault();

    const novoPneu = {
        produto: elements.produto.value.trim(),
        medida: elements.medida.value.trim(),
        data: elements.data.value,
        status: elements.status.value
    };

    try {
        const response = await fetch(API_BASE, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoPneu)
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const pneuCriado = await response.json();

        state.pneus.push(pneuCriado);
        renderTabela();
        fecharModal();
    } catch (error) {
        console.error("Erro ao salvar pneu:", error);
        alert("Não foi possível salvar o pneu.");
    }
}

function registrarEventos() {
    elements.btnNovoPneu.addEventListener("click", abrirModal);
    elements.fecharModal.addEventListener("click", fecharModal);

    elements.modal.addEventListener("click", (event) => {
        if (event.target === elements.modal) {
            fecharModal();
        }
    });

    elements.form.addEventListener("submit", salvarPneu);
}

function init() {
    registrarEventos();
    carregarPneus();
}

document.addEventListener("DOMContentLoaded", init);