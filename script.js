// script.js

// Elementos DOM
const formAdicionarCliente = document.getElementById('form-adicionar-cliente');
const formAdicionarDespesa = document.getElementById('form-adicionar-despesa');
const tabelaClientes = document.getElementById('clientes-tabela');
const tabelaDespesas = document.getElementById('despesas-tabela');
const totalReceitasSpan = document.getElementById('total-receitas');
const totalDespesasSpan = document.getElementById('total-despesas');
const burnRateSpan = document.getElementById('burn-rate');
const margemLucroSpan = document.getElementById('margem-lucro');

// Dados em memória
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let despesas = JSON.parse(localStorage.getItem('despesas')) || [];

// Atualizar interface
function atualizarInterface() {
    // Limpar tabelas
    tabelaClientes.innerHTML = '';
    tabelaDespesas.innerHTML = '';

    // Renderizar clientes
    clientes.forEach((cliente, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cliente.nome}</td>
            <td>${cliente.representante}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>R$ ${cliente.valorContrato.toFixed(2)}</td>
            <td>R$ ${cliente.valorDepositado.toFixed(2)}</td>
            <td class="acoes">
                <button class="btn btn-edit" onclick="editarCliente(${index})">Editar</button>
                <button class="btn btn-delete" onclick="excluirCliente(${index})">Excluir</button>
            </td>
        `;
        tabelaClientes.appendChild(row);
    });

    // Renderizar despesas
    despesas.forEach((despesa, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${despesa.descricao}</td>
            <td>${despesa.categoria}</td>
            <td>R$ ${despesa.valor.toFixed(2)}</td>
            <td>${despesa.indeterminado ? 'Indeterminado' : despesa.data || ''}</td>
            <td class="acoes">
                <button class="btn btn-edit" onclick="editarDespesa(${index})">Editar</button>
                <button class="btn btn-delete" onclick="excluirDespesa(${index})">Excluir</button>
            </td>
        `;
        tabelaDespesas.appendChild(row);
    });

    calcularResumo();
}

// Calcular resumo financeiro
function calcularResumo() {
    const totalReceitas = clientes.reduce((sum, cliente) => sum + cliente.valorDepositado, 0);
    const totalDespesas = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
    const burnRate = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas - totalDespesas;

    totalReceitasSpan.textContent = `R$ ${totalReceitas.toFixed(2)}`;
    totalDespesasSpan.textContent = `R$ ${totalDespesas.toFixed(2)}`;
    burnRateSpan.textContent = `R$ ${Math.abs(burnRate).toFixed(2)}`;
    burnRateSpan.className = burnRate >= 0 ? 'positive' : 'negative';
    margemLucroSpan.textContent = `R$ ${margemLucro.toFixed(2)}`;
}

// Adicionar cliente
formAdicionarCliente.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formAdicionarCliente);
    const cliente = {
        nome: formData.get('nome'),
        representante: formData.get('representante'),
        email: formData.get('email'),
        telefone: formData.get('telefone'),
        valorContrato: parseFloat(formData.get('valor')),
        valorDepositado: parseFloat(formData.get('depositado')),
    };
    clientes.push(cliente);
    salvarDados();
    atualizarInterface();
    formAdicionarCliente.reset();
});

// Adicionar despesa
formAdicionarDespesa.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(formAdicionarDespesa);
    const despesa = {
        descricao: formData.get('descricao'),
        categoria: formData.get('categoria'),
        valor: parseFloat(formData.get('valor-despesa')),
        data: formData.get('indeterminado') ? null : formData.get('data'),
        indeterminado: formData.get('indeterminado') ? true : false,
    };
    despesas.push(despesa);
    salvarDados();
    atualizarInterface();
    formAdicionarDespesa.reset();
});

// Editar e excluir funções para clientes e despesas
function editarCliente(index) {
    const cliente = clientes[index];
    formAdicionarCliente.elements['nome'].value = cliente.nome;
    formAdicionarCliente.elements['representante'].value = cliente.representante;
    formAdicionarCliente.elements['email'].value = cliente.email;
    formAdicionarCliente.elements['telefone'].value = cliente.telefone;
    formAdicionarCliente.elements['valor'].value = cliente.valorContrato;
    formAdicionarCliente.elements['depositado'].value = cliente.valorDepositado;
    excluirCliente(index);
}

function excluirCliente(index) {
    clientes.splice(index, 1);
    salvarDados();
    atualizarInterface();
}

function editarDespesa(index) {
    const despesa = despesas[index];
    formAdicionarDespesa.elements['descricao'].value = despesa.descricao;
    formAdicionarDespesa.elements['categoria'].value = despesa.categoria;
    formAdicionarDespesa.elements['valor-despesa'].value = despesa.valor;
    formAdicionarDespesa.elements['data'].value = despesa.data || '';
    formAdicionarDespesa.elements['indeterminado'].checked = despesa.indeterminado;
    excluirDespesa(index);
}

function excluirDespesa(index) {
    despesas.splice(index, 1);
    salvarDados();
    atualizarInterface();
}

// Salvar dados no localStorage
function salvarDados() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('despesas', JSON.stringify(despesas));
}
// Exportar dados para um arquivo JSON
document.getElementById('exportar-dados').addEventListener('click', () => {
    const dados = { clientes, despesas };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados-projetos.json';
    a.click();

    URL.revokeObjectURL(url);
});

// Importar dados de um arquivo JSON
document.getElementById('importar-dados').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const dadosImportados = JSON.parse(e.target.result);
            if (dadosImportados.clientes && dadosImportados.despesas) {
                clientes = dadosImportados.clientes;
                despesas = dadosImportados.despesas;
                salvarDados();
                atualizarInterface();
                alert('Dados importados com sucesso!');
            } else {
                throw new Error('Formato inválido de arquivo.');
            }
        } catch (error) {
            alert('Erro ao importar dados: ' + error.message);
        }
    };
    reader.readAsText(file);
});

// Inicializar interface
atualizarInterface();
