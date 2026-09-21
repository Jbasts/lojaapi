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
    criarProdutoVenda,
    atualizarProdutoVenda,
    excluirProdutoVenda,
    listarProdutosVenda
} from "../../services/produtoVendaService";

import {
    listarProdutosEstoque
} from "../../services/produtoEstoqueService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./ProdutosVenda.module.css";


const formularioInicial = {
    nome: "",
    sabor: "",
    tipo: "PRODUCAO",
    preco_venda: "",
    produto_estoque_id: ""
};


function ProdutosVenda() {

    const [produtos, setProdutos] =
        useState([]);

    const [
        produtosEstoque,
        setProdutosEstoque
    ] = useState([]);

    const [busca, setBusca] =
        useState("");


    const [
        filtroTipo,
        setFiltroTipo
    ] = useState("TODOS");


    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [
        produtoEditando,
        setProdutoEditando
    ] = useState(null);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [
        carregando,
        setCarregando
    ] = useState(false);


    const [
        modalFormularioAberto,
        setModalFormularioAberto
    ] = useState(false);


    const [
        produtoExcluir,
        setProdutoExcluir
    ] = useState(null);


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
                await listarProdutosVenda(
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
                + "os produtos de venda."
            );
        }
    }


    async function carregarEstoque() {

        try {

            const dados =
                await listarProdutosEstoque();

            setProdutosEstoque(
                Array.isArray(dados)
                    ? dados
                    : []
            );

        } catch {

            setErro(
                "Não foi possível carregar "
                + "os produtos de estoque."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregarProdutos();

        carregarEstoque();

    }, []);


    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        if (
            name === "tipo"
            && value === "PRODUCAO"
        ) {

            setFormulario(
                (anterior) => ({
                    ...anterior,
                    tipo: value,
                    produto_estoque_id: ""
                })
            );

            return;
        }


        setFormulario(
            (anterior) => ({
                ...anterior,
                [name]: value
            })
        );
    }


    async function handleBusca(event) {

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


    function editar(produto) {

        setProdutoEditando(
            produto.id
        );

        setFormulario({
            nome:
                produto.nome || "",

            sabor:
                produto.sabor || "",

            tipo:
                produto.tipo,

            preco_venda:
                produto.preco_venda,

            produto_estoque_id:
                produto.produto_estoque_id
                || ""
        });

        setErro("");
        setMensagem("");

        setModalFormularioAberto(
            true
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


    async function handleSubmit(event) {

        event.preventDefault();

        setErro("");
        setMensagem("");
        setCarregando(true);

        try {

            const dados = {
                ...formulario,

                produto_estoque_id:
                    formulario.tipo
                    === "REVENDA"
                        ? Number(
                            formulario
                                .produto_estoque_id
                        )
                        : null
            };


            if (produtoEditando) {

                await atualizarProdutoVenda(
                    produtoEditando,
                    dados
                );

                setMensagem(
                    "Produto atualizado "
                    + "com sucesso."
                );

            } else {

                await criarProdutoVenda(
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
                "Não foi possível "
                + "salvar o produto."
            );

        } finally {

            setCarregando(false);
        }
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


            await excluirProdutoVenda(
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
                "Não foi possível "
                + "excluir o produto."
            );

        } finally {

            setExcluindo(
                false
            );
        }
    }


    const quantidadeProducao =
        produtos.filter(
            (produto) => (
                produto.tipo
                === "PRODUCAO"
            )
        ).length;


    const quantidadeRevenda =
        produtos.filter(
            (produto) => (
                produto.tipo
                === "REVENDA"
            )
        ).length;


    const produtosFiltrados =
        produtos.filter(
            (produto) => {

                if (
                    filtroTipo
                    === "TODOS"
                ) {

                    return true;
                }


                return (
                    produto.tipo
                    === filtroTipo
                );
            }
        );


    const totalItens =
        produtosFiltrados.length;


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
        produtosFiltrados.slice(
            indiceInicial,
            indiceFinal
        );


    function alterarFiltroTipo(
        tipo
    ) {

        setFiltroTipo(
            tipo
        );

        setPaginaAtual(
            1
        );
    }


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

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Produtos de Venda
                    </h1>

                    <p>
                        Cadastre os produtos
                        comercializados.
                    </p>

                </div>


                <button
                    className={
                        styles.addButton
                    }
                    onClick={abrirAdicionar}
                >

                    <Plus size={16} />

                    Adicionar Produto

                </button>

            </div>


            <div
                className={
                    styles.searchBox
                }
            >

                <Search size={17} />

                <input
                    placeholder={
                        "Buscar produto..."
                    }
                    value={busca}
                    onChange={handleBusca}
                />

            </div>


            <div
                className={
                    styles.summaryGrid
                }
            >

                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <span>
                        Produção
                    </span>

                    <strong>
                        {quantidadeProducao}
                    </strong>

                    <small>
                        produtos cadastrados
                    </small>

                </div>


                <div
                    className={
                        styles.summaryCard
                    }
                >

                    <span>
                        Revenda
                    </span>

                    <strong>
                        {quantidadeRevenda}
                    </strong>

                    <small>
                        produtos cadastrados
                    </small>

                </div>

            </div>


            <div
                className={
                    styles.typeFilter
                }
            >

                <span>
                    Filtrar por tipo:
                </span>


                <button
                    type="button"
                    className={
                        filtroTipo === "TODOS"
                            ? styles.filterActive
                            : ""
                    }
                    onClick={() =>
                        alterarFiltroTipo(
                            "TODOS"
                        )
                    }
                >
                    Todos
                </button>


                <button
                    type="button"
                    className={
                        filtroTipo === "PRODUCAO"
                            ? styles.filterActive
                            : ""
                    }
                    onClick={() =>
                        alterarFiltroTipo(
                            "PRODUCAO"
                        )
                    }
                >
                    Produção
                </button>


                <button
                    type="button"
                    className={
                        filtroTipo === "REVENDA"
                            ? styles.filterActive
                            : ""
                    }
                    onClick={() =>
                        alterarFiltroTipo(
                            "REVENDA"
                        )
                    }
                >
                    Revenda
                </button>

            </div>


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


            {
                mensagem && (

                    <div
                        className={
                            styles.success
                        }
                    >
                        {mensagem}
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
                                    Produto
                                </th>

                                <th>
                                    Sabor
                                </th>

                                <th>
                                    Tipo
                                </th>

                                <th>
                                    Preço
                                </th>

                                <th>
                                    Estoque relacionado
                                </th>

                                <th>
                                    Ações
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                produtosPaginados.length === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="6"
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
                                                        produto.sabor
                                                        || "-"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            produto.tipo
                                                            === "PRODUCAO"
                                                                ? styles.producao
                                                                : styles.revenda
                                                        }
                                                    >
                                                        {
                                                            produto.tipo
                                                            === "PRODUCAO"
                                                                ? "Produção"
                                                                : "Revenda"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    {
                                                        Number(
                                                            produto
                                                                .preco_venda
                                                        )
                                                        .toLocaleString(
                                                            "pt-BR",
                                                            {
                                                                style:
                                                                    "currency",

                                                                currency:
                                                                    "BRL"
                                                            }
                                                        )
                                                    }

                                                </td>

                                                <td>

                                                    {
                                                        produto
                                                            .produto_estoque_nome
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
                                                ? "Atualize os dados do produto de venda."
                                                : "Cadastre um novo produto de venda."
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
                    onSubmit={handleSubmit}
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
                                Sabor
                            </label>

                            <input
                                name="sabor"
                                value={
                                    formulario.sabor
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder={
                                    "Ex.: Chocolate"
                                }
                            />

                        </div>


                        <div>

                            <label>
                                Tipo *
                            </label>

                            <select
                                name="tipo"
                                value={
                                    formulario.tipo
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >

                                <option
                                    value="PRODUCAO"
                                >
                                    Produção
                                </option>

                                <option
                                    value="REVENDA"
                                >
                                    Revenda
                                </option>

                            </select>

                        </div>


                        <div>

                            <label>
                                Preço de venda *
                            </label>

                            <input
                                type="number"
                                name="preco_venda"
                                value={
                                    formulario.preco_venda
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                step="0.01"
                                required
                            />

                        </div>


                        {
                            formulario.tipo
                            === "REVENDA"
                            && (

                                <div
                                    className={
                                        styles.fullField
                                    }
                                >

                                    <label>
                                        Produto de estoque *
                                    </label>

                                    <select
                                        name={
                                            "produto_estoque_id"
                                        }
                                        value={
                                            formulario
                                                .produto_estoque_id
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Selecione
                                        </option>

                                        {
                                            produtosEstoque.map(
                                                (produto) => (

                                                    <option
                                                        key={
                                                            produto.id
                                                        }
                                                        value={
                                                            produto.id
                                                        }
                                                    >
                                                        {
                                                            produto.nome
                                                        }
                                                        {" - "}
                                                        {
                                                            produto
                                                                .codigo_barras
                                                        }
                                                    </option>
                                                )
                                            )
                                        }

                                    </select>

                                </div>
                            )
                        }

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
                            onClick={fecharFormulario}
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
                                    {
                                        produtoExcluir.sabor
                                            ? ` - ${produtoExcluir.sabor}`
                                            : ""
                                    }
                                </strong>


                                <span>
                                    {
                                        produtoExcluir.tipo
                                        === "PRODUCAO"
                                            ? "Produção"
                                            : "Revenda"
                                    }
                                     | 
                                    {
                                        Number(
                                            produtoExcluir.preco_venda
                                            || 0
                                        ).toLocaleString(
                                            "pt-BR",
                                            {
                                                style: "currency",
                                                currency: "BRL"
                                            }
                                        )
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


export default ProdutosVenda;
