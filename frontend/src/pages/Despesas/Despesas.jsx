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
    X
} from "lucide-react";

import {
    atualizarDespesaExtra,
    criarDespesaExtra,
    excluirDespesaExtra,
    listarDespesasExtras
} from "../../services/despesaExtraService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./Despesas.module.css";


const formularioInicial = {
    quantidade: 1,
    nome: "",
    valor_unitario: ""
};


function dataLocalAtual() {

    const agora =
        new Date();


    const ano =
        agora.getFullYear();


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


    return `${ano}-${mes}-${dia}`;
}


function Despesas() {

    const [
        despesas,
        setDespesas
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
        despesaEditando,
        setDespesaEditando
    ] = useState(null);


    const [
        modalFormularioAberto,
        setModalFormularioAberto
    ] = useState(false);


    const [
        despesaExcluir,
        setDespesaExcluir
    ] = useState(null);


    const [
        duplicadaPendente,
        setDuplicadaPendente
    ] = useState(null);


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
        salvando,
        setSalvando
    ] = useState(false);


    const [
        excluindo,
        setExcluindo
    ] = useState(false);


    const [
        confirmandoDuplicada,
        setConfirmandoDuplicada
    ] = useState(false);


    const [
        periodo,
        setPeriodo
    ] = useState("TOTAL");


    const hoje =
        dataLocalAtual();


    const [
        diaFiltro,
        setDiaFiltro
    ] = useState(
        hoje
    );


    const [
        mesFiltro,
        setMesFiltro
    ] = useState(
        hoje.slice(
            0,
            7
        )
    );


    const [
        anoFiltro,
        setAnoFiltro
    ] = useState(
        hoje.slice(
            0,
            4
        )
    );


    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);


    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);


    async function carregarDespesas(
        textoBusca = ""
    ) {

        try {

            const dados =
                await listarDespesasExtras(
                    textoBusca
                );


            setDespesas(
                Array.isArray(dados)
                    ? dados
                    : []
            );

        } catch {

            setErro(
                "Não foi possível carregar "
                + "as despesas."
            );
        }
    }


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            carregarDespesas();

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


        await carregarDespesas(
            valor
        );
    }


    function limparFormulario() {

        setDespesaEditando(
            null
        );


        setFormulario(
            formularioInicial
        );


        setErroModal("");
    }


    function abrirAdicionar() {

        limparFormulario();

        setErro("");

        setMensagem("");

        setModalFormularioAberto(
            true
        );
    }


    function abrirEditar(
        despesa
    ) {

        setDespesaEditando(
            despesa.id
        );


        setFormulario({
            quantidade:
                despesa.quantidade,

            nome:
                despesa.nome,

            valor_unitario:
                despesa.valor_unitario
        });


        setErro("");

        setMensagem("");

        setErroModal("");

        setModalFormularioAberto(
            true
        );
    }


    function fecharFormulario() {

        if (
            salvando
        ) {

            return;
        }


        setModalFormularioAberto(
            false
        );


        limparFormulario();
    }


    function abrirExcluir(
        despesa
    ) {

        setErro("");

        setMensagem("");

        setErroModal("");

        setDespesaExcluir(
            despesa
        );
    }


    function fecharExcluir() {

        if (
            excluindo
        ) {

            return;
        }


        setDespesaExcluir(
            null
        );

        setErroModal("");
    }


    async function enviar(
        confirmarDuplicada = false
    ) {

        const dados = {
            quantidade:
                formulario.quantidade,

            nome:
                formulario.nome,

            valor_unitario:
                formulario.valor_unitario,

            confirmar_duplicada:
                confirmarDuplicada
        };


        if (
            despesaEditando
        ) {

            return atualizarDespesaExtra(
                despesaEditando,
                dados
            );
        }


        return criarDespesaExtra(
            dados
        );
    }


    async function concluirSalvamento() {

        setMensagem(
            despesaEditando
                ? "Despesa atualizada com sucesso."
                : "Despesa cadastrada com sucesso."
        );


        setModalFormularioAberto(
            false
        );


        limparFormulario();


        setPaginaAtual(
            1
        );


        await carregarDespesas(
            busca
        );
    }


    async function handleSubmit(
        event
    ) {

        event.preventDefault();

        setErro("");

        setErroModal("");

        setMensagem("");

        setSalvando(
            true
        );


        try {

            await enviar(
                false
            );


            await concluirSalvamento();

        } catch (error) {

            if (
                error.response?.status
                === 409
                &&
                error.response?.data?.codigo
                === "DESPESA_DUPLICADA"
            ) {

                setDuplicadaPendente({
                    mensagem:
                        error.response
                            ?.data
                            ?.erro
                        ||
                        "Já existe uma despesa semelhante."
                });


                setModalFormularioAberto(
                    false
                );

            } else {

                setErroModal(
                    error.response
                        ?.data
                        ?.erro
                    ||
                    "Não foi possível "
                    + "salvar a despesa."
                );
            }

        } finally {

            setSalvando(
                false
            );
        }
    }


    function cancelarDuplicada() {

        if (
            confirmandoDuplicada
        ) {

            return;
        }


        setDuplicadaPendente(
            null
        );


        setModalFormularioAberto(
            true
        );
    }


    async function confirmarDuplicada() {

        try {

            setConfirmandoDuplicada(
                true
            );

            setErroModal("");


            await enviar(
                true
            );


            setDuplicadaPendente(
                null
            );


            await concluirSalvamento();

        } catch (error) {

            setErroModal(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível "
                + "salvar a despesa."
            );

        } finally {

            setConfirmandoDuplicada(
                false
            );
        }
    }


    async function confirmarExclusao() {

        if (
            !despesaExcluir
        ) {

            return;
        }


        try {

            setExcluindo(
                true
            );

            setErro("");

            setErroModal("");

            setMensagem("");


            await excluirDespesaExtra(
                despesaExcluir.id
            );


            setMensagem(
                "Despesa excluída "
                + "com sucesso."
            );


            setDespesaExcluir(
                null
            );


            setPaginaAtual(
                1
            );


            await carregarDespesas(
                busca
            );

        } catch (error) {

            setErroModal(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível "
                + "excluir a despesa."
            );

        } finally {

            setExcluindo(
                false
            );
        }
    }


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


    function formatarData(
        data
    ) {

        if (
            !data
        ) {

            return "-";
        }


        const parteData =
            String(
                data
            ).substring(
                0,
                10
            );


        const [
            ano,
            mes,
            dia
        ] = parteData.split(
            "-"
        );


        if (
            !ano
            ||
            !mes
            ||
            !dia
        ) {

            return parteData;
        }


        return `${dia}/${mes}/${ano}`;
    }


    const despesasFiltradas =
        useMemo(
            () => {

                return despesas.filter(
                    (despesa) => {

                        const dataDespesa =
                            String(
                                despesa.data
                                || ""
                            ).substring(
                                0,
                                10
                            );


                        if (
                            periodo
                            === "TOTAL"
                        ) {

                            return true;
                        }


                        if (
                            periodo
                            === "DIA"
                        ) {

                            return (
                                dataDespesa
                                === diaFiltro
                            );
                        }


                        if (
                            periodo
                            === "MENSAL"
                        ) {

                            return (
                                dataDespesa.slice(
                                    0,
                                    7
                                )
                                === mesFiltro
                            );
                        }


                        if (
                            periodo
                            === "ANUAL"
                        ) {

                            return (
                                dataDespesa.slice(
                                    0,
                                    4
                                )
                                === anoFiltro
                            );
                        }


                        return true;
                    }
                );

            },
            [
                despesas,
                periodo,
                diaFiltro,
                mesFiltro,
                anoFiltro
            ]
        );


    const total =
        useMemo(
            () => {

                return despesasFiltradas.reduce(
                    (
                        soma,
                        despesa
                    ) =>
                        soma
                        +
                        Number(
                            despesa.valor_total
                            || 0
                        ),
                    0
                );

            },
            [
                despesasFiltradas
            ]
        );


    const totalItens =
        despesasFiltradas.length;


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


    const despesasPaginadas =
        despesasFiltradas.slice(
            indiceInicial,
            indiceInicial
            +
            itensPorPagina
        );


    function alterarPeriodo(
        novoPeriodo
    ) {

        setPeriodo(
            novoPeriodo
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


    const valorTotalFormulario =
        (
            Number(
                formulario.quantidade
            )
            || 0
        )
        *
        (
            Number(
                formulario.valor_unitario
            )
            || 0
        );


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
                        Despesas Extras
                    </h1>

                    <p>
                        Cadastro de despesas
                        adicionais do negócio.
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

                    Adicionar Despesa

                </button>

            </div>


            <div
                className={
                    styles.topBar
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
                            "Buscar despesa..."
                        }
                        value={busca}
                        onChange={
                            handleBusca
                        }
                    />

                </div>


                <div
                    className={
                        styles.totalCard
                    }
                >

                    <span>
                        Total do período
                    </span>

                    <strong>
                        {
                            moeda(
                                total
                            )
                        }
                    </strong>

                </div>

            </div>


            <div
                className={
                    styles.periodBar
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
                            periodo
                            === "TOTAL"
                                ? styles.periodActive
                                : styles.periodButton
                        }
                        onClick={() =>
                            alterarPeriodo(
                                "TOTAL"
                            )
                        }
                    >
                        Total
                    </button>


                    <button
                        type="button"
                        className={
                            periodo
                            === "DIA"
                                ? styles.periodActive
                                : styles.periodButton
                        }
                        onClick={() =>
                            alterarPeriodo(
                                "DIA"
                            )
                        }
                    >
                        Dia
                    </button>


                    <button
                        type="button"
                        className={
                            periodo
                            === "MENSAL"
                                ? styles.periodActive
                                : styles.periodButton
                        }
                        onClick={() =>
                            alterarPeriodo(
                                "MENSAL"
                            )
                        }
                    >
                        Mês
                    </button>


                    <button
                        type="button"
                        className={
                            periodo
                            === "ANUAL"
                                ? styles.periodActive
                                : styles.periodButton
                        }
                        onClick={() =>
                            alterarPeriodo(
                                "ANUAL"
                            )
                        }
                    >
                        Ano
                    </button>

                </div>


                {
                    periodo
                    === "DIA"
                    && (

                        <input
                            type="date"
                            className={
                                styles.referenceInput
                            }
                            value={
                                diaFiltro
                            }
                            onChange={
                                (event) => {

                                    setDiaFiltro(
                                        event.target.value
                                    );

                                    setPaginaAtual(
                                        1
                                    );
                                }
                            }
                        />
                    )
                }


                {
                    periodo
                    === "MENSAL"
                    && (

                        <input
                            type="month"
                            className={
                                styles.referenceInput
                            }
                            value={
                                mesFiltro
                            }
                            onChange={
                                (event) => {

                                    setMesFiltro(
                                        event.target.value
                                    );

                                    setPaginaAtual(
                                        1
                                    );
                                }
                            }
                        />
                    )
                }


                {
                    periodo
                    === "ANUAL"
                    && (

                        <input
                            type="number"
                            className={
                                styles.referenceInput
                            }
                            min="2000"
                            max="2100"
                            value={
                                anoFiltro
                            }
                            onChange={
                                (event) => {

                                    setAnoFiltro(
                                        event.target.value
                                            .slice(
                                                0,
                                                4
                                            )
                                    );

                                    setPaginaAtual(
                                        1
                                    );
                                }
                            }
                        />
                    )
                }

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
                                <th>Nome</th>
                                <th>Valor unitário</th>
                                <th>Valor total</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                despesasPaginadas.length
                                === 0

                                    ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhuma despesa
                                                encontrada.
                                            </td>

                                        </tr>
                                    )

                                    : despesasPaginadas.map(
                                        (despesa) => (

                                            <tr
                                                key={
                                                    despesa.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        despesa.quantidade
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        despesa.nome
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        moeda(
                                                            despesa
                                                                .valor_unitario
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <strong>
                                                        {
                                                            moeda(
                                                                despesa
                                                                    .valor_total
                                                            )
                                                        }
                                                    </strong>

                                                </td>


                                                <td>
                                                    {
                                                        formatarData(
                                                            despesa.data
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
                                                                abrirEditar(
                                                                    despesa
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
                                                                    despesa
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
                                styles.formModal
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
                                            despesaEditando
                                                ? "Editar Despesa"
                                                : "Adicionar Despesa"
                                        }
                                    </h2>

                                    <p>
                                        {
                                            despesaEditando
                                                ? "Atualize os dados da despesa."
                                                : "Cadastre uma nova despesa extra."
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
                                    styles.modalBody
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
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div
                                            className={
                                                styles.nameField
                                            }
                                        >

                                            <label>
                                                Nome *
                                            </label>

                                            <input
                                                type="text"
                                                name="nome"
                                                placeholder={
                                                    "Ex.: Gás de cozinha"
                                                }
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
                                                Valor unitário *
                                            </label>

                                            <input
                                                type="number"
                                                name="valor_unitario"
                                                min="0"
                                                step="0.01"
                                                placeholder="0,00"
                                                value={
                                                    formulario
                                                        .valor_unitario
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Valor total
                                            </label>

                                            <input
                                                value={
                                                    moeda(
                                                        valorTotalFormulario
                                                    )
                                                }
                                                disabled
                                            />

                                        </div>

                                    </div>


                                    <p
                                        className={
                                            styles.info
                                        }
                                    >
                                        A data será registrada
                                        automaticamente pelo sistema.
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
                                                    : despesaEditando
                                                        ? "Salvar alterações"
                                                        : "Adicionar despesa"
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
                duplicadaPendente
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
                                        Despesa semelhante
                                    </h2>

                                    <p>
                                        Confirme se deseja
                                        continuar.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        cancelarDuplicada
                                    }
                                    disabled={
                                        confirmandoDuplicada
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
                                    {
                                        duplicadaPendente
                                            .mensagem
                                    }
                                </p>


                                <strong>
                                    {
                                        formulario.nome
                                    }
                                </strong>


                                <span>
                                    Valor total:{" "}
                                    {
                                        moeda(
                                            valorTotalFormulario
                                        )
                                    }
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
                                            cancelarDuplicada
                                        }
                                        disabled={
                                            confirmandoDuplicada
                                        }
                                    >
                                        Voltar
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            styles.saveButton
                                        }
                                        onClick={
                                            confirmarDuplicada
                                        }
                                        disabled={
                                            confirmandoDuplicada
                                        }
                                    >
                                        {
                                            confirmandoDuplicada
                                                ? "Salvando..."
                                                : "Salvar mesmo assim"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )
            }


            {
                despesaExcluir
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
                                        Excluir Despesa
                                    </h2>

                                    <p>
                                        Confirme a exclusão
                                        deste lançamento.
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
                                    a despesa:
                                </p>


                                <strong>
                                    {
                                        despesaExcluir.nome
                                    }
                                </strong>


                                <span>
                                    {
                                        despesaExcluir.quantidade
                                    }
                                    {" × "}
                                    {
                                        moeda(
                                            despesaExcluir
                                                .valor_unitario
                                        )
                                    }
                                    {" = "}
                                    {
                                        moeda(
                                            despesaExcluir
                                                .valor_total
                                        )
                                    }
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
                                                : "Excluir despesa"
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


export default Despesas;
