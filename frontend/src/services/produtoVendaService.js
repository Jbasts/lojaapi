import api from "./api";


export async function listarProdutosVenda(
    busca = ""
) {

    const response = await api.get(
        "/produtos-venda",
        {
            params: {
                busca
            }
        }
    );

    return response.data;
}


export async function buscarProdutoVenda(
    id
) {

    const response = await api.get(
        `/produtos-venda/${id}`
    );

    return response.data;
}


export async function criarProdutoVenda(
    dados
) {

    const response = await api.post(
        "/produtos-venda",
        dados
    );

    return response.data;
}


export async function atualizarProdutoVenda(
    id,
    dados
) {

    const response = await api.put(
        `/produtos-venda/${id}`,
        dados
    );

    return response.data;
}


export async function excluirProdutoVenda(
    id
) {

    const response = await api.delete(
        `/produtos-venda/${id}`
    );

    return response.data;
}