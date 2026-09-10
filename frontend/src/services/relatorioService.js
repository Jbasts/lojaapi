import api from "./api";


export async function buscarRelatorio(
    periodo,
    data
) {

    const response = await api.get(
        "/relatorios",
        {
            params: {
                periodo,
                data
            }
        }
    );


    return response.data;
}