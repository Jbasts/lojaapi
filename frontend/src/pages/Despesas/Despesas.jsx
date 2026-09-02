import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Pencil,
    Plus,
    Search,
    Trash2
} from "lucide-react";

import {
    atualizarDespesaExtra,
    criarDespesaExtra,
    excluirDespesaExtra,
    listarDespesasExtras
} from "../../services/despesaExtraService";

import styles
    from "./Despesas.module.css";


const formularioInicial = {
    quantidade: 1,
    nome: "",
    valor_unitario: ""
};


function Despesas() {

    const [despesas, setDespesas] =
        useState([]);

    const [busca, setBusca] =
        useState("");

    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [
        despesaEditando,
        setDespesaEditando
    ] = useState(null);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);


    async function carregarDespesas(
        textoBusca = ""
    ) {

        try {

            const dados =
                await listarDespesasExtras(
                    textoBusca
                );

            setDespesas(
                dados
            );

        } catch {

            setErro(
                "Não foi possível carregar "
                + "as despesas."
            );
        }
    }


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        carregarDespesas();

    }, []);


    function handleChange(event) {

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


    async function handleBusca(event) {

        const valor =
            event.target.value;

        setBusca(valor);

        await carregarDespesas(
            valor
        );
    }


    function editar(despesa) {

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
    }


    function cancelar() {

        setDespesaEditando(
            null
        );

        setFormulario(
            formularioInicial
        );

        setErro("");
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


        if (despesaEditando) {

            return atualizarDespesaExtra(
                despesaEditando,
                dados
            );
        }


        return criarDespesaExtra(
            dados
        );
    }


    async function handleSubmit(event) {

        event.preventDefault();

        setErro("");
        setMensagem("");
        setSalvando(true);


        try {

            await enviar(false);


            setMensagem(
                despesaEditando
                    ? "Despesa atualizada com sucesso."
                    : "Despesa cadastrada com sucesso."
            );


            setDespesaEditando(
                null
            );

            setFormulario(
                formularioInicial
            );

            await carregarDespesas(
                busca
            );

        } catch (error) {

            if (
                error.response?.status === 409
                &&
                error.response?.data?.codigo
                === "DESPESA_DUPLICADA"
            ) {

                const confirmar =
                    window.confirm(
                        error.response
                            .data
                            .erro
                    );


                if (confirmar) {

                    try {

                        await enviar(true);


                        setMensagem(
                            despesaEditando
                                ? "Despesa atualizada com sucesso."
                                : "Despesa cadastrada com sucesso."
                        );


                        setDespesaEditando(
                            null
                        );

                        setFormulario(
                            formularioInicial
                        );


                        await carregarDespesas(
                            busca
                        );

                    } catch (novoErro) {

                        setErro(
                            novoErro.response
                                ?.data
                                ?.erro
                            ||
                            "Não foi possível "
                            + "salvar a despesa."
                        );
                    }
                }

            } else {

                setErro(
                    error.response
                        ?.data
                        ?.erro
                    ||
                    "Não foi possível "
                    + "salvar a despesa."
                );
            }

        } finally {

            setSalvando(false);
        }
    }


    async function remover(despesa) {

        const confirmar =
            window.confirm(
                `Deseja excluir `
                + `"${despesa.nome}"?`
            );


        if (!confirmar) {
            return;
        }


        try {

            await excluirDespesaExtra(
                despesa.id
            );

            setMensagem(
                "Despesa excluída "
                + "com sucesso."
            );

            await carregarDespesas(
                busca
            );

        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível "
                + "excluir a despesa."
            );
        }
    }


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


    function formatarData(data) {

        if (!data) {
            return "-";
        }

        const parteData =
            data.substring(
                0,
                10
            );

        const [
            ano,
            mes,
            dia
        ] = parteData.split("-");

        return `${dia}/${mes}/${ano}`;
    }


    const total = useMemo(
        () => {

            return despesas.reduce(
                (soma, despesa) =>
                    soma
                    +
                    Number(
                        despesa.valor_total
                        || 0
                    ),
                0
            );

        },
        [despesas]
    );


    return (

        <div className={styles.page}>

            <div className={styles.header}>

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
                    className={
                        styles.addButton
                    }
                    onClick={cancelar}
                >

                    <Plus size={16} />

                    Adicionar Despesa

                </button>

            </div>


            <div className={styles.topBar}>

                <div
                    className={
                        styles.searchBox
                    }
                >

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar despesa..."
                        }
                        value={busca}
                        onChange={handleBusca}
                    />

                </div>


                <div
                    className={
                        styles.totalCard
                    }
                >

                    <span>
                        Total listado
                    </span>

                    <strong>
                        {moeda(total)}
                    </strong>

                </div>

            </div>


            {
                erro && (

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
                                    Qtd.
                                </th>

                                <th>
                                    Nome
                                </th>

                                <th>
                                    Valor unitário
                                </th>

                                <th>
                                    Valor total
                                </th>

                                <th>
                                    Data
                                </th>

                                <th>
                                    Ações
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                despesas.length === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhuma despesa
                                                cadastrada.
                                            </td>

                                        </tr>
                                    )

                                    : despesas.map(
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
                                                            title="Editar"
                                                            onClick={() =>
                                                                editar(
                                                                    despesa
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

            </section>


            <section
                className={
                    styles.formCard
                }
            >

                <h2>

                    {
                        despesaEditando
                            ? "Editar Despesa"
                            : "Adicionar Despesa"
                    }

                </h2>


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


                        <div>

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
                                        (
                                            Number(
                                                formulario
                                                    .quantidade
                                            )
                                            || 0
                                        )
                                        *
                                        (
                                            Number(
                                                formulario
                                                    .valor_unitario
                                            )
                                            || 0
                                        )
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

            </section>

        </div>
    );
}


export default Despesas;