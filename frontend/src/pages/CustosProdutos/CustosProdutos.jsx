import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Plus,
    Save,
    Trash2
} from "lucide-react";

import {
    listarCustosProdutos,
    buscarCustoProduto,
    salvarCustoProduto,
    removerCustoProduto
} from "../../services/custoProdutoService";

import {
    listarProdutosEstoque
} from "../../services/produtoEstoqueService";

import styles
    from "./CustosProdutos.module.css";


const itemInicial = () => ({
    tipo: "ESTOQUE",
    produto_estoque_id: "",
    descricao: "",
    quantidade: "",
    unidade: "UN",
    valor_unitario: ""
});


function CustosProdutos() {

    const [produtos, setProdutos] =
        useState([]);

    const [produtosEstoque, setProdutosEstoque] =
        useState([]);

    const [produtoSelecionado, setProdutoSelecionado] =
        useState(null);

    const [produto, setProduto] =
        useState(null);

    const [rendimento, setRendimento] =
        useState(1);

    const [itens, setItens] =
        useState([]);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [salvando, setSalvando] =
        useState(false);


    async function carregarLista() {

        const dados =
            await listarCustosProdutos();

        setProdutos(dados);

        return dados;
    }


    async function carregarEstoque() {

        const dados =
            await listarProdutosEstoque();

        setProdutosEstoque(dados);
    }


    async function selecionarProduto(
        produtoId
    ) {

        try {

            setErro("");
            setMensagem("");

            const dados =
                await buscarCustoProduto(
                    produtoId
                );

            setProdutoSelecionado(
                produtoId
            );

            setProduto(
                dados.produto
            );

            setRendimento(
                dados.ficha?.rendimento
                || 1
            );

            setItens(
                dados.itens.length
                    ? dados.itens.map(
                        (item) => ({
                            tipo:
                                item.tipo,

                            produto_estoque_id:
                                item.produto_estoque_id
                                || "",

                            descricao:
                                item.descricao
                                || "",

                            quantidade:
                                item.quantidade,

                            unidade:
                                item.unidade,

                            valor_unitario:
                                item.valor_unitario
                        })
                    )
                    : []
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível carregar a ficha."
            );
        }
    }


    useEffect(() => {

        async function iniciar() {

            try {

                const lista =
                    await carregarLista();

                await carregarEstoque();


                if (lista.length > 0) {

                    await selecionarProduto(
                        lista[0].produto_id
                    );
                }

            } catch {

                setErro(
                    "Não foi possível carregar "
                    + "os custos dos produtos."
                );
            }
        }


        iniciar();

    }, []);


    function adicionarItem() {

        setItens(
            (anterior) => [
                ...anterior,
                itemInicial()
            ]
        );
    }


    function alterarItem(
        indice,
        campo,
        valor
    ) {

        setItens(
            (anterior) => {

                const copia = [
                    ...anterior
                ];

                const item = {
                    ...copia[indice],
                    [campo]: valor
                };


                if (
                    campo === "tipo"
                    && valor === "ESTOQUE"
                ) {

                    item.descricao = "";
                }


                if (
                    campo === "tipo"
                    && valor === "MANUAL"
                ) {

                    item.produto_estoque_id = "";
                }


                copia[indice] = item;

                return copia;
            }
        );
    }


    function excluirItem(indice) {

        setItens(
            (anterior) =>
                anterior.filter(
                    (_, atual) =>
                        atual !== indice
                )
        );
    }


    const resumo = useMemo(
        () => {

            const custoTotal =
                itens.reduce(
                    (total, item) => {

                        const quantidade =
                            Number(
                                item.quantidade
                            ) || 0;

                        const valor =
                            Number(
                                item.valor_unitario
                            ) || 0;

                        return (
                            total
                            +
                            quantidade * valor
                        );
                    },
                    0
                );


            const rend =
                Number(rendimento) || 0;


            const custoUnitario =
                rend > 0
                    ? custoTotal / rend
                    : 0;


            const preco =
                Number(
                    produto?.preco_venda
                ) || 0;


            const lucro =
                preco - custoUnitario;


            const margem =
                preco > 0
                    ? (
                        lucro
                        / preco
                    ) * 100
                    : 0;


            return {
                custoTotal,
                custoUnitario,
                preco,
                lucro,
                margem
            };

        },
        [
            itens,
            rendimento,
            produto
        ]
    );


    async function salvar() {

        if (!produtoSelecionado) {
            return;
        }


        setErro("");
        setMensagem("");
        setSalvando(true);


        try {

            await salvarCustoProduto(
                produtoSelecionado,
                {
                    rendimento,
                    itens
                }
            );


            setMensagem(
                "Ficha de custo salva "
                + "com sucesso."
            );


            await carregarLista();

            await selecionarProduto(
                produtoSelecionado
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível salvar "
                + "a ficha de custo."
            );

        } finally {

            setSalvando(false);
        }
    }


    async function removerFicha() {

        if (!produtoSelecionado) {
            return;
        }


        const confirmar =
            window.confirm(
                "Deseja remover a ficha "
                + "de custo deste produto?"
            );


        if (!confirmar) {
            return;
        }


        try {

            await removerCustoProduto(
                produtoSelecionado
            );


            setMensagem(
                "Ficha removida com sucesso."
            );

            setRendimento(1);
            setItens([]);

            await carregarLista();

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível remover "
                + "a ficha."
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


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Custos dos Produtos
                    </h1>

                    <p>
                        Ficha técnica, custo,
                        lucro e margem.
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


            <div className={styles.layout}>

                <aside className={styles.products}>

                    <h3>
                        Produtos
                    </h3>


                    {
                        produtos.map(
                            (item) => (

                                <button
                                    key={
                                        item.produto_id
                                    }
                                    className={
                                        produtoSelecionado
                                        === item.produto_id
                                            ? styles.productActive
                                            : styles.product
                                    }
                                    onClick={() =>
                                        selecionarProduto(
                                            item.produto_id
                                        )
                                    }
                                >

                                    <strong>
                                        {item.nome}
                                    </strong>

                                    <span>
                                        {item.sabor || "Sem sabor"}
                                    </span>

                                    <small>

                                        {
                                            item.possui_ficha
                                                ? (
                                                    item.custo_unitario
                                                    !== null
                                                        ? `Custo: ${moeda(
                                                            item.custo_unitario
                                                        )}`
                                                        : "Ficha cadastrada"
                                                )
                                                : "Sem ficha de custo"
                                        }

                                    </small>

                                </button>
                            )
                        )
                    }

                </aside>


                <section className={styles.editor}>

                    {
                        !produto
                            ? (
                                <p>
                                    Cadastre um produto
                                    de venda primeiro.
                                </p>
                            )
                            : (

                                <>

                                    <div
                                        className={
                                            styles.productHeader
                                        }
                                    >

                                        <div>

                                            <h2>
                                                {produto.nome}

                                                {
                                                    produto.sabor
                                                    &&
                                                    ` - ${produto.sabor}`
                                                }
                                            </h2>

                                            <span>
                                                {
                                                    produto.tipo
                                                    === "PRODUCAO"
                                                        ? "Produção"
                                                        : "Revenda"
                                                }
                                            </span>

                                        </div>


                                        <button
                                            className={
                                                styles.deleteFicha
                                            }
                                            onClick={
                                                removerFicha
                                            }
                                        >
                                            <Trash2 size={15} />

                                            Remover ficha
                                        </button>

                                    </div>


                                    <div
                                        className={
                                            styles.rendimento
                                        }
                                    >

                                        <label>
                                            Rendimento *
                                        </label>

                                        <input
                                            type="number"
                                            min="0.001"
                                            step="0.001"
                                            value={
                                                rendimento
                                            }
                                            onChange={
                                                (event) =>
                                                    setRendimento(
                                                        event.target.value
                                                    )
                                            }
                                        />

                                        <span>
                                            Quantas unidades
                                            este custo produz.
                                        </span>

                                    </div>


                                    <div
                                        className={
                                            styles.itemsHeader
                                        }
                                    >

                                        <h3>
                                            Itens de custo
                                        </h3>

                                        <button
                                            onClick={
                                                adicionarItem
                                            }
                                        >
                                            <Plus size={15} />

                                            Adicionar item
                                        </button>

                                    </div>


                                    <div
                                        className={
                                            styles.tableWrapper
                                        }
                                    >

                                        <table>

                                            <thead>

                                                <tr>
                                                    <th>Tipo</th>
                                                    <th>Item</th>
                                                    <th>Qtd.</th>
                                                    <th>Unidade</th>
                                                    <th>Valor unit.</th>
                                                    <th>Subtotal</th>
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
                                                                    Adicione os
                                                                    componentes
                                                                    do custo.
                                                                </td>

                                                            </tr>
                                                        )

                                                        : itens.map(
                                                            (
                                                                item,
                                                                indice
                                                            ) => {

                                                                const subtotal =
                                                                    (
                                                                        Number(
                                                                            item.quantidade
                                                                        ) || 0
                                                                    )
                                                                    *
                                                                    (
                                                                        Number(
                                                                            item.valor_unitario
                                                                        ) || 0
                                                                    );


                                                                return (

                                                                    <tr
                                                                        key={
                                                                            indice
                                                                        }
                                                                    >

                                                                        <td>

                                                                            <select
                                                                                value={
                                                                                    item.tipo
                                                                                }
                                                                                onChange={
                                                                                    (event) =>
                                                                                        alterarItem(
                                                                                            indice,
                                                                                            "tipo",
                                                                                            event.target.value
                                                                                        )
                                                                                }
                                                                            >
                                                                                <option value="ESTOQUE">
                                                                                    Estoque
                                                                                </option>

                                                                                <option value="MANUAL">
                                                                                    Manual
                                                                                </option>
                                                                            </select>

                                                                        </td>


                                                                        <td>

                                                                            {
                                                                                item.tipo
                                                                                === "ESTOQUE"
                                                                                    ? (

                                                                                        <select
                                                                                            value={
                                                                                                item.produto_estoque_id
                                                                                            }
                                                                                            onChange={
                                                                                                (event) =>
                                                                                                    alterarItem(
                                                                                                        indice,
                                                                                                        "produto_estoque_id",
                                                                                                        event.target.value
                                                                                                    )
                                                                                            }
                                                                                        >

                                                                                            <option value="">
                                                                                                Selecione
                                                                                            </option>

                                                                                            {
                                                                                                produtosEstoque.map(
                                                                                                    (estoque) => (

                                                                                                        <option
                                                                                                            key={
                                                                                                                estoque.id
                                                                                                            }
                                                                                                            value={
                                                                                                                estoque.id
                                                                                                            }
                                                                                                        >
                                                                                                            {
                                                                                                                estoque.nome
                                                                                                            }
                                                                                                        </option>
                                                                                                    )
                                                                                                )
                                                                                            }

                                                                                        </select>
                                                                                    )
                                                                                    : (

                                                                                        <input
                                                                                            value={
                                                                                                item.descricao
                                                                                            }
                                                                                            placeholder="Ex.: Entrega"
                                                                                            onChange={
                                                                                                (event) =>
                                                                                                    alterarItem(
                                                                                                        indice,
                                                                                                        "descricao",
                                                                                                        event.target.value
                                                                                                    )
                                                                                            }
                                                                                        />
                                                                                    )
                                                                            }

                                                                        </td>


                                                                        <td>

                                                                            <input
                                                                                type="number"
                                                                                min="0.0001"
                                                                                step="0.0001"
                                                                                value={
                                                                                    item.quantidade
                                                                                }
                                                                                onChange={
                                                                                    (event) =>
                                                                                        alterarItem(
                                                                                            indice,
                                                                                            "quantidade",
                                                                                            event.target.value
                                                                                        )
                                                                                }
                                                                            />

                                                                        </td>


                                                                        <td>

                                                                            <select
                                                                                value={
                                                                                    item.unidade
                                                                                }
                                                                                onChange={
                                                                                    (event) =>
                                                                                        alterarItem(
                                                                                            indice,
                                                                                            "unidade",
                                                                                            event.target.value
                                                                                        )
                                                                                }
                                                                            >
                                                                                <option value="UN">UN</option>
                                                                                <option value="KG">KG</option>
                                                                                <option value="G">G</option>
                                                                                <option value="L">L</option>
                                                                                <option value="ML">ML</option>
                                                                                <option value="CX">CX</option>
                                                                                <option value="PCT">PCT</option>
                                                                            </select>

                                                                        </td>


                                                                        <td>

                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={
                                                                                    item.valor_unitario
                                                                                }
                                                                                onChange={
                                                                                    (event) =>
                                                                                        alterarItem(
                                                                                            indice,
                                                                                            "valor_unitario",
                                                                                            event.target.value
                                                                                        )
                                                                                }
                                                                            />

                                                                        </td>


                                                                        <td>
                                                                            {
                                                                                moeda(
                                                                                    subtotal
                                                                                )
                                                                            }
                                                                        </td>


                                                                        <td>

                                                                            <button
                                                                                className={
                                                                                    styles.removeItem
                                                                                }
                                                                                onClick={() =>
                                                                                    excluirItem(
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


                                    <div
                                        className={
                                            styles.summary
                                        }
                                    >

                                        <div>
                                            <span>
                                                Custo total
                                            </span>

                                            <strong>
                                                {
                                                    moeda(
                                                        resumo.custoTotal
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Rendimento
                                            </span>

                                            <strong>
                                                {rendimento || 0}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Custo unitário
                                            </span>

                                            <strong>
                                                {
                                                    moeda(
                                                        resumo.custoUnitario
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Preço de venda
                                            </span>

                                            <strong>
                                                {
                                                    moeda(
                                                        resumo.preco
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Lucro unitário
                                            </span>

                                            <strong>
                                                {
                                                    moeda(
                                                        resumo.lucro
                                                    )
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                Margem
                                            </span>

                                            <strong>
                                                {
                                                    resumo.margem
                                                    .toFixed(2)
                                                }%
                                            </strong>
                                        </div>

                                    </div>


                                    <div
                                        className={
                                            styles.actions
                                        }
                                    >

                                        <button
                                            className={
                                                styles.saveButton
                                            }
                                            onClick={
                                                salvar
                                            }
                                            disabled={
                                                salvando
                                            }
                                        >

                                            <Save size={16} />

                                            {
                                                salvando
                                                    ? "Salvando..."
                                                    : "Salvar ficha"
                                            }

                                        </button>

                                    </div>

                                </>
                            )
                    }

                </section>

            </div>

        </div>
    );
}


export default CustosProdutos;