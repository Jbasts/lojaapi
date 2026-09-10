import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    CircleCheck,
    RotateCcw,
    Search
} from "lucide-react";

import {
    estornarPagamento,
    listarPagamentos,
    pagarPedido
} from "../../services/pagamentoService";

import styles
    from "./Pagamentos.module.css";


const formasPagamento = {
    DINHEIRO:"Dinheiro",
    PIX:"Pix",
    CARTAO_CREDITO:"Cartão de crédito",
    CARTAO_DEBITO:"Cartão de débito",
    TRANSFERENCIA:"Transferência",
    OUTRO:"Outro"
};


function Pagamentos() {

    const [
        registros,
        setRegistros
    ] = useState([]);

    const [busca, setBusca] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [
        pedidoSelecionado,
        setPedidoSelecionado
    ] = useState(null);

    const [
        forma,
        setForma
    ] = useState("PIX");

    const [observacao, setObservacao] =
        useState("");

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);


    async function carregar(
        texto = busca,
        filtro = status
    ) {

        try {

            const dados =
                await listarPagamentos(
                    texto,
                    filtro
                );

            setRegistros(
                dados
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "os pagamentos."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregar("", "");

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
            return "-";
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

        setBusca(valor);

        await carregar(
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

        await carregar(
            busca,
            valor
        );
    }


    function abrirPagamento(
        registro
    ) {

        setPedidoSelecionado(
            registro
        );

        setForma(
            "PIX"
        );

        setObservacao("");

        setErro("");
        setMensagem("");
    }


    function cancelarPagamento() {

        setPedidoSelecionado(
            null
        );

        setForma(
            "PIX"
        );

        setObservacao("");
    }


    async function confirmarPagamento() {

        if (!pedidoSelecionado) {
            return;
        }


        const confirmar =
            window.confirm(
                `Confirmar pagamento do `
                + `pedido #${
                    pedidoSelecionado
                        .numero_pedido
                } no valor de ${
                    moeda(
                        pedidoSelecionado
                            .valor_pedido
                    )
                }?`
            );


        if (!confirmar) {
            return;
        }


        setSalvando(true);
        setErro("");
        setMensagem("");


        try {

            await pagarPedido(
                pedidoSelecionado.pedido_id,
                {
                    forma,
                    observacao
                }
            );


            setMensagem(
                `Pedido #${
                    pedidoSelecionado
                        .numero_pedido
                } marcado como pago.`
            );


            cancelarPagamento();

            await carregar();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível registrar "
                + "o pagamento."
            );

        } finally {

            setSalvando(false);
        }
    }


    async function estornar(
        registro
    ) {

        const confirmar =
            window.confirm(
                `Estornar o pagamento `
                + `do pedido #${
                    registro.numero_pedido
                }?`
            );


        if (!confirmar) {
            return;
        }


        try {

            await estornarPagamento(
                registro.pagamento_id
            );


            setMensagem(
                "Pagamento estornado "
                + "com sucesso."
            );


            await carregar();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível estornar "
                + "o pagamento."
            );
        }
    }


    const resumo =
        useMemo(
            () => {

                return registros.reduce(
                    (
                        acumulador,
                        item
                    ) => {

                        acumulador.total++;

                        if (
                            item.pagamento_status
                            === "PAGO"
                        ) {

                            acumulador.pagos++;

                            acumulador.recebido +=
                                Number(
                                    item.valor
                                    || 0
                                );

                        } else {

                            acumulador.pendentes++;

                            acumulador.pendente +=
                                Number(
                                    item.valor_pedido
                                    || 0
                                );
                        }


                        return acumulador;
                    },

                    {
                        total: 0,
                        pagos: 0,
                        pendentes: 0,
                        recebido: 0,
                        pendente: 0
                    }
                );

            },
            [registros]
        );


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Pagamentos
                    </h1>

                    <p>
                        Controle dos pagamentos
                        dos pedidos.
                    </p>

                </div>

            </div>


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


            <div className={styles.summary}>

                <div>

                    <span>
                        Pedidos
                    </span>

                    <strong>
                        {resumo.total}
                    </strong>

                </div>


                <div>

                    <span>
                        Pagos
                    </span>

                    <strong>
                        {resumo.pagos}
                    </strong>

                </div>


                <div>

                    <span>
                        Pendentes
                    </span>

                    <strong>
                        {resumo.pendentes}
                    </strong>

                </div>


                <div>

                    <span>
                        Recebido
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo.recebido
                            )
                        }
                    </strong>

                </div>


                <div>

                    <span>
                        A receber
                    </span>

                    <strong>
                        {
                            moeda(
                                resumo.pendente
                            )
                        }
                    </strong>

                </div>

            </div>


            <div className={styles.filters}>

                <div
                    className={
                        styles.searchBox
                    }
                >

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar pedido ou cliente..."
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

                    <option value="PENDENTE">
                        Pendentes
                    </option>

                    <option value="PAGO">
                        Pagos
                    </option>

                </select>

            </div>


            <section className={styles.card}>

                <div
                    className={
                        styles.tableWrapper
                    }
                >

                    <table>

                        <thead>

                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Valor</th>
                                <th>Data pedido</th>
                                <th>Status pedido</th>
                                <th>Pagamento</th>
                                <th>Forma</th>
                                <th>Data pagamento</th>
                                <th>Ação</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                registros.length
                                === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum pedido encontrado.
                                            </td>

                                        </tr>
                                    )

                                    : registros.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.pedido_id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        #
                                                        {
                                                            item
                                                                .numero_pedido
                                                        }
                                                    </strong>
                                                </td>


                                                <td>
                                                    {
                                                        item
                                                            .cliente_nome
                                                    }
                                                </td>


                                                <td>
                                                    <strong>
                                                        {
                                                            moeda(
                                                                item
                                                                    .valor_pedido
                                                            )
                                                        }
                                                    </strong>
                                                </td>


                                                <td>
                                                    {
                                                        dataBR(
                                                            item
                                                                .data_pedido
                                                        )
                                                    }
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            item
                                                                .pedido_status
                                                            === "CONCLUIDO"
                                                                ? styles.concluido
                                                                : styles.aberto
                                                        }
                                                    >
                                                        {
                                                            item
                                                                .pedido_status
                                                            === "CONCLUIDO"
                                                                ? "Concluído"
                                                                : "Aberto"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            item
                                                                .pagamento_status
                                                            === "PAGO"
                                                                ? styles.pago
                                                                : styles.pendente
                                                        }
                                                    >
                                                        {
                                                            item
                                                                .pagamento_status
                                                            === "PAGO"
                                                                ? "Pago"
                                                                : "Pendente"
                                                        }
                                                    </span>

                                                </td>


                                                <td>

                                                    {
                                                        item.forma
                                                            ? (
                                                                formasPagamento[
                                                                    item.forma
                                                                ]
                                                                ||
                                                                item.forma
                                                            )
                                                            : "-"
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        dataBR(
                                                            item
                                                                .data_pagamento
                                                        )
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        item
                                                            .pagamento_status
                                                        === "PENDENTE"
                                                            ? (

                                                                <button
                                                                    className={
                                                                        styles.payButton
                                                                    }
                                                                    onClick={() =>
                                                                        abrirPagamento(
                                                                            item
                                                                        )
                                                                    }
                                                                >

                                                                    <CircleCheck
                                                                        size={15}
                                                                    />

                                                                    Marcar pago

                                                                </button>
                                                            )

                                                            : (

                                                                <button
                                                                    className={
                                                                        styles.reverseButton
                                                                    }
                                                                    onClick={() =>
                                                                        estornar(
                                                                            item
                                                                        )
                                                                    }
                                                                >

                                                                    <RotateCcw
                                                                        size={15}
                                                                    />

                                                                    Estornar

                                                                </button>
                                                            )
                                                    }

                                                </td>

                                            </tr>
                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>

            </section>


            {
                pedidoSelecionado && (

                    <section
                        className={
                            styles.paymentCard
                        }
                    >

                        <div
                            className={
                                styles.paymentHeader
                            }
                        >

                            <div>

                                <h2>
                                    Registrar Pagamento
                                </h2>

                                <p>
                                    Pedido #
                                    {
                                        pedidoSelecionado
                                            .numero_pedido
                                    }
                                </p>

                            </div>


                            <strong>
                                {
                                    moeda(
                                        pedidoSelecionado
                                            .valor_pedido
                                    )
                                }
                            </strong>

                        </div>


                        <div
                            className={
                                styles.paymentGrid
                            }
                        >

                            <div>

                                <label>
                                    Cliente
                                </label>

                                <input
                                    value={
                                        pedidoSelecionado
                                            .cliente_nome
                                    }
                                    disabled
                                />

                            </div>


                            <div>

                                <label>
                                    Forma de pagamento *
                                </label>

                                <select
                                    value={
                                        forma
                                    }
                                    onChange={
                                        (event) =>
                                            setForma(
                                                event.target.value
                                            )
                                    }
                                >

                                    {
                                        Object.entries(
                                            formasPagamento
                                        ).map(
                                            ([
                                                valor,
                                                descricao
                                            ]) => (

                                                <option
                                                    key={valor}
                                                    value={valor}
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


                            <div
                                className={
                                    styles.observation
                                }
                            >

                                <label>
                                    Observação
                                </label>

                                <input
                                    value={
                                        observacao
                                    }
                                    onChange={
                                        (event) =>
                                            setObservacao(
                                                event
                                                    .target
                                                    .value
                                            )
                                    }
                                    placeholder={
                                        "Opcional"
                                    }
                                />

                            </div>

                        </div>


                        <p
                            className={
                                styles.dateInfo
                            }
                        >
                            A data do pagamento
                            será registrada
                            automaticamente.
                        </p>


                        <div
                            className={
                                styles.paymentActions
                            }
                        >

                            <button
                                className={
                                    styles.cancelButton
                                }
                                onClick={
                                    cancelarPagamento
                                }
                            >
                                Cancelar
                            </button>


                            <button
                                className={
                                    styles.confirmButton
                                }
                                onClick={
                                    confirmarPagamento
                                }
                                disabled={
                                    salvando
                                }
                            >

                                {
                                    salvando
                                        ? "Salvando..."
                                        : "Confirmar Pagamento"
                                }

                            </button>

                        </div>

                    </section>
                )
            }

        </div>
    );
}


export default Pagamentos;