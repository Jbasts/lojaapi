import api from "./api";


export async function listarCompras(
    busca = ""
) {

    const response = await api.get(
        "/compras",
        {
            params: {
                busca
            }
        }
    );

    return response.data;
}


export async function buscarCompra(id) {

    const response = await api.get(
        `/compras/${id}`
    );

    return response.data;
}


export async function criarCompra(dados) {

    const response = await api.post(
        "/compras",
        dados
    );

    return response.data;
}


export async function atualizarCompra(
    id,
    dados
) {

    const response = await api.put(
        `/compras/${id}`,
        dados
    );

    return response.data;
}


export async function excluirCompra(id) {

    const response = await api.delete(
        `/compras/${id}`
    );

    return response.data;
}