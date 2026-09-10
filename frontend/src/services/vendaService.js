import api from "./api";

export async function listarVendas(
    periodo,
    data,
    busca = "",
    status = ""
) {

    const response = await api.get(
        "/vendas",
        {
            params: {
                periodo,
                data,
                busca,
                status
            }
        }
    );

    return response.data;
}

export async function buscarResumoVendas(
    periodo,
    data
) {

    const response = await api.get(
        "/vendas/resumo",
        {
            params: {
                periodo,
                data
            }
        }
    );

    return response.data;
}