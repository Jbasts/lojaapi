import api from "./api";


export async function listarDespesasExtras(
    busca = ""
) {

    const response = await api.get(
        "/despesas-extras",
        {
            params: {
                busca
            }
        }
    );

    return response.data;
}


export async function criarDespesaExtra(
    dados
) {

    const response = await api.post(
        "/despesas-extras",
        dados
    );

    return response.data;
}


export async function atualizarDespesaExtra(
    id,
    dados
) {

    const response = await api.put(
        `/despesas-extras/${id}`,
        dados
    );

    return response.data;
}


export async function excluirDespesaExtra(
    id
) {

    const response = await api.delete(
        `/despesas-extras/${id}`
    );

    return response.data;
}