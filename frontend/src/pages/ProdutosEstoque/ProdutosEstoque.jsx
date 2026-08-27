import {
    useEffect,
    useState
} from "react";

import {
    Pencil,
    Plus,
    Search,
    Trash2
} from "lucide-react";

import {
    atualizarProdutoEstoque,
    criarProdutoEstoque,
    excluirProdutoEstoque,
    listarProdutosEstoque
} from "../../services/produtoEstoqueService";

import styles
    from "./ProdutosEstoque.module.css";


const formularioInicial = {
    nome: "",
    codigo_barras: ""
};


function ProdutosEstoque() {

    const [produtos, setProdutos] =
        useState([]);

    const [busca, setBusca] =
        useState("");

    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [
        produtoEditando,
        setProdutoEditando
    ] = useState(null);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [carregando, setCarregando] =
        useState(false);


    async function carregarProdutos(
        textoBusca = ""
    ) {

        try {

            const dados =
                await listarProdutosEstoque(
                    textoBusca
                );

            setProdutos(dados);

        } catch {

            setErro(
                "Não foi possível carregar os produtos."
            );
        }
    }


    useEffect(() => {

        carregarProdutos();

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

        await carregarProdutos(
            valor
        );
    }


    function editar(produto) {

        setProdutoEditando(
            produto.id
        );

        setFormulario({
            nome: produto.nome,
            codigo_barras:
                produto.codigo_barras
        });

        setErro("");
        setMensagem("");
    }


    function cancelar() {

        setProdutoEditando(null);

        setFormulario(
            formularioInicial
        );

        setErro("");
    }


    async function handleSubmit(event) {

        event.preventDefault();

        setErro("");
        setMensagem("");
        setCarregando(true);

        try {

            if (produtoEditando) {

                await atualizarProdutoEstoque(
                    produtoEditando,
                    formulario
                );

                setMensagem(
                    "Produto atualizado com sucesso."
                );

            } else {

                await criarProdutoEstoque(
                    formulario
                );

                setMensagem(
                    "Produto cadastrado com sucesso."
                );
            }

            setProdutoEditando(null);

            setFormulario(
                formularioInicial
            );

            await carregarProdutos(
                busca
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível salvar o produto."
            );

        } finally {

            setCarregando(false);
        }
    }


    async function remover(produto) {

        const confirmar =
            window.confirm(
                `Deseja excluir "${produto.nome}"?`
            );

        if (!confirmar) {
            return;
        }

        try {

            await excluirProdutoEstoque(
                produto.id
            );

            setMensagem(
                "Produto excluído com sucesso."
            );

            await carregarProdutos(
                busca
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível excluir o produto."
            );
        }
    }


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Produtos de Estoque
                    </h1>

                    <p>
                        Cadastre os produtos que poderão
                        ser usados nas compras e no estoque.
                    </p>

                </div>


                <button
                    className={styles.addButton}
                    onClick={cancelar}
                >

                    <Plus size={16} />

                    Adicionar Produto

                </button>

            </div>


            <div className={styles.searchBox}>

                <Search size={17} />

                <input
                    placeholder="Buscar por nome ou código..."
                    value={busca}
                    onChange={handleBusca}
                />

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


            <section className={styles.card}>

                <table>

                    <thead>

                        <tr>

                            <th>
                                Nome
                            </th>

                            <th>
                                Código de barras
                            </th>

                            <th>
                                Ações
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {
                            produtos.length === 0
                                ? (

                                    <tr>

                                        <td
                                            colSpan="3"
                                            className={styles.empty}
                                        >
                                            Nenhum produto cadastrado.
                                        </td>

                                    </tr>
                                )

                                : produtos.map(
                                    (produto) => (

                                        <tr
                                            key={
                                                produto.id
                                            }
                                        >

                                            <td>
                                                {produto.nome}
                                            </td>

                                            <td>
                                                {
                                                    produto.codigo_barras
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
                                                                produto
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
                                                                produto
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

            </section>


            <section className={styles.formCard}>

                <h2>

                    {
                        produtoEditando
                            ? "Editar Produto"
                            : "Adicionar Produto"
                    }

                </h2>


                <form
                    onSubmit={handleSubmit}
                >

                    <div className={styles.formGrid}>

                        <div>

                            <label>
                                Nome *
                            </label>

                            <input
                                name="nome"
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
                                Código de barras *
                            </label>

                            <input
                                name="codigo_barras"
                                value={
                                    formulario.codigo_barras
                                }
                                onChange={
                                    handleChange
                                }
                                inputMode="numeric"
                                required
                            />

                        </div>

                    </div>


                    <p className={styles.required}>
                        * Campos obrigatórios
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
                            onClick={cancelar}
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className={
                                styles.saveButton
                            }
                            disabled={
                                carregando
                            }
                        >

                            {
                                carregando
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


export default ProdutosEstoque;