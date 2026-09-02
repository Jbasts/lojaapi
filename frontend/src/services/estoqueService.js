import api from "./api";


export async function listarEstoque(
    busca = "",
    status = ""
) {

    const response = await api.get(
        "/estoque",
        {
            params: {
                busca,
                status
            }
        }
    );

    return response.data;
}


export async function buscarResumoEstoque() {

    const response = await api.get(
        "/estoque/resumo"
    );

    return response.data;
}


export async function buscarEstoquePorCodigo(
    codigo
) {

    const response = await api.get(
        "/estoque/codigo",
        {
            params: {
                codigo
            }
        }
    );

    return response.data;
}


export async function retirarProdutoEstoque(
    dados
) {

    const response = await api.post(
        "/estoque/retirar",
        dados
    );

    return response.data;
}