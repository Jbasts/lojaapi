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


export async function listarReceitasEstoque() {

    const response = await api.get(
        "/estoque/receitas"
    );

    return response.data;
}


export async function buscarReceitaEstoque(
    produtoVendaId
) {

    const response = await api.get(
        `/estoque/receitas/${produtoVendaId}`
    );

    return response.data;
}


export async function retirarReceitaEstoque(
    dados
) {

    const response = await api.post(
        "/estoque/retirar-receita",
        dados
    );

    return response.data;
}


export async function listarRetiradasEstoque(
    periodo = "DIARIO",
    referencia = ""
) {

    const response = await api.get(
        "/estoque/retiradas",
        {
            params: {
                periodo,
                referencia
            }
        }
    );

    return response.data;
}