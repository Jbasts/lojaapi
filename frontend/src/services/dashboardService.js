import api from "./api";


export async function buscarDashboard(
    data
) {

    const response = await api.get(
        "/dashboard",
        {
            params: {
                data
            }
        }
    );


    return response.data;
}