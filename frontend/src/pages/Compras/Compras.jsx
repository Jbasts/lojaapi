import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    ChevronDown,
    ChevronUp,
    Pencil,
    Plus,
    Search,
    Trash2
} from "lucide-react";

import {
    atualizarCompra,
    buscarCompra,
    criarCompra,
    excluirCompra,
    listarCompras
} from "../../services/compraService";

import {
    buscarProdutoPorCodigo
} from "../../services/produtoEstoqueService";

import styles from "./Compras.module.css";


const itemInicial = {
    codigo_barras: "",
    produto: null,
    quantidade: "",
    valor_unitario: "",
    validade: ""
};


function Compras() {

    const [compras, setCompras] =
        useState([]);

    const [busca, setBusca] =
        useState("");

    const [itemForm, setItemForm] =
        useState(itemInicial);

    const [itens, setItens] =
        useState([]);

    const [compraEditando, setCompraEditando] =
        useState(null);

    const [detalhes, setDetalhes] =
        useState({});

    const [aberta, setAberta] =
        useState(null);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);


    async function carregarCompras(
        texto = ""
    ) {

        try {
            const dados =
                await listarCompras(texto);

            setCompras(dados);

        } catch {
            setErro(
                "Não foi possível carregar as compras."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregarCompras();

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


    async function handleBusca(event) {

        const valor =
            event.target.value;

        setBusca(valor);

        await carregarCompras(
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

        setItemForm(
            (anterior) => ({
                ...anterior,
                [name]: value
            })
        );
    }


    async function procurarCodigo() {

        setErro("");

        if (
            !itemForm.codigo_barras.trim()
        ) {
            setErro(
                "Digite o código de barras."
            );

            return;
        }


        try {
            const produto =
                await buscarProdutoPorCodigo(
                    itemForm.codigo_barras
                );

            setItemForm(
                (anterior) => ({
                    ...anterior,
                    produto
                })
            );

        } catch {

            setItemForm(
                (anterior) => ({
                    ...anterior,
                    produto: null
                })
            );

            setErro(
                "Produto de estoque não registrado, " +
                "vá em produto_estoque e registre " +
                "o produto antes."
            );
        }
    }


    function adicionarItem() {

        setErro("");

        if (!itemForm.produto) {

            setErro(
                "Pesquise um produto pelo código de barras."
            );

            return;
        }


        if (
            Number(
                itemForm.quantidade
            ) <= 0
        ) {

            setErro(
                "Quantidade deve ser maior que zero."
            );

            return;
        }


        if (
            itemForm.valor_unitario === ""
            ||
            Number(
                itemForm.valor_unitario
            ) < 0
        ) {

            setErro(
                "Informe um valor unitário válido."
            );

            return;
        }


        setItens(
            (anteriores) => [
                ...anteriores,
                {
                    produto_estoque_id:
                        itemForm.produto.id,

                    produto_nome:
                        itemForm.produto.nome,

                    codigo_barras:
                        itemForm.produto.codigo_barras,

                    quantidade:
                        Number(
                            itemForm.quantidade
                        ),

                    valor_unitario:
                        Number(
                            itemForm.valor_unitario
                        ),

                    validade:
                        itemForm.validade || null
                }
            ]
        );


        setItemForm(
            itemInicial
        );
    }


    function removerItem(indice) {

        setItens(
            (anteriores) =>
                anteriores.filter(
                    (_, i) =>
                        i !== indice
                )
        );
    }


    const totalCompra = useMemo(
        () => {

            return itens.reduce(
                (total, item) => (
                    total
                    +
                    Number(item.quantidade)
                    *
                    Number(item.valor_unitario)
                ),
                0
            );

        },
        [itens]
    );


    async function enviarCompra(
        confirmarSemValidade = false
    ) {

        const dados = {
            confirmar_sem_validade:
                confirmarSemValidade,

            itens: itens.map(
                (item) => ({
                    produto_estoque_id:
                        item.produto_estoque_id,

                    quantidade:
                        item.quantidade,

                    valor_unitario:
                        item.valor_unitario,

                    validade:
                        item.validade || null
                })
            )
        };


        if (compraEditando) {

            return atualizarCompra(
                compraEditando,
                dados
            );
        }


        return criarCompra(
            dados
        );
    }


    async function salvarCompra() {

        if (itens.length === 0) {

            setErro(
                "Adicione pelo menos um item."
            );

            return;
        }


        setErro("");
        setMensagem("");
        setSalvando(true);


        try {

            await enviarCompra(false);

            setMensagem(
                compraEditando
                    ? "Compra atualizada com sucesso."
                    : "Compra registrada com sucesso."
            );

            limparFormulario();

            await carregarCompras(
                busca
            );

        } catch (error) {

            if (
                error.response?.status === 409
                &&
                error.response?.data?.codigo
                === "VALIDADE_NAO_INFORMADA"
            ) {

                const confirmar =
                    window.confirm(
                        "Produto sem validade, " +
                        "deseja prosseguir?"
                    );


                if (confirmar) {

                    try {

                        await enviarCompra(
                            true
                        );

                        setMensagem(
                            compraEditando
                                ? "Compra atualizada com sucesso."
                                : "Compra registrada com sucesso."
                        );

                        limparFormulario();

                        await carregarCompras(
                            busca
                        );

                    } catch (novoErro) {

                        setErro(
                            novoErro.response
                                ?.data
                                ?.erro
                            ||
                            "Não foi possível salvar a compra."
                        );
                    }
                }

            } else {

                setErro(
                    error.response
                        ?.data
                        ?.erro
                    ||
                    "Não foi possível salvar a compra."
                );
            }

        } finally {

            setSalvando(false);
        }
    }


    function limparFormulario() {

        setCompraEditando(null);
        setItemForm(itemInicial);
        setItens([]);
    }


    async function editarCompra(
        compra
    ) {

        try {

            setErro("");
            setMensagem("");

            const dados =
                await buscarCompra(
                    compra.id
                );

            setCompraEditando(
                compra.id
            );

            setItens(
                dados.itens.map(
                    (item) => ({
                        produto_estoque_id:
                            item.produto_estoque_id,

                        produto_nome:
                            item.produto_nome,

                        codigo_barras:
                            item.codigo_barras,

                        quantidade:
                            item.quantidade,

                        valor_unitario:
                            item.valor_unitario,

                        validade:
                            item.validade
                            || null
                    })
                )
            );

        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível carregar a compra."
            );
        }
    }


    async function apagarCompra(
        compra
    ) {

        const confirmar =
            window.confirm(
                `Deseja excluir a compra #${compra.numero}?`
            );

        if (!confirmar) {
            return;
        }


        try {

            await excluirCompra(
                compra.id
            );

            setMensagem(
                "Compra excluída com sucesso."
            );

            await carregarCompras(
                busca
            );

        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível excluir a compra."
            );
        }
    }


    async function alternarDetalhes(
        compra
    ) {

        if (aberta === compra.id) {

            setAberta(null);

            return;
        }


        try {

            if (!detalhes[compra.id]) {

                const dados =
                    await buscarCompra(
                        compra.id
                    );

                setDetalhes(
                    (anterior) => ({
                        ...anterior,
                        [compra.id]: dados
                    })
                );
            }

            setAberta(
                compra.id
            );

        } catch {

            setErro(
                "Não foi possível carregar " +
                "os detalhes da compra."
            );
        }
    }


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>
                    <h1>
                        Compras
                    </h1>

                    <p>
                        Entrada de produtos e
                        matérias-primas no estoque.
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


            <div className={styles.searchBox}>

                <Search size={17} />

                <input
                    placeholder={
                        "Buscar compra, produto ou código..."
                    }
                    value={busca}
                    onChange={handleBusca}
                />

            </div>


            <section className={styles.card}>

                <table className={styles.table}>

                    <thead>
                        <tr>
                            <th>Nº Compra</th>
                            <th>Itens</th>
                            <th>Valor total</th>
                            <th>Data</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>


                    <tbody>

                        {compras.length === 0
                            ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className={
                                            styles.empty
                                        }
                                    >
                                        Nenhuma compra registrada.
                                    </td>
                                </tr>
                            )
                            : compras.map(
                                (compra) => (

                                    <>
                                        <tr key={compra.id}>

                                            <td>
                                                #{compra.numero}
                                            </td>

                                            <td>
                                                {
                                                    compra.quantidade_itens
                                                }
                                            </td>

                                            <td>
                                                <strong>
                                                    {
                                                        moeda(
                                                            compra.valor_total
                                                        )
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                {
                                                    dataBR(
                                                        compra.data_compra
                                                    )
                                                }
                                            </td>

                                            <td>
                                                Confirmada
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
                                                                compra
                                                            )
                                                        }
                                                    >
                                                        {
                                                            aberta
                                                            === compra.id
                                                                ? (
                                                                    <ChevronUp
                                                                        size={15}
                                                                    />
                                                                )
                                                                : (
                                                                    <ChevronDown
                                                                        size={15}
                                                                    />
                                                                )
                                                        }
                                                    </button>


                                                    <button
                                                        title="Editar"
                                                        onClick={() =>
                                                            editarCompra(
                                                                compra
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
                                                            apagarCompra(
                                                                compra
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


                                        {
                                            aberta === compra.id
                                            &&
                                            detalhes[compra.id]
                                            && (

                                                <tr
                                                    key={
                                                        `${compra.id}-detalhes`
                                                    }
                                                >

                                                    <td
                                                        colSpan="6"
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
                                                                    <th>Código</th>
                                                                    <th>Qtd.</th>
                                                                    <th>Valor unit.</th>
                                                                    <th>Total</th>
                                                                    <th>Validade</th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>

                                                                {
                                                                    detalhes[
                                                                        compra.id
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
                                                                                        item.codigo_barras
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
                                                                                            item.valor_total
                                                                                        )
                                                                                    }
                                                                                </td>

                                                                                <td>
                                                                                    {
                                                                                        item.validade
                                                                                            ? dataBR(
                                                                                                item.validade
                                                                                            )
                                                                                            : "Sem validade"
                                                                                    }
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

            </section>


            <section className={styles.formCard}>

                <div className={styles.formHeader}>

                    <h2>
                        {
                            compraEditando
                                ? "Editar Compra"
                                : "Nova Compra"
                        }
                    </h2>

                    {
                        compraEditando
                        && (
                            <button
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


                <div className={styles.barcodeArea}>

                    <div>
                        <label>
                            Código de barras *
                        </label>

                        <input
                            name="codigo_barras"
                            value={
                                itemForm.codigo_barras
                            }
                            onChange={
                                alterarItemForm
                            }
                            inputMode="numeric"
                            placeholder={
                                "Digite ou leia o código"
                            }
                        />
                    </div>


                    <button
                        onClick={
                            procurarCodigo
                        }
                    >
                        <Search size={15} />

                        Buscar
                    </button>

                </div>


                {
                    itemForm.produto
                    && (

                        <div
                            className={
                                styles.productFound
                            }
                        >
                            Produto encontrado:

                            <strong>
                                {
                                    itemForm.produto.nome
                                }
                            </strong>
                        </div>
                    )
                }


                <div className={styles.itemGrid}>

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
                                itemForm.valor_unitario
                            }
                            onChange={
                                alterarItemForm
                            }
                        />
                    </div>


                    <div>
                        <label>
                            Validade
                        </label>

                        <input
                            type="date"
                            name="validade"
                            value={
                                itemForm.validade
                            }
                            onChange={
                                alterarItemForm
                            }
                        />
                    </div>


                    <button
                        className={
                            styles.addItem
                        }
                        onClick={
                            adicionarItem
                        }
                    >
                        <Plus size={15} />

                        Adicionar item
                    </button>

                </div>


                <div className={styles.itemsArea}>

                    <h3>
                        Itens da compra
                    </h3>


                    <table className={styles.table}>

                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Código</th>
                                <th>Qtd.</th>
                                <th>Valor unit.</th>
                                <th>Total</th>
                                <th>Validade</th>
                                <th></th>
                            </tr>
                        </thead>


                        <tbody>

                            {
                                itens.length === 0
                                    ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum item adicionado.
                                            </td>
                                        </tr>
                                    )
                                    : itens.map(
                                        (item, indice) => (

                                            <tr key={indice}>

                                                <td>
                                                    {
                                                        item.produto_nome
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.codigo_barras
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
                                                            item.quantidade
                                                            *
                                                            item.valor_unitario
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.validade
                                                            ? dataBR(
                                                                item.validade
                                                            )
                                                            : "Sem validade"
                                                    }
                                                </td>

                                                <td>

                                                    <button
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
                                        )
                                    )
                            }

                        </tbody>

                    </table>

                </div>


                <div className={styles.footer}>

                    <div>
                        <span>
                            Total da compra
                        </span>

                        <strong>
                            {
                                moeda(
                                    totalCompra
                                )
                            }
                        </strong>
                    </div>


                    <button
                        className={
                            styles.saveButton
                        }
                        onClick={
                            salvarCompra
                        }
                        disabled={
                            salvando
                        }
                    >
                        {
                            salvando
                                ? "Salvando..."
                                : (
                                    compraEditando
                                        ? "Atualizar Compra"
                                        : "Salvar Compra"
                                )
                        }
                    </button>

                </div>

            </section>

        </div>
    );
}


export default Compras;