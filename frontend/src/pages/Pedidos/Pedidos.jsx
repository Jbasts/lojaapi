import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Check,
    ChevronDown,
    ChevronUp,
    Pencil,
    Plus,
    Search,
    Trash2
} from "lucide-react";

import {
    atualizarPedido,
    buscarPedido,
    concluirPedido,
    criarPedido,
    excluirPedido,
    listarPedidos
} from "../../services/pedidoService";

import {
    listarClientes
} from "../../services/clienteService";

import {
    listarProdutosVenda
} from "../../services/produtoVendaService";

import styles
    from "./Pedidos.module.css";


const itemInicial = {
    produto_venda_id: "",
    quantidade: 1,
    valor_unitario: "",
    desconto_tipo: "NENHUM",
    desconto_valor: 0
};


function Pedidos() {

    const [pedidos, setPedidos] =
        useState([]);

    const [clientes, setClientes] =
        useState([]);

    const [produtos, setProdutos] =
        useState([]);

    const [clienteId, setClienteId] =
        useState("");

    const [itemForm, setItemForm] =
        useState(itemInicial);

    const [itens, setItens] =
        useState([]);

    const [pedidoEditando, setPedidoEditando] =
        useState(null);

    const [busca, setBusca] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [aberto, setAberto] =
        useState(null);

    const [detalhes, setDetalhes] =
        useState({});

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);


    async function carregarPedidos(
        texto = busca,
        filtro = status
    ) {

        try {

            const dados =
                await listarPedidos(
                    texto,
                    filtro
                );

            setPedidos(dados);

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar os pedidos."
            );
        }
    }


    async function carregarCadastros() {

        try {

            const [
                dadosClientes,
                dadosProdutos
            ] = await Promise.all([
                listarClientes(),
                listarProdutosVenda()
            ]);

            setClientes(
                dadosClientes
            );

            setProdutos(
                dadosProdutos
            );

        } catch {

            setErro(
                "Não foi possível carregar "
                + "clientes e produtos."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregarPedidos("", "");
        carregarCadastros();

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

        await carregarPedidos(
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

        await carregarPedidos(
            busca,
            valor
        );
    }


    function alterarItemForm(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        if (
            name
            === "produto_venda_id"
        ) {

            const produto =
                produtos.find(
                    (p) =>
                        String(p.id)
                        === String(value)
                );


            setItemForm(
                (anterior) => ({
                    ...anterior,

                    produto_venda_id:
                        value,

                    valor_unitario:
                        produto
                            ? produto.preco_venda
                            : ""
                })
            );

            return;
        }


        if (
            name
            === "desconto_tipo"
            &&
            value
            === "NENHUM"
        ) {

            setItemForm(
                (anterior) => ({
                    ...anterior,

                    desconto_tipo:
                        "NENHUM",

                    desconto_valor:
                        0
                })
            );

            return;
        }


        setItemForm(
            (anterior) => ({
                ...anterior,
                [name]: value
            })
        );
    }


    function calcularItem(
        item
    ) {

        const bruto =
            Number(
                item.quantidade || 0
            )
            *
            Number(
                item.valor_unitario || 0
            );


        let desconto = 0;


        if (
            item.desconto_tipo
            === "PERCENTUAL"
        ) {

            desconto =
                bruto
                *
                (
                    Number(
                        item.desconto_valor
                        || 0
                    )
                    /
                    100
                );

        } else if (
            item.desconto_tipo
            === "VALOR"
        ) {

            desconto = Number(
                item.desconto_valor
                || 0
            );
        }


        return {
            bruto,
            desconto,
            total:
                Math.max(
                    bruto - desconto,
                    0
                )
        };
    }


    function adicionarItem() {

        setErro("");


        const produto =
            produtos.find(
                (p) =>
                    String(p.id)
                    ===
                    String(
                        itemForm
                            .produto_venda_id
                    )
            );


        if (!produto) {

            setErro(
                "Selecione o produto."
            );

            return;
        }


        if (
            Number(
                itemForm.quantidade
            ) <= 0
        ) {

            setErro(
                "Quantidade inválida."
            );

            return;
        }


        if (
            itemForm.valor_unitario
            === ""
            ||
            Number(
                itemForm.valor_unitario
            ) < 0
        ) {

            setErro(
                "Valor unitário inválido."
            );

            return;
        }


        if (
            itemForm.desconto_tipo
            === "PERCENTUAL"
            &&
            Number(
                itemForm.desconto_valor
            ) > 100
        ) {

            setErro(
                "Desconto percentual "
                + "não pode passar de 100%."
            );

            return;
        }


        const novoItem = {
            produto_venda_id:
                produto.id,

            produto_nome:
                produto.nome,

            sabor:
                produto.sabor,

            tipo_produto:
                produto.tipo,

            quantidade:
                Number(
                    itemForm.quantidade
                ),

            valor_unitario:
                Number(
                    itemForm.valor_unitario
                ),

            desconto_tipo:
                itemForm.desconto_tipo,

            desconto_valor:
                Number(
                    itemForm.desconto_valor
                    || 0
                )
        };


        const calculo =
            calcularItem(
                novoItem
            );


        if (
            novoItem.desconto_tipo
            === "VALOR"
            &&
            novoItem.desconto_valor
            > calculo.bruto
        ) {

            setErro(
                "O desconto não pode "
                + "ser maior que o "
                + "valor do item."
            );

            return;
        }


        setItens(
            (anteriores) => [
                ...anteriores,
                novoItem
            ]
        );


        setItemForm(
            itemInicial
        );
    }


    function removerItem(
        indice
    ) {

        setItens(
            (anteriores) =>
                anteriores.filter(
                    (_, atual) =>
                        atual !== indice
                )
        );
    }


    const totais =
        useMemo(
            () => {

                return itens.reduce(
                    (
                        total,
                        item
                    ) => {

                        const calculo =
                            calcularItem(
                                item
                            );


                        return {
                            subtotal:
                                total.subtotal
                                +
                                calculo.bruto,

                            desconto:
                                total.desconto
                                +
                                calculo.desconto,

                            final:
                                total.final
                                +
                                calculo.total
                        };
                    },

                    {
                        subtotal: 0,
                        desconto: 0,
                        final: 0
                    }
                );

            },
            [itens]
        );


    function limparFormulario() {

        setPedidoEditando(null);

        setClienteId("");

        setItens([]);

        setItemForm(
            itemInicial
        );
    }


    async function salvarPedido() {

        setErro("");
        setMensagem("");


        if (!clienteId) {

            setErro(
                "Selecione o cliente."
            );

            return;
        }


        if (
            itens.length === 0
        ) {

            setErro(
                "Adicione pelo menos "
                + "um produto."
            );

            return;
        }


        setSalvando(true);


        const dados = {
            cliente_id:
                Number(clienteId),

            itens:
                itens.map(
                    (item) => ({
                        produto_venda_id:
                            item.produto_venda_id,

                        quantidade:
                            item.quantidade,

                        valor_unitario:
                            item.valor_unitario,

                        desconto_tipo:
                            item.desconto_tipo,

                        desconto_valor:
                            item.desconto_valor
                    })
                )
        };


        try {

            if (pedidoEditando) {

                await atualizarPedido(
                    pedidoEditando,
                    dados
                );

                setMensagem(
                    "Pedido atualizado "
                    + "com sucesso."
                );

            } else {

                const resultado =
                    await criarPedido(
                        dados
                    );


                setMensagem(
                    `Pedido #${
                        resultado
                            .pedido
                            .numero
                    } cadastrado com sucesso.`
                );
            }


            limparFormulario();

            await carregarPedidos();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível salvar "
                + "o pedido."
            );

        } finally {

            setSalvando(false);
        }
    }


    async function editarPedido(
        pedido
    ) {

        try {

            const dados =
                await buscarPedido(
                    pedido.id
                );


            if (
                dados.status
                !== "ABERTO"
            ) {

                setErro(
                    "Pedido concluído "
                    + "não pode ser editado."
                );

                return;
            }


            setPedidoEditando(
                dados.id
            );

            setClienteId(
                dados.cliente_id
            );


            setItens(
                dados.itens.map(
                    (item) => ({
                        produto_venda_id:
                            item.produto_venda_id,

                        produto_nome:
                            item.produto_nome,

                        sabor:
                            item.sabor,

                        tipo_produto:
                            item.tipo_produto,

                        quantidade:
                            item.quantidade,

                        valor_unitario:
                            item.valor_unitario,

                        desconto_tipo:
                            item.desconto_tipo,

                        desconto_valor:
                            item.desconto_valor
                    })
                )
            );


            setErro("");
            setMensagem("");

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar "
                + "o pedido."
            );
        }
    }


    async function finalizar(
        pedido
    ) {

        const confirmar =
            window.confirm(
                `Concluir o pedido `
                + `#${pedido.numero}? `
                + `Depois disso ele `
                + `não poderá ser editado.`
            );


        if (!confirmar) {
            return;
        }


        try {

            await concluirPedido(
                pedido.id
            );

            setMensagem(
                `Pedido #${pedido.numero} `
                + "concluído com sucesso."
            );

            await carregarPedidos();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível concluir "
                + "o pedido."
            );
        }
    }


    async function removerPedido(
        pedido
    ) {

        const confirmar =
            window.confirm(
                `Deseja excluir o pedido `
                + `#${pedido.numero}?`
            );


        if (!confirmar) {
            return;
        }


        try {

            await excluirPedido(
                pedido.id
            );

            setMensagem(
                "Pedido excluído "
                + "com sucesso."
            );

            await carregarPedidos();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível "
                + "excluir o pedido."
            );
        }
    }


    async function alternarDetalhes(
        pedido
    ) {

        if (
            aberto === pedido.id
        ) {

            setAberto(null);

            return;
        }


        try {

            if (
                !detalhes[pedido.id]
            ) {

                const dados =
                    await buscarPedido(
                        pedido.id
                    );


                setDetalhes(
                    (anterior) => ({
                        ...anterior,

                        [pedido.id]:
                            dados
                    })
                );
            }


            setAberto(
                pedido.id
            );

        } catch {

            setErro(
                "Não foi possível carregar "
                + "os detalhes do pedido."
            );
        }
    }


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Pedidos
                    </h1>

                    <p>
                        Cadastro e acompanhamento
                        dos pedidos.
                    </p>

                </div>

            </div>


            {erro && (
                <div className={styles.error}>
                    {erro}
                </div>
            )}


            {mensagem && (
                <div className={styles.success}>
                    {mensagem}
                </div>
            )}


            <div className={styles.filters}>

                <div className={styles.searchBox}>

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar pedido, cliente ou produto..."
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

                    <option value="ABERTO">
                        Abertos
                    </option>

                    <option value="CONCLUIDO">
                        Concluídos
                    </option>

                </select>

            </div>


            <section className={styles.card}>

                <div className={styles.tableWrapper}>

                    <table>

                        <thead>

                            <tr>
                                <th>Nº Pedido</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Subtotal</th>
                                <th>Desconto</th>
                                <th>Total</th>
                                <th>Pedido</th>
                                <th>Pagamento</th>
                                <th>Ações</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                pedidos.length === 0
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

                                    : pedidos.map(
                                        (pedido) => (

                                            <>
                                                <tr key={pedido.id}>

                                                    <td>
                                                        <strong>
                                                            #{pedido.numero}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {
                                                            pedido
                                                                .cliente_nome
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            dataBR(
                                                                pedido
                                                                    .data_pedido
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            moeda(
                                                                pedido
                                                                    .subtotal
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            moeda(
                                                                pedido
                                                                    .desconto_total
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                moeda(
                                                                    pedido
                                                                        .valor_total
                                                                )
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                pedido.status
                                                                === "CONCLUIDO"
                                                                    ? styles.concluido
                                                                    : styles.aberto
                                                            }
                                                        >
                                                            {
                                                                pedido.status
                                                                === "CONCLUIDO"
                                                                    ? "Concluído"
                                                                    : "Aberto"
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <span
                                                            className={
                                                                pedido
                                                                    .pagamento_status
                                                                === "PAGO"
                                                                    ? styles.pago
                                                                    : styles.pendente
                                                            }
                                                        >
                                                            {
                                                                pedido
                                                                    .pagamento_status
                                                                === "PAGO"
                                                                    ? "Pago"
                                                                    : "Pendente"
                                                            }
                                                        </span>

                                                    </td>

                                                    <td>

                                                        <div
                                                            className={
                                                                styles.actions
                                                            }
                                                        >

                                                            <button
                                                                title="Detalhes"
                                                                onClick={() =>
                                                                    alternarDetalhes(
                                                                        pedido
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    aberto
                                                                    === pedido.id
                                                                        ? (
                                                                            <ChevronUp size={15} />
                                                                        )
                                                                        : (
                                                                            <ChevronDown size={15} />
                                                                        )
                                                                }
                                                            </button>


                                                            {
                                                                pedido.status
                                                                === "ABERTO"
                                                                && (

                                                                    <>
                                                                        <button
                                                                            title="Editar"
                                                                            onClick={() =>
                                                                                editarPedido(
                                                                                    pedido
                                                                                )
                                                                            }
                                                                        >
                                                                            <Pencil size={15} />
                                                                        </button>


                                                                        <button
                                                                            title="Concluir"
                                                                            onClick={() =>
                                                                                finalizar(
                                                                                    pedido
                                                                                )
                                                                            }
                                                                        >
                                                                            <Check size={15} />
                                                                        </button>


                                                                        <button
                                                                            title="Excluir"
                                                                            onClick={() =>
                                                                                removerPedido(
                                                                                    pedido
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 size={15} />
                                                                        </button>
                                                                    </>
                                                                )
                                                            }

                                                        </div>

                                                    </td>

                                                </tr>


                                                {
                                                    aberto === pedido.id
                                                    &&
                                                    detalhes[pedido.id]
                                                    && (

                                                        <tr>

                                                            <td
                                                                colSpan="9"
                                                                className={
                                                                    styles.details
                                                                }
                                                            >

                                                                <table
                                                                    className={
                                                                        styles.innerTable
                                                                    }
                                                                >

                                                                    <thead>
                                                                        <tr>
                                                                            <th>Produto</th>
                                                                            <th>Sabor</th>
                                                                            <th>Qtd.</th>
                                                                            <th>Unitário</th>
                                                                            <th>Bruto</th>
                                                                            <th>Desconto</th>
                                                                            <th>Total</th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>

                                                                        {
                                                                            detalhes[
                                                                                pedido.id
                                                                            ]
                                                                            .itens
                                                                            .map(
                                                                                (item) => (

                                                                                    <tr
                                                                                        key={
                                                                                            item.id
                                                                                        }
                                                                                    >

                                                                                        <td>
                                                                                            {
                                                                                                item.produto_nome
                                                                                            }
                                                                                        </td>

                                                                                        <td>
                                                                                            {
                                                                                                item.sabor
                                                                                                || "-"
                                                                                            }
                                                                                        </td>

                                                                                        <td>
                                                                                            {
                                                                                                item.quantidade
                                                                                            }
                                                                                        </td>

                                                                                        <td>
                                                                                            {
                                                                                                moeda(
                                                                                                    item.valor_unitario
                                                                                                )
                                                                                            }
                                                                                        </td>

                                                                                        <td>
                                                                                            {
                                                                                                moeda(
                                                                                                    item.valor_bruto
                                                                                                )
                                                                                            }
                                                                                        </td>

                                                                                        <td>
                                                                                            {
                                                                                                item.desconto_tipo
                                                                                                === "PERCENTUAL"
                                                                                                    ? `${
                                                                                                        item.desconto_valor
                                                                                                    }% (${
                                                                                                        moeda(
                                                                                                            item.valor_desconto
                                                                                                        )
                                                                                                    })`
                                                                                                    : moeda(
                                                                                                        item.valor_desconto
                                                                                                    )
                                                                                            }
                                                                                        </td>

                                                                                        <td>
                                                                                            <strong>
                                                                                                {
                                                                                                    moeda(
                                                                                                        item.valor_final
                                                                                                    )
                                                                                                }
                                                                                            </strong>
                                                                                        </td>

                                                                                    </tr>
                                                                                )
                                                                            )
                                                                        }

                                                                    </tbody>

                                                                </table>

                                                            </td>

                                                        </tr>
                                                    )
                                                }

                                            </>
                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>

            </section>


            <section className={styles.formCard}>

                <div className={styles.formHeader}>

                    <h2>
                        {
                            pedidoEditando
                                ? "Editar Pedido"
                                : "Novo Pedido"
                        }
                    </h2>


                    {
                        pedidoEditando
                        && (

                            <button
                                type="button"
                                className={
                                    styles.cancelButton
                                }
                                onClick={
                                    limparFormulario
                                }
                            >
                                Cancelar edição
                            </button>
                        )
                    }

                </div>


                <div className={styles.customer}>

                    <label>
                        Cliente *
                    </label>

                    <select
                        value={clienteId}
                        onChange={
                            (event) =>
                                setClienteId(
                                    event.target.value
                                )
                        }
                    >

                        <option value="">
                            Selecione o cliente
                        </option>


                        {
                            clientes.map(
                                (cliente) => (

                                    <option
                                        key={
                                            cliente.id
                                        }
                                        value={
                                            cliente.id
                                        }
                                    >
                                        {
                                            cliente.nome
                                        }
                                        {" "}
                                        {
                                            cliente.sobrenome
                                        }
                                    </option>
                                )
                            )
                        }

                    </select>

                </div>


                <h3>
                    Adicionar produto
                </h3>


                <div className={styles.itemGrid}>

                    <div>

                        <label>
                            Produto *
                        </label>

                        <select
                            name="produto_venda_id"
                            value={
                                itemForm
                                    .produto_venda_id
                            }
                            onChange={
                                alterarItemForm
                            }
                        >

                            <option value="">
                                Selecione
                            </option>


                            {
                                produtos.map(
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

                                            {
                                                produto.sabor
                                                &&
                                                ` - ${produto.sabor}`
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
                                itemForm.quantidade
                            }
                            onChange={
                                alterarItemForm
                            }
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
                            value={
                                itemForm
                                    .valor_unitario
                            }
                            onChange={
                                alterarItemForm
                            }
                        />

                    </div>


                    <div>

                        <label>
                            Tipo desconto
                        </label>

                        <select
                            name="desconto_tipo"
                            value={
                                itemForm
                                    .desconto_tipo
                            }
                            onChange={
                                alterarItemForm
                            }
                        >

                            <option value="NENHUM">
                                Sem desconto
                            </option>

                            <option value="VALOR">
                                R$
                            </option>

                            <option value="PERCENTUAL">
                                %
                            </option>

                        </select>

                    </div>


                    <div>

                        <label>
                            Desconto
                        </label>

                        <input
                            type="number"
                            name="desconto_valor"
                            min="0"
                            step="0.01"
                            value={
                                itemForm
                                    .desconto_valor
                            }
                            onChange={
                                alterarItemForm
                            }
                            disabled={
                                itemForm
                                    .desconto_tipo
                                === "NENHUM"
                            }
                        />

                    </div>


                    <button
                        type="button"
                        className={
                            styles.addItem
                        }
                        onClick={
                            adicionarItem
                        }
                    >
                        <Plus size={15} />

                        Adicionar
                    </button>

                </div>


                <div className={styles.itemsArea}>

                    <table>

                        <thead>

                            <tr>
                                <th>Produto</th>
                                <th>Sabor</th>
                                <th>Qtd.</th>
                                <th>Unitário</th>
                                <th>Bruto</th>
                                <th>Desconto</th>
                                <th>Total</th>
                                <th></th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                itens.length === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum produto adicionado.
                                            </td>

                                        </tr>
                                    )

                                    : itens.map(
                                        (
                                            item,
                                            indice
                                        ) => {

                                            const calculo =
                                                calcularItem(
                                                    item
                                                );


                                            return (

                                                <tr key={indice}>

                                                    <td>
                                                        {
                                                            item
                                                                .produto_nome
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.sabor
                                                            || "-"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            item.quantidade
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            moeda(
                                                                item
                                                                    .valor_unitario
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            moeda(
                                                                calculo.bruto
                                                            )
                                                        }
                                                    </td>

                                                    <td>

                                                        {
                                                            item
                                                                .desconto_tipo
                                                            === "PERCENTUAL"

                                                                ? `${
                                                                    item
                                                                        .desconto_valor
                                                                }%`

                                                                : moeda(
                                                                    calculo
                                                                        .desconto
                                                                )
                                                        }

                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                moeda(
                                                                    calculo.total
                                                                )
                                                            }
                                                        </strong>
                                                    </td>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.removeItem
                                                            }
                                                            onClick={() =>
                                                                removerItem(
                                                                    indice
                                                                )
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


                <div className={styles.summary}>

                    <div>

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            {
                                moeda(
                                    totais.subtotal
                                )
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Descontos
                        </span>

                        <strong>
                            - {
                                moeda(
                                    totais.desconto
                                )
                            }
                        </strong>

                    </div>


                    <div>

                        <span>
                            Valor final
                        </span>

                        <strong>
                            {
                                moeda(
                                    totais.final
                                )
                            }
                        </strong>

                    </div>

                </div>


                <div className={styles.formActions}>

                    <button
                        type="button"
                        className={
                            styles.cancelButton
                        }
                        onClick={
                            limparFormulario
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
                            salvarPedido
                        }
                        disabled={
                            salvando
                        }
                    >

                        {
                            salvando
                                ? "Salvando..."
                                : "Salvar Pedido"
                        }

                    </button>

                </div>

            </section>

        </div>
    );
}


export default Pedidos;