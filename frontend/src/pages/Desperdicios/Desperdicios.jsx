import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Pencil,
    Search,
    Trash2,
    TriangleAlert
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


function Desperdicios() {

    const [
        desperdicios,
        setDesperdicios
    ] = useState([]);

    const [busca, setBusca] =
        useState("");

    const [filtroMotivo, setFiltroMotivo] =
        useState("");

    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [
        desperdicioEditando,
        setDesperdicioEditando
    ] = useState(null);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);


    async function carregar(
        texto = busca,
        motivo = filtroMotivo
    ) {

        try {

            const dados =
                await listarDesperdicios(
                    texto,
                    motivo
                );

            setDesperdicios(
                dados
            );

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

        await carregar(
            valor,
            filtroMotivo
        );
    }


    async function handleMotivo(
        event
    ) {

        const valor =
            event.target.value;

        setFiltroMotivo(valor);

        await carregar(
            busca,
            valor
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


    async function buscarCodigo() {

        setErro("");
        setMensagem("");


        if (
            !formulario.codigo.trim()
        ) {

            setErro(
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
                dados.lotes.length === 0
            ) {

                setErro(
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


    const loteSelecionado =
        useMemo(
            () => {

                return (
                    formulario.lotes.find(
                        (lote) =>
                            String(lote.id)
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


    function cancelar() {

        setDesperdicioEditando(
            null
        );

        setFormulario(
            formularioInicial
        );

        setErro("");
    }


    async function editar(
        desperdicio
    ) {

        try {

            setErro("");
            setMensagem("");


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
                ...dadosEstoque.lotes
            ];


            const existeLote =
                lotes.some(
                    (lote) =>
                        lote.id
                        === detalhe.lote_id
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
                            lote.id
                            !== detalhe.lote_id
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

        setErro("");
        setMensagem("");


        if (!formulario.lote_id) {

            setErro(
                "Selecione o lote."
            );

            return;
        }


        if (
            Number(
                formulario.quantidade
            ) <= 0
        ) {

            setErro(
                "Quantidade deve ser "
                + "maior que zero."
            );

            return;
        }


        setSalvando(true);


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

            if (
                desperdicioEditando
            ) {

                await atualizarDesperdicio(
                    desperdicioEditando,
                    dados
                );

                setMensagem(
                    "Desperdício atualizado "
                    + "com sucesso."
                );

            } else {

                await criarDesperdicio(
                    dados
                );

                setMensagem(
                    "Desperdício registrado "
                    + "com sucesso."
                );
            }


            cancelar();

            await carregar();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível salvar "
                + "o desperdício."
            );

        } finally {

            setSalvando(false);
        }
    }


    async function remover(
        desperdicio
    ) {

        const confirmar =
            window.confirm(
                "Deseja excluir este "
                + "desperdício? A quantidade "
                + "será devolvida ao estoque."
            );


        if (!confirmar) {
            return;
        }


        try {

            await excluirDesperdicio(
                desperdicio.id
            );

            setMensagem(
                "Desperdício excluído "
                + "e estoque estornado."
            );

            await carregar();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível excluir."
            );
        }
    }


    const totalPerdas =
        useMemo(
            () => {

                return desperdicios.reduce(
                    (total, item) =>
                        total
                        +
                        Number(
                            item.valor_total
                            || 0
                        ),
                    0
                );

            },
            [desperdicios]
        );


    return (

        <div className={styles.page}>

            <div className={styles.header}>

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


            <div className={styles.filters}>

                <div
                    className={
                        styles.searchBox
                    }
                >

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar produto ou código..."
                        }
                        value={busca}
                        onChange={handleBusca}
                    />

                </div>


                <select
                    value={filtroMotivo}
                    onChange={handleMotivo}
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
                                    key={valor}
                                    value={valor}
                                >
                                    {descricao}
                                </option>
                            )
                        )
                    }

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
                                desperdicios.length
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
                                                registrado.
                                            </td>

                                        </tr>
                                    )

                                    : desperdicios.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        item.quantidade
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item.produto_nome
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        moeda(
                                                            item.custo_unitario
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            moeda(
                                                                item.valor_total
                                                            )
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        item.codigo_barras
                                                    }
                                                </td>

                                                <td>
                                                    #{item.lote_id}
                                                </td>

                                                <td>
                                                    {
                                                        dataBR(
                                                            item.validade
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        motivos[
                                                            item.motivo
                                                        ]
                                                        ||
                                                        item.motivo
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
                                                            title="Excluir"
                                                            onClick={() =>
                                                                remover(
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

            </section>


            <section className={styles.formCard}>

                <h2>
                    {
                        desperdicioEditando
                            ? "Editar Desperdício"
                            : "Registrar Desperdício"
                    }
                </h2>


                <div className={styles.barcode}>

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
                            onSubmit={salvar}
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
                                    />

                                </div>


                                <div>

                                    <label>
                                        Motivo *
                                    </label>

                                    <select
                                        name="motivo"
                                        value={
                                            formulario.motivo
                                        }
                                        onChange={
                                            alterarFormulario
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
                                                        key={valor}
                                                        value={valor}
                                                    >
                                                        {descricao}
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
                                        cancelar
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
                                            : "Salvar"
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


export default Desperdicios;