import api from "./api";


export async function listarProdutosEstoque(
    busca = ""
) {

    const response = await api.get(
        "/produtos-estoque",
        {
            params: {
                busca
            }
        }
    );

    return response.data;
}


export async function buscarProdutoEstoque(
    id
) {

    const response = await api.get(
        `/produtos-estoque/${id}`
    );

    return response.data;
}


export async function buscarProdutoPorCodigo(
    codigo
) {

    const response = await api.get(
        "/produtos-estoque/codigo",
        {
            params: {
                codigo
            }
        }
    );

    return response.data;
}


export async function criarProdutoEstoque(
    dados
) {

    const response = await api.post(
        "/produtos-estoque",
        dados
    );

    return response.data;
}


export async function atualizarProdutoEstoque(
    id,
    dados
) {

    const response = await api.put(
        `/produtos-estoque/${id}`,
        dados
    );

    return response.data;
}


export async function excluirProdutoEstoque(
    id
) {

    const response = await api.delete(
        `/produtos-estoque/${id}`
    );

    return response.data;
}