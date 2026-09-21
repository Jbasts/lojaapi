import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Pencil,
    Plus,
    Search,
    Trash2,
    TriangleAlert,
    X
} from "lucide-react";

import {
    atualizarDesperdicio,
    buscarDesperdicio,
    criarDesperdicio,
    excluirDesperdicio,
    listarDesperdicios
} from "../../services/desperdicioService";

import {
    buscarEstoquePorCodigo
} from "../../services/estoqueService";

import styles
    from "./Desperdicios.module.css";


const formularioInicial = {
    codigo: "",
    produto: null,
    lotes: [],
    lote_id: "",
    quantidade: "",
    motivo: "VENCIMENTO",
    observacao: ""
};


const motivos = {
    VENCIMENTO: "Vencimento",
    PRODUTO_DANIFICADO:
        "Produto danificado",
    PRODUCAO_INCORRETA:
        "Produção incorreta",
    QUEDA: "Queda",
    QUEBRA: "Quebra",
    OUTRO: "Outro"
};


function referenciaAtual(
    periodo
) {

    const hoje = new Date();

    const ano =
        String(
            hoje.getFullYear()
        );

    const mes =
        String(
            hoje.getMonth() + 1
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


    return "";
}


function Desperdicios() {

    const [
        desperdicios,
        setDesperdicios
    ] = useState([]);

    const [
        busca,
        setBusca
    ] = useState("");

    const [
        filtroMotivo,
        setFiltroMotivo
    ] = useState("");

    const [
        periodo,
        setPeriodo
    ] = useState("TOTAL");

    const [
        referencia,
        setReferencia
    ] = useState("");

    const [
        formulario,
        setFormulario
    ] = useState(
        formularioInicial
    );

    const [
        desperdicioEditando,
        setDesperdicioEditando
    ] = useState(null);

    const [
        modalFormularioAberto,
        setModalFormularioAberto
    ] = useState(false);

    const [
        modalExcluir,
        setModalExcluir
    ] = useState(null);

    const [
        erro,
        setErro
    ] = useState("");

    const [
        erroFormulario,
        setErroFormulario
    ] = useState("");

    const [
        mensagem,
        setMensagem
    ] = useState("");

    const [
        salvando,
        setSalvando
    ] = useState(false);

    const [
        excluindo,
        setExcluindo
    ] = useState(false);


    // ==============================
    // PAGINAÇÃO
    // ==============================

    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);

    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);

    const [
        quantidadePagina,
        setQuantidadePagina
    ] = useState("6");


    async function carregar(
        texto = busca,
        motivo = filtroMotivo,
        periodoFiltro = periodo,
        referenciaFiltro = referencia
    ) {

        try {

            setErro("");


            const dados =
                await listarDesperdicios(
                    texto,
                    motivo,
                    periodoFiltro,
                    referenciaFiltro
                );


            setDesperdicios(
                Array.isArray(dados)
                    ? dados
                    : []
            );

            setPaginaAtual(1);

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "os desperdícios."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregar(
            "",
            "",
            "TOTAL",
            ""
        );

    }, []);


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


    function dataBR(
        data
    ) {

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


    async function handleBusca(
        event
    ) {

        const valor =
            event.target.value;


        setBusca(
            valor
        );


        await carregar(
            valor,
            filtroMotivo,
            periodo,
            referencia
        );
    }


    async function handleMotivo(
        event
    ) {

        const valor =
            event.target.value;


        setFiltroMotivo(
            valor
        );


        await carregar(
            busca,
            valor,
            periodo,
            referencia
        );
    }


    async function handlePeriodo(
        novoPeriodo
    ) {

        const novaReferencia =
            referenciaAtual(
                novoPeriodo
            );


        setPeriodo(
            novoPeriodo
        );

        setReferencia(
            novaReferencia
        );


        await carregar(
            busca,
            filtroMotivo,
            novoPeriodo,
            novaReferencia
        );
    }


    async function aplicarPeriodo() {

        if (
            periodo !== "TOTAL"
            &&
            !referencia
        ) {

            setErro(
                "Informe a referência "
                + "do período."
            );

            return;
        }


        await carregar(
            busca,
            filtroMotivo,
            periodo,
            referencia
        );
    }


    function alterarFormulario(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        setFormulario(
            (anterior) => ({
                ...anterior,
                [name]: value
            })
        );
    }


    function abrirAdicionar() {

        setDesperdicioEditando(
            null
        );

        setFormulario(
            formularioInicial
        );

        setErroFormulario(
            ""
        );

        setMensagem(
            ""
        );

        setModalFormularioAberto(
            true
        );
    }


    function fecharFormulario() {

        if (salvando) {
            return;
        }


        setModalFormularioAberto(
            false
        );

        setDesperdicioEditando(
            null
        );

        setFormulario(
            formularioInicial
        );

        setErroFormulario(
            ""
        );
    }


    async function buscarCodigo() {

        setErroFormulario(
            ""
        );


        if (
            !formulario.codigo.trim()
        ) {

            setErroFormulario(
                "Digite o código de barras."
            );

            return;
        }


        try {

            const dados =
                await buscarEstoquePorCodigo(
                    formulario.codigo
                );


            setFormulario(
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
                !Array.isArray(
                    dados.lotes
                )
                ||
                dados.lotes.length === 0
            ) {

                setErroFormulario(
                    "Produto sem saldo "
                    + "em estoque."
                );
            }

        } catch (error) {

            setFormulario(
                (anterior) => ({
                    ...anterior,
                    produto: null,
                    lotes: [],
                    lote_id: "",
                    quantidade: ""
                })
            );


            setErroFormulario(
                error.response?.data?.erro
                ||
                "Produto não encontrado."
            );
        }
    }


    const loteSelecionado =
        useMemo(
            () => {

                return (
                    formulario.lotes.find(
                        (lote) =>
                            String(
                                lote.id
                            )
                            ===
                            String(
                                formulario.lote_id
                            )
                    )
                    ||
                    null
                );

            },
            [
                formulario.lotes,
                formulario.lote_id
            ]
        );


    const valorTotal =
        useMemo(
            () => {

                if (!loteSelecionado) {
                    return 0;
                }


                return (
                    Number(
                        formulario.quantidade
                    )
                    || 0
                )
                *
                Number(
                    loteSelecionado
                        .custo_unitario
                    || 0
                );

            },
            [
                formulario.quantidade,
                loteSelecionado
            ]
        );


    async function editar(
        desperdicio
    ) {

        try {

            setErro(
                ""
            );

            setMensagem(
                ""
            );

            setErroFormulario(
                ""
            );


            const detalhe =
                await buscarDesperdicio(
                    desperdicio.id
                );


            let dadosEstoque;


            try {

                dadosEstoque =
                    await buscarEstoquePorCodigo(
                        detalhe.codigo_barras
                    );

            } catch {

                dadosEstoque = {
                    produto: {
                        id:
                            detalhe.produto_estoque_id,

                        nome:
                            detalhe.produto_nome,

                        codigo_barras:
                            detalhe.codigo_barras
                    },

                    lotes: []
                };
            }


            let lotes = [
                ...(
                    Array.isArray(
                        dadosEstoque.lotes
                    )
                        ? dadosEstoque.lotes
                        : []
                )
            ];


            const existeLote =
                lotes.some(
                    (lote) =>
                        Number(
                            lote.id
                        )
                        ===
                        Number(
                            detalhe.lote_id
                        )
                );


            if (!existeLote) {

                lotes.push({
                    id:
                        detalhe.lote_id,

                    produto_estoque_id:
                        detalhe.produto_estoque_id,

                    produto_nome:
                        detalhe.produto_nome,

                    codigo_barras:
                        detalhe.codigo_barras,

                    quantidade_atual:
                        detalhe.quantidade,

                    custo_unitario:
                        detalhe.custo_unitario,

                    validade:
                        detalhe.validade,

                    status_validade:
                        "VALIDO"
                });

            } else {

                lotes = lotes.map(
                    (lote) => {

                        if (
                            Number(
                                lote.id
                            )
                            !==
                            Number(
                                detalhe.lote_id
                            )
                        ) {
                            return lote;
                        }


                        return {
                            ...lote,

                            quantidade_atual:
                                Number(
                                    lote.quantidade_atual
                                )
                                +
                                Number(
                                    detalhe.quantidade
                                )
                        };
                    }
                );
            }


            setDesperdicioEditando(
                detalhe.id
            );


            setFormulario({
                codigo:
                    detalhe.codigo_barras,

                produto:
                    dadosEstoque.produto,

                lotes,

                lote_id:
                    detalhe.lote_id,

                quantidade:
                    detalhe.quantidade,

                motivo:
                    detalhe.motivo,

                observacao:
                    detalhe.observacao
                    || ""
            });


            setModalFormularioAberto(
                true
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "o desperdício."
            );
        }
    }


    async function salvar(
        event
    ) {

        event.preventDefault();

        setErroFormulario(
            ""
        );

        setMensagem(
            ""
        );


        if (
            !formulario.produto
        ) {

            setErroFormulario(
                "Busque um produto "
                + "do estoque."
            );

            return;
        }


        if (
            !formulario.lote_id
        ) {

            setErroFormulario(
                "Selecione o lote."
            );

            return;
        }


        if (
            Number(
                formulario.quantidade
            ) <= 0
        ) {

            setErroFormulario(
                "Quantidade deve ser "
                + "maior que zero."
            );

            return;
        }


        setSalvando(
            true
        );


        const dados = {
            lote_id:
                Number(
                    formulario.lote_id
                ),

            quantidade:
                Number(
                    formulario.quantidade
                ),

            motivo:
                formulario.motivo,

            observacao:
                formulario.observacao
        };


        try {

            let mensagemSucesso;


            if (
                desperdicioEditando
            ) {

                await atualizarDesperdicio(
                    desperdicioEditando,
                    dados
                );


                mensagemSucesso =
                    "Desperdício atualizado "
                    + "com sucesso.";

            } else {

                await criarDesperdicio(
                    dados
                );


                mensagemSucesso =
                    "Desperdício registrado "
                    + "com sucesso.";
            }


            setModalFormularioAberto(
                false
            );

            setDesperdicioEditando(
                null
            );

            setFormulario(
                formularioInicial
            );

            setErroFormulario(
                ""
            );

            setMensagem(
                mensagemSucesso
            );


            await carregar(
                busca,
                filtroMotivo,
                periodo,
                referencia
            );

        } catch (error) {

            setErroFormulario(
                error.response?.data?.erro
                ||
                "Não foi possível salvar "
                + "o desperdício."
            );

        } finally {

            setSalvando(
                false
            );
        }
    }


    function abrirExcluir(
        desperdicio
    ) {

        setErro(
            ""
        );

        setMensagem(
            ""
        );

        setModalExcluir(
            desperdicio
        );
    }


    function fecharExcluir() {

        if (excluindo) {
            return;
        }


        setModalExcluir(
            null
        );
    }


    async function confirmarExclusao() {

        if (!modalExcluir) {
            return;
        }


        try {

            setExcluindo(
                true
            );

            setErro(
                ""
            );


            await excluirDesperdicio(
                modalExcluir.id
            );


            setModalExcluir(
                null
            );

            setMensagem(
                "Desperdício excluído "
                + "e estoque estornado."
            );


            await carregar(
                busca,
                filtroMotivo,
                periodo,
                referencia
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível excluir."
            );

        } finally {

            setExcluindo(
                false
            );
        }
    }


    const totalPerdas =
        useMemo(
            () => {

                return desperdicios.reduce(
                    (
                        total,
                        item
                    ) =>
                        total
                        +
                        Number(
                            item.valor_total
                            || 0
                        ),
                    0
                );

            },
            [
                desperdicios
            ]
        );


    // ==============================
    // PAGINAÇÃO
    // ==============================

    const totalItens =
        desperdicios.length;


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                totalItens
                /
                itensPorPagina
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
        *
        itensPorPagina;


    const indiceFinal =
        indiceInicial
        +
        itensPorPagina;


    const desperdiciosPaginados =
        desperdicios.slice(
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
            ||
            pagina > totalPaginas
        ) {
            return;
        }


        setPaginaAtual(
            pagina
        );
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

        setPaginaAtual(
            1
        );
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
                        Desperdícios
                    </h1>

                    <p>
                        Controle de produtos
                        perdidos, vencidos ou
                        descartados.
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

                    Adicionar desperdício

                </button>

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


            <div
                className={
                    styles.summary
                }
            >

                <div>

                    <TriangleAlert
                        size={20}
                    />

                    <span>
                        Registros
                    </span>

                    <strong>
                        {
                            desperdicios.length
                        }
                    </strong>

                </div>


                <div>

                    <TriangleAlert
                        size={20}
                    />

                    <span>
                        Total em perdas
                    </span>

                    <strong>
                        {
                            moeda(
                                totalPerdas
                            )
                        }
                    </strong>

                </div>

            </div>


            <div
                className={
                    styles.periodArea
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
                            periodo === "TOTAL"
                                ? styles.activePeriod
                                : ""
                        }
                        onClick={() =>
                            handlePeriodo(
                                "TOTAL"
                            )
                        }
                    >
                        Total
                    </button>


                    <button
                        type="button"
                        className={
                            periodo === "MENSAL"
                                ? styles.activePeriod
                                : ""
                        }
                        onClick={() =>
                            handlePeriodo(
                                "MENSAL"
                            )
                        }
                    >
                        Mensal
                    </button>


                    <button
                        type="button"
                        className={
                            periodo === "ANUAL"
                                ? styles.activePeriod
                                : ""
                        }
                        onClick={() =>
                            handlePeriodo(
                                "ANUAL"
                            )
                        }
                    >
                        Anual
                    </button>

                </div>


                {
                    periodo !== "TOTAL"
                    && (

                        <div
                            className={
                                styles.periodReference
                            }
                        >

                            {
                                periodo === "MENSAL"
                                    ? (

                                        <input
                                            type="month"
                                            value={
                                                referencia
                                            }
                                            onChange={
                                                (event) =>
                                                    setReferencia(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                        />
                                    )
                                    : (

                                        <input
                                            type="number"
                                            min="2000"
                                            max="2100"
                                            step="1"
                                            value={
                                                referencia
                                            }
                                            onChange={
                                                (event) =>
                                                    setReferencia(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                            }
                                            placeholder="Ano"
                                        />
                                    )
                            }


                            <button
                                type="button"
                                onClick={
                                    aplicarPeriodo
                                }
                            >
                                Aplicar
                            </button>

                        </div>
                    )
                }

            </div>


            <div
                className={
                    styles.filters
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
                        placeholder={
                            "Buscar produto ou código..."
                        }
                        value={
                            busca
                        }
                        onChange={
                            handleBusca
                        }
                    />

                </div>


                <select
                    value={
                        filtroMotivo
                    }
                    onChange={
                        handleMotivo
                    }
                >

                    <option value="">
                        Todos os motivos
                    </option>


                    {
                        Object.entries(
                            motivos
                        ).map(
                            ([
                                valor,
                                descricao
                            ]) => (

                                <option
                                    key={
                                        valor
                                    }
                                    value={
                                        valor
                                    }
                                >
                                    {
                                        descricao
                                    }
                                </option>
                            )
                        )
                    }

                </select>

            </div>


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
                                <th>Qtd.</th>
                                <th>Produto</th>
                                <th>Valor unit.</th>
                                <th>Valor total</th>
                                <th>Código</th>
                                <th>Lote</th>
                                <th>Validade</th>
                                <th>Motivo</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                desperdiciosPaginados
                                    .length
                                === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="10"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum desperdício
                                                encontrado.
                                            </td>

                                        </tr>
                                    )

                                    : desperdiciosPaginados
                                        .map(
                                            (item) => (

                                                <tr
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <td>
                                                        {
                                                            item
                                                                .quantidade
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            item
                                                                .produto_nome
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            moeda(
                                                                item
                                                                    .custo_unitario
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <strong>
                                                            {
                                                                moeda(
                                                                    item
                                                                        .valor_total
                                                                )
                                                            }
                                                        </strong>

                                                    </td>


                                                    <td>
                                                        {
                                                            item
                                                                .codigo_barras
                                                            || "-"
                                                        }
                                                    </td>


                                                    <td>
                                                        #
                                                        {
                                                            item
                                                                .lote_id
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            dataBR(
                                                                item
                                                                    .validade
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            motivos[
                                                                item
                                                                    .motivo
                                                            ]
                                                            ||
                                                            item
                                                                .motivo
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            dataBR(
                                                                item
                                                                    .data_desperdicio
                                                            )
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
                                                                        item
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
                                                                className={
                                                                    styles.deleteAction
                                                                }
                                                                onClick={() =>
                                                                    abrirExcluir(
                                                                        item
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
                                primeiroItem
                            }
                        </strong>

                        {" - "}

                        <strong>
                            {
                                ultimoItem
                            }
                        </strong>

                        {" de "}

                        <strong>
                            {
                                totalItens
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
                                paginaExibida === 1
                            }
                            onClick={() =>
                                irParaPagina(
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
                                {
                                    paginaExibida
                                }
                            </strong>

                            {" de "}

                            <strong>
                                {
                                    totalPaginas
                                }
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
                                "itensPorPaginaDesperdicios"
                            }
                        >
                            Itens por página
                        </label>

                        <input
                            id={
                                "itensPorPaginaDesperdicios"
                            }
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
                modalFormularioAberto
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.modalCard
                            }
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>

                                    <h2>
                                        {
                                            desperdicioEditando
                                                ? (
                                                    "Editar desperdício #"
                                                    + desperdicioEditando
                                                )
                                                : "Adicionar desperdício"
                                        }
                                    </h2>

                                    <p>
                                        {
                                            desperdicioEditando
                                                ? "Altere os dados do registro."
                                                : "Registre uma nova perda do estoque."
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeButton
                                    }
                                    onClick={
                                        fecharFormulario
                                    }
                                    disabled={
                                        salvando
                                    }
                                    title="Fechar"
                                >
                                    <X
                                        size={18}
                                    />
                                </button>

                            </div>


                            <div
                                className={
                                    styles.modalBody
                                }
                            >

                                {
                                    erroFormulario
                                    && (

                                        <div
                                            className={
                                                styles.error
                                            }
                                        >
                                            {
                                                erroFormulario
                                            }
                                        </div>
                                    )
                                }


                                <div
                                    className={
                                        styles.barcode
                                    }
                                >

                                    <div>

                                        <label>
                                            Código de barras *
                                        </label>

                                        <input
                                            name="codigo"
                                            value={
                                                formulario.codigo
                                            }
                                            onChange={
                                                alterarFormulario
                                            }
                                            inputMode="numeric"
                                            disabled={
                                                salvando
                                            }
                                        />

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            buscarCodigo
                                        }
                                        disabled={
                                            salvando
                                        }
                                    >

                                        <Search
                                            size={15}
                                        />

                                        Buscar

                                    </button>

                                </div>


                                {
                                    formulario.produto
                                    && (

                                        <div
                                            className={
                                                styles.productFound
                                            }
                                        >
                                            Produto:
                                            {" "}

                                            <strong>
                                                {
                                                    formulario
                                                        .produto
                                                        .nome
                                                }
                                            </strong>
                                        </div>
                                    )
                                }


                                {
                                    formulario.produto
                                    && (

                                        <form
                                            onSubmit={
                                                salvar
                                            }
                                        >

                                            <div
                                                className={
                                                    styles.formGrid
                                                }
                                            >

                                                <div>

                                                    <label>
                                                        Lote *
                                                    </label>

                                                    <select
                                                        name="lote_id"
                                                        value={
                                                            formulario
                                                                .lote_id
                                                        }
                                                        onChange={
                                                            alterarFormulario
                                                        }
                                                        required
                                                        disabled={
                                                            salvando
                                                        }
                                                    >

                                                        <option value="">
                                                            Selecione
                                                        </option>


                                                        {
                                                            formulario
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
                                                            formulario
                                                                .quantidade
                                                        }
                                                        onChange={
                                                            alterarFormulario
                                                        }
                                                        required
                                                        disabled={
                                                            salvando
                                                        }
                                                    />

                                                </div>


                                                <div>

                                                    <label>
                                                        Motivo *
                                                    </label>

                                                    <select
                                                        name="motivo"
                                                        value={
                                                            formulario
                                                                .motivo
                                                        }
                                                        onChange={
                                                            alterarFormulario
                                                        }
                                                        disabled={
                                                            salvando
                                                        }
                                                    >

                                                        {
                                                            Object.entries(
                                                                motivos
                                                            ).map(
                                                                ([
                                                                    valor,
                                                                    descricao
                                                                ]) => (

                                                                    <option
                                                                        key={
                                                                            valor
                                                                        }
                                                                        value={
                                                                            valor
                                                                        }
                                                                    >
                                                                        {
                                                                            descricao
                                                                        }
                                                                    </option>
                                                                )
                                                            )
                                                        }

                                                    </select>

                                                </div>


                                                <div>

                                                    <label>
                                                        Valor unitário
                                                    </label>

                                                    <input
                                                        value={
                                                            moeda(
                                                                loteSelecionado
                                                                    ?.custo_unitario
                                                            )
                                                        }
                                                        disabled
                                                    />

                                                </div>


                                                <div>

                                                    <label>
                                                        Valor total
                                                    </label>

                                                    <input
                                                        value={
                                                            moeda(
                                                                valorTotal
                                                            )
                                                        }
                                                        disabled
                                                    />

                                                </div>


                                                <div>

                                                    <label>
                                                        Validade
                                                    </label>

                                                    <input
                                                        value={
                                                            loteSelecionado
                                                                ? dataBR(
                                                                    loteSelecionado
                                                                        .validade
                                                                )
                                                                : ""
                                                        }
                                                        disabled
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
                                                        name="observacao"
                                                        value={
                                                            formulario
                                                                .observacao
                                                        }
                                                        onChange={
                                                            alterarFormulario
                                                        }
                                                        placeholder={
                                                            "Informações adicionais"
                                                        }
                                                        disabled={
                                                            salvando
                                                        }
                                                    />

                                                </div>

                                            </div>


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
                                                        salvando
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
                                                        salvando
                                                    }
                                                >

                                                    {
                                                        salvando
                                                            ? "Salvando..."
                                                            : desperdicioEditando
                                                                ? "Salvar alterações"
                                                                : "Adicionar"
                                                    }

                                                </button>

                                            </div>

                                        </form>
                                    )
                                }

                            </div>

                        </div>

                    </div>
                )
            }


            {
                modalExcluir
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
                        >

                            <div
                                className={
                                    styles.confirmIcon
                                }
                            >
                                <TriangleAlert
                                    size={24}
                                />
                            </div>


                            <h2>
                                Excluir desperdício #
                                {
                                    modalExcluir.id
                                }
                            </h2>


                            <p>
                                Deseja realmente excluir este
                                desperdício? A quantidade será
                                devolvida ao estoque.
                            </p>


                            <div
                                className={
                                    styles.confirmDetails
                                }
                            >

                                <span>
                                    Produto
                                </span>

                                <strong>
                                    {
                                        modalExcluir
                                            .produto_nome
                                    }
                                </strong>


                                <span>
                                    Quantidade
                                </span>

                                <strong>
                                    {
                                        modalExcluir
                                            .quantidade
                                    }
                                </strong>

                            </div>


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
                                            : "Excluir"
                                    }

                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

        </div>
    );
}


export default Desperdicios;
