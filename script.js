const API_PRODUTO = 'http://localhost:5196/api/Produto';
const API_CATEGORIA = 'http://localhost:5196/api/Categoria';
const API_FORNECEDOR = 'http://localhost:5196/api/Fornecedor';

// Inicia as funções quando a tela carrega
document.addEventListener('DOMContentLoaded', () => {
    carregarOpcoes(); // Carrega os Selects primeiro
    carregarProdutos();
});

document.getElementById('form-produto').addEventListener('submit', salvarProduto);

// CARREGAR CATEGORIAS E FORNECEDORES NO SELECT
async function carregarOpcoes() {
    try {
        const resCat = await fetch(API_CATEGORIA);
        const categorias = await resCat.json();
        const selectCat = document.getElementById('categoriaId');
        selectCat.innerHTML = '<option value="">Selecione uma Categoria...</option>';
        categorias.forEach(c => {
            selectCat.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
        });

        const resForn = await fetch(API_FORNECEDOR);
        const fornecedores = await resForn.json();
        const selectForn = document.getElementById('fornecedorId');
        selectForn.innerHTML = '<option value="">Selecione um Fornecedor...</option>';
        fornecedores.forEach(f => {
            const nomeForn = f.nomeEmpresa || f.nome;
            selectForn.innerHTML += `<option value="${f.id}">${nomeForn}</option>`;
        });
    } catch (error) {
        console.error("Erro ao carregar dropdowns:", error);
    }
}

// CARREGAR PRODUTOS NA TABELA
async function carregarProdutos() {
    try {
        const response = await fetch(API_PRODUTO);
        const produtos = await response.json();
        const tbody = document.getElementById('tabela-produtos');
        tbody.innerHTML = '';

        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${produto.id}</td>
                <td>${produto.nome}</td>
                <td>R$ ${produto.preco ? Number(produto.preco).toFixed(2) : '0.00'}</td>
                <td>${produto.quantidadeEstoque}</td>
                <td>
                    <button type="button" class="btn-editar" onclick="prepararEdicao(${produto.id}, '${produto.nome}', ${produto.preco}, ${produto.quantidadeEstoque}, ${produto.categoriaId}, ${produto.fornecedorId})">Editar</button>
                    <button type="button" class="btn-excluir" onclick="excluirProduto(${produto.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro na função carregarProdutos:', error);
    }
}

// SALVAR / EDITAR PRODUTO
async function salvarProduto(e) {
    e.preventDefault();

    const id = document.getElementById('produto-id').value;
    const produto = {
        nome: document.getElementById('nome').value,
        preco: parseFloat(document.getElementById('preco').value),
        quantidadeEstoque: parseInt(document.getElementById('quantidade').value),
        categoriaId: parseInt(document.getElementById('categoriaId').value),
        fornecedorId: parseInt(document.getElementById('fornecedorId').value)
    };

    let metodo = 'POST';
    let url = API_PRODUTO;

    if (id) {
        metodo = 'PUT';
        url = `${API_PRODUTO}/${id}`;
        produto.id = parseInt(id);
    }

    try {
        const response = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });

        if (!response.ok) throw new Error("Falha ao salvar produto.");

        alert("Produto salvo com sucesso!");
        document.getElementById('form-produto').reset();
        document.getElementById('produto-id').value = '';
        carregarProdutos();

    } catch (error) {
        alert("Erro: " + error.message);
    }
}

// PREPARAR EDIÇÃO
function prepararEdicao(id, nome, preco, quantidade, categoriaId, fornecedorId) {
    document.getElementById('produto-id').value = id;
    document.getElementById('nome').value = nome;
    document.getElementById('preco').value = preco;
    document.getElementById('quantidade').value = quantidade;
    document.getElementById('categoriaId').value = categoriaId;
    document.getElementById('fornecedorId').value = fornecedorId;
}

// EXCLUIR PRODUTO
async function excluirProduto(id) {
    if (confirm('Deseja realmente excluir este produto?')) {
        try {
            await fetch(`${API_PRODUTO}/${id}`, { method: 'DELETE' });
            carregarProdutos();
        } catch (error) {
            alert("Erro ao excluir: " + error.message);
        }
    }
}