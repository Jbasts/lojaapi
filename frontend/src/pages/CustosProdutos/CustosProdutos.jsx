import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Calculator,
    CircleDollarSign,
    PackageCheck,
    PackageX,
    Pencil,
    Plus,
    Save,
    Search,
    Trash2,
    X
} from "lucide-react";

import {
    listarCustosProdutos,
    buscarCustoProduto,
    salvarCustoProduto,
    removerCustoProduto
} from "../../services/custoProdutoService";

import {
    listarProdutosEstoque
} from "../../services/produtoEstoqueService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./CustosProdutos.module.css";


const itemInicial = () => ({
    tipo: "ESTOQUE",
    produto_estoque_id: "",
    descricao: "",
    quantidade: "",
    unidade: "UN",
    valor_unitario: ""
});


function CustosProdutos() {

    const [
        produtos,
        setProdutos
    ] = useState([]);


    const [
        produtosEstoque,
        setProdutosEstoque
    ] = useState([]);


    const [
        produtoModal,
        setProdutoModal
    ] = useState(null);


    const [
        produtoExcluir,
        setProdutoExcluir
    ] = useState(null);


    const [
        rendimento,
        setRendimento
    ] = useState(1);


    const [
        itens,
        setItens
    ] = useState([]);


    const [
        busca,
        setBusca
    ] = useState("");


    const [
        filtroFicha,
        setFiltroFicha
    ] = useState("TODOS");


    const [
        filtroTipo,
        setFiltroTipo
    ] = useState("TODOS");


    const [
        erro,
        setErro
    ] = useState("");


    const [
        erroModal,
        setErroModal
    ] = useState("");


    const [
        mensagem,
        setMensagem
    ] = useState("");


    const [
        carregandoModal,
        setCarregandoModal
    ] = useState(false);


    const [
        salvando,
        setSalvando
    ] = useState(false);


    const [
        removendo,
        setRemovendo
    ] = useState(false);


    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);


    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);


    async function carregarLista() {

        const dados =
            await listarCustosProdutos();


        const lista =
            Array.isArray(dados)
                ? dados
                : [];


        setProdutos(
            lista
        );


        return lista;
    }


    async function carregarEstoque() {

        const dados =
            await listarProdutosEstoque();


        setProdutosEstoque(
            Array.isArray(dados)
                ? dados
                : []
        );
    }


    useEffect(
        () => {

            async function iniciar() {

                try {

                    await Promise.all([
                        carregarLista(),
                        carregarEstoque()
                    ]);

                } catch {

                    setErro(
                        "Não foi possível carregar "
                        + "os custos dos produtos."
                    );
                }
            }


            iniciar();

        },
        []
    );


    function moeda(
        valor
    ) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }


    function adicionarItem() {

        setItens(
            (anterior) => [
                ...anterior,
                itemInicial()
            ]
        );
    }


    function alterarItem(
        indice,
        campo,
        valor
    ) {

        setItens(
            (anterior) => {

                const copia = [
                    ...anterior
                ];


                const item = {
                    ...copia[indice],
                    [campo]:
                        valor
                };


                if (
                    campo === "tipo"
                    &&
                    valor === "ESTOQUE"
                ) {

                    item.descricao = "";
                }


                if (
                    campo === "tipo"
                    &&
                    valor === "MANUAL"
                ) {

                    item.produto_estoque_id = "";
                }


                copia[indice] =
                    item;


                return copia;
            }
        );
    }


    function excluirItem(
        indice
    ) {

        setItens(
            (anterior) =>
                anterior.filter(
                    (_, atual) =>
                        atual !== indice
                )
        );
    }


    async function abrirFicha(
        itemLista
    ) {

        try {

            setErro("");

            setErroModal("");

            setMensagem("");

            setCarregandoModal(
                true
            );


            const dados =
                await buscarCustoProduto(
                    itemLista.produto_id
                );


            setProdutoModal({
                ...dados.produto,
                possui_ficha:
                    itemLista.possui_ficha
            });


            setRendimento(
                dados.ficha?.rendimento
                || 1
            );


            setItens(
                Array.isArray(
                    dados.itens
                )
                &&
                dados.itens.length > 0

                    ? dados.itens.map(
                        (item) => ({
                            tipo:
                                item.tipo,

                            produto_estoque_id:
                                item.produto_estoque_id
                                || "",

                            descricao:
                                item.descricao
                                || "",

                            quantidade:
                                item.quantidade,

                            unidade:
                                item.unidade,

                            valor_unitario:
                                item.valor_unitario
                        })
                    )

                    : []
            );

        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível abrir "
                + "a ficha de custo."
            );

        } finally {

            setCarregandoModal(
                false
            );
        }
    }


    function fecharFicha() {

        if (
            salvando
        ) {

            return;
        }


        setProdutoModal(
            null
        );

        setRendimento(
            1
        );

        setItens([]);

        setErroModal("");
    }


    function abrirExclusao(
        item
    ) {

        setErro("");

        setErroModal("");

        setMensagem("");

        setProdutoExcluir(
            item
        );
    }


    function fecharExclusao() {

        if (
            removendo
        ) {

            return;
        }


        setProdutoExcluir(
            null
        );

        setErroModal("");
    }


    const resumo =
        useMemo(
            () => {

                const custoTotal =
                    itens.reduce(
                        (
                            total,
                            item
                        ) => {

                            const quantidade =
                                Number(
                                    item.quantidade
                                )
                                || 0;


                            const valor =
                                Number(
                                    item.valor_unitario
                                )
                                || 0;


                            return (
                                total
                                +
                                quantidade
                                *
                                valor
                            );
                        },
                        0
                    );


                const rend =
                    Number(
                        rendimento
                    )
                    || 0;


                const custoUnitario =
                    rend > 0
                        ? custoTotal / rend
                        : 0;


                const preco =
                    Number(
                        produtoModal
                            ?.preco_venda
                    )
                    || 0;


                const lucro =
                    preco
                    -
                    custoUnitario;


                const margem =
                    preco > 0
                        ? (
                            lucro
                            /
                            preco
                        )
                        *
                        100
                        : 0;


                return {
                    custoTotal,
                    custoUnitario,
                    preco,
                    lucro,
                    margem
                };

            },
            [
                itens,
                rendimento,
                produtoModal
            ]
        );


    const resumoGeral =
        useMemo(
            () => {

                const total =
                    produtos.length;


                const comFicha =
                    produtos.filter(
                        (item) =>
                            item.possui_ficha
                    ).length;


                const semFicha =
                    total
                    -
                    comFicha;


                const margens =
                    produtos
                        .filter(
                            (item) =>
                                item.margem_percentual
                                !== null
                                &&
                                item.margem_percentual
                                !== undefined
                        )
                        .map(
                            (item) =>
                                Number(
                                    item.margem_percentual
                                )
                        )
                        .filter(
                            (valor) =>
                                Number.isFinite(
                                    valor
                                )
                        );


                const margemMedia =
                    margens.length > 0
                        ? margens.reduce(
                            (
                                soma,
                                valor
                            ) =>
                                soma + valor,
                            0
                        )
                        /
                        margens.length
                        : 0;


                return {
                    total,
                    comFicha,
                    semFicha,
                    margemMedia
                };

            },
            [
                produtos
            ]
        );


    const produtosFiltrados =
        useMemo(
            () => {

                const termo =
                    busca
                        .trim()
                        .toLowerCase();


                return produtos.filter(
                    (item) => {

                        const texto =
                            `${item.nome || ""} ${item.sabor || ""}`
                                .toLowerCase();


                        const combinaBusca =
                            !termo
                            ||
                            texto.includes(
                                termo
                            );


                        const combinaFicha =
                            filtroFicha === "TODOS"
                            ||
                            (
                                filtroFicha
                                === "COM_FICHA"
                                &&
                                item.possui_ficha
                            )
                            ||
                            (
                                filtroFicha
                                === "SEM_FICHA"
                                &&
                                !item.possui_ficha
                            );


                        const combinaTipo =
                            filtroTipo === "TODOS"
                            ||
                            item.tipo
                            === filtroTipo;


                        return (
                            combinaBusca
                            &&
                            combinaFicha
                            &&
                            combinaTipo
                        );
                    }
                );

            },
            [
                produtos,
                busca,
                filtroFicha,
                filtroTipo
            ]
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


    const produtosPaginados =
        produtosFiltrados.slice(
            indiceInicial,
            indiceInicial
            +
            itensPorPagina
        );


    function alterarBusca(
        event
    ) {

        setBusca(
            event.target.value
        );


        setPaginaAtual(
            1
        );
    }


    function alterarFiltroFicha(
        valor
    ) {

        setFiltroFicha(
            valor
        );


        setPaginaAtual(
            1
        );
    }


    function alterarFiltroTipo(
        valor
    ) {

        setFiltroTipo(
            valor
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


    async function salvar() {

        if (
            !produtoModal
        ) {

            return;
        }


        setErroModal("");

        setSalvando(
            true
        );


        try {

            await salvarCustoProduto(
                produtoModal.id,
                {
                    rendimento,
                    itens
                }
            );


            setMensagem(
                produtoModal.possui_ficha
                    ? "Ficha de custo atualizada com sucesso."
                    : "Ficha de custo criada com sucesso."
            );


            setProdutoModal(
                null
            );

            setRendimento(
                1
            );

            setItens([]);


            await carregarLista();

        } catch (error) {

            setErroModal(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível salvar "
                + "a ficha de custo."
            );

        } finally {

            setSalvando(
                false
            );
        }
    }


    async function confirmarRemocaoFicha() {

        if (
            !produtoExcluir
        ) {

            return;
        }


        try {

            setRemovendo(
                true
            );

            setErroModal("");


            await removerCustoProduto(
                produtoExcluir.produto_id
            );


            setMensagem(
                "Ficha removida "
                + "com sucesso."
            );


            setProdutoExcluir(
                null
            );


            await carregarLista();

        } catch (error) {

            setErroModal(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível remover "
                + "a ficha."
            );

        } finally {

            setRemovendo(
                false
            );
        }
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
                        Custos dos Produtos
                    </h1>

                    <p>
                        Fichas técnicas, custos,
                        lucro e margem.
                    </p>

                </div>

            </div>


            <div
                className={
                    styles.topCards
                }
            >

                <div
                    className={
                        styles.topCard
                    }
                >

                    <div
                        className={
                            styles.cardIcon
                        }
                    >
                        <Calculator
                            size={19}
                        />
                    </div>


                    <div>
                        <span>
                            Produtos
                        </span>

                        <strong>
                            {
                                resumoGeral.total
                            }
                        </strong>
                    </div>

                </div>


                <div
                    className={
                        styles.topCard
                    }
                >

                    <div
                        className={
                            styles.cardIcon
                        }
                    >
                        <PackageCheck
                            size={19}
                        />
                    </div>


                    <div>
                        <span>
                            Com ficha
                        </span>

                        <strong>
                            {
                                resumoGeral.comFicha
                            }
                        </strong>
                    </div>

                </div>


                <div
                    className={
                        styles.topCard
                    }
                >

                    <div
                        className={
                            styles.cardIcon
                        }
                    >
                        <PackageX
                            size={19}
                        />
                    </div>


                    <div>
                        <span>
                            Sem ficha
                        </span>

                        <strong>
                            {
                                resumoGeral.semFicha
                            }
                        </strong>
                    </div>

                </div>


                <div
                    className={
                        styles.topCard
                    }
                >

                    <div
                        className={
                            styles.cardIcon
                        }
                    >
                        <CircleDollarSign
                            size={19}
                        />
                    </div>


                    <div>
                        <span>
                            Margem média
                        </span>

                        <strong>
                            {
                                resumoGeral
                                    .margemMedia
                                    .toFixed(
                                        2
                                    )
                            }%
                        </strong>
                    </div>

                </div>

            </div>


            <div
                className={
                    styles.toolbar
                }
            >

                <div
                    className={
                        styles.searchBox
                    }
                >

                    <Search
                        size={17}
                    />


                    <input
                        value={busca}
                        onChange={
                            alterarBusca
                        }
                        placeholder={
                            "Buscar produto ou sabor..."
                        }
                    />

                </div>


                <div
                    className={
                        styles.filterGroup
                    }
                >

                    <button
                        type="button"
                        className={
                            filtroFicha
                            === "TODOS"
                                ? styles.filterActive
                                : styles.filterButton
                        }
                        onClick={() =>
                            alterarFiltroFicha(
                                "TODOS"
                            )
                        }
                    >
                        Todos
                    </button>


                    <button
                        type="button"
                        className={
                            filtroFicha
                            === "COM_FICHA"
                                ? styles.filterActive
                                : styles.filterButton
                        }
                        onClick={() =>
                            alterarFiltroFicha(
                                "COM_FICHA"
                            )
                        }
                    >
                        Com ficha
                    </button>


                    <button
                        type="button"
                        className={
                            filtroFicha
                            === "SEM_FICHA"
                                ? styles.filterActive
                                : styles.filterButton
                        }
                        onClick={() =>
                            alterarFiltroFicha(
                                "SEM_FICHA"
                            )
                        }
                    >
                        Sem ficha
                    </button>

                </div>


                <div
                    className={
                        styles.typeFilter
                    }
                >

                    <select
                        value={
                            filtroTipo
                        }
                        onChange={
                            (event) =>
                                alterarFiltroTipo(
                                    event.target.value
                                )
                        }
                    >
                        <option
                            value="TODOS"
                        >
                            Todos os tipos
                        </option>

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

            </div>


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


            <section
                className={
                    styles.productsCard
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
                                <th>Produto</th>
                                <th>Tipo</th>
                                <th>Ficha</th>
                                <th>Custo unit.</th>
                                <th>Preço</th>
                                <th>Lucro unit.</th>
                                <th>Margem</th>
                                <th>Ações</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                produtosPaginados.length
                                === 0

                                    ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum produto
                                                encontrado.
                                            </td>

                                        </tr>
                                    )

                                    : produtosPaginados.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.produto_id
                                                }
                                            >

                                                <td>

                                                    <div
                                                        className={
                                                            styles.productName
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                item.nome
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.sabor
                                                                || "Sem sabor"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            item.tipo
                                                            === "PRODUCAO"
                                                                ? styles.badgeProducao
                                                                : styles.badgeRevenda
                                                        }
                                                    >
                                                        {
                                                            item.tipo
                                                            === "PRODUCAO"
                                                                ? "Produção"
                                                                : "Revenda"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            item.possui_ficha
                                                                ? styles.badgeOk
                                                                : styles.badgePending
                                                        }
                                                    >
                                                        {
                                                            item.possui_ficha
                                                                ? "Cadastrada"
                                                                : "Pendente"
                                                        }
                                                    </span>

                                                </td>


                                                <td>
                                                    {
                                                        item.custo_unitario
                                                        !== null
                                                            ? moeda(
                                                                item.custo_unitario
                                                            )
                                                            : "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        moeda(
                                                            item.preco_venda
                                                        )
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        item.lucro_unitario
                                                        !== null
                                                            ? moeda(
                                                                item.lucro_unitario
                                                            )
                                                            : "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        item.margem_percentual
                                                        !== null
                                                            ? `${Number(
                                                                item.margem_percentual
                                                            ).toFixed(
                                                                2
                                                            )}%`
                                                            : "-"
                                                    }
                                                </td>


                                                <td>

                                                    <div
                                                        className={
                                                            styles.rowActions
                                                        }
                                                    >

                                                        {
                                                            item.possui_ficha

                                                                ? (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                styles.editButton
                                                                            }
                                                                            onClick={() =>
                                                                                abrirFicha(
                                                                                    item
                                                                                )
                                                                            }
                                                                            title="Editar ficha"
                                                                        >
                                                                            <Pencil
                                                                                size={14}
                                                                            />

                                                                            
                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                styles.deleteButton
                                                                            }
                                                                            onClick={() =>
                                                                                abrirExclusao(
                                                                                    item
                                                                                )
                                                                            }
                                                                            title="Excluir ficha"
                                                                        >
                                                                            <Trash2
                                                                                size={14}
                                                                            />

                                                                            
                                                                        </button>
                                                                    </>
                                                                )

                                                                : (

                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.createButton
                                                                        }
                                                                        onClick={() =>
                                                                            abrirFicha(
                                                                                item
                                                                            )
                                                                        }
                                                                    >
                                                                        <Plus
                                                                            size={14}
                                                                        />

                                                                        Criar ficha
                                                                    </button>
                                                                )
                                                        }

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
                carregandoModal
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.loadingModal
                            }
                        >
                            Carregando ficha...
                        </div>

                    </div>
                )
            }


            {
                produtoModal
                && (
                    !carregandoModal
                )
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.editorModal
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

                                    <div
                                        className={
                                            styles.modalTitleLine
                                        }
                                    >

                                        <h2>
                                            {
                                                produtoModal.possui_ficha
                                                    ? "Editar Ficha de Custo"
                                                    : "Criar Ficha de Custo"
                                            }
                                        </h2>


                                        <span
                                            className={
                                                produtoModal.tipo
                                                === "PRODUCAO"
                                                    ? styles.badgeProducao
                                                    : styles.badgeRevenda
                                            }
                                        >
                                            {
                                                produtoModal.tipo
                                                === "PRODUCAO"
                                                    ? "Produção"
                                                    : "Revenda"
                                            }
                                        </span>

                                    </div>


                                    <p>
                                        {
                                            produtoModal.nome
                                        }

                                        {
                                            produtoModal.sabor
                                            &&
                                            ` - ${produtoModal.sabor}`
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharFicha
                                    }
                                    disabled={
                                        salvando
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
                                    styles.editorModalBody
                                }
                            >

                                {
                                    erroModal
                                    && (

                                        <div
                                            className={
                                                styles.error
                                            }
                                        >
                                            {erroModal}
                                        </div>
                                    )
                                }


                                <div
                                    className={
                                        styles.modalSummary
                                    }
                                >

                                    <div>
                                        <span>
                                            Custo total
                                        </span>

                                        <strong>
                                            {
                                                moeda(
                                                    resumo.custoTotal
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Custo unitário
                                        </span>

                                        <strong>
                                            {
                                                moeda(
                                                    resumo.custoUnitario
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Preço de venda
                                        </span>

                                        <strong>
                                            {
                                                moeda(
                                                    resumo.preco
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Lucro unitário
                                        </span>

                                        <strong
                                            className={
                                                resumo.lucro < 0
                                                    ? styles.negative
                                                    : ""
                                            }
                                        >
                                            {
                                                moeda(
                                                    resumo.lucro
                                                )
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Margem
                                        </span>

                                        <strong
                                            className={
                                                resumo.margem < 0
                                                    ? styles.negative
                                                    : ""
                                            }
                                        >
                                            {
                                                resumo.margem
                                                    .toFixed(
                                                        2
                                                    )
                                            }%
                                        </strong>
                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.rendimento
                                    }
                                >

                                    <div>

                                        <label>
                                            Rendimento *
                                        </label>

                                        <span>
                                            Quantas unidades
                                            esta ficha produz.
                                        </span>

                                    </div>


                                    <input
                                        type="number"
                                        min="0.001"
                                        step="0.001"
                                        value={
                                            rendimento
                                        }
                                        onChange={
                                            (event) =>
                                                setRendimento(
                                                    event.target.value
                                                )
                                        }
                                    />

                                </div>


                                <div
                                    className={
                                        styles.itemsHeader
                                    }
                                >

                                    <div>

                                        <h3>
                                            Itens de custo
                                        </h3>

                                        <span>
                                            Ingredientes,
                                            embalagens ou
                                            custos manuais.
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            adicionarItem
                                        }
                                    >

                                        <Plus
                                            size={15}
                                        />

                                        Adicionar item

                                    </button>

                                </div>


                                <div
                                    className={
                                        styles.tableWrapper
                                    }
                                >

                                    <table
                                        className={
                                            styles.itemsTable
                                        }
                                    >

                                        <thead>

                                            <tr>
                                                <th>Tipo</th>
                                                <th>Item</th>
                                                <th>Qtd.</th>
                                                <th>Unidade</th>
                                                <th>Valor unit.</th>
                                                <th>Subtotal</th>
                                                <th></th>
                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                itens.length
                                                === 0

                                                    ? (

                                                        <tr>

                                                            <td
                                                                colSpan="7"
                                                                className={
                                                                    styles.empty
                                                                }
                                                            >
                                                                Adicione os
                                                                componentes
                                                                do custo.
                                                            </td>

                                                        </tr>
                                                    )

                                                    : itens.map(
                                                        (
                                                            item,
                                                            indice
                                                        ) => {

                                                            const subtotal =
                                                                (
                                                                    Number(
                                                                        item.quantidade
                                                                    )
                                                                    || 0
                                                                )
                                                                *
                                                                (
                                                                    Number(
                                                                        item.valor_unitario
                                                                    )
                                                                    || 0
                                                                );


                                                            return (

                                                                <tr
                                                                    key={
                                                                        indice
                                                                    }
                                                                >

                                                                    <td>

                                                                        <select
                                                                            value={
                                                                                item.tipo
                                                                            }
                                                                            onChange={
                                                                                (event) =>
                                                                                    alterarItem(
                                                                                        indice,
                                                                                        "tipo",
                                                                                        event.target.value
                                                                                    )
                                                                            }
                                                                        >

                                                                            <option
                                                                                value="ESTOQUE"
                                                                            >
                                                                                Estoque
                                                                            </option>

                                                                            <option
                                                                                value="MANUAL"
                                                                            >
                                                                                Manual
                                                                            </option>

                                                                        </select>

                                                                    </td>


                                                                    <td>

                                                                        {
                                                                            item.tipo
                                                                            === "ESTOQUE"

                                                                                ? (

                                                                                    <select
                                                                                        value={
                                                                                            item.produto_estoque_id
                                                                                        }
                                                                                        onChange={
                                                                                            (event) =>
                                                                                                alterarItem(
                                                                                                    indice,
                                                                                                    "produto_estoque_id",
                                                                                                    event.target.value
                                                                                                )
                                                                                        }
                                                                                    >

                                                                                        <option
                                                                                            value=""
                                                                                        >
                                                                                            Selecione
                                                                                        </option>


                                                                                        {
                                                                                            produtosEstoque.map(
                                                                                                (estoque) => (

                                                                                                    <option
                                                                                                        key={
                                                                                                            estoque.id
                                                                                                        }
                                                                                                        value={
                                                                                                            estoque.id
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            estoque.nome
                                                                                                        }
                                                                                                    </option>
                                                                                                )
                                                                                            )
                                                                                        }

                                                                                    </select>
                                                                                )

                                                                                : (

                                                                                    <input
                                                                                        value={
                                                                                            item.descricao
                                                                                        }
                                                                                        placeholder={
                                                                                            "Ex.: Entrega"
                                                                                        }
                                                                                        onChange={
                                                                                            (event) =>
                                                                                                alterarItem(
                                                                                                    indice,
                                                                                                    "descricao",
                                                                                                    event.target.value
                                                                                                )
                                                                                        }
                                                                                    />
                                                                                )
                                                                        }

                                                                    </td>


                                                                    <td>

                                                                        <input
                                                                            type="number"
                                                                            min="0.0001"
                                                                            step="0.0001"
                                                                            value={
                                                                                item.quantidade
                                                                            }
                                                                            onChange={
                                                                                (event) =>
                                                                                    alterarItem(
                                                                                        indice,
                                                                                        "quantidade",
                                                                                        event.target.value
                                                                                    )
                                                                            }
                                                                        />

                                                                    </td>


                                                                    <td>

                                                                        <select
                                                                            value={
                                                                                item.unidade
                                                                            }
                                                                            onChange={
                                                                                (event) =>
                                                                                    alterarItem(
                                                                                        indice,
                                                                                        "unidade",
                                                                                        event.target.value
                                                                                    )
                                                                            }
                                                                        >
                                                                            <option value="UN">UN</option>
                                                                            <option value="KG">KG</option>
                                                                            <option value="G">G</option>
                                                                            <option value="L">L</option>
                                                                            <option value="ML">ML</option>
                                                                            <option value="CX">CX</option>
                                                                            <option value="PCT">PCT</option>
                                                                        </select>

                                                                    </td>


                                                                    <td>

                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            value={
                                                                                item.valor_unitario
                                                                            }
                                                                            onChange={
                                                                                (event) =>
                                                                                    alterarItem(
                                                                                        indice,
                                                                                        "valor_unitario",
                                                                                        event.target.value
                                                                                    )
                                                                            }
                                                                        />

                                                                    </td>


                                                                    <td
                                                                        className={
                                                                            styles.subtotal
                                                                        }
                                                                    >
                                                                        {
                                                                            moeda(
                                                                                subtotal
                                                                            )
                                                                        }
                                                                    </td>


                                                                    <td>

                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                styles.removeItem
                                                                            }
                                                                            onClick={() =>
                                                                                excluirItem(
                                                                                    indice
                                                                                )
                                                                            }
                                                                            title={
                                                                                "Remover item"
                                                                            }
                                                                        >
                                                                            <Trash2
                                                                                size={14}
                                                                            />
                                                                        </button>

                                                                    </td>

                                                                </tr>
                                                            );
                                                        }
                                                    )
                                            }

                                        </tbody>

                                    </table>

                                </div>

                            </div>


                            <div
                                className={
                                    styles.modalFooter
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.cancelButton
                                    }
                                    onClick={
                                        fecharFicha
                                    }
                                    disabled={
                                        salvando
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="button"
                                    className={
                                        styles.saveButton
                                    }
                                    onClick={
                                        salvar
                                    }
                                    disabled={
                                        salvando
                                    }
                                >

                                    <Save
                                        size={16}
                                    />

                                    {
                                        salvando
                                            ? "Salvando..."
                                            : produtoModal.possui_ficha
                                                ? "Salvar alterações"
                                                : "Criar ficha"
                                    }

                                </button>

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
                                        Excluir Ficha de Custo
                                    </h2>

                                    <p>
                                        Confirme a exclusão
                                        da ficha.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharExclusao
                                    }
                                    disabled={
                                        removendo
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
                                    erroModal
                                    && (

                                        <div
                                            className={
                                                styles.error
                                            }
                                        >
                                            {erroModal}
                                        </div>
                                    )
                                }


                                <p>
                                    Deseja realmente excluir
                                    a ficha de custo de:
                                </p>


                                <strong>
                                    {
                                        produtoExcluir.nome
                                    }

                                    {
                                        produtoExcluir.sabor
                                        &&
                                        ` - ${produtoExcluir.sabor}`
                                    }
                                </strong>


                                <span>
                                    A ficha atual será
                                    desativada.
                                </span>


                                <div
                                    className={
                                        styles.confirmActions
                                    }
                                >

                                    <button
                                        type="button"
                                        className={
                                            styles.cancelButton
                                        }
                                        onClick={
                                            fecharExclusao
                                        }
                                        disabled={
                                            removendo
                                        }
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            styles.confirmDelete
                                        }
                                        onClick={
                                            confirmarRemocaoFicha
                                        }
                                        disabled={
                                            removendo
                                        }
                                    >
                                        {
                                            removendo
                                                ? "Excluindo..."
                                                : "Excluir ficha"
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


export default CustosProdutos;
