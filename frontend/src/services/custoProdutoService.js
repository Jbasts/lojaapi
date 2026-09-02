import api from "./api";


export async function listarCustosProdutos() {

    const response = await api.get(
        "/custos-produtos"
    );

    return response.data;
}


export async function buscarCustoProduto(
    produtoId
) {

    const response = await api.get(
        `/custos-produtos/${produtoId}`
    );

    return response.data;
}


export async function salvarCustoProduto(
    produtoId,
    dados
) {

    const response = await api.put(
        `/custos-produtos/${produtoId}`,
        dados
    );

    return response.data;
}


export async function removerCustoProduto(
    produtoId
) {

    const response = await api.delete(
        `/custos-produtos/${produtoId}`
    );

    return response.data;
}