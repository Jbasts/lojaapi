import {
    useEffect,
    useState
} from "react";

import {
    Boxes,
    CircleDollarSign,
    Package,
    Search,
    TriangleAlert
} from "lucide-react";

import {
    buscarEstoquePorCodigo,
    buscarResumoEstoque,
    listarEstoque,
    retirarProdutoEstoque
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


function Estoque() {

    const [lotes, setLotes] =
        useState([]);

    const [resumo, setResumo] =
        useState({
            produtos: 0,
            lotes: 0,
            quantidade_total: 0,
            valor_estoque: 0,
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

            setLotes(dados);

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


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregarEstoque("", "");
        carregarResumo();

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


    async function handleBusca(
        event
    ) {

        const valor =
            event.target.value;

        setBusca(valor);

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

        await carregarEstoque(
            busca,
            valor
        );
    }


    function statusTexto(valor) {

        if (valor === "VALIDO") {
            return "Válido";
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
                // O estoque principal já
                // foi atualizado.
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
                            resumo.quantidade_total
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
                                resumo.valor_estoque
                            )
                        }
                    </strong>

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
                            resumo.lotes_vencidos
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
                                lotes.length === 0
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

                                    : lotes.map(
                                        (lote) => (

                                            <tr
                                                key={
                                                    lote.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        lote.produto_nome
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        lote.codigo_barras
                                                    }
                                                </td>

                                                <td>
                                                    #{lote.id}
                                                </td>

                                                <td>
                                                    {
                                                        lote.compra_numero
                                                            ? `#${lote.compra_numero}`
                                                            : "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        lote.quantidade_atual
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        moeda(
                                                            lote.custo_unitario
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            moeda(
                                                                lote.valor_total
                                                            )
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        dataBR(
                                                            lote.validade
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

            </section>


            <section
                className={
                    styles.withdrawCard
                }
            >

                <h2>
                    Retirar produto para uso
                </h2>

                <p>
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
                                            retirada.lote_id
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
                                            retirada.lotes.map(
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
                                            .length === 0
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

            </section>

        </div>
    );
}


export default Estoque;