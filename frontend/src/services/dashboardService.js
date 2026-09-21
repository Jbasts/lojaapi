import api from "./api";


export async function buscarDashboard(
    dataReferencia,
    mesesGrafico = 6,
    rankingPeriodo = "MENSAL"
) {

    const response =
        await api.get(
            "/dashboard",
            {
                params: {
                    data_referencia:
                        dataReferencia,

                    meses_grafico:
                        mesesGrafico,

                    ranking_periodo:
                        rankingPeriodo
                }
            }
        );


    return response.data;
}