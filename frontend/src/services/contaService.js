import api from "./api";


export async function listarContas(
    periodo,
    data,
    busca = "",
    tipo = "",
    categoria = ""
) {

    const response = await api.get(
        "/contas",
        {
            params: {
                periodo,
                data,
                busca,
                tipo,
                categoria
            }
        }
    );

    return response.data;
}


export async function buscarResumoContas(
    periodo,
    data
) {

    const response = await api.get(
        "/contas/resumo",
        {
            params: {
                periodo,
                data
            }
        }
    );

    return response.data;
}


export async function buscarDetalhesCompra(
    compraId
) {

    const response = await api.get(
        `/contas/compras/${compraId}`
    );

    return response.data;
}