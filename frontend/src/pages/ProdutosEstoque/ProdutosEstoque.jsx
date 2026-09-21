import {
    useEffect,
    useState
} from "react";

import {
    Pencil,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import {
    atualizarProdutoEstoque,
    criarProdutoEstoque,
    excluirProdutoEstoque,
    listarProdutosEstoque
} from "../../services/produtoEstoqueService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./ProdutosEstoque.module.css";


const formularioInicial = {
    nome: "",
    codigo_barras: ""
};


function ProdutosEstoque() {

    const [
        produtos,
        setProdutos
    ] = useState([]);


    const [
        busca,
        setBusca
    ] = useState("");


    const [
        formulario,
        setFormulario
    ] = useState(
        formularioInicial
    );


    const [
        produtoEditando,
        setProdutoEditando
    ] = useState(null);


    const [
        modalFormularioAberto,
        setModalFormularioAberto
    ] = useState(false);


    const [
        produtoExcluir,
        setProdutoExcluir
    ] = useState(null);


    const [
        erro,
        setErro
    ] = useState("");


    const [
        mensagem,
        setMensagem
    ] = useState("");


    const [
        carregando,
        setCarregando
    ] = useState(false);


    const [
        excluindo,
        setExcluindo
    ] = useState(false);


    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);


    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);


    async function carregarProdutos(
        textoBusca = ""
    ) {

        try {

            const dados =
                await listarProdutosEstoque(
                    textoBusca
                );


            setProdutos(
                Array.isArray(dados)
                    ? dados
                    : []
            );

        } catch {

            setErro(
                "Não foi possível carregar "
                + "os produtos."
            );
        }
    }


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            carregarProdutos();

        },
        []
    );


    function handleChange(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        setFormulario(
            (anterior) => ({
                ...anterior,
                [name]:
                    value
            })
        );
    }


    async function handleBusca(
        event
    ) {

        const valor =
            event.target.value;


        setBusca(
            valor
        );


        setPaginaAtual(
            1
        );


        await carregarProdutos(
            valor
        );
    }


    function limparFormulario() {

        setProdutoEditando(
            null
        );


        setFormulario(
            formularioInicial
        );
    }


    function abrirAdicionar() {

        limparFormulario();

        setErro("");

        setMensagem("");

        setModalFormularioAberto(
            true
        );
    }


    function editar(
        produto
    ) {

        setProdutoEditando(
            produto.id
        );


        setFormulario({
            nome:
                produto.nome
                || "",

            codigo_barras:
                produto.codigo_barras
                || ""
        });


        setErro("");

        setMensagem("");

        setModalFormularioAberto(
            true
        );
    }


    function fecharFormulario() {

        if (
            carregando
        ) {

            return;
        }


        setModalFormularioAberto(
            false
        );


        limparFormulario();

        setErro("");
    }


    function abrirExcluir(
        produto
    ) {

        setErro("");

        setMensagem("");

        setProdutoExcluir(
            produto
        );
    }


    function fecharExcluir() {

        if (
            excluindo
        ) {

            return;
        }


        setProdutoExcluir(
            null
        );
    }


    async function handleSubmit(
        event
    ) {

        event.preventDefault();

        setErro("");

        setMensagem("");

        setCarregando(
            true
        );


        try {

            const dados = {
                nome:
                    formulario.nome
                        .trim(),

                codigo_barras:
                    String(
                        formulario.codigo_barras
                        || ""
                    )
                        .replace(
                            /\D/g,
                            ""
                        )
            };


            if (
                produtoEditando
            ) {

                await atualizarProdutoEstoque(
                    produtoEditando,
                    dados
                );


                setMensagem(
                    "Produto atualizado "
                    + "com sucesso."
                );

            } else {

                await criarProdutoEstoque(
                    dados
                );


                setMensagem(
                    "Produto cadastrado "
                    + "com sucesso."
                );
            }


            setModalFormularioAberto(
                false
            );


            limparFormulario();


            setPaginaAtual(
                1
            );


            await carregarProdutos(
                busca
            );

        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível salvar "
                + "o produto."
            );

        } finally {

            setCarregando(
                false
            );
        }
    }


    async function confirmarExclusao() {

        if (
            !produtoExcluir
        ) {

            return;
        }


        try {

            setExcluindo(
                true
            );


            setErro("");

            setMensagem("");


            await excluirProdutoEstoque(
                produtoExcluir.id
            );


            setMensagem(
                "Produto excluído "
                + "com sucesso."
            );


            setProdutoExcluir(
                null
            );


            setPaginaAtual(
                1
            );


            await carregarProdutos(
                busca
            );

        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível excluir "
                + "o produto."
            );

        } finally {

            setExcluindo(
                false
            );
        }
    }


    const totalItens =
        produtos.length;


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                totalItens
                /
                itensPorPagina
            )
        );


    const paginaSegura =
        Math.min(
            paginaAtual,
            totalPaginas
        );


    const indiceInicial =
        (
            paginaSegura - 1
        )
        *
        itensPorPagina;


    const indiceFinal =
        indiceInicial
        +
        itensPorPagina;


    const produtosPaginados =
        produtos.slice(
            indiceInicial,
            indiceFinal
        );


    function alterarItensPorPagina(
        quantidade
    ) {

        setItensPorPagina(
            quantidade
        );


        setPaginaAtual(
            1
        );
    }


    return (

        <div
            className={
                styles.page
            }
        >

            <div
                className={
                    styles.header
                }
            >

                <div>

                    <h1>
                        Produtos de Estoque
                    </h1>

                    <p>
                        Cadastre os produtos que
                        poderão ser usados nas
                        compras e no estoque.
                    </p>

                </div>


                <button
                    type="button"
                    className={
                        styles.addButton
                    }
                    onClick={
                        abrirAdicionar
                    }
                >

                    <Plus
                        size={16}
                    />

                    Adicionar Produto

                </button>

            </div>


            <div
                className={
                    styles.searchBox
                }
            >

                <Search
                    size={17}
                />


                <input
                    placeholder={
                        "Buscar por nome ou código..."
                    }
                    value={busca}
                    onChange={
                        handleBusca
                    }
                />

            </div>


            {
                mensagem
                && (

                    <div
                        className={
                            styles.success
                        }
                    >
                        {mensagem}
                    </div>
                )
            }


            {
                erro
                &&
                !modalFormularioAberto
                &&
                !produtoExcluir
                && (

                    <div
                        className={
                            styles.error
                        }
                    >
                        {erro}
                    </div>
                )
            }


            <section
                className={
                    styles.card
                }
            >

                <div
                    className={
                        styles.tableWrapper
                    }
                >

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Nome
                                </th>

                                <th>
                                    Código de barras
                                </th>

                                <th>
                                    Ações
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                produtosPaginados.length
                                === 0

                                    ? (

                                        <tr>

                                            <td
                                                colSpan="3"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum produto
                                                cadastrado.
                                            </td>

                                        </tr>
                                    )

                                    : produtosPaginados.map(
                                        (produto) => (

                                            <tr
                                                key={
                                                    produto.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        produto.nome
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        produto
                                                            .codigo_barras
                                                        || "-"
                                                    }
                                                </td>


                                                <td>

                                                    <div
                                                        className={
                                                            styles.actions
                                                        }
                                                    >

                                                        <button
                                                            type="button"
                                                            title="Editar"
                                                            onClick={() =>
                                                                editar(
                                                                    produto
                                                                )
                                                            }
                                                        >

                                                            <Pencil
                                                                size={15}
                                                            />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            title="Excluir"
                                                            onClick={() =>
                                                                abrirExcluir(
                                                                    produto
                                                                )
                                                            }
                                                        >

                                                            <Trash2
                                                                size={15}
                                                            />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <Paginacao
                    paginaAtual={
                        paginaSegura
                    }
                    totalItens={
                        totalItens
                    }
                    itensPorPagina={
                        itensPorPagina
                    }
                    onPaginaChange={
                        setPaginaAtual
                    }
                    onItensPorPaginaChange={
                        alterarItensPorPagina
                    }
                />

            </section>


            {
                modalFormularioAberto
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.modal
                            }
                            role="dialog"
                            aria-modal="true"
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>

                                    <h2>
                                        {
                                            produtoEditando
                                                ? "Editar Produto"
                                                : "Adicionar Produto"
                                        }
                                    </h2>

                                    <p>
                                        {
                                            produtoEditando
                                                ? "Atualize os dados do produto."
                                                : "Cadastre um novo produto de estoque."
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharFormulario
                                    }
                                    disabled={
                                        carregando
                                    }
                                    title="Fechar"
                                >

                                    <X
                                        size={19}
                                    />

                                </button>

                            </div>


                            <div
                                className={
                                    styles.modalBody
                                }
                            >

                                {
                                    erro
                                    && (

                                        <div
                                            className={
                                                styles.error
                                            }
                                        >
                                            {erro}
                                        </div>
                                    )
                                }


                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    <div
                                        className={
                                            styles.formGrid
                                        }
                                    >

                                        <div>

                                            <label>
                                                Nome *
                                            </label>

                                            <input
                                                name="nome"
                                                value={
                                                    formulario.nome
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Código de barras *
                                            </label>

                                            <input
                                                name="codigo_barras"
                                                value={
                                                    formulario
                                                        .codigo_barras
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                inputMode="numeric"
                                                required
                                            />

                                        </div>

                                    </div>


                                    <p
                                        className={
                                            styles.required
                                        }
                                    >
                                        * Campos obrigatórios
                                    </p>


                                    <div
                                        className={
                                            styles.formActions
                                        }
                                    >

                                        <button
                                            type="button"
                                            className={
                                                styles.cancelButton
                                            }
                                            onClick={
                                                fecharFormulario
                                            }
                                            disabled={
                                                carregando
                                            }
                                        >
                                            Cancelar
                                        </button>


                                        <button
                                            type="submit"
                                            className={
                                                styles.saveButton
                                            }
                                            disabled={
                                                carregando
                                            }
                                        >

                                            {
                                                carregando
                                                    ? "Salvando..."
                                                    : produtoEditando
                                                        ? "Salvar alterações"
                                                        : "Adicionar produto"
                                            }

                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>
                )
            }


            {
                produtoExcluir
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.confirmModal
                            }
                            role="dialog"
                            aria-modal="true"
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>

                                    <h2>
                                        Excluir Produto
                                    </h2>

                                    <p>
                                        Confirme a exclusão
                                        deste produto.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharExcluir
                                    }
                                    disabled={
                                        excluindo
                                    }
                                    title="Fechar"
                                >

                                    <X
                                        size={19}
                                    />

                                </button>

                            </div>


                            <div
                                className={
                                    styles.confirmBody
                                }
                            >

                                {
                                    erro
                                    && (

                                        <div
                                            className={
                                                styles.error
                                            }
                                        >
                                            {erro}
                                        </div>
                                    )
                                }


                                <p>
                                    Deseja realmente excluir
                                    o produto:
                                </p>


                                <strong>
                                    {
                                        produtoExcluir.nome
                                    }
                                </strong>


                                <span>
                                    Código de barras:{" "}
                                    {
                                        produtoExcluir
                                            .codigo_barras
                                        || "-"
                                    }
                                </span>


                                <div
                                    className={
                                        styles.formActions
                                    }
                                >

                                    <button
                                        type="button"
                                        className={
                                            styles.cancelButton
                                        }
                                        onClick={
                                            fecharExcluir
                                        }
                                        disabled={
                                            excluindo
                                        }
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            styles.deleteButton
                                        }
                                        onClick={
                                            confirmarExclusao
                                        }
                                        disabled={
                                            excluindo
                                        }
                                    >
                                        {
                                            excluindo
                                                ? "Excluindo..."
                                                : "Excluir produto"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )
            }

        </div>
    );
}


export default ProdutosEstoque;
