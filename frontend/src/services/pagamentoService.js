import api from "./api";


export async function listarPagamentos(
    busca = "",
    status = ""
) {

    const response = await api.get(
        "/pagamentos",
        {
            params: {
                busca,
                status
            }
        }
    );

    return response.data;
}


export async function pagarPedido(
    pedidoId,
    dados
) {

    const response = await api.post(
        `/pagamentos/pedido/${pedidoId}/pagar`,
        dados
    );

    return response.data;
}


export async function estornarPagamento(
    pagamentoId
) {

    const response = await api.post(
        `/pagamentos/${pagamentoId}/estornar`
    );

    return response.data;
}