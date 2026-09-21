import api from "./api";


export async function listarDesperdicios(
    busca = "",
    motivo = "",
    periodo = "TOTAL",
    referencia = ""
) {

    const response = await api.get(
        "/desperdicios",
        {
            params: {
                busca,
                motivo,
                periodo,
                referencia
            }
        }
    );

    return response.data;
}


export async function buscarDesperdicio(
    id
) {

    const response = await api.get(
        `/desperdicios/${id}`
    );

    return response.data;
}


export async function criarDesperdicio(
    dados
) {

    const response = await api.post(
        "/desperdicios",
        dados
    );

    return response.data;
}


export async function atualizarDesperdicio(
    id,
    dados
) {

    const response = await api.put(
        `/desperdicios/${id}`,
        dados
    );

    return response.data;
}


export async function excluirDesperdicio(
    id
) {

    const response = await api.delete(
        `/desperdicios/${id}`
    );

    return response.data;
}