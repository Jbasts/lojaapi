import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileImage,
    Pencil,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import {
    atualizarCompra,
    buscarCompra,
    criarCompra,
    excluirCompra,
    lerNotaFiscal,
    listarCompras
} from "../../services/compraService";

import {
    buscarProdutoPorCodigo,
    criarProdutoEstoque
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


    const arquivoNotaRef =
        useRef(null);

    const [modalNotaAberto, setModalNotaAberto] =
        useState(false);

    const [itensNota, setItensNota] =
        useState([]);

    const [nomeArquivoNota, setNomeArquivoNota] =
        useState("");

    const [lendoNota, setLendoNota] =
        useState(false);

    const [erroNota, setErroNota] =
        useState("");

    const [
        modalEscolhaCompraAberto,
        setModalEscolhaCompraAberto
    ] = useState(false);

    const [
        modalCompraAberto,
        setModalCompraAberto
    ] = useState(false);

    const [
        verificandoCodigoNota,
        setVerificandoCodigoNota
    ] = useState(null);


    const [
        cadastroProdutoNota,
        setCadastroProdutoNota
    ] = useState(null);

    const [
        cadastrandoProdutoNota,
        setCadastrandoProdutoNota
    ] = useState(false);

    const [
        erroCadastroProdutoNota,
        setErroCadastroProdutoNota
    ] = useState("");


    const hoje =
        new Date();

    const hojeISO =
        [
            hoje.getFullYear(),
            String(
                hoje.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),
            String(
                hoje.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join("-");


    const [
        periodo,
        setPeriodo
    ] = useState("TOTAL");

    const [
        diaFiltro,
        setDiaFiltro
    ] = useState(
        hojeISO
    );

    const [
        mesFiltro,
        setMesFiltro
    ] = useState(
        hojeISO.substring(
            0,
            7
        )
    );

    const [
        anoFiltro,
        setAnoFiltro
    ] = useState(
        hojeISO.substring(
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

    const [
        quantidadePagina,
        setQuantidadePagina
    ] = useState("6");


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

        setPaginaAtual(1);

        await carregarCompras(
            valor
        );
    }


    function abrirEscolhaCompra() {

        setErro("");
        setMensagem("");
        setModalEscolhaCompraAberto(true);
    }


    function abrirCompraManual() {

        setModalEscolhaCompraAberto(false);

        setCompraEditando(null);
        setItemForm(itemInicial);
        setItens([]);

        setErro("");
        setMensagem("");

        setModalCompraAberto(true);
    }


    function abrirLeituraNota() {

        setModalEscolhaCompraAberto(false);

        setCompraEditando(null);
        setItemForm(itemInicial);
        setItens([]);

        abrirSeletorNota();
    }


    function fecharModalCompra() {

        if (salvando) {
            return;
        }

        setModalCompraAberto(false);
        setCompraEditando(null);
        setItemForm(itemInicial);
        setItens([]);
        setErro("");
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



    function abrirSeletorNota() {

        setErro("");
        setMensagem("");
        setErroNota("");

        arquivoNotaRef.current?.click();
    }


    async function handleArquivoNota(
        event
    ) {

        const arquivo =
            event.target.files?.[0];

        event.target.value = "";

        if (!arquivo) {
            return;
        }


        const tiposAceitos = [
            "image/png",
            "image/jpeg"
        ];


        if (
            !tiposAceitos.includes(
                arquivo.type
            )
        ) {

            setErro(
                "Envie uma imagem PNG, JPG ou JPEG."
            );

            return;
        }


        setNomeArquivoNota(
            arquivo.name
        );

        setLendoNota(true);
        setErro("");
        setErroNota("");
        setMensagem("");


        try {

            const dados =
                await lerNotaFiscal(
                    arquivo
                );


            const itensLidos =
                Array.isArray(
                    dados.itens
                )
                    ? dados.itens.map(
                        (item) => ({
                            ...item,
                            validade: "",
                            selecionado:
                                Boolean(
                                    item.registrado
                                )
                        })
                    )
                    : [];


            setItensNota(
                itensLidos
            );

            setModalNotaAberto(
                true
            );

        } catch (error) {

            setNomeArquivoNota("");

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível ler a nota fiscal."
            );

        } finally {

            setLendoNota(false);
        }
    }


    function fecharModalNota() {

        if (lendoNota) {
            return;
        }


        setModalNotaAberto(false);
        setItensNota([]);
        setNomeArquivoNota("");
        setErroNota("");
    }


    function alterarItemNota(
        indice,
        campo,
        valor
    ) {

        setItensNota(
            (anteriores) => {

                const copia = [
                    ...anteriores
                ];


                copia[indice] = {
                    ...copia[indice],
                    [campo]: valor
                };


                return copia;
            }
        );
    }


    function alterarCodigoItemNota(
        indice,
        valor
    ) {

        const codigo =
            String(
                valor || ""
            )
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    14
                );


        setItensNota(
            (anteriores) =>
                anteriores.map(
                    (item, i) =>
                        i === indice
                            ? {
                                ...item,
                                codigo_barras:
                                    codigo,
                                produto_estoque_id:
                                    null,
                                produto_nome:
                                    null,
                                registrado:
                                    false,
                                selecionado:
                                    false,
                                codigo_valido:
                                    null
                            }
                            : item
                )
        );
    }


    async function verificarCodigoItemNota(
        indice
    ) {

        const item =
            itensNota[indice];

        const codigo =
            String(
                item?.codigo_barras
                || ""
            ).trim();


        if (!codigo) {

            setErroNota(
                "Informe o código de barras antes de verificar."
            );

            return;
        }


        setErroNota("");
        setVerificandoCodigoNota(
            indice
        );


        try {

            const produto =
                await buscarProdutoPorCodigo(
                    codigo
                );


            setItensNota(
                (anteriores) =>
                    anteriores.map(
                        (atual, i) =>
                            i === indice
                                ? {
                                    ...atual,
                                    codigo_barras:
                                        codigo,
                                    produto_estoque_id:
                                        produto.id,
                                    produto_nome:
                                        produto.nome,
                                    registrado:
                                        true,
                                    selecionado:
                                        true
                                }
                                : atual
                    )
            );

        } catch {

            setItensNota(
                (anteriores) =>
                    anteriores.map(
                        (atual, i) =>
                            i === indice
                                ? {
                                    ...atual,
                                    produto_estoque_id:
                                        null,
                                    produto_nome:
                                        null,
                                    registrado:
                                        false,
                                    selecionado:
                                        false
                                }
                                : atual
                    )
            );

            setErroNota(
                `O código ${codigo} não está cadastrado em Produto Estoque.`
            );

        } finally {

            setVerificandoCodigoNota(
                null
            );
        }
    }


    function abrirCadastroProdutoNota(
        indice
    ) {

        const item =
            itensNota[indice];


        setErroCadastroProdutoNota("");

        setCadastroProdutoNota({
            indice,
            nome: "",
            codigo_barras:
                String(
                    item?.codigo_barras
                    || ""
                )
        });
    }


    function fecharCadastroProdutoNota() {

        if (
            cadastrandoProdutoNota
        ) {
            return;
        }


        setCadastroProdutoNota(
            null
        );

        setErroCadastroProdutoNota(
            ""
        );
    }


    function alterarCadastroProdutoNota(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        setCadastroProdutoNota(
            (anterior) => {

                if (!anterior) {
                    return anterior;
                }


                if (
                    name
                    === "codigo_barras"
                ) {

                    return {
                        ...anterior,
                        codigo_barras:
                            String(
                                value
                                || ""
                            )
                                .replace(
                                    /\D/g,
                                    ""
                                )
                                .slice(
                                    0,
                                    32
                                )
                    };
                }


                return {
                    ...anterior,
                    [name]:
                        value
                };
            }
        );
    }


    async function cadastrarProdutoDaNota(
        event
    ) {

        event.preventDefault();


        if (
            !cadastroProdutoNota
        ) {
            return;
        }


        const nome =
            String(
                cadastroProdutoNota.nome
                || ""
            ).trim();

        const codigo =
            String(
                cadastroProdutoNota
                    .codigo_barras
                || ""
            )
                .replace(
                    /\D/g,
                    ""
                );


        if (!nome) {

            setErroCadastroProdutoNota(
                "Informe o nome do produto."
            );

            return;
        }


        if (!codigo) {

            setErroCadastroProdutoNota(
                "Confirme o código de barras."
            );

            return;
        }


        setErroCadastroProdutoNota(
            ""
        );

        setCadastrandoProdutoNota(
            true
        );


        try {

            await criarProdutoEstoque({
                nome,
                codigo_barras:
                    codigo
            });


            const produto =
                await buscarProdutoPorCodigo(
                    codigo
                );


            const indice =
                cadastroProdutoNota.indice;


            setItensNota(
                (anteriores) =>
                    anteriores.map(
                        (
                            item,
                            i
                        ) =>
                            i === indice
                                ? {
                                    ...item,
                                    codigo_barras:
                                        produto
                                            .codigo_barras
                                        || codigo,
                                    produto_estoque_id:
                                        produto.id,
                                    produto_nome:
                                        produto.nome,
                                    registrado:
                                        true,
                                    selecionado:
                                        true,
                                    codigo_valido:
                                        true
                                }
                                : item
                    )
            );


            setErroNota("");

            setCadastroProdutoNota(
                null
            );

        } catch (error) {

            setErroCadastroProdutoNota(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível cadastrar o produto."
            );

        } finally {

            setCadastrandoProdutoNota(
                false
            );
        }
    }


    function removerItemNota(
        indice
    ) {

        setErroNota("");

        setItensNota(
            (anteriores) =>
                anteriores.filter(
                    (_, i) =>
                        i !== indice
                )
        );
    }


    function adicionarItensDaNota() {

        setErroNota("");


        const selecionados =
            itensNota.filter(
                (item) =>
                    item.registrado
                    &&
                    item.selecionado
            );


        if (
            selecionados.length === 0
        ) {

            setErroNota(
                "Selecione pelo menos um produto registrado."
            );

            return;
        }


        const itemInvalido =
            selecionados.find(
                (item) =>
                    Number(
                        item.quantidade
                    ) <= 0
                    ||
                    item.valor_unitario === ""
                    ||
                    Number(
                        item.valor_unitario
                    ) < 0
            );


        if (itemInvalido) {

            setErroNota(
                "Revise quantidade e valor unitário "
                + "dos produtos selecionados."
            );

            return;
        }


        const semValidade =
            selecionados.find(
                (item) =>
                    !item.validade
            );


        if (semValidade) {

            setErroNota(
                `Informe a validade de "${semValidade.produto_nome}".`
            );

            return;
        }


        const novosItens =
            selecionados.map(
                (item) => ({
                    produto_estoque_id:
                        item.produto_estoque_id,

                    produto_nome:
                        item.produto_nome,

                    codigo_barras:
                        item.codigo_barras,

                    quantidade:
                        Number(
                            item.quantidade
                        ),

                    valor_unitario:
                        Number(
                            item.valor_unitario
                        ),

                    validade:
                        item.validade
                })
            );


        setItens(
            (anteriores) => [
                ...anteriores,
                ...novosItens
            ]
        );


        setMensagem(
            `${novosItens.length} item(ns) da nota `
            + "adicionado(s) à compra."
        );


        fecharModalNota();

        setModalCompraAberto(
            true
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

            setModalCompraAberto(
                false
            );

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

                        setModalCompraAberto(
                            false
                        );

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

            setItemForm(
                itemInicial
            );

            setModalCompraAberto(
                true
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


    const comprasFiltradas =
        useMemo(
            () => {

                return compras.filter(
                    (compra) => {

                        const data =
                            String(
                                compra.data_compra
                                || ""
                            )
                                .substring(
                                    0,
                                    10
                                );


                        if (
                            periodo
                            === "DIA"
                        ) {

                            return (
                                data
                                === diaFiltro
                            );
                        }


                        if (
                            periodo
                            === "MES"
                        ) {

                            return (
                                data.startsWith(
                                    mesFiltro
                                )
                            );
                        }


                        if (
                            periodo
                            === "ANO"
                        ) {

                            return (
                                data.startsWith(
                                    anoFiltro
                                )
                            );
                        }


                        return true;
                    }
                );

            },
            [
                compras,
                periodo,
                diaFiltro,
                mesFiltro,
                anoFiltro
            ]
        );


    const totalComprasFiltradas =
        useMemo(
            () => {

                return comprasFiltradas.reduce(
                    (total, compra) =>
                        total
                        +
                        Number(
                            compra.valor_total
                            || 0
                        ),
                    0
                );

            },
            [
                comprasFiltradas
            ]
        );


    const totalItens =
        comprasFiltradas.length;

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

    const indiceFinal =
        Math.min(
            indiceInicial
            +
            itensPorPagina,
            totalItens
        );

    const comprasPaginadas =
        comprasFiltradas.slice(
            indiceInicial,
            indiceFinal
        );


    function alterarPeriodo(
        novoPeriodo
    ) {

        setPeriodo(
            novoPeriodo
        );

        setPaginaAtual(1);
        setAberta(null);
    }


    function alterarItensPorPagina(
        event
    ) {

        const valorTexto =
            event.target.value;

        setQuantidadePagina(
            valorTexto
        );


        const valor =
            Number(
                valorTexto
            );


        if (
            Number.isInteger(
                valor
            )
            &&
            valor > 0
        ) {

            setItensPorPagina(
                valor
            );

            setPaginaAtual(1);
        }
    }


    function confirmarQuantidadePagina() {

        const valor =
            Number(
                quantidadePagina
            );


        if (
            !Number.isInteger(
                valor
            )
            ||
            valor <= 0
        ) {

            setQuantidadePagina(
                String(
                    itensPorPagina
                )
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


                <div
                    className={
                        styles.headerActions
                    }
                >

                    <input
                        ref={
                            arquivoNotaRef
                        }
                        type="file"
                        accept={
                            "image/png,image/jpeg"
                        }
                        className={
                            styles.hiddenFileInput
                        }
                        onChange={
                            handleArquivoNota
                        }
                    />


                    <button
                        type="button"
                        className={
                            styles.readInvoiceButton
                        }
                        onClick={
                            abrirEscolhaCompra
                        }
                    >

                        <Plus
                            size={16}
                        />

                        Adicionar Compra

                    </button>

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


            <div
                className={
                    styles.listControls
                }
            >

                <div
                    className={
                        styles.searchBox
                    }
                >

                    <Search size={17} />

                    <input
                        placeholder={
                            "Buscar compra, produto ou código..."
                        }
                        value={busca}
                        onChange={handleBusca}
                    />

                </div>


                <div
                    className={
                        styles.periodArea
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
                                periodo === "TOTAL"
                                    ? styles.activePeriod
                                    : ""
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
                                periodo === "DIA"
                                    ? styles.activePeriod
                                    : ""
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
                                periodo === "MES"
                                    ? styles.activePeriod
                                    : ""
                            }
                            onClick={() =>
                                alterarPeriodo(
                                    "MES"
                                )
                            }
                        >
                            Mês
                        </button>


                        <button
                            type="button"
                            className={
                                periodo === "ANO"
                                    ? styles.activePeriod
                                    : ""
                            }
                            onClick={() =>
                                alterarPeriodo(
                                    "ANO"
                                )
                            }
                        >
                            Ano
                        </button>

                    </div>


                    {
                        periodo === "DIA"
                        && (

                            <input
                                type="date"
                                className={
                                    styles.periodReference
                                }
                                value={
                                    diaFiltro
                                }
                                onChange={
                                    (event) => {

                                        setDiaFiltro(
                                            event.target.value
                                        );

                                        setPaginaAtual(1);
                                    }
                                }
                            />
                        )
                    }


                    {
                        periodo === "MES"
                        && (

                            <input
                                type="month"
                                className={
                                    styles.periodReference
                                }
                                value={
                                    mesFiltro
                                }
                                onChange={
                                    (event) => {

                                        setMesFiltro(
                                            event.target.value
                                        );

                                        setPaginaAtual(1);
                                    }
                                }
                            />
                        )
                    }


                    {
                        periodo === "ANO"
                        && (

                            <input
                                type="number"
                                min="2000"
                                max="2100"
                                className={
                                    styles.periodReference
                                }
                                value={
                                    anoFiltro
                                }
                                onChange={
                                    (event) => {

                                        setAnoFiltro(
                                            event.target.value
                                                .replace(
                                                    /\D/g,
                                                    ""
                                                )
                                                .slice(
                                                    0,
                                                    4
                                                )
                                        );

                                        setPaginaAtual(1);
                                    }
                                }
                            />
                        )
                    }

                </div>

            </div>


            <div
                className={
                    styles.filteredSummary
                }
            >

                <span>
                    {
                        comprasFiltradas.length
                    }
                    {" compra(s) no período"}
                </span>

                <strong>
                    Total: {
                        moeda(
                            totalComprasFiltradas
                        )
                    }
                </strong>

            </div>


            <section className={styles.card}>

                <div
                    className={
                        styles.tableWrapper
                    }
                >

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

                        {comprasFiltradas.length === 0
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
                            : comprasPaginadas.map(
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

                </div>


                <div
                    className={
                        styles.pagination
                    }
                >

                    <div
                        className={
                            styles.paginationInfo
                        }
                    >

                        {
                            totalItens > 0
                                ? (
                                    <>
                                        Mostrando{" "}
                                        <strong>
                                            {
                                                indiceInicial + 1
                                            }
                                        </strong>
                                        {" - "}
                                        <strong>
                                            {
                                                indiceFinal
                                            }
                                        </strong>
                                        {" de "}
                                        <strong>
                                            {
                                                totalItens
                                            }
                                        </strong>
                                    </>
                                )
                                : (
                                    <>
                                        Mostrando{" "}
                                        <strong>
                                            0
                                        </strong>
                                        {" de "}
                                        <strong>
                                            0
                                        </strong>
                                    </>
                                )
                        }

                    </div>


                    <div
                        className={
                            styles.paginationControls
                        }
                    >

                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaSegura <= 1
                            }
                            onClick={() =>
                                setPaginaAtual(
                                    1
                                )
                            }
                            title="Primeira página"
                        >
                            «
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaSegura <= 1
                            }
                            onClick={() =>
                                setPaginaAtual(
                                    (anterior) =>
                                        Math.max(
                                            1,
                                            anterior - 1
                                        )
                                )
                            }
                            title="Página anterior"
                        >
                            ‹
                        </button>


                        <div
                            className={
                                styles.paginationPage
                            }
                        >
                            Página{" "}
                            <strong>
                                {
                                    paginaSegura
                                }
                            </strong>
                            {" de "}
                            <strong>
                                {
                                    totalPaginas
                                }
                            </strong>
                        </div>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaSegura
                                >= totalPaginas
                            }
                            onClick={() =>
                                setPaginaAtual(
                                    (anterior) =>
                                        Math.min(
                                            totalPaginas,
                                            anterior + 1
                                        )
                                )
                            }
                            title="Próxima página"
                        >
                            ›
                        </button>


                        <button
                            type="button"
                            className={
                                styles.paginationButton
                            }
                            disabled={
                                paginaSegura
                                >= totalPaginas
                            }
                            onClick={() =>
                                setPaginaAtual(
                                    totalPaginas
                                )
                            }
                            title="Última página"
                        >
                            »
                        </button>

                    </div>


                    <div
                        className={
                            styles.paginationSize
                        }
                    >

                        <label>
                            Itens por página
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={
                                quantidadePagina
                            }
                            onChange={
                                alterarItensPorPagina
                            }
                            onBlur={
                                confirmarQuantidadePagina
                            }
                        />

                    </div>

                </div>

            </section>



            {
                lendoNota
                && (

                    <div
                        className={
                            styles.readingOverlay
                        }
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                    >

                        <div
                            className={
                                styles.readingCard
                            }
                        >

                            <div
                                className={
                                    styles.readingIconArea
                                }
                            >

                                <div
                                    className={
                                        styles.readingSpinner
                                    }
                                />

                                <div
                                    className={
                                        styles.readingFileIcon
                                    }
                                >
                                    <FileImage
                                        size={28}
                                    />
                                </div>

                            </div>


                            <div
                                className={
                                    styles.readingContent
                                }
                            >

                                <span
                                    className={
                                        styles.readingEyebrow
                                    }
                                >
                                    LEITOR DE NOTA FISCAL
                                </span>

                                <h2>
                                    Lendo sua nota...
                                </h2>

                                <p>
                                    Estamos identificando os códigos
                                    de barras, quantidades, valores
                                    e verificando os produtos
                                    cadastrados.
                                </p>


                                {
                                    nomeArquivoNota
                                    && (

                                        <div
                                            className={
                                                styles.readingFileName
                                            }
                                        >
                                            <FileImage
                                                size={15}
                                            />

                                            <span>
                                                {
                                                    nomeArquivoNota
                                                }
                                            </span>
                                        </div>
                                    )
                                }


                                <div
                                    className={
                                        styles.readingProgress
                                    }
                                >
                                    <div
                                        className={
                                            styles.readingProgressBar
                                        }
                                    />
                                </div>


                                <div
                                    className={
                                        styles.readingSteps
                                    }
                                >

                                    <div
                                        className={
                                            styles.readingStep
                                        }
                                    >
                                        <span
                                            className={
                                                styles.stepDot
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Analisando imagem
                                            </strong>

                                            <small>
                                                Melhorando a leitura
                                                da foto enviada.
                                            </small>
                                        </div>
                                    </div>


                                    <div
                                        className={
                                            styles.readingStep
                                        }
                                    >
                                        <span
                                            className={
                                                styles.stepDot
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Lendo os itens
                                            </strong>

                                            <small>
                                                Código, quantidade
                                                e valor unitário.
                                            </small>
                                        </div>
                                    </div>


                                    <div
                                        className={
                                            styles.readingStep
                                        }
                                    >
                                        <span
                                            className={
                                                styles.stepDot
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Conferindo cadastro
                                            </strong>

                                            <small>
                                                Verificando os produtos
                                                no estoque.
                                            </small>
                                        </div>
                                    </div>

                                </div>


                                <span
                                    className={
                                        styles.readingHint
                                    }
                                >
                                    Isso pode levar alguns segundos.
                                </span>

                            </div>

                        </div>

                    </div>
                )
            }


            {
                modalEscolhaCompraAberto
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                        onMouseDown={() =>
                            setModalEscolhaCompraAberto(
                                false
                            )
                        }
                    >

                        <div
                            className={
                                styles.choiceModal
                            }
                            onMouseDown={
                                (event) =>
                                    event.stopPropagation()
                            }
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>

                                    <h2>
                                        Adicionar Compra
                                    </h2>

                                    <p>
                                        Escolha como deseja lançar
                                        os produtos da compra.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={() =>
                                        setModalEscolhaCompraAberto(
                                            false
                                        )
                                    }
                                >
                                    <X size={17} />
                                </button>

                            </div>


                            <div
                                className={
                                    styles.choiceOptions
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.choiceOption
                                    }
                                    onClick={
                                        abrirCompraManual
                                    }
                                >

                                    <Plus size={22} />

                                    <strong>
                                        Manual
                                    </strong>

                                    <span>
                                        Digite o código, quantidade,
                                        valor e validade dos produtos.
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    className={
                                        styles.choiceOption
                                    }
                                    onClick={
                                        abrirLeituraNota
                                    }
                                    disabled={
                                        lendoNota
                                    }
                                >

                                    <FileImage size={22} />

                                    <strong>
                                        Ler Nota
                                    </strong>

                                    <span>
                                        Selecione uma foto PNG, JPG ou JPEG
                                        para preencher os itens.
                                    </span>

                                </button>

                            </div>

                        </div>

                    </div>
                )
            }


            {
                modalCompraAberto
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                        onMouseDown={
                            fecharModalCompra
                        }
                    >

                        <div
                            className={
                                styles.purchaseModal
                            }
                            onMouseDown={
                                (event) =>
                                    event.stopPropagation()
                            }
                        >

                            <div
                                className={
                                    styles.modalHeader
                                }
                            >

                                <div>

                                    <h2>
                                        {
                                            compraEditando
                                                ? "Editar Compra"
                                                : "Adicionar Compra"
                                        }
                                    </h2>

                                    <p>
                                        Revise os itens antes de salvar.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharModalCompra
                                    }
                                    disabled={
                                        salvando
                                    }
                                >
                                    <X size={17} />
                                </button>

                            </div>


                            <div
                                className={
                                    styles.invoiceModalBody
                                }
                            >

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

                            </div>

                        </div>

                    </div>
                )
            }


            {
                modalNotaAberto
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.invoiceModal
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
                                        Conferir Nota Fiscal
                                    </h2>

                                    <p>
                                        {
                                            nomeArquivoNota
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharModalNota
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
                                    styles.invoiceModalBody
                                }
                            >

                                <div
                                    className={
                                        styles.invoiceNotice
                                    }
                                >

                                    <AlertTriangle
                                        size={17}
                                    />

                                    <span>
                                        Confira quantidade e valor.
                                        A leitura da imagem pode
                                        precisar de correção manual.
                                        Produtos registrados exigem
                                        validade antes de serem
                                        adicionados à compra.
                                    </span>

                                </div>


                                {
                                    erroNota
                                    && (

                                        <div
                                            className={
                                                styles.error
                                            }
                                        >
                                            {erroNota}
                                        </div>
                                    )
                                }


                                <div
                                    className={
                                        styles.invoiceTableWrapper
                                    }
                                >

                                    <table
                                        className={
                                            styles.invoiceTable
                                        }
                                    >

                                        <thead>

                                            <tr>
                                                <th></th>
                                                <th>Status</th>
                                                <th>Código</th>
                                                <th>Produto</th>
                                                <th>Qtd.</th>
                                                <th>Valor unit.</th>
                                                <th>Validade</th>
                                                <th></th>
                                            </tr>

                                        </thead>


                                        <tbody>

                                            {
                                                itensNota.length
                                                === 0

                                                    ? (

                                                        <tr>

                                                            <td
                                                                colSpan="8"
                                                                className={
                                                                    styles.empty
                                                                }
                                                            >
                                                                Nenhum item
                                                                foi identificado
                                                                na imagem.
                                                            </td>

                                                        </tr>
                                                    )

                                                    : itensNota.map(
                                                        (
                                                            item,
                                                            indice
                                                        ) => (

                                                            <tr
                                                                key={
                                                                    `${item.codigo_barras}-${indice}`
                                                                }
                                                                className={
                                                                    item.registrado
                                                                        ? ""
                                                                        : styles.unregisteredRow
                                                                }
                                                            >

                                                                <td>

                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            Boolean(
                                                                                item.selecionado
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !item.registrado
                                                                        }
                                                                        onChange={
                                                                            (event) =>
                                                                                alterarItemNota(
                                                                                    indice,
                                                                                    "selecionado",
                                                                                    event.target.checked
                                                                                )
                                                                        }
                                                                    />

                                                                </td>


                                                                <td>

                                                                    <span
                                                                        className={
                                                                            item.registrado
                                                                                ? styles.registeredBadge
                                                                                : styles.unregisteredBadge
                                                                        }
                                                                    >

                                                                        {
                                                                            item.registrado
                                                                                ? (
                                                                                    <>
                                                                                        <CheckCircle2
                                                                                            size={13}
                                                                                        />

                                                                                        Registrado
                                                                                    </>
                                                                                )
                                                                                : (
                                                                                    <>
                                                                                        <AlertTriangle
                                                                                            size={13}
                                                                                        />

                                                                                        Não registrado
                                                                                    </>
                                                                                )
                                                                        }

                                                                    </span>

                                                                </td>


                                                                <td>

                                                                    <div
                                                                        className={
                                                                            styles.invoiceCodeEdit
                                                                        }
                                                                    >

                                                                        <input
                                                                            type="text"
                                                                            inputMode="numeric"
                                                                            value={
                                                                                item.codigo_barras
                                                                                || ""
                                                                            }
                                                                            onChange={
                                                                                (event) =>
                                                                                    alterarCodigoItemNota(
                                                                                        indice,
                                                                                        event.target.value
                                                                                    )
                                                                            }
                                                                            onKeyDown={
                                                                                (event) => {

                                                                                    if (
                                                                                        event.key
                                                                                        === "Enter"
                                                                                    ) {

                                                                                        event.preventDefault();

                                                                                        verificarCodigoItemNota(
                                                                                            indice
                                                                                        );
                                                                                    }
                                                                                }
                                                                            }
                                                                        />


                                                                        <button
                                                                            type="button"
                                                                            title={
                                                                                "Verificar código"
                                                                            }
                                                                            onClick={() =>
                                                                                verificarCodigoItemNota(
                                                                                    indice
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                verificandoCodigoNota
                                                                                === indice
                                                                            }
                                                                        >

                                                                            <Search
                                                                                size={14}
                                                                            />

                                                                        </button>

                                                                    </div>

                                                                    {
                                                                        item.codigo_valido
                                                                        === false
                                                                        && (
                                                                            <small
                                                                                className={
                                                                                    styles.codeWarning
                                                                                }
                                                                            >
                                                                                Revise o código lido
                                                                            </small>
                                                                        )
                                                                    }

                                                                </td>


                                                                <td>

                                                                    {
                                                                        item.registrado
                                                                            ? (
                                                                                <strong
                                                                                    className={
                                                                                        styles.invoiceProductName
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        item.produto_nome
                                                                                    }
                                                                                </strong>
                                                                            )
                                                                            : (

                                                                                <div
                                                                                    className={
                                                                                        styles.unregisteredProductCell
                                                                                    }
                                                                                >

                                                                                    <span>
                                                                                        Produto de estoque
                                                                                        não registrado
                                                                                    </span>


                                                                                    <button
                                                                                        type="button"
                                                                                        className={
                                                                                            styles.quickRegisterButton
                                                                                        }
                                                                                        onClick={() =>
                                                                                            abrirCadastroProdutoNota(
                                                                                                indice
                                                                                            )
                                                                                        }
                                                                                    >

                                                                                        <Plus
                                                                                            size={13}
                                                                                        />

                                                                                        Cadastrar

                                                                                    </button>

                                                                                </div>
                                                                            )
                                                                    }

                                                                </td>


                                                                <td>

                                                                    <input
                                                                        type="number"
                                                                        min="0.001"
                                                                        step="0.001"
                                                                        value={
                                                                            item.quantidade
                                                                            ?? ""
                                                                        }
                                                                        disabled={
                                                                            !item.registrado
                                                                        }
                                                                        onChange={
                                                                            (event) =>
                                                                                alterarItemNota(
                                                                                    indice,
                                                                                    "quantidade",
                                                                                    event.target.value
                                                                                )
                                                                        }
                                                                    />

                                                                </td>


                                                                <td>

                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="0.01"
                                                                        value={
                                                                            item.valor_unitario
                                                                            ?? ""
                                                                        }
                                                                        disabled={
                                                                            !item.registrado
                                                                        }
                                                                        onChange={
                                                                            (event) =>
                                                                                alterarItemNota(
                                                                                    indice,
                                                                                    "valor_unitario",
                                                                                    event.target.value
                                                                                )
                                                                        }
                                                                    />

                                                                </td>


                                                                <td>

                                                                    {
                                                                        item.registrado
                                                                            ? (

                                                                                <input
                                                                                    type="date"
                                                                                    value={
                                                                                        item.validade
                                                                                        || ""
                                                                                    }
                                                                                    onChange={
                                                                                        (event) =>
                                                                                            alterarItemNota(
                                                                                                indice,
                                                                                                "validade",
                                                                                                event.target.value
                                                                                            )
                                                                                    }
                                                                                />
                                                                            )
                                                                            : (
                                                                                <span
                                                                                    className={
                                                                                        styles.notAvailable
                                                                                    }
                                                                                >
                                                                                    Cadastre o produto primeiro
                                                                                </span>
                                                                            )
                                                                    }

                                                                </td>


                                                                <td>

                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            styles.deleteInvoiceItem
                                                                        }
                                                                        title={
                                                                            "Remover item da nota"
                                                                        }
                                                                        onClick={() =>
                                                                            removerItemNota(
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

                            </div>


                            <div
                                className={
                                    styles.modalFooter
                                }
                            >

                                <button
                                    type="button"
                                    className={
                                        styles.cancelButton
                                    }
                                    onClick={
                                        fecharModalNota
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
                                        adicionarItensDaNota
                                    }
                                >
                                    Adicionar itens à compra
                                </button>

                            </div>

                        </div>

                    </div>
                    )
                }

            {
                cadastroProdutoNota
                && (

                    <div
                        className={
                            styles.quickRegisterOverlay
                        }
                        onMouseDown={
                            (event) => {

                                if (
                                    event.target
                                    === event.currentTarget
                                ) {

                                    fecharCadastroProdutoNota();
                                }
                            }
                        }
                    >

                        <div
                            className={
                                styles.quickRegisterModal
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={
                                "titulo-cadastro-produto-nota"
                            }
                        >

                            <div
                                className={
                                    styles.quickRegisterHeader
                                }
                            >

                                <div>

                                    <span>
                                        PRODUTO NÃO CADASTRADO
                                    </span>

                                    <h2
                                        id={
                                            "titulo-cadastro-produto-nota"
                                        }
                                    >
                                        Cadastrar Produto
                                    </h2>

                                    <p>
                                        Informe o nome e confirme
                                        o código lido na nota fiscal.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.modalClose
                                    }
                                    onClick={
                                        fecharCadastroProdutoNota
                                    }
                                    disabled={
                                        cadastrandoProdutoNota
                                    }
                                    aria-label={
                                        "Fechar"
                                    }
                                >
                                    <X size={18} />
                                </button>

                            </div>


                            <form
                                onSubmit={
                                    cadastrarProdutoDaNota
                                }
                            >

                                <div
                                    className={
                                        styles.quickRegisterBody
                                    }
                                >

                                    {
                                        erroCadastroProdutoNota
                                        && (

                                            <div
                                                className={
                                                    styles.quickRegisterError
                                                }
                                            >
                                                {
                                                    erroCadastroProdutoNota
                                                }
                                            </div>
                                        )
                                    }


                                    <div
                                        className={
                                            styles.quickRegisterField
                                        }
                                    >

                                        <label>
                                            Nome do produto *
                                        </label>

                                        <input
                                            type="text"
                                            name="nome"
                                            autoFocus
                                            placeholder={
                                                "Ex.: Fermento em pó químico"
                                            }
                                            value={
                                                cadastroProdutoNota.nome
                                            }
                                            onChange={
                                                alterarCadastroProdutoNota
                                            }
                                            disabled={
                                                cadastrandoProdutoNota
                                            }
                                            required
                                        />

                                    </div>


                                    <div
                                        className={
                                            styles.quickRegisterField
                                        }
                                    >

                                        <label>
                                            Código de barras *
                                        </label>

                                        <input
                                            type="text"
                                            name="codigo_barras"
                                            inputMode="numeric"
                                            value={
                                                cadastroProdutoNota
                                                    .codigo_barras
                                            }
                                            onChange={
                                                alterarCadastroProdutoNota
                                            }
                                            disabled={
                                                cadastrandoProdutoNota
                                            }
                                            required
                                        />

                                        <small>
                                            Confira se o código está igual
                                            ao impresso na nota antes de salvar.
                                        </small>

                                    </div>


                                    <div
                                        className={
                                            styles.quickRegisterPreview
                                        }
                                    >

                                        <CheckCircle2
                                            size={17}
                                        />

                                        <span>
                                            Depois de cadastrar, este item
                                            ficará automaticamente marcado
                                            como Registrado na nota.
                                        </span>

                                    </div>

                                </div>


                                <div
                                    className={
                                        styles.quickRegisterFooter
                                    }
                                >

                                    <button
                                        type="button"
                                        className={
                                            styles.cancelButton
                                        }
                                        onClick={
                                            fecharCadastroProdutoNota
                                        }
                                        disabled={
                                            cadastrandoProdutoNota
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
                                            cadastrandoProdutoNota
                                        }
                                    >

                                        {
                                            cadastrandoProdutoNota
                                                ? "Cadastrando..."
                                                : "Cadastrar produto"
                                        }

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )
            }


        </div>
    );
}


export default Compras;
