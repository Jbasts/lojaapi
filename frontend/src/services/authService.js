import api from "./api";


export async function realizarLogin(
    email,
    senha
) {

    const response = await api.post(
        "/auth/login",
        {
            email,
            senha
        }
    );

    return response.data;
}