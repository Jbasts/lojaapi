import {
    Fragment,
    useEffect,
    useState
} from "react";

import {
    Boxes,
    ChevronDown,
    ChevronRight,
    CircleDollarSign,
    Package,
    PackageMinus,
    Search,
    TriangleAlert,
    X
} from "lucide-react";

import {
    buscarEstoquePorCodigo,
    buscarReceitaEstoque,
    buscarResumoEstoque,
    listarEstoque,
    listarReceitasEstoque,
    listarRetiradasEstoque,
    retirarProdutoEstoque,
    retirarReceitaEstoque
} from "../../services/estoqueService";

import styles
    from "./Estoque.module.css";


const retiradaInicial = {
    codigo: "",
    produto: null,
    lotes: [],
    lote_id: "",
    quantidade: "",
    observacao: ""
};


const receitaInicial = {
    produto_venda_id: "",
    quantidade_produzir: "",
    observacao: ""
};


function referenciaAtual(
    periodo
) {

    const agora = new Date();

    const ano =
        String(
            agora.getFullYear()
        );

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );


    if (periodo === "MENSAL") {

        return `${ano}-${mes}`;
    }


    if (periodo === "ANUAL") {

        return ano;
    }


    return `${ano}-${mes}-${dia}`;
}



function Estoque() {

    const [lotes, setLotes] =
        useState([]);

    const [resumo, setResumo] =
        useState({
            produtos: 0,
            lotes: 0,
            quantidade_total: 0,
            valor_estoque: 0,
            lotes_proximos_validade: 0,
            lotes_vencidos: 0
        });

    const [busca, setBusca] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [retirada, setRetirada] =
        useState(retiradaInicial);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [retirando, setRetirando] =
        useState(false);


    const [
        modalRetiradaAberto,
        setModalRetiradaAberto
    ] = useState(false);


    const [
        modoRetirada,
        setModoRetirada
    ] = useState("UNITARIO");


    const [receitas, setReceitas] =
        useState([]);


    const [
        receita,
        setReceita
    ] = useState(receitaInicial);


    const [
        detalhesReceita,
        setDetalhesReceita
    ] = useState(null);


    const [
        retirandoReceita,
        setRetirandoReceita
    ] = useState(false);


    const [
        lotesReceita,
        setLotesReceita
    ] = useState({});


    const [
        retiradas,
        setRetiradas
    ] = useState([]);


    const [
        periodoRetiradas,
        setPeriodoRetiradas
    ] = useState("DIARIO");


    const [
        referenciaRetiradas,
        setReferenciaRetiradas
    ] = useState(
        referenciaAtual(
            "DIARIO"
        )
    );


    const [
        carregandoRetiradas,
        setCarregandoRetiradas
    ] = useState(false);


    const [
        retiradaAberta,
        setRetiradaAberta
    ] = useState(null);


    const [
        paginaRetiradas,
        setPaginaRetiradas
    ] = useState(1);


    const [
        itensPorPaginaRetiradas,
        setItensPorPaginaRetiradas
    ] = useState(6);


    const [
        quantidadePaginaRetiradas,
        setQuantidadePaginaRetiradas
    ] = useState("6");



    // ==============================
    // PAGINAÇÃO
    // ==============================

    const [paginaAtual, setPaginaAtual] =
        useState(1);

    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);

    const [
        quantidadePagina,
        setQuantidadePagina
    ] = useState("6");


    async function carregarEstoque(
        texto = busca,
        filtro = status
    ) {

        try {

            const dados =
                await listarEstoque(
                    texto,
                    filtro
                );


            setLotes(
                Array.isArray(dados)
                    ? dados
                    : []
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "o estoque."
            );
        }
    }


    async function carregarResumo() {

        try {

            const dados =
                await buscarResumoEstoque();

            setResumo(dados);

        } catch {

            setErro(
                "Não foi possível carregar "
                + "o resumo do estoque."
            );
        }
    }



    async function carregarRetiradas(
        periodo = periodoRetiradas,
        referencia = referenciaRetiradas
    ) {

        try {

            setCarregandoRetiradas(
                true
            );


            const dados =
                await listarRetiradasEstoque(
                    periodo,
                    referencia
                );


            setRetiradas(
                Array.isArray(dados)
                    ? dados
                    : []
            );

            setPaginaRetiradas(1);

            setRetiradaAberta(null);

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "a lista de retiradas."
            );

        } finally {

            setCarregandoRetiradas(
                false
            );
        }
    }



    async function carregarReceitas() {

        try {

            const dados =
                await listarReceitasEstoque();

            setReceitas(
                Array.isArray(dados)
                    ? dados
                    : []
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "as receitas."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregarEstoque("", "");

        carregarResumo();

        carregarReceitas();

        carregarRetiradas(
            "DIARIO",
            referenciaAtual(
                "DIARIO"
            )
        );

    }, []);


    function moeda(valor) {

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


    function dataBR(data) {

        if (!data) {
            return "Sem validade";
        }

        const [
            ano,
            mes,
            dia
        ] = data
            .substring(0, 10)
            .split("-");

        return `${dia}/${mes}/${ano}`;
    }


    function dataHoraBR(
        data
    ) {

        if (!data) {
            return "-";
        }


        const valor =
            new Date(data);


        if (
            Number.isNaN(
                valor.getTime()
            )
        ) {
            return data;
        }


        return valor.toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    async function alterarPeriodoRetiradas(
        novoPeriodo
    ) {

        const novaReferencia =
            referenciaAtual(
                novoPeriodo
            );


        setPeriodoRetiradas(
            novoPeriodo
        );

        setReferenciaRetiradas(
            novaReferencia
        );


        await carregarRetiradas(
            novoPeriodo,
            novaReferencia
        );
    }


    async function aplicarFiltroRetiradas() {

        if (!referenciaRetiradas) {

            setErro(
                "Informe a referência "
                + "da lista de retiradas."
            );

            return;
        }


        setErro("");


        await carregarRetiradas(
            periodoRetiradas,
            referenciaRetiradas
        );
    }



    async function handleBusca(
        event
    ) {

        const valor =
            event.target.value;

        setBusca(valor);

        setPaginaAtual(1);

        await carregarEstoque(
            valor,
            status
        );
    }


    async function handleStatus(
        event
    ) {

        const valor =
            event.target.value;

        setStatus(valor);

        setPaginaAtual(1);

        await carregarEstoque(
            busca,
            valor
        );
    }


    function statusTexto(valor) {

        if (valor === "VALIDO") {
            return "Válido";
        }

        if (
            valor === "PROXIMO_VALIDADE"
        ) {
            return "Próx. validade";
        }

        if (valor === "VENCIDO") {
            return "Vencido";
        }

        return "Sem validade";
    }


    async function buscarCodigo() {

        setErro("");
        setMensagem("");


        if (
            !retirada.codigo.trim()
        ) {

            setErro(
                "Digite o código de barras."
            );

            return;
        }


        try {

            const dados =
                await buscarEstoquePorCodigo(
                    retirada.codigo
                );

            setRetirada(
                (anterior) => ({
                    ...anterior,

                    produto:
                        dados.produto,

                    lotes:
                        dados.lotes,

                    lote_id: "",

                    quantidade: ""
                })
            );


            if (
                dados.lotes.length === 0
            ) {

                setErro(
                    "Este produto está cadastrado, "
                    + "mas não possui saldo "
                    + "em estoque."
                );
            }

        } catch (error) {

            setRetirada(
                (anterior) => ({
                    ...anterior,
                    produto: null,
                    lotes: [],
                    lote_id: ""
                })
            );

            setErro(
                error.response?.data?.erro
                ||
                "Produto não encontrado."
            );
        }
    }


    function alterarRetirada(
        event
    ) {

        const {
            name,
            value
        } = event.target;

        setRetirada(
            (anterior) => ({
                ...anterior,
                [name]: value
            })
        );
    }


    async function retirarProduto(
        event
    ) {

        event.preventDefault();

        setErro("");
        setMensagem("");


        if (!retirada.lote_id) {

            setErro(
                "Selecione o lote."
            );

            return;
        }


        if (
            Number(
                retirada.quantidade
            ) <= 0
        ) {

            setErro(
                "Informe uma quantidade válida."
            );

            return;
        }


        setRetirando(true);


        try {

            await retirarProdutoEstoque({
                lote_id:
                    Number(
                        retirada.lote_id
                    ),

                quantidade:
                    Number(
                        retirada.quantidade
                    ),

                observacao:
                    retirada.observacao
            });


            setMensagem(
                "Produto retirado do "
                + "estoque com sucesso."
            );


            const codigo =
                retirada.codigo;


            setRetirada({
                ...retiradaInicial,
                codigo
            });


            await carregarEstoque(
                busca,
                status
            );

            await carregarResumo();

            await carregarRetiradas(
                periodoRetiradas,
                referenciaRetiradas
            );


            try {

                const dados =
                    await buscarEstoquePorCodigo(
                        codigo
                    );

                setRetirada(
                    (anterior) => ({
                        ...anterior,

                        produto:
                            dados.produto,

                        lotes:
                            dados.lotes
                    })
                );

            } catch {
                // Estoque principal atualizado.
            }

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível retirar "
                + "o produto."
            );

        } finally {

            setRetirando(false);
        }
    }


    async function selecionarReceita(
        event
    ) {

        const valor =
            event.target.value;

        setReceita(
            (anterior) => ({
                ...anterior,
                produto_venda_id: valor
            })
        );

        setDetalhesReceita(null);
        setLotesReceita({});
        setErro("");
        setMensagem("");


        if (!valor) {
            return;
        }


        try {

            const dados =
                await buscarReceitaEstoque(
                    Number(valor)
                );


            const selecoes = {};

            (
                dados.itens
                || []
            ).forEach(
                (item) => {

                    if (
                        item.produto_estoque_id
                    ) {

                        selecoes[
                            item.id
                        ] = "";
                    }
                }
            );


            setLotesReceita(
                selecoes
            );

            setDetalhesReceita(
                dados
            );

        } catch (error) {

            setLotesReceita({});

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "a receita selecionada."
            );
        }
    }


    function alterarLoteReceita(
        itemId,
        valor
    ) {

        setLotesReceita(
            (anterior) => ({
                ...anterior,
                [itemId]: valor
            })
        );

        setErro("");
        setMensagem("");
    }


    function loteSelecionadoReceita(
        item
    ) {

        const loteId =
            Number(
                lotesReceita[
                    item.id
                ]
                || 0
            );


        return (
            item.lotes
            || []
        ).find(
            (lote) =>
                Number(
                    lote.id
                )
                === loteId
        )
        || null;
    }


    function alterarReceita(
        event
    ) {

        const {
            name,
            value
        } = event.target;

        setReceita(
            (anterior) => ({
                ...anterior,
                [name]: value
            })
        );
    }


    function formatarQuantidade(
        valor
    ) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 4
            }
        );
    }


    function quantidadeNecessaria(
        item
    ) {

        const quantidadeProduzir =
            Number(
                receita
                    .quantidade_produzir
                || 0
            );

        const rendimento =
            Number(
                detalhesReceita
                    ?.ficha
                    ?.rendimento
                || 0
            );


        if (
            quantidadeProduzir <= 0
            || rendimento <= 0
        ) {
            return 0;
        }


        return (
            Number(
                item.quantidade
                || 0
            )
            *
            quantidadeProduzir
            /
            rendimento
        );
    }


    async function retirarPorReceita(
        event
    ) {

        event.preventDefault();

        setErro("");
        setMensagem("");


        if (
            !receita.produto_venda_id
        ) {

            setErro(
                "Selecione a receita."
            );

            return;
        }


        if (
            Number(
                receita
                    .quantidade_produzir
            ) <= 0
        ) {

            setErro(
                "Informe uma quantidade "
                + "de produção válida."
            );

            return;
        }


        if (!detalhesReceita) {

            setErro(
                "Carregue a receita antes "
                + "de confirmar a retirada."
            );

            return;
        }


        const itensEstoque =
            detalhesReceita.itens.filter(
                (item) =>
                    Boolean(
                        item.produto_estoque_id
                    )
            );


        const itensManuais =
            detalhesReceita.itens.filter(
                (item) =>
                    !item.produto_estoque_id
            );


        const itemSemLote =
            itensEstoque.find(
                (item) =>
                    !lotesReceita[
                        item.id
                    ]
            );


        if (itemSemLote) {

            setErro(
                "Selecione o lote de "
                + `${
                    itemSemLote
                        .produto_estoque_nome
                }.`
            );

            return;
        }


        const itemInsuficiente =
            itensEstoque.find(
                (item) => {

                    const lote =
                        loteSelecionadoReceita(
                            item
                        );

                    return (
                        !lote
                        ||
                        Number(
                            lote.quantidade_atual
                            || 0
                        )
                        <
                        quantidadeNecessaria(
                            item
                        )
                    );
                }
            );


        if (itemInsuficiente) {

            setErro(
                "O lote selecionado de "
                + `${
                    itemInsuficiente
                        .produto_estoque_nome
                } não possui saldo suficiente.`
            );

            return;
        }


        const descricaoProduto = [
            detalhesReceita
                ?.produto
                ?.nome,

            detalhesReceita
                ?.produto
                ?.sabor
        ]
            .filter(Boolean)
            .join(" - ");


        let textoConfirmacao =
            `Retirar os produtos do estoque `
            + `para produzir ${
                receita.quantidade_produzir
            } unidade(s) de ${
                descricaoProduto
            }?`;


        if (
            itensManuais.length > 0
        ) {

            const nomesManuais =
                itensManuais
                    .map(
                        (item) =>
                            item.descricao
                            || "Item manual"
                    )
                    .join(", ");


            textoConfirmacao =
                `Há ${
                    itensManuais.length
                } item(ns) que não são do estoque: `
                + `${nomesManuais}. `
                + `Eles serão ignorados e somente `
                + `os produtos vinculados ao estoque `
                + `serão retirados. Deseja prosseguir?`;
        }


        const confirmar =
            window.confirm(
                textoConfirmacao
            );


        if (!confirmar) {
            return;
        }


        setRetirandoReceita(true);


        try {

            const resposta =
                await retirarReceitaEstoque({
                    produto_venda_id:
                        Number(
                            receita
                                .produto_venda_id
                        ),

                    quantidade_produzir:
                        Number(
                            receita
                                .quantidade_produzir
                        ),

                    lotes_selecionados:
                        itensEstoque.map(
                            (item) => ({
                                item_ficha_id:
                                    item.id,

                                lote_id:
                                    Number(
                                        lotesReceita[
                                            item.id
                                        ]
                                    )
                            })
                        ),

                    observacao:
                        receita.observacao
                });


            setMensagem(
                resposta.mensagem
                ||
                "Retirada pela receita "
                + "realizada com sucesso."
            );


            setReceita({
                ...receitaInicial
            });

            setDetalhesReceita(
                null
            );

            setLotesReceita({});


            await carregarEstoque(
                busca,
                status
            );

            await carregarResumo();

            await carregarReceitas();

            await carregarRetiradas(
                periodoRetiradas,
                referenciaRetiradas
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível retirar "
                + "os produtos da receita."
            );

        } finally {

            setRetirandoReceita(false);
        }
    }


    // ==============================
    // LÓGICA DA PAGINAÇÃO
    // ==============================

    const totalItens =
        lotes.length;

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                totalItens
                / itensPorPagina
            )
        );

    const paginaExibida =
        Math.min(
            paginaAtual,
            totalPaginas
        );

    const indiceInicial =
        (
            paginaExibida - 1
        )
        * itensPorPagina;

    const indiceFinal =
        indiceInicial
        + itensPorPagina;

    const lotesPaginados =
        lotes.slice(
            indiceInicial,
            indiceFinal
        );


    const primeiroItem =
        totalItens === 0
            ? 0
            : indiceInicial + 1;

    const ultimoItem =
        Math.min(
            indiceFinal,
            totalItens
        );


    function irParaPagina(
        pagina
    ) {

        if (
            pagina < 1
            || pagina > totalPaginas
        ) {
            return;
        }

        setPaginaAtual(pagina);
    }


    function aplicarQuantidadePagina() {

        const quantidade =
            Number(
                quantidadePagina
            );


        if (
            !Number.isInteger(
                quantidade
            )
            ||
            quantidade <= 0
        ) {

            setQuantidadePagina(
                String(
                    itensPorPagina
                )
            );

            return;
        }


        setItensPorPagina(
            quantidade
        );

        setPaginaAtual(1);
    }


    function teclaQuantidadePagina(
        event
    ) {

        if (
            event.key === "Enter"
        ) {

            aplicarQuantidadePagina();

            event.currentTarget.blur();
        }
    }


    // ==============================
    // PAGINAÇÃO - RETIRADAS
    // ==============================

    const totalRetiradas =
        retiradas.length;


    const totalPaginasRetiradas =
        Math.max(
            1,
            Math.ceil(
                totalRetiradas
                /
                itensPorPaginaRetiradas
            )
        );


    const paginaRetiradasExibida =
        Math.min(
            paginaRetiradas,
            totalPaginasRetiradas
        );


    const indiceInicialRetiradas =
        (
            paginaRetiradasExibida - 1
        )
        *
        itensPorPaginaRetiradas;


    const indiceFinalRetiradas =
        indiceInicialRetiradas
        +
        itensPorPaginaRetiradas;


    const retiradasPaginadas =
        retiradas.slice(
            indiceInicialRetiradas,
            indiceFinalRetiradas
        );


    const primeiraRetirada =
        totalRetiradas === 0
            ? 0
            : indiceInicialRetiradas + 1;


    const ultimaRetirada =
        Math.min(
            indiceFinalRetiradas,
            totalRetiradas
        );


    function irParaPaginaRetiradas(
        pagina
    ) {

        if (
            pagina < 1
            ||
            pagina > totalPaginasRetiradas
        ) {
            return;
        }


        setPaginaRetiradas(
            pagina
        );

        setRetiradaAberta(
            null
        );
    }


    function aplicarQuantidadePaginaRetiradas() {

        const quantidade =
            Number(
                quantidadePaginaRetiradas
            );


        if (
            !Number.isInteger(
                quantidade
            )
            ||
            quantidade <= 0
        ) {

            setQuantidadePaginaRetiradas(
                String(
                    itensPorPaginaRetiradas
                )
            );

            return;
        }


        setItensPorPaginaRetiradas(
            quantidade
        );

        setPaginaRetiradas(
            1
        );

        setRetiradaAberta(
            null
        );
    }


    function teclaQuantidadePaginaRetiradas(
        event
    ) {

        if (
            event.key === "Enter"
        ) {

            aplicarQuantidadePaginaRetiradas();

            event.currentTarget.blur();
        }
    }


    function alternarRetiradaAberta(
        retiradaId
    ) {

        setRetiradaAberta(
            (anterior) =>
                anterior === retiradaId
                    ? null
                    : retiradaId
        );
    }


    function abrirModalRetirada() {

        setErro("");
        setMensagem("");

        setModalRetiradaAberto(
            true
        );
    }


    function fecharModalRetirada() {

        if (
            retirando
            ||
            retirandoReceita
        ) {

            return;
        }


        setModalRetiradaAberto(
            false
        );

        setErro("");
    }


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Estoque
                    </h1>

                    <p>
                        Controle de produtos,
                        lotes, custos e validades.
                    </p>

                </div>


                <button
                    type="button"
                    className={
                        styles.withdrawOpenButton
                    }
                    onClick={
                        abrirModalRetirada
                    }
                >
                    <PackageMinus
                        size={17}
                    />

                    Retirar do Estoque
                </button>

            </div>


            <div className={styles.cards}>

                <div className={styles.summaryCard}>

                    <Package size={20} />

                    <span>
                        Produtos
                    </span>

                    <strong>
                        {resumo.produtos}
                    </strong>

                </div>


                <div className={styles.summaryCard}>

                    <Boxes size={20} />

                    <span>
                        Lotes com saldo
                    </span>

                    <strong>
                        {resumo.lotes}
                    </strong>

                </div>


                <div className={styles.summaryCard}>

                    <Boxes size={20} />

                    <span>
                        Quantidade total
                    </span>

                    <strong>
                        {
                            resumo
                                .quantidade_total
                        }
                    </strong>

                </div>


                <div className={styles.summaryCard}>

                    <CircleDollarSign
                        size={20}
                    />

                    <span>
                        Valor em estoque
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo
                                    .valor_estoque
                            )
                        }
                    </strong>

                </div>


                <div
                    className={
                        `${styles.summaryCard} `
                        + `${styles.warningCard}`
                    }
                >

                    <TriangleAlert
                        size={20}
                    />

                    <span>
                        Próximos da validade
                    </span>

                    <strong>
                        {
                            resumo
                                .lotes_proximos_validade
                        }
                    </strong>

                    <small>
                        Próximos 30 dias
                    </small>

                </div>


                <div className={styles.summaryCard}>

                    <TriangleAlert
                        size={20}
                    />

                    <span>
                        Lotes vencidos
                    </span>

                    <strong>
                        {
                            resumo
                                .lotes_vencidos
                        }
                    </strong>

                </div>

            </div>


            <div className={styles.filters}>

                <div className={styles.searchBox}>

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar produto, código ou lote..."
                        }
                        value={busca}
                        onChange={handleBusca}
                    />

                </div>


                <select
                    value={status}
                    onChange={handleStatus}
                >

                    <option value="">
                        Todos
                    </option>

                    <option value="VALIDO">
                        Válidos
                    </option>

                    <option value="PROXIMOS_VALIDADE">
                        Próximos da validade
                    </option>

                    <option value="VENCIDO">
                        Vencidos
                    </option>

                    <option value="SEM_VALIDADE">
                        Sem validade
                    </option>

                </select>

            </div>


            <section className={styles.card}>

                <div className={styles.tableWrapper}>

                    <table>

                        <thead>

                            <tr>
                                <th>Produto</th>
                                <th>Código</th>
                                <th>Lote</th>
                                <th>Compra</th>
                                <th>Qtd. atual</th>
                                <th>Custo unit.</th>
                                <th>Valor</th>
                                <th>Validade</th>
                                <th>Status</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                lotesPaginados
                                    .length === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum produto
                                                em estoque.
                                            </td>

                                        </tr>
                                    )

                                    : lotesPaginados.map(
                                        (lote) => (

                                            <tr
                                                key={
                                                    lote.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        lote
                                                            .produto_nome
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        lote
                                                            .codigo_barras
                                                    }
                                                </td>

                                                <td>
                                                    #{lote.id}
                                                </td>

                                                <td>
                                                    {
                                                        lote
                                                            .compra_numero
                                                            ? `#${lote.compra_numero}`
                                                            : "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        lote
                                                            .quantidade_atual
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        moeda(
                                                            lote
                                                                .custo_unitario
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    <strong>
                                                        {
                                                            moeda(
                                                                lote
                                                                    .valor_total
                                                            )
                                                        }
                                                    </strong>

                                                </td>

                                                <td>
                                                    {
                                                        dataBR(
                                                            lote
                                                                .validade
                                                        )
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            `${
                                                                styles.status
                                                            } ${
                                                                styles[
                                                                    lote
                                                                        .status_validade
                                                                ]
                                                            }`
                                                        }
                                                    >
                                                        {
                                                            statusTexto(
                                                                lote
                                                                    .status_validade
                                                            )
                                                        }
                                                    </span>

                                                </td>

                                            </tr>
                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <div
                    className={
                        styles.pagination
                    }
                >

                    <div
                        className={
                            styles.paginationInfo
                        }
                    >

                        Mostrando{" "}

                        <strong>
                            {primeiroItem}
                        </strong>

                        {" - "}

                        <strong>
                            {ultimoItem}
                        </strong>

                        {" de "}

                        <strong>
                            {totalItens}
                        </strong>

                    </div>


                    <div
                        className={
                            styles.paginationControls
                        }
                    >

                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida === 1
                            }
                            onClick={() =>
                                irParaPagina(1)
                            }
                            title="Primeira página"
                        >
                            &laquo;
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida === 1
                            }
                            onClick={() =>
                                irParaPagina(
                                    paginaExibida - 1
                                )
                            }
                            title="Página anterior"
                        >
                            &lsaquo;
                        </button>


                        <span
                            className={
                                styles.paginationPage
                            }
                        >
                            Página{" "}

                            <strong>
                                {paginaExibida}
                            </strong>

                            {" de "}

                            <strong>
                                {totalPaginas}
                            </strong>
                        </span>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida
                                === totalPaginas
                            }
                            onClick={() =>
                                irParaPagina(
                                    paginaExibida + 1
                                )
                            }
                            title="Próxima página"
                        >
                            &rsaquo;
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaExibida
                                === totalPaginas
                            }
                            onClick={() =>
                                irParaPagina(
                                    totalPaginas
                                )
                            }
                            title="Última página"
                        >
                            &raquo;
                        </button>

                    </div>


                    <div
                        className={
                            styles.paginationSize
                        }
                    >

                        <label
                            htmlFor={
                                "itensPorPagina"
                            }
                        >
                            Itens por página
                        </label>

                        <input
                            id="itensPorPagina"
                            type="number"
                            min="1"
                            step="1"
                            value={
                                quantidadePagina
                            }
                            onChange={
                                (event) =>
                                    setQuantidadePagina(
                                        event.target.value
                                    )
                            }
                            onBlur={
                                aplicarQuantidadePagina
                            }
                            onKeyDown={
                                teclaQuantidadePagina
                            }
                        />

                    </div>

                </div>

            </section>


            {
                erro && (

                    <div className={styles.error}>
                        {erro}
                    </div>
                )
            }


            {
                mensagem && (

                    <div className={styles.success}>
                        {mensagem}
                    </div>
                )
            }


            {
                Number(
                    resumo
                        .lotes_proximos_validade
                    || 0
                ) > 0
                && (

                    <div
                        className={
                            styles.validityAlert
                        }
                    >

                        <TriangleAlert
                            size={17}
                        />

                        <span>
                            Existem{" "}

                            <strong>
                                {
                                    resumo
                                        .lotes_proximos_validade
                                }
                            </strong>

                            {" "}lote(s) com validade
                            nos próximos 30 dias.
                        </span>

                    </div>
                )
            }


            {
                modalRetiradaAberto
                && (

                    <div
                        className={
                            styles.withdrawModalOverlay
                        }
                        onMouseDown={
                            (event) => {

                                if (
                                    event.target
                                    === event.currentTarget
                                ) {

                                    fecharModalRetirada();
                                }
                            }
                        }
                    >

                        <div
                            className={
                                styles.withdrawModal
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-label="Retirar do estoque"
                        >

                            <button
                                type="button"
                                className={
                                    styles.withdrawModalClose
                                }
                                onClick={
                                    fecharModalRetirada
                                }
                                disabled={
                                    retirando
                                    ||
                                    retirandoReceita
                                }
                                title="Fechar"
                            >
                                <X
                                    size={19}
                                />
                            </button>


                            {
                                erro
                                && (

                                    <div
                                        className={
                                            styles.withdrawModalMessage
                                        }
                                    >
                                        <div
                                            className={
                                                styles.error
                                            }
                                        >
                                            {erro}
                                        </div>
                                    </div>
                                )
                            }


                            {
                                mensagem
                                && (

                                    <div
                                        className={
                                            styles.withdrawModalMessage
                                        }
                                    >
                                        <div
                                            className={
                                                styles.success
                                            }
                                        >
                                            {mensagem}
                                        </div>
                                    </div>
                                )
                            }

                        <section
                            className={
                                styles.withdrawCard
                            }
                        >
                        
                            <div
                                className={
                                    styles.withdrawHeader
                                }
                            >
                        
                                <div>
                        
                                    <h2>
                                        Retirar do estoque
                                    </h2>
                        
                                    <p>
                                        Escolha retirada unitária
                                        ou retirada automática
                                        pelos ingredientes da receita.
                                    </p>
                        
                                </div>
                        
                        
                                <div
                                    className={
                                        styles.withdrawModes
                                    }
                                >
                        
                                    <button
                                        type="button"
                                        className={
                                            modoRetirada
                                            === "UNITARIO"
                                                ? styles.activeMode
                                                : ""
                                        }
                                        onClick={() => {
                        
                                            setModoRetirada(
                                                "UNITARIO"
                                            );
                        
                                            setErro("");
                                            setMensagem("");
                                        }}
                                    >
                                        Retirada unitária
                                    </button>
                        
                        
                                    <button
                                        type="button"
                                        className={
                                            modoRetirada
                                            === "RECEITA"
                                                ? styles.activeMode
                                                : ""
                                        }
                                        onClick={() => {
                        
                                            setModoRetirada(
                                                "RECEITA"
                                            );
                        
                                            setErro("");
                                            setMensagem("");
                                        }}
                                    >
                                        Por receita
                                    </button>
                        
                                </div>
                        
                            </div>
                        
                        
                            {
                                modoRetirada
                                === "UNITARIO"
                                && (
                                    <>
                        
                                        <p
                                            className={
                                                styles.withdrawDescription
                                            }
                                        >
                                            Localize o produto pelo
                                            código de barras e escolha
                                            exatamente o lote que será
                                            utilizado.
                                        </p>
                        
                        
                                        <div
                                            className={
                                                styles.barcodeArea
                                            }
                                        >
                        
                                            <div>
                        
                                                <label>
                                                    Código de barras *
                                                </label>
                        
                                                <input
                                                    name="codigo"
                                                    value={
                                                        retirada.codigo
                                                    }
                                                    onChange={
                                                        alterarRetirada
                                                    }
                                                    inputMode="numeric"
                                                    placeholder={
                                                        "Digite ou leia o código"
                                                    }
                                                />
                        
                                            </div>
                        
                        
                                            <button
                                                type="button"
                                                onClick={
                                                    buscarCodigo
                                                }
                                            >
                        
                                                <Search size={15} />
                        
                                                Buscar
                        
                                            </button>
                        
                                        </div>
                        
                        
                                        {
                                            retirada.produto && (
                        
                                                <div
                                                    className={
                                                        styles.productFound
                                                    }
                                                >
                        
                                                    <span>
                                                        Produto encontrado
                                                    </span>
                        
                                                    <strong>
                                                        {
                                                            retirada
                                                                .produto
                                                                .nome
                                                        }
                                                    </strong>
                        
                                                    <small>
                                                        Código:
                                                        {" "}
                                                        {
                                                            retirada
                                                                .produto
                                                                .codigo_barras
                                                        }
                                                    </small>
                        
                                                </div>
                                            )
                                        }
                        
                        
                                        {
                                            retirada.produto && (
                        
                                                <form
                                                    onSubmit={
                                                        retirarProduto
                                                    }
                                                >
                        
                                                    <div
                                                        className={
                                                            styles.withdrawGrid
                                                        }
                                                    >
                        
                                                        <div>
                        
                                                            <label>
                                                                Lote *
                                                            </label>
                        
                                                            <select
                                                                name="lote_id"
                                                                value={
                                                                    retirada
                                                                        .lote_id
                                                                }
                                                                onChange={
                                                                    alterarRetirada
                                                                }
                                                                required
                                                            >
                        
                                                                <option value="">
                                                                    Selecione o lote
                                                                </option>
                        
                        
                                                                {
                                                                    retirada
                                                                        .lotes
                                                                        .map(
                                                                            (lote) => (
                        
                                                                                <option
                                                                                    key={
                                                                                        lote.id
                                                                                    }
                                                                                    value={
                                                                                        lote.id
                                                                                    }
                                                                                    disabled={
                                                                                        lote
                                                                                            .status_validade
                                                                                        === "VENCIDO"
                                                                                    }
                                                                                >
                        
                                                                                    Lote #{lote.id}
                        
                                                                                    {" - "}
                        
                                                                                    {
                                                                                        dataBR(
                                                                                            lote.validade
                                                                                        )
                                                                                    }
                        
                                                                                    {" - "}
                        
                                                                                    {
                                                                                        lote
                                                                                            .quantidade_atual
                                                                                    }
                        
                                                                                    {" disponíveis"}
                        
                                                                                    {
                                                                                        lote
                                                                                            .status_validade
                                                                                        === "VENCIDO"
                                                                                            ? " - VENCIDO"
                                                                                            : ""
                                                                                    }
                        
                                                                                </option>
                                                                            )
                                                                        )
                                                                }
                        
                                                            </select>
                        
                                                        </div>
                        
                        
                                                        <div>
                        
                                                            <label>
                                                                Quantidade *
                                                            </label>
                        
                                                            <input
                                                                type="number"
                                                                name="quantidade"
                                                                min="0.001"
                                                                step="0.001"
                                                                value={
                                                                    retirada
                                                                        .quantidade
                                                                }
                                                                onChange={
                                                                    alterarRetirada
                                                                }
                                                                required
                                                            />
                        
                                                        </div>
                        
                        
                                                        <div
                                                            className={
                                                                styles.observation
                                                            }
                                                        >
                        
                                                            <label>
                                                                Observação
                                                            </label>
                        
                                                            <input
                                                                type="text"
                                                                name="observacao"
                                                                placeholder={
                                                                    "Ex.: Uso na produção"
                                                                }
                                                                value={
                                                                    retirada
                                                                        .observacao
                                                                }
                                                                onChange={
                                                                    alterarRetirada
                                                                }
                                                            />
                        
                                                        </div>
                        
                                                    </div>
                        
                        
                                                    <div
                                                        className={
                                                            styles.withdrawActions
                                                        }
                                                    >
                        
                                                        <button
                                                            type="submit"
                                                            disabled={
                                                                retirando
                                                                ||
                                                                retirada
                                                                    .lotes
                                                                    .length
                                                                === 0
                                                            }
                                                        >
                        
                                                            {
                                                                retirando
                                                                    ? "Retirando..."
                                                                    : "Retirar produto"
                                                            }
                        
                                                        </button>
                        
                                                    </div>
                        
                                                </form>
                                            )
                                        }
                        
                                    </>
                                )
                            }
                        
                        
                            {
                                modoRetirada
                                === "RECEITA"
                                && (
                        
                                    <form
                                        onSubmit={
                                            retirarPorReceita
                                        }
                                    >
                        
                                        <p
                                            className={
                                                styles.withdrawDescription
                                            }
                                        >
                                            Selecione um produto com
                                            ficha técnica ativa. O
                                            sistema calcula os
                                            ingredientes necessários e
                                            você escolhe o lote que será
                                            usado em cada produto.
                                        </p>
                        
                        
                                        <div
                                            className={
                                                styles.recipeGrid
                                            }
                                        >
                        
                                            <div>
                        
                                                <label>
                                                    Receita *
                                                </label>
                        
                                                <select
                                                    value={
                                                        receita
                                                            .produto_venda_id
                                                    }
                                                    onChange={
                                                        selecionarReceita
                                                    }
                                                    required
                                                >
                        
                                                    <option value="">
                                                        Selecione a receita
                                                    </option>
                        
                        
                                                    {
                                                        receitas.map(
                                                            (item) => (
                        
                                                                <option
                                                                    key={
                                                                        item
                                                                            .produto_venda_id
                                                                    }
                                                                    value={
                                                                        item
                                                                            .produto_venda_id
                                                                    }
                                                                >
                                                                    {
                                                                        item.nome
                                                                    }
                        
                                                                    {
                                                                        item.sabor
                                                                            ? ` - ${item.sabor}`
                                                                            : ""
                                                                    }
                                                                </option>
                                                            )
                                                        )
                                                    }
                        
                                                </select>
                        
                                            </div>
                        
                        
                                            <div>
                        
                                                <label>
                                                    Quantidade a produzir *
                                                </label>
                        
                                                <input
                                                    type="number"
                                                    name={
                                                        "quantidade_produzir"
                                                    }
                                                    min="0.001"
                                                    step="0.001"
                                                    value={
                                                        receita
                                                            .quantidade_produzir
                                                    }
                                                    onChange={
                                                        alterarReceita
                                                    }
                                                    required
                                                />
                        
                                            </div>
                        
                        
                                            <div
                                                className={
                                                    styles.observation
                                                }
                                            >
                        
                                                <label>
                                                    Observação
                                                </label>
                        
                                                <input
                                                    type="text"
                                                    name="observacao"
                                                    placeholder={
                                                        "Ex.: Produção do dia"
                                                    }
                                                    value={
                                                        receita
                                                            .observacao
                                                    }
                                                    onChange={
                                                        alterarReceita
                                                    }
                                                />
                        
                                            </div>
                        
                                        </div>
                        
                        
                                        {
                                            detalhesReceita && (
                        
                                                <div
                                                    className={
                                                        styles.recipeFound
                                                    }
                                                >
                        
                                                    <div
                                                        className={
                                                            styles.recipeInfo
                                                        }
                                                    >
                        
                                                        <div>
                        
                                                            <span>
                                                                Receita
                                                            </span>
                        
                                                            <strong>
                                                                {
                                                                    detalhesReceita
                                                                        .ficha
                                                                        .nome
                                                                }
                                                            </strong>
                        
                                                        </div>
                        
                        
                                                        <div>
                        
                                                            <span>
                                                                Rendimento
                                                            </span>
                        
                                                            <strong>
                                                                {
                                                                    formatarQuantidade(
                                                                        detalhesReceita
                                                                            .ficha
                                                                            .rendimento
                                                                    )
                                                                }
                                                                {" unidade(s)"}
                                                            </strong>
                        
                                                        </div>
                        
                                                    </div>
                        
                        
                                                    {
                                                        detalhesReceita
                                                            .possui_itens_manuais
                                                        && (
                        
                                                            <div
                                                                className={
                                                                    styles.manualWarning
                                                                }
                                                            >
                        
                                                                <TriangleAlert
                                                                    size={16}
                                                                />
                        
                                                                <span>
                                                                    Há item(ns) manual(is)
                                                                    nesta receita. Eles não
                                                                    serão retirados do
                                                                    estoque. Ao confirmar,
                                                                    somente os produtos
                                                                    vinculados ao estoque
                                                                    serão baixados.
                                                                </span>
                        
                                                            </div>
                                                        )
                                                    }
                        
                        
                                                    <div
                                                        className={
                                                            styles.recipeTableWrapper
                                                        }
                                                    >
                        
                                                        <table
                                                            className={
                                                                styles.recipeTable
                                                            }
                                                        >
                        
                                                            <thead>
                        
                                                                <tr>
                                                                    <th>
                                                                        Ingrediente
                                                                    </th>
                        
                                                                    <th>
                                                                        Tipo
                                                                    </th>
                        
                                                                    <th>
                                                                        Necessário
                                                                    </th>
                        
                                                                    <th>
                                                                        Lote
                                                                    </th>
                        
                                                                    <th>
                                                                        Saldo do lote
                                                                    </th>
                        
                                                                    <th>
                                                                        Situação
                                                                    </th>
                                                                </tr>
                        
                                                            </thead>
                        
                        
                                                            <tbody>
                        
                                                                {
                                                                    detalhesReceita
                                                                        .itens
                                                                        .map(
                                                                            (item) => {
                        
                                                                                const necessario =
                                                                                    quantidadeNecessaria(
                                                                                        item
                                                                                    );
                        
                                                                                const manual =
                                                                                    !item
                                                                                        .produto_estoque_id;
                        
                                                                                const loteSelecionado =
                                                                                    manual
                                                                                        ? null
                                                                                        : loteSelecionadoReceita(
                                                                                            item
                                                                                        );
                        
                                                                                const suficiente =
                                                                                    Boolean(
                                                                                        loteSelecionado
                                                                                    )
                                                                                    &&
                                                                                    Number(
                                                                                        loteSelecionado
                                                                                            .quantidade_atual
                                                                                        || 0
                                                                                    )
                                                                                    >=
                                                                                    necessario;
                        
                        
                                                                                return (
                        
                                                                                    <tr
                                                                                        key={
                                                                                            item.id
                                                                                        }
                                                                                    >
                        
                                                                                        <td>
                                                                                            <strong>
                                                                                                {
                                                                                                    manual
                                                                                                        ? (
                                                                                                            item
                                                                                                                .descricao
                                                                                                            || "Item manual"
                                                                                                        )
                                                                                                        : item
                                                                                                            .produto_estoque_nome
                                                                                                }
                                                                                            </strong>
                        
                                                                                            {
                                                                                                !manual
                                                                                                &&
                                                                                                item.codigo_barras
                                                                                                && (
                                                                                                    <small
                                                                                                        className={
                                                                                                            styles.recipeItemCode
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            item.codigo_barras
                                                                                                        }
                                                                                                    </small>
                                                                                                )
                                                                                            }
                                                                                        </td>
                        
                        
                                                                                        <td>
                        
                                                                                            <span
                                                                                                className={
                                                                                                    manual
                                                                                                        ? styles.manualBadge
                                                                                                        : styles.stockBadge
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    manual
                                                                                                        ? "Manual"
                                                                                                        : "Estoque"
                                                                                                }
                                                                                            </span>
                        
                                                                                        </td>
                        
                        
                                                                                        <td>
                                                                                            <strong>
                                                                                                {
                                                                                                    formatarQuantidade(
                                                                                                        necessario
                                                                                                    )
                                                                                                }
                                                                                                {" "}
                                                                                                {
                                                                                                    item.unidade
                                                                                                }
                                                                                            </strong>
                                                                                        </td>
                        
                        
                                                                                        <td>
                        
                                                                                            {
                                                                                                manual
                                                                                                    ? (
                                                                                                        <span
                                                                                                            className={
                                                                                                                styles.notApplicable
                                                                                                            }
                                                                                                        >
                                                                                                            Não se aplica
                                                                                                        </span>
                                                                                                    )
                                                                                                    : (
                        
                                                                                                        <select
                                                                                                            className={
                                                                                                                styles.recipeLotSelect
                                                                                                            }
                                                                                                            value={
                                                                                                                lotesReceita[
                                                                                                                    item.id
                                                                                                                ]
                                                                                                                || ""
                                                                                                            }
                                                                                                            onChange={
                                                                                                                (event) =>
                                                                                                                    alterarLoteReceita(
                                                                                                                        item.id,
                                                                                                                        event
                                                                                                                            .target
                                                                                                                            .value
                                                                                                                    )
                                                                                                            }
                                                                                                        >
                        
                                                                                                            <option value="">
                                                                                                                Selecione o lote
                                                                                                            </option>
                        
                        
                                                                                                            {
                                                                                                                (
                                                                                                                    item.lotes
                                                                                                                    || []
                                                                                                                ).map(
                                                                                                                    (lote) => (
                        
                                                                                                                        <option
                                                                                                                            key={
                                                                                                                                lote.id
                                                                                                                            }
                                                                                                                            value={
                                                                                                                                lote.id
                                                                                                                            }
                                                                                                                        >
                                                                                                                            Lote #{lote.id}
                                                                                                                            {" - "}
                                                                                                                            {
                                                                                                                                dataBR(
                                                                                                                                    lote.validade
                                                                                                                                )
                                                                                                                            }
                                                                                                                            {" - "}
                                                                                                                            {
                                                                                                                                formatarQuantidade(
                                                                                                                                    lote
                                                                                                                                        .quantidade_atual
                                                                                                                                )
                                                                                                                            }
                                                                                                                            {" disponível"}
                                                                                                                        </option>
                                                                                                                    )
                                                                                                                )
                                                                                                            }
                        
                                                                                                        </select>
                                                                                                    )
                                                                                            }
                        
                                                                                        </td>
                        
                        
                                                                                        <td>
                                                                                            {
                                                                                                manual
                                                                                                    ? "-"
                                                                                                    : loteSelecionado
                                                                                                        ? (
                                                                                                            <>
                                                                                                                {
                                                                                                                    formatarQuantidade(
                                                                                                                        loteSelecionado
                                                                                                                            .quantidade_atual
                                                                                                                    )
                                                                                                                }
                                                                                                                {" "}
                                                                                                                {
                                                                                                                    item
                                                                                                                        .unidade_estoque
                                                                                                                    ||
                                                                                                                    item.unidade
                                                                                                                }
                                                                                                            </>
                                                                                                        )
                                                                                                        : "-"
                                                                                            }
                                                                                        </td>
                        
                        
                                                                                        <td>
                        
                                                                                            {
                                                                                                manual
                                                                                                    ? (
                                                                                                        <span
                                                                                                            className={
                                                                                                                styles.manualIgnored
                                                                                                            }
                                                                                                        >
                                                                                                            Será ignorado
                                                                                                        </span>
                                                                                                    )
                                                                                                    : (
                        
                                                                                                        <span
                                                                                                            className={
                                                                                                                suficiente
                                                                                                                    ? styles.stockOk
                                                                                                                    : styles.stockError
                                                                                                            }
                                                                                                        >
                                                                                                            {
                                                                                                                !loteSelecionado
                                                                                                                    ? "Selecione o lote"
                                                                                                                    : suficiente
                                                                                                                        ? "Disponível"
                                                                                                                        : "Insuficiente"
                                                                                                            }
                                                                                                        </span>
                                                                                                    )
                                                                                            }
                        
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
                                            )
                                        }
                        
                                        <div
                                            className={
                                                styles.withdrawActions
                                            }
                                        >
                        
                                            <button
                                                type="submit"
                                                disabled={
                                                    retirandoReceita
                                                    ||
                                                    !detalhesReceita
                                                }
                                            >
                        
                                                {
                                                    retirandoReceita
                                                        ? "Retirando..."
                                                        : "Retirar pela receita"
                                                }
                        
                                            </button>
                        
                                        </div>
                        
                                    </form>
                                )
                            }
                        
                        </section>

                        </div>

                    </div>
                )
            }

            <section
                className={
                    styles.withdrawHistoryCard
                }
            >

                <div
                    className={
                        styles.historyHeader
                    }
                >

                    <div>

                        <h2>
                            Lista de retiradas
                        </h2>

                        <p>
                            Consulte as saídas para uso
                            registradas no estoque.
                        </p>

                    </div>


                    <strong>
                        {
                            retiradas.length
                        }
                        {" "}
                        registro(s)
                    </strong>

                </div>


                <div
                    className={
                        styles.historyFilters
                    }
                >

                    <div
                        className={
                            styles.periodButtons
                        }
                    >

                        <button
                            type="button"
                            className={
                                periodoRetiradas
                                === "DIARIO"
                                    ? styles.activePeriod
                                    : ""
                            }
                            onClick={() =>
                                alterarPeriodoRetiradas(
                                    "DIARIO"
                                )
                            }
                        >
                            Diário
                        </button>


                        <button
                            type="button"
                            className={
                                periodoRetiradas
                                === "MENSAL"
                                    ? styles.activePeriod
                                    : ""
                            }
                            onClick={() =>
                                alterarPeriodoRetiradas(
                                    "MENSAL"
                                )
                            }
                        >
                            Mês
                        </button>


                        <button
                            type="button"
                            className={
                                periodoRetiradas
                                === "ANUAL"
                                    ? styles.activePeriod
                                    : ""
                            }
                            onClick={() =>
                                alterarPeriodoRetiradas(
                                    "ANUAL"
                                )
                            }
                        >
                            Ano
                        </button>

                    </div>


                    <div
                        className={
                            styles.historyReference
                        }
                    >

                        <label>
                            {
                                periodoRetiradas
                                === "DIARIO"
                                    ? "Dia"
                                    : periodoRetiradas
                                        === "MENSAL"
                                        ? "Mês"
                                        : "Ano"
                            }
                        </label>


                        {
                            periodoRetiradas
                            === "DIARIO"
                            && (

                                <input
                                    type="date"
                                    value={
                                        referenciaRetiradas
                                    }
                                    onChange={
                                        (event) =>
                                            setReferenciaRetiradas(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                />
                            )
                        }


                        {
                            periodoRetiradas
                            === "MENSAL"
                            && (

                                <input
                                    type="month"
                                    value={
                                        referenciaRetiradas
                                    }
                                    onChange={
                                        (event) =>
                                            setReferenciaRetiradas(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                />
                            )
                        }


                        {
                            periodoRetiradas
                            === "ANUAL"
                            && (

                                <input
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    step="1"
                                    value={
                                        referenciaRetiradas
                                    }
                                    onChange={
                                        (event) =>
                                            setReferenciaRetiradas(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                />
                            )
                        }


                        <button
                            type="button"
                            onClick={
                                aplicarFiltroRetiradas
                            }
                            disabled={
                                carregandoRetiradas
                            }
                        >
                            {
                                carregandoRetiradas
                                    ? "Carregando..."
                                    : "Aplicar"
                            }
                        </button>

                    </div>

                </div>


                <div
                    className={
                        styles.historyTableWrapper
                    }
                >

                    <table
                        className={
                            styles.historyTable
                        }
                    >

                        <thead>

                            <tr>
                                <th
                                    className={
                                        styles.historyArrowColumn
                                    }
                                >
                                </th>

                                <th>Data / hora</th>
                                <th>Retirada</th>
                                <th>Itens</th>
                                <th>Observação</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                carregandoRetiradas
                                ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className={
                                                styles.empty
                                            }
                                        >
                                            Carregando retiradas...
                                        </td>

                                    </tr>
                                )

                                : retiradasPaginadas.length
                                    === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhuma retirada
                                                encontrada no período.
                                            </td>

                                        </tr>
                                    )

                                    : retiradasPaginadas.map(
                                        (item) => {

                                            const aberto =
                                                retiradaAberta
                                                === item.id;


                                            return (

                                                <Fragment
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <tr
                                                        className={
                                                            styles.historyMainRow
                                                        }
                                                    >

                                                        <td
                                                            className={
                                                                styles.historyArrowCell
                                                            }
                                                        >

                                                            <button
                                                                type="button"
                                                                className={
                                                                    styles.historyToggle
                                                                }
                                                                onClick={() =>
                                                                    alternarRetiradaAberta(
                                                                        item.id
                                                                    )
                                                                }
                                                                title={
                                                                    aberto
                                                                        ? "Ocultar itens retirados"
                                                                        : "Mostrar itens retirados"
                                                                }
                                                            >

                                                                {
                                                                    aberto
                                                                        ? (
                                                                            <ChevronDown
                                                                                size={16}
                                                                            />
                                                                        )
                                                                        : (
                                                                            <ChevronRight
                                                                                size={16}
                                                                            />
                                                                        )
                                                                }

                                                            </button>

                                                        </td>


                                                        <td>
                                                            {
                                                                dataHoraBR(
                                                                    item
                                                                        .data_movimentacao
                                                                )
                                                            }
                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    item
                                                                        .forma_retirada
                                                                    === "RECEITA"
                                                                        ? styles.recipeHistoryBadge
                                                                        : styles.unitHistoryBadge
                                                                }
                                                            >
                                                                {
                                                                    item
                                                                        .forma_retirada
                                                                    === "RECEITA"
                                                                        ? "Receita"
                                                                        : "Unitária"
                                                                }
                                                            </span>

                                                        </td>


                                                        <td>
                                                            <strong>
                                                                {
                                                                    item
                                                                        .quantidade_itens
                                                                    ??
                                                                    (
                                                                        Array.isArray(
                                                                            item.itens
                                                                        )
                                                                            ? item.itens.length
                                                                            : 0
                                                                    )
                                                                }
                                                            </strong>
                                                            {" item(ns)"}
                                                        </td>


                                                        <td
                                                            className={
                                                                styles.historyObservation
                                                            }
                                                        >
                                                            {
                                                                item
                                                                    .observacao
                                                                || "-"
                                                            }
                                                        </td>

                                                    </tr>


                                                    {
                                                        aberto
                                                        && (

                                                            <tr
                                                                className={
                                                                    styles.historyDetailsRow
                                                                }
                                                            >

                                                                <td
                                                                    colSpan="5"
                                                                >

                                                                    <div
                                                                        className={
                                                                            styles.withdrawalList
                                                                        }
                                                                    >

                                                                        <div
                                                                            className={
                                                                                styles.withdrawalListTitle
                                                                            }
                                                                        >
                                                                            Itens retirados nesta retirada
                                                                        </div>


                                                                        <div
                                                                            className={
                                                                                styles.withdrawalListTableWrapper
                                                                            }
                                                                        >

                                                                            <table
                                                                                className={
                                                                                    styles.withdrawalListTable
                                                                                }
                                                                            >

                                                                                <thead>

                                                                                    <tr>
                                                                                        <th>Produto</th>
                                                                                        <th>Código</th>
                                                                                        <th>Lote</th>
                                                                                        <th>Quantidade retirada</th>
                                                                                    </tr>

                                                                                </thead>


                                                                                <tbody>

                                                                                    {
                                                                                        Array.isArray(
                                                                                            item.itens
                                                                                        )
                                                                                        &&
                                                                                        item.itens.length
                                                                                        > 0
                                                                                        ? item.itens.map(
                                                                                            (
                                                                                                itemRetirado
                                                                                            ) => (

                                                                                                <tr
                                                                                                    key={
                                                                                                        itemRetirado
                                                                                                            .movimentacao_id
                                                                                                    }
                                                                                                >

                                                                                                    <td>
                                                                                                        <strong>
                                                                                                            {
                                                                                                                itemRetirado
                                                                                                                    .produto_nome
                                                                                                            }
                                                                                                        </strong>
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        {
                                                                                                            itemRetirado
                                                                                                                .codigo_barras
                                                                                                            || "-"
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        #
                                                                                                        {
                                                                                                            itemRetirado
                                                                                                                .lote_id
                                                                                                        }
                                                                                                    </td>


                                                                                                    <td>
                                                                                                        {
                                                                                                            formatarQuantidade(
                                                                                                                itemRetirado
                                                                                                                    .quantidade
                                                                                                            )
                                                                                                        }
                                                                                                        {" "}
                                                                                                        {
                                                                                                            itemRetirado
                                                                                                                .unidade
                                                                                                            || ""
                                                                                                        }
                                                                                                    </td>

                                                                                                </tr>
                                                                                            )
                                                                                        )

                                                                                        : (

                                                                                            <tr>

                                                                                                <td
                                                                                                    colSpan="4"
                                                                                                    className={
                                                                                                        styles.empty
                                                                                                    }
                                                                                                >
                                                                                                    Nenhum item encontrado
                                                                                                    nesta retirada.
                                                                                                </td>

                                                                                            </tr>
                                                                                        )
                                                                                    }

                                                                                </tbody>

                                                                            </table>

                                                                        </div>

                                                                    </div>

                                                                </td>

                                                            </tr>
                                                        )
                                                    }

                                                </Fragment>
                                            );
                                        }
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <div
                    className={
                        styles.pagination
                    }
                >

                    <div
                        className={
                            styles.paginationInfo
                        }
                    >

                        Mostrando{" "}

                        <strong>
                            {
                                primeiraRetirada
                            }
                        </strong>

                        {" - "}

                        <strong>
                            {
                                ultimaRetirada
                            }
                        </strong>

                        {" de "}

                        <strong>
                            {
                                totalRetiradas
                            }
                        </strong>

                    </div>


                    <div
                        className={
                            styles.paginationControls
                        }
                    >

                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaRetiradasExibida
                                === 1
                            }
                            onClick={() =>
                                irParaPaginaRetiradas(
                                    1
                                )
                            }
                            title="Primeira página"
                        >
                            &laquo;
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaRetiradasExibida
                                === 1
                            }
                            onClick={() =>
                                irParaPaginaRetiradas(
                                    paginaRetiradasExibida
                                    - 1
                                )
                            }
                            title="Página anterior"
                        >
                            &lsaquo;
                        </button>


                        <span
                            className={
                                styles.paginationPage
                            }
                        >
                            Página{" "}

                            <strong>
                                {
                                    paginaRetiradasExibida
                                }
                            </strong>

                            {" de "}

                            <strong>
                                {
                                    totalPaginasRetiradas
                                }
                            </strong>
                        </span>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaRetiradasExibida
                                === totalPaginasRetiradas
                            }
                            onClick={() =>
                                irParaPaginaRetiradas(
                                    paginaRetiradasExibida
                                    + 1
                                )
                            }
                            title="Próxima página"
                        >
                            &rsaquo;
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaRetiradasExibida
                                === totalPaginasRetiradas
                            }
                            onClick={() =>
                                irParaPaginaRetiradas(
                                    totalPaginasRetiradas
                                )
                            }
                            title="Última página"
                        >
                            &raquo;
                        </button>

                    </div>


                    <div
                        className={
                            styles.paginationSize
                        }
                    >

                        <label
                            htmlFor={
                                "itensPorPaginaRetiradas"
                            }
                        >
                            Itens por página
                        </label>

                        <input
                            id="itensPorPaginaRetiradas"
                            type="number"
                            min="1"
                            step="1"
                            value={
                                quantidadePaginaRetiradas
                            }
                            onChange={
                                (event) =>
                                    setQuantidadePaginaRetiradas(
                                        event.target.value
                                    )
                            }
                            onBlur={
                                aplicarQuantidadePaginaRetiradas
                            }
                            onKeyDown={
                                teclaQuantidadePaginaRetiradas
                            }
                        />

                    </div>

                </div>

            </section>

        </div>
    );
}


export default Estoque;
