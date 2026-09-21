

import {
    Fragment,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Check,
    ChevronDown,
    ChevronUp,
    FileDown,
    Pencil,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import {
    jsPDF
} from "jspdf";

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

import {
    listarVendas
} from "../../services/vendaService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./Pedidos.module.css";


const itemInicial = {
    produto_venda_id: "",
    quantidade: 1,
    valor_unitario: "",
    desconto_tipo: "NENHUM",
    desconto_valor: 0
};


const formasPagamento = {
    DINHEIRO: "Dinheiro",
    PIX: "Pix",
    CARTAO_CREDITO: "Cartão de crédito",
    CARTAO_DEBITO: "Cartão de débito",
    TRANSFERENCIA: "Transferência",
    OUTRO: "Outro"
};


function dataLocalAtual() {

    const data = new Date();

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const dia =
        String(
            data.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${ano}-${mes}-${dia}`;
}


function Pedidos() {

    const hoje =
        useMemo(
            () => dataLocalAtual(),
            []
        );


    const [
        pedidos,
        setPedidos
    ] = useState([]);


    const [
        clientes,
        setClientes
    ] = useState([]);


    const [
        produtos,
        setProdutos
    ] = useState([]);


    const [
        clienteId,
        setClienteId
    ] = useState("");


    const [
        itemForm,
        setItemForm
    ] = useState({
        ...itemInicial
    });


    const [
        itens,
        setItens
    ] = useState([]);


    const [
        pedidoEditando,
        setPedidoEditando
    ] = useState(null);


    const [
        numeroPedidoEditando,
        setNumeroPedidoEditando
    ] = useState(null);


    const [
        busca,
        setBusca
    ] = useState("");


    const [
        status,
        setStatus
    ] = useState("");


    const [
        novoPedidoAberto,
        setNovoPedidoAberto
    ] = useState(false);


    const [
        periodoData,
        setPeriodoData
    ] = useState("TODOS");


    const [
        diaFiltro,
        setDiaFiltro
    ] = useState(hoje);


    const [
        mesFiltro,
        setMesFiltro
    ] = useState(
        hoje.substring(
            0,
            7
        )
    );


    const [
        anoFiltro,
        setAnoFiltro
    ] = useState(
        hoje.substring(
            0,
            4
        )
    );


    const [
        aberto,
        setAberto
    ] = useState(null);


    const [
        detalhes,
        setDetalhes
    ] = useState({});


    const [
        erro,
        setErro
    ] = useState("");


    const [
        mensagem,
        setMensagem
    ] = useState("");


    const [
        salvando,
        setSalvando
    ] = useState(false);


    // ==========================================
    // PAGINAÇÃO
    // ==========================================

    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);


    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);


    // ==========================================
    // CARREGAR PEDIDOS
    // ==========================================

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


            setPedidos(
                Array.isArray(dados)
                    ? dados
                    : []
            );


        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro

                ||

                "Não foi possível "
                + "carregar os pedidos."
            );
        }
    }


    // ==========================================
    // CARREGAR CLIENTES E PRODUTOS
    // ==========================================

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
                Array.isArray(
                    dadosClientes
                )
                    ? dadosClientes
                    : []
            );


            setProdutos(
                Array.isArray(
                    dadosProdutos
                )
                    ? dadosProdutos
                    : []
            );


        } catch {

            setErro(
                "Não foi possível carregar "
                + "clientes e produtos."
            );
        }
    }


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            carregarPedidos(
                "",
                ""
            );

            carregarCadastros();

        },
        []
    );


    // ==========================================
    // FORMATAÇÃO
    // ==========================================

    function moeda(
        valor
    ) {

        return Number(
            valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                style:
                    "currency",

                currency:
                    "BRL"
            }
        );
    }


    function dataBR(
        data
    ) {

        if (!data) {

            return "-";
        }


        const [
            ano,
            mes,
            dia
        ] = data
            .substring(
                0,
                10
            )
            .split("-");


        return (
            `${dia}/${mes}/${ano}`
        );
    }


    // ==========================================
    // FILTROS
    // ==========================================

    function resetarPagina() {

        setPaginaAtual(1);

        setAberto(null);
    }


    async function handleBusca(
        event
    ) {

        const valor =
            event.target.value;


        setBusca(
            valor
        );


        resetarPagina();


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


        setStatus(
            valor
        );


        resetarPagina();


        await carregarPedidos(
            busca,
            valor
        );
    }


    function alterarPeriodoData(
        novoPeriodo
    ) {

        setPeriodoData(
            novoPeriodo
        );

        resetarPagina();
    }


    function alterarDiaFiltro(
        event
    ) {

        setDiaFiltro(
            event.target.value
        );

        resetarPagina();
    }


    function alterarMesFiltro(
        event
    ) {

        setMesFiltro(
            event.target.value
        );

        resetarPagina();
    }


    function alterarAnoFiltro(
        event
    ) {

        setAnoFiltro(
            event.target.value
        );

        resetarPagina();
    }


    // ==========================================
    // FORMULÁRIO DO ITEM
    // ==========================================

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
                    (produtoAtual) =>
                        String(
                            produtoAtual.id
                        )
                        ===
                        String(
                            value
                        )
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

                [name]:
                    value
            })
        );
    }


    // ==========================================
    // CÁLCULO DO ITEM
    // ==========================================

    function calcularItem(
        item
    ) {

        const bruto =
            Number(
                item.quantidade
                || 0
            )
            *
            Number(
                item.valor_unitario
                || 0
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

            desconto =
                Number(
                    item.desconto_valor
                    || 0
                );
        }


        return {

            bruto,

            desconto,

            total:
                Math.max(
                    bruto
                    -
                    desconto,
                    0
                )
        };
    }


    // ==========================================
    // ADICIONAR ITEM
    // ==========================================

    function adicionarItem() {

        setErro("");


        const produto =
            produtos.find(
                (produtoAtual) =>
                    String(
                        produtoAtual.id
                    )
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
            Number(
                itemForm.desconto_valor
                || 0
            ) < 0
        ) {

            setErro(
                "Desconto não pode ser negativo."
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


        setItemForm({
            ...itemInicial
        });
    }


    // ==========================================
    // REMOVER ITEM
    // ==========================================

    function removerItem(
        indice
    ) {

        setItens(
            (anteriores) =>
                anteriores.filter(
                    (
                        _,
                        indiceAtual
                    ) =>
                        indiceAtual
                        !== indice
                )
        );
    }


    // ==========================================
    // TOTAIS
    // ==========================================

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


    // ==========================================
    // LIMPAR FORMULÁRIO / FECHAR MODAL
    // ==========================================

    function limparFormulario() {

        setPedidoEditando(
            null
        );


        setNumeroPedidoEditando(
            null
        );


        setNovoPedidoAberto(
            false
        );


        setClienteId("");


        setItens([]);


        setItemForm({
            ...itemInicial
        });
    }


    function abrirNovoPedido() {

        setErro("");

        setMensagem("");

        setPedidoEditando(
            null
        );

        setNumeroPedidoEditando(
            null
        );

        setClienteId("");

        setItens([]);

        setItemForm({
            ...itemInicial
        });

        setNovoPedidoAberto(
            true
        );
    }


    // ==========================================
    // SALVAR
    // ==========================================

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


        const dados = {

            cliente_id:
                Number(
                    clienteId
                ),

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

            setSalvando(
                true
            );


            if (
                pedidoEditando
            ) {

                await atualizarPedido(
                    pedidoEditando,
                    dados
                );


                setMensagem(
                    `Pedido #${
                        numeroPedidoEditando
                    } atualizado com sucesso.`
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


            setDetalhes({});


            await carregarPedidos();


        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro

                ||

                "Não foi possível salvar "
                + "o pedido."
            );


        } finally {

            setSalvando(
                false
            );
        }
    }


    // ==========================================
    // EDITAR
    // ==========================================

    async function editarPedido(
        pedido
    ) {

        try {

            setErro("");

            setMensagem("");

            setNovoPedidoAberto(
                false
            );


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


            setNumeroPedidoEditando(
                dados.numero
            );


            setClienteId(
                String(
                    dados.cliente_id
                )
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
                            Number(
                                item.quantidade
                            ),

                        valor_unitario:
                            Number(
                                item.valor_unitario
                            ),

                        desconto_tipo:
                            item.desconto_tipo,

                        desconto_valor:
                            Number(
                                item.desconto_valor
                                || 0
                            )
                    })
                )
            );


            setItemForm({
                ...itemInicial
            });


        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro

                ||

                "Não foi possível carregar "
                + "o pedido."
            );
        }
    }


    // ==========================================
    // CONCLUIR
    // ==========================================

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

            setErro("");

            setMensagem("");


            await concluirPedido(
                pedido.id
            );


            setMensagem(
                `Pedido #${pedido.numero} `
                + "concluído com sucesso."
            );


            setDetalhes({});


            await carregarPedidos();


        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro

                ||

                "Não foi possível concluir "
                + "o pedido."
            );
        }
    }


    // ==========================================
    // EXCLUIR
    // ==========================================

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

            setErro("");

            setMensagem("");


            await excluirPedido(
                pedido.id
            );


            setMensagem(
                "Pedido excluído "
                + "com sucesso."
            );


            setDetalhes({});


            await carregarPedidos();


        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro

                ||

                "Não foi possível "
                + "excluir o pedido."
            );
        }
    }


    // ==========================================
    // DETALHES
    // ==========================================

    async function alternarDetalhes(
        pedido
    ) {

        if (
            aberto
            === pedido.id
        ) {

            setAberto(
                null
            );

            return;
        }


        try {

            setErro("");


            if (
                !detalhes[
                    pedido.id
                ]
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


    // ==========================================
    // GERAR PDF / NOTA DO PEDIDO
    // ==========================================

    async function gerarPdfPedido(
        pedido
    ) {

        try {

            setErro("");

            setMensagem("");


            let dados =
                detalhes[
                    pedido.id
                ];


            if (!dados) {

                dados =
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


            const cliente =
                clientes.find(
                    (clienteAtual) =>
                        String(
                            clienteAtual.id
                        )
                        ===
                        String(
                            dados.cliente_id
                        )
                )
                || null;


            const nomeCliente =
                cliente

                    ? [
                        cliente.nome,
                        cliente.sobrenome
                    ]
                        .filter(Boolean)
                        .join(" ")

                    : (
                        dados.cliente_nome
                        || pedido.cliente_nome
                        || "-"
                    );


            function somenteNumeros(
                valor
            ) {

                return String(
                    valor || ""
                ).replace(
                    /\D/g,
                    ""
                );
            }


            function formatarCpf(
                valor
            ) {

                const numeros =
                    somenteNumeros(
                        valor
                    );


                if (
                    numeros.length
                    !== 11
                ) {

                    return valor || "-";
                }


                return numeros.replace(
                    /(\d{3})(\d{3})(\d{3})(\d{2})/,
                    "$1.$2.$3-$4"
                );
            }


            function formatarCep(
                valor
            ) {

                const numeros =
                    somenteNumeros(
                        valor
                    );


                if (
                    numeros.length
                    !== 8
                ) {

                    return valor || "-";
                }


                return numeros.replace(
                    /(\d{5})(\d{3})/,
                    "$1-$2"
                );
            }


            function formatarTelefone(
                valor
            ) {

                const numeros =
                    somenteNumeros(
                        valor
                    );


                if (
                    numeros.length
                    === 11
                ) {

                    return numeros.replace(
                        /(\d{2})(\d{5})(\d{4})/,
                        "($1) $2-$3"
                    );
                }


                if (
                    numeros.length
                    === 10
                ) {

                    return numeros.replace(
                        /(\d{2})(\d{4})(\d{4})/,
                        "($1) $2-$3"
                    );
                }


                return valor || "-";
            }


            function textoSeguro(
                valor
            ) {

                if (
                    valor === null
                    || valor === undefined
                    || valor === ""
                ) {

                    return "-";
                }


                return String(valor);
            }


            function formatarFormaPagamento(
                forma
            ) {

                if (!forma) {

                    return "Não informado";
                }


                return (
                    formasPagamento[
                        forma
                    ]
                    ||
                    String(
                        forma
                    )
                        .replace(
                            /_/g,
                            " "
                        )
                        .toLowerCase()
                        .replace(
                            /(^|\s)\S/g,
                            (letra) =>
                                letra.toUpperCase()
                        )
                );
            }


            let formaPagamentoCodigo =
                dados.forma
                ||
                dados.forma_pagamento
                ||
                dados.pagamento_forma
                ||
                pedido.forma
                ||
                null;


            if (
                !formaPagamentoCodigo
            ) {

                try {

                    const dataPedidoVenda =
                        dados.data_pedido
                        ||
                        pedido.data_pedido;


                    const anoPedido =
                        String(
                            dataPedidoVenda
                            || ""
                        ).substring(
                            0,
                            4
                        );


                    if (anoPedido) {

                        const vendasPedido =
                            await listarVendas(
                                "ANUAL",
                                `${anoPedido}-01-01`,
                                String(
                                    dados.numero
                                ),
                                ""
                            );


                        const vendaEncontrada =
                            Array.isArray(
                                vendasPedido
                            )
                                ? vendasPedido.find(
                                    (venda) =>
                                        Number(
                                            venda.pedido_id
                                        )
                                        ===
                                        Number(
                                            dados.id
                                        )
                                        ||
                                        String(
                                            venda.numero_pedido
                                        )
                                        ===
                                        String(
                                            dados.numero
                                        )
                                )
                                : null;


                        formaPagamentoCodigo =
                            vendaEncontrada
                                ?.forma
                            ||
                            null;
                    }


                } catch {

                    formaPagamentoCodigo =
                        null;
                }
            }


            const formaPagamento =
                formatarFormaPagamento(
                    formaPagamentoCodigo
                );


            const itensPdf =
                Array.isArray(
                    dados.itens
                )
                    ? dados.itens
                    : [];


            const calculosPdf =
                itensPdf.map(
                    (item) => {

                        const calculo =
                            calcularItem(
                                item
                            );


                        return {
                            ...item,

                            valor_bruto:
                                Number(
                                    item.valor_bruto
                                    ?? calculo.bruto
                                ),

                            valor_desconto:
                                Number(
                                    item.valor_desconto
                                    ?? calculo.desconto
                                ),

                            valor_final:
                                Number(
                                    item.valor_final
                                    ?? calculo.total
                                )
                        };
                    }
                );


            const subtotalPdf =
                calculosPdf.reduce(
                    (
                        soma,
                        item
                    ) =>
                        soma
                        +
                        item.valor_bruto,
                    0
                );


            const descontoPdf =
                calculosPdf.reduce(
                    (
                        soma,
                        item
                    ) =>
                        soma
                        +
                        item.valor_desconto,
                    0
                );


            const totalPdf =
                calculosPdf.reduce(
                    (
                        soma,
                        item
                    ) =>
                        soma
                        +
                        item.valor_final,
                    0
                );


            const quantidadeTotal =
                calculosPdf.reduce(
                    (
                        soma,
                        item
                    ) =>
                        soma
                        +
                        Number(
                            item.quantidade
                            || 0
                        ),
                    0
                );


            const documento =
                new jsPDF({
                    orientation:
                        "portrait",

                    unit:
                        "mm",

                    format:
                        "a4"
                });


            const margem = 15;

            const larguraPagina = 210;

            // eslint-disable-next-line no-unused-vars
            const alturaPagina = 297;

            const larguraConteudo =
                larguraPagina
                -
                (
                    margem
                    *
                    2
                );

            const limiteInferior = 278;

            let y = 15;


            const corMarca = [
                111,
                60,
                45
            ];

            const cinzaClaro = [
                245,
                242,
                239
            ];

            const cinzaTitulo = [
                235,
                232,
                229
            ];

            const cinzaLinha = [
                115,
                115,
                115
            ];


            function aplicarLinhaPadrao() {

                documento.setDrawColor(
                    ...cinzaLinha
                );

                documento.setLineWidth(
                    0.25
                );
            }


            function desenharTituloSecao(
                titulo
            ) {

                aplicarLinhaPadrao();

                documento.setFillColor(
                    ...cinzaTitulo
                );

                documento.rect(
                    margem,
                    y,
                    larguraConteudo,
                    7,
                    "FD"
                );

                documento.setFont(
                    "helvetica",
                    "bold"
                );

                documento.setFontSize(
                    9
                );

                documento.setTextColor(
                    35,
                    35,
                    35
                );

                documento.text(
                    titulo,
                    margem + 2,
                    y + 4.8
                );

                y += 7;
            }


            function desenharCampo(
                x,
                yCampo,
                largura,
                altura,
                rotulo,
                valor
            ) {

                aplicarLinhaPadrao();

                documento.rect(
                    x,
                    yCampo,
                    largura,
                    altura
                );

                documento.setFont(
                    "helvetica",
                    "bold"
                );

                documento.setFontSize(
                    6.5
                );

                documento.setTextColor(
                    70,
                    70,
                    70
                );

                documento.text(
                    `${rotulo}:`,
                    x + 2,
                    yCampo + 3.1
                );

                documento.setFont(
                    "helvetica",
                    "normal"
                );

                documento.setFontSize(
                    7.6
                );

                documento.setTextColor(
                    25,
                    25,
                    25
                );

                const linhas =
                    documento.splitTextToSize(
                        textoSeguro(
                            valor
                        ),
                        largura - 4
                    );

                documento.text(
                    linhas.slice(
                        0,
                        2
                    ),
                    x + 2,
                    yCampo + 6.4
                );
            }


            function desenharCabecalhoPrincipal() {

                aplicarLinhaPadrao();

                const altura = 24;

                const larguraMarca = 48;

                const larguraNumero = 43;

                const xTitulo =
                    margem
                    +
                    larguraMarca;

                const larguraTitulo =
                    larguraConteudo
                    -
                    larguraMarca
                    -
                    larguraNumero;


                documento.rect(
                    margem,
                    y,
                    larguraConteudo,
                    altura
                );

                documento.line(
                    xTitulo,
                    y,
                    xTitulo,
                    y + altura
                );

                documento.line(
                    xTitulo
                    +
                    larguraTitulo,
                    y,
                    xTitulo
                    +
                    larguraTitulo,
                    y + altura
                );


                documento.setTextColor(
                    ...corMarca
                );

                documento.setFont(
                    "helvetica",
                    "bold"
                );

                documento.setFontSize(
                    18
                );

                documento.text(
                    "MARDRI",
                    margem
                    +
                    larguraMarca / 2,
                    y + 14,
                    {
                        align:
                            "center"
                    }
                );

                documento.setTextColor(
                    25,
                    25,
                    25
                );

                documento.setFont(
                    "helvetica",
                    "bold"
                );

                documento.setFontSize(
                    13
                );

                documento.text(
                    "PEDIDO DE VENDA",
                    xTitulo
                    +
                    larguraTitulo / 2,
                    y + 11,
                    {
                        align:
                            "center"
                    }
                );

                documento.setFontSize(
                    7
                );

                documento.setFont(
                    "helvetica",
                    "normal"
                );

                documento.text(
                    "Documento de pedido / orçamento",
                    xTitulo
                    +
                    larguraTitulo / 2,
                    y + 16,
                    {
                        align:
                            "center"
                    }
                );


                const xNumero =
                    xTitulo
                    +
                    larguraTitulo;

                documento.setFont(
                    "helvetica",
                    "bold"
                );

                documento.setFontSize(
                    7
                );

                documento.text(
                    "PEDIDO Nº",
                    xNumero + 2,
                    y + 6
                );

                documento.setFontSize(
                    13
                );

                documento.text(
                    `#${dados.numero}`,
                    xNumero
                    +
                    larguraNumero / 2,
                    y + 15,
                    {
                        align:
                            "center"
                    }
                );


                y += altura + 4;
            }


            function desenharCabecalhoContinuacao() {

                y = 15;

                documento.setFont(
                    "helvetica",
                    "bold"
                );

                documento.setFontSize(
                    13
                );

                documento.setTextColor(
                    ...corMarca
                );

                documento.text(
                    "MARDRI",
                    margem,
                    y + 4
                );

                documento.setFontSize(
                    8
                );

                documento.setTextColor(
                    35,
                    35,
                    35
                );

                documento.text(
                    `PEDIDO #${dados.numero} - CONTINUAÇÃO`,
                    larguraPagina - margem,
                    y + 4,
                    {
                        align:
                            "right"
                    }
                );

                aplicarLinhaPadrao();

                documento.line(
                    margem,
                    y + 7,
                    larguraPagina - margem,
                    y + 7
                );

                y += 12;
            }


            function novaPagina() {

                documento.addPage();

                desenharCabecalhoContinuacao();
            }


            function garantirEspaco(
                alturaNecessaria
            ) {

                if (
                    y
                    +
                    alturaNecessaria
                    >
                    limiteInferior
                ) {

                    novaPagina();

                    return true;
                }


                return false;
            }


            function desenharCabecalhoTabela() {

                const colunas = [
                    {
                        titulo: "ITEM",
                        largura: 10,
                        align: "center"
                    },
                    {
                        titulo: "PRODUTO / SABOR",
                        largura: 60,
                        align: "left"
                    },
                    {
                        titulo: "QTD.",
                        largura: 15,
                        align: "center"
                    },
                    {
                        titulo: "UNIT.",
                        largura: 24,
                        align: "right"
                    },
                    {
                        titulo: "BRUTO",
                        largura: 24,
                        align: "right"
                    },
                    {
                        titulo: "DESC.",
                        largura: 23,
                        align: "right"
                    },
                    {
                        titulo: "FINAL",
                        largura: 24,
                        align: "right"
                    }
                ];


                const alturaCabecalho = 6.5;


                aplicarLinhaPadrao();

                documento.setFillColor(
                    ...cinzaTitulo
                );

                documento.rect(
                    margem,
                    y,
                    larguraConteudo,
                    alturaCabecalho,
                    "FD"
                );


                let x = margem;


                colunas.forEach(
                    (coluna) => {

                        documento.line(
                            x,
                            y,
                            x,
                            y + alturaCabecalho
                        );

                        documento.setFont(
                            "helvetica",
                            "bold"
                        );

                        documento.setFontSize(
                            6.2
                        );

                        documento.setTextColor(
                            35,
                            35,
                            35
                        );


                        const xTexto =
                            coluna.align
                            === "right"
                                ? x
                                    +
                                    coluna.largura
                                    -
                                    1.5
                                : coluna.align
                                === "center"
                                    ? x
                                        +
                                        coluna.largura / 2
                                    : x + 1.5;


                        documento.text(
                            coluna.titulo,
                            xTexto,
                            y + 4.25,
                            {
                                align:
                                    coluna.align
                            }
                        );


                        x +=
                            coluna.largura;
                    }
                );


                documento.line(
                    margem
                    +
                    larguraConteudo,
                    y,
                    margem
                    +
                    larguraConteudo,
                    y + alturaCabecalho
                );


                y += alturaCabecalho;
            }


            function desenharLinhaItem(
                item,
                indice
            ) {

                const larguras = [
                    10,
                    60,
                    15,
                    24,
                    24,
                    23,
                    24
                ];


                const descricao =
                    [
                        item.produto_nome,
                        item.sabor
                    ]
                        .filter(Boolean)
                        .join(" - ");


                documento.setFont(
                    "helvetica",
                    "normal"
                );

                documento.setFontSize(
                    6.4
                );


                const linhasDescricao =
                    documento.splitTextToSize(
                        descricao,
                        larguras[1] - 4
                    );


                const espacamentoDescricao = 2.8;

                const alturaTextoDescricao =
                    linhasDescricao.length
                    *
                    espacamentoDescricao;


                const alturaLinha =
                    Math.max(
                        7.5,
                        alturaTextoDescricao
                        +
                        2.4
                    );


                const mudouPagina =
                    garantirEspaco(
                        alturaLinha
                        +
                        6.5
                    );


                if (mudouPagina) {

                    desenharCabecalhoTabela();
                }


                aplicarLinhaPadrao();

                documento.rect(
                    margem,
                    y,
                    larguraConteudo,
                    alturaLinha
                );


                let x = margem;


                larguras.forEach(
                    (
                        largura,
                        indiceColuna
                    ) => {

                        if (
                            indiceColuna > 0
                        ) {

                            documento.line(
                                x,
                                y,
                                x,
                                y + alturaLinha
                            );
                        }


                        x += largura;
                    }
                );


                const centroY =
                    y
                    +
                    alturaLinha / 2
                    +
                    1;


                documento.setTextColor(
                    30,
                    30,
                    30
                );

                documento.setFontSize(
                    6.4
                );

                documento.setFont(
                    "helvetica",
                    "normal"
                );


                let xAtual = margem;


                documento.text(
                    String(
                        indice + 1
                    ),
                    xAtual
                    +
                    larguras[0] / 2,
                    centroY,
                    {
                        align:
                            "center"
                    }
                );


                xAtual +=
                    larguras[0];


                const yDescricao =
                    y
                    +
                    (
                        alturaLinha
                        -
                        alturaTextoDescricao
                    ) / 2
                    +
                    2.1;


                documento.text(
                    linhasDescricao,
                    xAtual + 2,
                    yDescricao,
                    {
                        lineHeightFactor:
                            1.05
                    }
                );


                xAtual +=
                    larguras[1];


                documento.text(
                    textoSeguro(
                        item.quantidade
                    ),
                    xAtual
                    +
                    larguras[2] / 2,
                    centroY,
                    {
                        align:
                            "center"
                    }
                );


                xAtual +=
                    larguras[2];


                const valores = [
                    moeda(
                        item.valor_unitario
                    ),
                    moeda(
                        item.valor_bruto
                    ),
                    moeda(
                        item.valor_desconto
                    ),
                    moeda(
                        item.valor_final
                    )
                ];


                [
                    larguras[3],
                    larguras[4],
                    larguras[5],
                    larguras[6]
                ].forEach(
                    (
                        largura,
                        indiceValor
                    ) => {

                        documento.setFontSize(
                            6.1
                        );

                        documento.text(
                            valores[
                                indiceValor
                            ],
                            xAtual
                            +
                            largura
                            -
                            1.5,
                            centroY,
                            {
                                align:
                                    "right"
                            }
                        );


                        xAtual +=
                            largura;
                    }
                );


                y +=
                    alturaLinha;
            }


            function desenharTotaisEmLinha() {

                const larguraBloco =
                    larguraConteudo / 3;

                const altura = 8;


                aplicarLinhaPadrao();


                documento.rect(
                    margem,
                    y,
                    larguraConteudo,
                    altura
                );


                for (
                    let indice = 1;
                    indice < 3;
                    indice += 1
                ) {

                    documento.line(
                        margem
                        +
                        larguraBloco
                        *
                        indice,
                        y,
                        margem
                        +
                        larguraBloco
                        *
                        indice,
                        y + altura
                    );
                }


                const totaisLinha = [
                    {
                        rotulo:
                            "VALOR BRUTO",
                        valor:
                            subtotalPdf,
                        destaque:
                            false
                    },
                    {
                        rotulo:
                            "DESCONTO TOTAL",
                        valor:
                            descontoPdf,
                        destaque:
                            false
                    },
                    {
                        rotulo:
                            "VALOR FINAL",
                        valor:
                            totalPdf,
                        destaque:
                            true
                    }
                ];


                totaisLinha.forEach(
                    (
                        total,
                        indice
                    ) => {

                        const xBloco =
                            margem
                            +
                            larguraBloco
                            *
                            indice;


                        if (
                            total.destaque
                        ) {

                            documento.setFillColor(
                                ...cinzaClaro
                            );

                            documento.rect(
                                xBloco,
                                y,
                                larguraBloco,
                                altura,
                                "F"
                            );

                            aplicarLinhaPadrao();

                            documento.rect(
                                xBloco,
                                y,
                                larguraBloco,
                                altura,
                                "D"
                            );
                        }


                        documento.setTextColor(
                            30,
                            30,
                            30
                        );

                        documento.setFont(
                            "helvetica",
                            total.destaque
                                ? "bold"
                                : "normal"
                        );

                        documento.setFontSize(
                            6.7
                        );


                        documento.text(
                            total.rotulo,
                            xBloco + 2,
                            y + 5.1
                        );


                        documento.setFont(
                            "helvetica",
                            "bold"
                        );

                        documento.setFontSize(
                            7.1
                        );

                        documento.text(
                            moeda(
                                total.valor
                            ),
                            xBloco
                            +
                            larguraBloco
                            -
                            2,
                            y + 5.1,
                            {
                                align:
                                    "right"
                            }
                        );
                    }
                );


                y += altura;
            }


            // ======================================
            // CABEÇALHO PRINCIPAL
            // ======================================

            desenharCabecalhoPrincipal();


            // ======================================
            // DADOS DO CLIENTE
            // ======================================

            desenharTituloSecao(
                "DADOS DO CLIENTE"
            );


            const larguraTerco =
                larguraConteudo / 3;

            const alturaCampo = 9;


            const camposCliente = [
                [
                    [
                        "NOME",
                        nomeCliente
                    ],
                    [
                        "CPF",
                        formatarCpf(
                            cliente?.cpf
                        )
                    ],
                    [
                        "TELEFONE",
                        formatarTelefone(
                            cliente?.telefone
                        )
                    ]
                ],
                [
                    [
                        "E-MAIL",
                        cliente?.email
                        || "-"
                    ],
                    [
                        "CEP",
                        formatarCep(
                            cliente?.cep
                        )
                    ],
                    [
                        "BAIRRO",
                        cliente?.bairro
                        || "-"
                    ]
                ],
                [
                    [
                        "ENDEREÇO",
                        cliente?.rua
                        || "-"
                    ],
                    [
                        "NÚMERO",
                        cliente?.numero_endereco
                        || "-"
                    ],
                    [
                        "COMPLEMENTO",
                        cliente?.complemento
                        || "-"
                    ]
                ]
            ];


            camposCliente.forEach(
                (linha) => {

                    linha.forEach(
                        (
                            campo,
                            indiceCampo
                        ) => {

                            desenharCampo(
                                margem
                                +
                                (
                                    larguraTerco
                                    *
                                    indiceCampo
                                ),
                                y,
                                larguraTerco,
                                alturaCampo,
                                campo[0],
                                campo[1]
                            );
                        }
                    );

                    y += alturaCampo;
                }
            );


            y += 4;


            // ======================================
            // DADOS DO PEDIDO
            // ======================================

            desenharTituloSecao(
                "DADOS DO PEDIDO"
            );


            const statusPedido =
                dados.status
                === "CONCLUIDO"
                    ? "Concluído"
                    : dados.status
                    === "CANCELADO"
                        ? "Cancelado"
                        : "Aberto";


            const camposPedido = [
                [
                    [
                        "NÚMERO",
                        `#${dados.numero}`
                    ],
                    [
                        "DATA DO PEDIDO",
                        dataBR(
                            dados.data_pedido
                            || pedido.data_pedido
                        )
                    ],
                    [
                        "FORMA DE PAGAMENTO",
                        formaPagamento
                    ]
                ],
                [
                    [
                        "ITENS",
                        `${calculosPdf.length} item(ns)`
                    ],
                    [
                        "QUANTIDADE TOTAL",
                        quantidadeTotal
                    ],
                    [
                        "VALOR FINAL",
                        moeda(
                            totalPdf
                        )
                    ]
                ]
            ];


            camposPedido.forEach(
                (linha) => {

                    linha.forEach(
                        (
                            campo,
                            indiceCampo
                        ) => {

                            desenharCampo(
                                margem
                                +
                                (
                                    larguraTerco
                                    *
                                    indiceCampo
                                ),
                                y,
                                larguraTerco,
                                alturaCampo,
                                campo[0],
                                campo[1]
                            );
                        }
                    );

                    y += alturaCampo;
                }
            );


            y += 5;


            // ======================================
            // ITENS DO PEDIDO
            // ======================================

            desenharTituloSecao(
                "ITENS DO PEDIDO"
            );


            desenharCabecalhoTabela();


            if (
                calculosPdf.length
                === 0
            ) {

                documento.setFont(
                    "helvetica",
                    "normal"
                );

                documento.setFontSize(
                    8
                );

                documento.text(
                    "Nenhum item encontrado no pedido.",
                    margem + 2,
                    y + 6
                );

                aplicarLinhaPadrao();

                documento.rect(
                    margem,
                    y,
                    larguraConteudo,
                    10
                );

                y += 10;


            } else {

                calculosPdf.forEach(
                    (
                        item,
                        indice
                    ) => {

                        desenharLinhaItem(
                            item,
                            indice
                        );
                    }
                );
            }


            // ======================================
            // TOTAIS
            // ======================================

            if (
                garantirEspaco(
                    17
                )
            ) {

                y += 2;
            }


            y += 4;


            desenharTotaisEmLinha();


            y += 5;


            // ======================================
            // RODAPÉ INFORMATIVO
            // ======================================

            if (
                garantirEspaco(
                    27
                )
            ) {

                y += 2;
            }


            desenharTituloSecao(
                "INFORMAÇÕES"
            );


            aplicarLinhaPadrao();

            documento.rect(
                margem,
                y,
                larguraConteudo,
                18
            );

            documento.setFont(
                "helvetica",
                "normal"
            );

            documento.setFontSize(
                7.3
            );

            documento.setTextColor(
                45,
                45,
                45
            );

            documento.text(
                `Situação: ${statusPedido} | Pagamento: ${formaPagamento}`,
                margem + 2,
                y + 5
            );

            documento.text(
                `Emissão: ${new Date().toLocaleString("pt-BR")}`,
                margem + 2,
                y + 10
            );

            documento.text(
                "Documento gerado pelo sistema de gestão MARDRI.",
                margem + 2,
                y + 15
            );


            // ======================================
            // NUMERAÇÃO DAS PÁGINAS
            // ======================================

            const totalPaginasDocumento =
                documento.getNumberOfPages();


            for (
                let pagina = 1;
                pagina <= totalPaginasDocumento;
                pagina += 1
            ) {

                documento.setPage(
                    pagina
                );

                documento.setFont(
                    "helvetica",
                    "normal"
                );

                documento.setFontSize(
                    7
                );

                documento.setTextColor(
                    100,
                    100,
                    100
                );

                documento.text(
                    `Página ${pagina} de ${totalPaginasDocumento}`,
                    larguraPagina - margem,
                    290,
                    {
                        align:
                            "right"
                    }
                );
            }


            const nomeArquivoCliente =
                nomeCliente
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .replace(
                        /[^a-zA-Z0-9]+/g,
                        "-"
                    )
                    .replace(
                        /^-+|-+$/g,
                        ""
                    )
                    .toLowerCase()
                    .slice(
                        0,
                        40
                    );


            documento.save(
                `pedido-${dados.numero}-${
                    nomeArquivoCliente
                    || "cliente"
                }.pdf`
            );


            setMensagem(
                `PDF do pedido #${
                    dados.numero
                } gerado com sucesso.`
            );


        } catch (error) {

            console.error(
                "Erro ao gerar PDF do pedido:",
                error
            );


            setErro(
                error.response
                    ?.data
                    ?.erro

                ||

                "Não foi possível gerar "
                + "o PDF do pedido."
            );
        }
    }


    // ==========================================
    // FILTRO DE DATA DA LISTAGEM
    // ==========================================

    const pedidosFiltradosData =
        useMemo(
            () => {

                if (
                    periodoData
                    === "TODOS"
                ) {

                    return pedidos;
                }


                return pedidos.filter(
                    (pedido) => {

                        const dataPedido =
                            String(
                                pedido
                                    .data_pedido
                                || ""
                            ).substring(
                                0,
                                10
                            );


                        if (
                            !dataPedido
                        ) {

                            return false;
                        }


                        if (
                            periodoData
                            === "DIA"
                        ) {

                            return (
                                dataPedido
                                === diaFiltro
                            );
                        }


                        if (
                            periodoData
                            === "MES"
                        ) {

                            return (
                                dataPedido
                                    .substring(
                                        0,
                                        7
                                    )
                                === mesFiltro
                            );
                        }


                        if (
                            periodoData
                            === "ANO"
                        ) {

                            return (
                                dataPedido
                                    .substring(
                                        0,
                                        4
                                    )
                                === String(
                                    anoFiltro
                                )
                            );
                        }


                        return true;
                    }
                );
            },
            [
                pedidos,
                periodoData,
                diaFiltro,
                mesFiltro,
                anoFiltro
            ]
        );


    // ==========================================
    // PAGINAÇÃO
    // ==========================================

    const totalItens =
        pedidosFiltradosData.length;


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
            paginaSegura
            -
            1
        )
        *
        itensPorPagina;


    const indiceFinal =
        indiceInicial
        +
        itensPorPagina;


    const pedidosPaginados =
        pedidosFiltradosData.slice(
            indiceInicial,
            indiceFinal
        );


    function alterarItensPorPagina(
        quantidade
    ) {

        setItensPorPagina(
            quantidade
        );


        setPaginaAtual(
            1
        );


        setAberto(
            null
        );
    }


    // ==========================================
    // FORMULÁRIO REUTILIZADO
    // NOVO PEDIDO + MODAL DE EDIÇÃO
    // ==========================================

    function renderFormularioPedido(
        modoModal = false
    ) {

        return (

            <section
                className={
                    modoModal
                        ? styles.modalForm
                        : styles.formCard
                }
            >

                {
                    !modoModal
                    && (

                        <div
                            className={
                                styles.formHeader
                            }
                        >

                            <div>

                                <h2>
                                    Novo Pedido
                                </h2>

                                <p>
                                    Selecione o cliente e
                                    adicione os produtos.
                                </p>

                            </div>

                        </div>
                    )
                }


                <div
                    className={
                        styles.customer
                    }
                >

                    <label>
                        Cliente *
                    </label>


                    <select
                        value={
                            clienteId
                        }
                        onChange={
                            (event) =>
                                setClienteId(
                                    event
                                        .target
                                        .value
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


                <div
                    className={
                        styles.itemGrid
                    }
                >

                    <div
                        className={
                            styles.productField
                        }
                    >

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


                    <div
                        className={
                            styles.quantityField
                        }
                    >

                        <label>
                            Quantidade *
                        </label>


                        <input
                            type="number"
                            name="quantidade"
                            min="0.001"
                            step="0.001"
                            value={
                                itemForm
                                    .quantidade
                            }
                            onChange={
                                alterarItemForm
                            }
                        />

                    </div>


                    <div
                        className={
                            styles.valueField
                        }
                    >

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


                    <div
                        className={
                            styles.discountTypeField
                        }
                    >

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

                            <option
                                value="NENHUM"
                            >
                                Sem desconto
                            </option>

                            <option
                                value="VALOR"
                            >
                                R$
                            </option>

                            <option
                                value="PERCENTUAL"
                            >
                                %
                            </option>

                        </select>

                    </div>


                    <div
                        className={
                            styles.discountValueField
                        }
                    >

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

                        <Plus
                            size={15}
                        />

                        Adicionar

                    </button>

                </div>


                <div
                    className={
                        styles.itemsArea
                    }
                >

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
                                itens.length
                                === 0

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

                                                <tr
                                                    key={
                                                        `${
                                                            item
                                                                .produto_venda_id
                                                        }-${indice}`
                                                    }
                                                >

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
                                                            title="Remover item"
                                                            className={
                                                                styles
                                                                    .removeItem
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


                <div
                    className={
                        styles.summary
                    }
                >

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
                            limparFormulario
                        }
                        disabled={
                            salvando
                        }
                    >
                        {
                            pedidoEditando
                                ? "Cancelar edição"
                                : "Cancelar"
                        }
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

                                : pedidoEditando

                                    ? "Salvar alterações"

                                    : "Salvar pedido"
                        }

                    </button>

                </div>

            </section>
        );
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
                        Pedidos
                    </h1>

                    <p>
                        Cadastro e acompanhamento
                        dos pedidos.
                    </p>

                </div>


                <button
                    type="button"
                    className={
                        styles.newOrderButton
                    }
                    onClick={
                        abrirNovoPedido
                    }
                >

                    <Plus
                        size={16}
                    />

                    Novo pedido

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
                    styles.listSectionHeader
                }
            >

                <h2>
                    Pedidos cadastrados
                </h2>

                <p>
                    Consulte, edite, conclua
                    ou gere o PDF de um pedido.
                </p>

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
                            "Buscar pedido, cliente ou produto..."
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
                        status
                    }
                    onChange={
                        handleStatus
                    }
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


            <div
                className={
                    styles.dateFilters
                }
            >

                <div
                    className={
                        styles.dateTabs
                    }
                >

                    <button
                        type="button"
                        className={
                            periodoData
                            === "TODOS"
                                ? styles.activeDateTab
                                : ""
                        }
                        onClick={() =>
                            alterarPeriodoData(
                                "TODOS"
                            )
                        }
                    >
                        Todos
                    </button>


                    <button
                        type="button"
                        className={
                            periodoData
                            === "DIA"
                                ? styles.activeDateTab
                                : ""
                        }
                        onClick={() =>
                            alterarPeriodoData(
                                "DIA"
                            )
                        }
                    >
                        Dia
                    </button>


                    <button
                        type="button"
                        className={
                            periodoData
                            === "MES"
                                ? styles.activeDateTab
                                : ""
                        }
                        onClick={() =>
                            alterarPeriodoData(
                                "MES"
                            )
                        }
                    >
                        Mês
                    </button>


                    <button
                        type="button"
                        className={
                            periodoData
                            === "ANO"
                                ? styles.activeDateTab
                                : ""
                        }
                        onClick={() =>
                            alterarPeriodoData(
                                "ANO"
                            )
                        }
                    >
                        Ano
                    </button>

                </div>


                {
                    periodoData
                    !== "TODOS"
                    && (

                        <div
                            className={
                                styles.dateReference
                            }
                        >

                            <span>
                                Filtrar por
                            </span>


                            {
                                periodoData
                                === "DIA"
                                && (

                                    <input
                                        type="date"
                                        value={
                                            diaFiltro
                                        }
                                        onChange={
                                            alterarDiaFiltro
                                        }
                                    />
                                )
                            }


                            {
                                periodoData
                                === "MES"
                                && (

                                    <input
                                        type="month"
                                        value={
                                            mesFiltro
                                        }
                                        onChange={
                                            alterarMesFiltro
                                        }
                                    />
                                )
                            }


                            {
                                periodoData
                                === "ANO"
                                && (

                                    <input
                                        type="number"
                                        min="2000"
                                        max="2100"
                                        value={
                                            anoFiltro
                                        }
                                        onChange={
                                            alterarAnoFiltro
                                        }
                                    />
                                )
                            }

                        </div>
                    )
                }

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
                                pedidosPaginados
                                    .length
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

                                    : pedidosPaginados
                                        .map(
                                            (pedido) => (

                                                <Fragment
                                                    key={
                                                        pedido.id
                                                    }
                                                >

                                                    <tr>

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
                                                                    pedido
                                                                        .status
                                                                    === "CONCLUIDO"

                                                                        ? styles
                                                                            .concluido

                                                                        : styles
                                                                            .aberto
                                                                }
                                                            >
                                                                {
                                                                    pedido
                                                                        .status
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

                                                                        ? styles
                                                                            .pago

                                                                        : styles
                                                                            .pendente
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
                                                                    type="button"
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
                                                                    type="button"
                                                                    className={
                                                                        styles.pdfButton
                                                                    }
                                                                    title="Gerar PDF"
                                                                    onClick={() =>
                                                                        gerarPdfPedido(
                                                                            pedido
                                                                        )
                                                                    }
                                                                >

                                                                    <FileDown
                                                                        size={15}
                                                                    />

                                                                </button>


                                                                {
                                                                    pedido.status
                                                                    === "ABERTO"
                                                                    && (

                                                                        <>

                                                                            <button
                                                                                type="button"
                                                                                title="Editar"
                                                                                onClick={() =>
                                                                                    editarPedido(
                                                                                        pedido
                                                                                    )
                                                                                }
                                                                            >

                                                                                <Pencil
                                                                                    size={15}
                                                                                />

                                                                            </button>


                                                                            <button
                                                                                type="button"
                                                                                title="Concluir"
                                                                                onClick={() =>
                                                                                    finalizar(
                                                                                        pedido
                                                                                    )
                                                                                }
                                                                            >

                                                                                <Check
                                                                                    size={15}
                                                                                />

                                                                            </button>


                                                                            <button
                                                                                type="button"
                                                                                title="Excluir"
                                                                                onClick={() =>
                                                                                    removerPedido(
                                                                                        pedido
                                                                                    )
                                                                                }
                                                                            >

                                                                                <Trash2
                                                                                    size={15}
                                                                                />

                                                                            </button>

                                                                        </>
                                                                    )
                                                                }

                                                            </div>

                                                        </td>

                                                    </tr>


                                                    {
                                                        aberto
                                                        === pedido.id
                                                        &&
                                                        detalhes[
                                                            pedido.id
                                                        ]
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
                                                                            styles
                                                                                .innerTable
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
                                                                                                            item
                                                                                                                .valor_bruto
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
                                                                                                            }% (${
                                                                                                                moeda(
                                                                                                                    item
                                                                                                                        .valor_desconto
                                                                                                                )
                                                                                                            })`

                                                                                                            : moeda(
                                                                                                                item
                                                                                                                    .valor_desconto
                                                                                                            )
                                                                                                    }
                                                                                                </td>

                                                                                                <td>

                                                                                                    <strong>
                                                                                                        {
                                                                                                            moeda(
                                                                                                                item
                                                                                                                    .valor_final
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

                                                </Fragment>
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
                        (pagina) => {

                            setPaginaAtual(
                                pagina
                            );

                            setAberto(
                                null
                            );
                        }
                    }
                    onItensPorPaginaChange={
                        alterarItensPorPagina
                    }
                />

            </section>


            {/* MODAL DE NOVO PEDIDO / EDIÇÃO */}

            {
                (
                    novoPedidoAberto
                    ||
                    pedidoEditando
                )
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.modal
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
                                            pedidoEditando
                                                ? `Editar pedido #${numeroPedidoEditando}`
                                                : "Novo pedido"
                                        }
                                    </h2>

                                    <p>
                                        {
                                            pedidoEditando
                                                ? "Altere o cliente ou os itens do pedido."
                                                : "Selecione o cliente e adicione os produtos."
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    title="Fechar"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        limparFormulario
                                    }
                                    disabled={
                                        salvando
                                    }
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
                                    renderFormularioPedido(
                                        true
                                    )
                                }

                            </div>

                        </div>

                    </div>
                )
            }

        </div>
    );
}


export default Pedidos;

