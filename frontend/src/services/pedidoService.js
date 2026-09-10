import api from "./api";


export async function listarPedidos(
    busca = "",
    status = ""
) {

    const response = await api.get(
        "/pedidos",
        {
            params: {
                busca,
                status
            }
        }
    );

    return response.data;
}


export async function buscarPedido(
    id
) {

    const response = await api.get(
        `/pedidos/${id}`
    );

    return response.data;
}


export async function criarPedido(
    dados
) {

    const response = await api.post(
        "/pedidos",
        dados
    );

    return response.data;
}


export async function atualizarPedido(
    id,
    dados
) {

    const response = await api.put(
        `/pedidos/${id}`,
        dados
    );

    return response.data;
}


export async function excluirPedido(
    id
) {

    const response = await api.delete(
        `/pedidos/${id}`
    );

    return response.data;
}


export async function concluirPedido(
    id
) {

    const response = await api.post(
        `/pedidos/${id}/concluir`
    );

    return response.data;
}