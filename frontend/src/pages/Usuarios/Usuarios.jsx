import {
    useEffect,
    useRef,
    useState
} from "react";

import {
    LoaderCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import {
    listarClientes,
    criarCliente,
    atualizarCliente,
    excluirCliente
} from "../../services/clienteService";

import Paginacao
    from "../../components/Paginacao/Paginacao";

import styles
    from "./Usuarios.module.css";


const formularioInicial = {
    nome: "",
    sobrenome: "",
    telefone: "",
    email: "",
    cpf: "",
    cep: "",
    bairro: "",
    rua: "",
    cidade: "",
    estado: "",
    numero_endereco: "",
    complemento: ""
};


function Usuarios() {

    const [
        clientes,
        setClientes
    ] = useState([]);


    const [
        busca,
        setBusca
    ] = useState("");


    const [
        formulario,
        setFormulario
    ] = useState(
        formularioInicial
    );


    const [
        clienteEditando,
        setClienteEditando
    ] = useState(null);


    const [
        modalFormularioAberto,
        setModalFormularioAberto
    ] = useState(false);


    const [
        clienteExcluir,
        setClienteExcluir
    ] = useState(null);


    const [
        erro,
        setErro
    ] = useState("");


    const [
        mensagem,
        setMensagem
    ] = useState("");


    const [
        carregando,
        setCarregando
    ] = useState(false);


    const [
        excluindo,
        setExcluindo
    ] = useState(false);


    const [
        buscandoCep,
        setBuscandoCep
    ] = useState(false);


    const [
        erroCep,
        setErroCep
    ] = useState("");


    const [
        paginaAtual,
        setPaginaAtual
    ] = useState(1);


    const [
        itensPorPagina,
        setItensPorPagina
    ] = useState(6);


    const numeroEnderecoRef =
        useRef(null);


    async function carregarClientes(
        textoBusca = ""
    ) {

        try {

            const dados =
                await listarClientes(
                    textoBusca
                );


            setClientes(
                Array.isArray(dados)
                    ? dados
                    : []
            );

        } catch {

            setErro(
                "Não foi possível carregar "
                + "os usuários."
            );
        }
    }


    useEffect(
        () => {

            // eslint-disable-next-line react-hooks/set-state-in-effect
            carregarClientes();

        },
        []
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


    function formatarCep(
        valor
    ) {

        const numeros =
            String(
                valor || ""
            )
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    8
                );


        if (
            numeros.length > 5
        ) {

            return (
                numeros.slice(
                    0,
                    5
                )
                +
                "-"
                +
                numeros.slice(
                    5
                )
            );
        }


        return numeros;
    }


    async function consultarCep(
        cep
    ) {

        const cepNumerico =
            somenteNumeros(
                cep
            );


        if (
            cepNumerico.length !== 8
        ) {

            return;
        }


        try {

            setBuscandoCep(
                true
            );

            setErroCep("");


            const response =
                await fetch(
                    `https://viacep.com.br/ws/${cepNumerico}/json/`
                );


            if (
                !response.ok
            ) {

                throw new Error(
                    "Erro ao consultar CEP."
                );
            }


            const dados =
                await response.json();


            if (
                dados.erro
            ) {

                setErroCep(
                    "CEP não encontrado."
                );


                setFormulario(
                    (anterior) => ({
                        ...anterior,
                        bairro: "",
                        rua: "",
                        cidade: "",
                        estado: ""
                    })
                );


                return;
            }


            setFormulario(
                (anterior) => ({
                    ...anterior,

                    cep:
                        dados.cep
                        ||
                        anterior.cep,

                    rua:
                        dados.logradouro
                        || "",

                    bairro:
                        dados.bairro
                        || "",

                    cidade:
                        dados.localidade
                        || "",

                    estado:
                        dados.uf
                        || ""
                })
            );


            setTimeout(
                () => {

                    numeroEnderecoRef
                        .current
                        ?.focus();

                },
                100
            );

        } catch (error) {

            console.error(
                "Erro ViaCEP:",
                error
            );


            setErroCep(
                "Não foi possível consultar "
                + "o CEP."
            );

        } finally {

            setBuscandoCep(
                false
            );
        }
    }


    useEffect(
        () => {

            const cepNumerico =
                somenteNumeros(
                    formulario.cep
                );


            if (
                cepNumerico.length !== 8
            ) {

                // eslint-disable-next-line react-hooks/set-state-in-effect
                setErroCep("");

                return;
            }


            const temporizador =
                setTimeout(
                    () => {

                        consultarCep(
                            formulario.cep
                        );

                    },
                    400
                );


            return () => {

                clearTimeout(
                    temporizador
                );
            };

        },
        [formulario.cep]
    );


    function handleChange(
        event
    ) {

        const {
            name,
            value
        } = event.target;


        if (
            name === "estado"
        ) {

            setFormulario(
                (anterior) => ({
                    ...anterior,

                    estado:
                        value
                            .toUpperCase()
                            .slice(
                                0,
                                2
                            )
                })
            );

            return;
        }


        setFormulario(
            (anterior) => ({
                ...anterior,
                [name]:
                    value
            })
        );
    }


    function handleCepChange(
        event
    ) {

        const valorFormatado =
            formatarCep(
                event.target.value
            );


        setFormulario(
            (anterior) => ({
                ...anterior,
                cep:
                    valorFormatado
            })
        );
    }


    async function handleBusca(
        event
    ) {

        const valor =
            event.target.value;


        setBusca(
            valor
        );


        setPaginaAtual(
            1
        );


        await carregarClientes(
            valor
        );
    }


    function limparFormulario() {

        setClienteEditando(
            null
        );

        setFormulario(
            formularioInicial
        );

        setErroCep("");
    }


    function abrirAdicionar() {

        limparFormulario();

        setErro("");

        setMensagem("");

        setModalFormularioAberto(
            true
        );
    }


    function fecharFormulario() {

        if (
            carregando
        ) {

            return;
        }


        setModalFormularioAberto(
            false
        );

        limparFormulario();

        setErro("");
    }


    function editar(
        cliente
    ) {

        setClienteEditando(
            cliente.id
        );


        setFormulario({
            nome:
                cliente.nome
                || "",

            sobrenome:
                cliente.sobrenome
                || "",

            telefone:
                cliente.telefone
                || "",

            email:
                cliente.email
                || "",

            cpf:
                cliente.cpf
                || "",

            cep:
                cliente.cep
                || "",

            bairro:
                cliente.bairro
                || "",

            rua:
                cliente.rua
                || "",

            cidade:
                cliente.cidade
                || "",

            estado:
                cliente.estado
                || "",

            numero_endereco:
                cliente.numero_endereco
                || "",

            complemento:
                cliente.complemento
                || ""
        });


        setErro("");

        setMensagem("");

        setErroCep("");

        setModalFormularioAberto(
            true
        );
    }


    function abrirExcluir(
        cliente
    ) {

        setErro("");

        setMensagem("");

        setClienteExcluir(
            cliente
        );
    }


    function fecharExcluir() {

        if (
            excluindo
        ) {

            return;
        }


        setClienteExcluir(
            null
        );
    }


    async function validarDuplicados() {

        const dados =
            await listarClientes(
                ""
            );


        const todosClientes =
            Array.isArray(dados)
                ? dados
                : [];


        const telefone =
            somenteNumeros(
                formulario.telefone
            );


        const cpf =
            somenteNumeros(
                formulario.cpf
            );


        if (
            telefone
        ) {

            const telefoneDuplicado =
                todosClientes.find(
                    (cliente) => {

                        return (
                            Number(
                                cliente.id
                            )
                            !==
                            Number(
                                clienteEditando
                            )
                            &&
                            somenteNumeros(
                                cliente.telefone
                            )
                            ===
                            telefone
                        );
                    }
                );


            if (
                telefoneDuplicado
            ) {

                throw new Error(
                    "Já existe outro usuário "
                    + "com esse telefone."
                );
            }
        }


        if (
            cpf
        ) {

            const cpfDuplicado =
                todosClientes.find(
                    (cliente) => {

                        return (
                            Number(
                                cliente.id
                            )
                            !==
                            Number(
                                clienteEditando
                            )
                            &&
                            somenteNumeros(
                                cliente.cpf
                            )
                            ===
                            cpf
                        );
                    }
                );


            if (
                cpfDuplicado
            ) {

                throw new Error(
                    "Já existe outro usuário "
                    + "com esse CPF."
                );
            }
        }
    }


    async function handleSubmit(
        event
    ) {

        event.preventDefault();

        setErro("");

        setMensagem("");


        const cepNumerico =
            somenteNumeros(
                formulario.cep
            );


        if (
            formulario.cep
            &&
            cepNumerico.length !== 8
        ) {

            setErro(
                "Informe um CEP válido "
                + "com 8 dígitos."
            );

            return;
        }


        if (
            formulario.estado
            &&
            formulario.estado.length !== 2
        ) {

            setErro(
                "Informe uma UF válida "
                + "para o estado."
            );

            return;
        }


        setCarregando(
            true
        );


        try {

            await validarDuplicados();


            const dadosParaSalvar = {
                ...formulario,

                nome:
                    formulario.nome
                        .trim(),

                sobrenome:
                    formulario.sobrenome
                        .trim(),

                telefone:
                    formulario.telefone
                        .trim(),

                email:
                    formulario.email
                        .trim(),

                cpf:
                    formulario.cpf
                        .trim(),

                cep:
                    formulario.cep
                        .trim(),

                bairro:
                    formulario.bairro
                        .trim(),

                rua:
                    formulario.rua
                        .trim(),

                cidade:
                    formulario.cidade
                        .trim(),

                estado:
                    formulario.estado
                        .trim()
                        .toUpperCase(),

                numero_endereco:
                    formulario
                        .numero_endereco
                        .trim(),

                complemento:
                    formulario
                        .complemento
                        .trim()
            };


            if (
                clienteEditando
            ) {

                await atualizarCliente(
                    clienteEditando,
                    dadosParaSalvar
                );


                setMensagem(
                    "Usuário atualizado "
                    + "com sucesso."
                );

            } else {

                await criarCliente(
                    dadosParaSalvar
                );


                setMensagem(
                    "Usuário cadastrado "
                    + "com sucesso."
                );
            }


            setModalFormularioAberto(
                false
            );

            limparFormulario();

            setPaginaAtual(
                1
            );


            await carregarClientes(
                busca
            );

        } catch (error) {

            const mensagemErro =
                error.response
                    ?.data
                    ?.erro
                ||
                error.message
                ||
                "Não foi possível salvar "
                + "o usuário.";


            setErro(
                mensagemErro
            );

        } finally {

            setCarregando(
                false
            );
        }
    }


    async function confirmarExclusao() {

        if (
            !clienteExcluir
        ) {

            return;
        }


        try {

            setExcluindo(
                true
            );

            setErro("");

            setMensagem("");


            await excluirCliente(
                clienteExcluir.id
            );


            setMensagem(
                "Usuário excluído "
                + "com sucesso."
            );


            setClienteExcluir(
                null
            );


            setPaginaAtual(
                1
            );


            await carregarClientes(
                busca
            );

        } catch (error) {

            setErro(
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível excluir "
                + "o usuário."
            );

        } finally {

            setExcluindo(
                false
            );
        }
    }


    const totalItens =
        clientes.length;


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
        indiceInicial
        +
        itensPorPagina;


    const clientesPaginados =
        clientes.slice(
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
                        Usuários
                    </h1>

                    <p>
                        Cadastro e gerenciamento
                        de clientes.
                    </p>

                </div>


                <button
                    type="button"
                    className={
                        styles.addButton
                    }
                    onClick={
                        abrirAdicionar
                    }
                >

                    <Plus
                        size={16}
                    />

                    Adicionar usuário

                </button>

            </div>


            <div
                className={
                    styles.searchBox
                }
            >

                <Search
                    size={17}
                />


                <input
                    type="text"
                    placeholder={
                        "Buscar usuário..."
                    }
                    value={busca}
                    onChange={
                        handleBusca
                    }
                />

            </div>


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


            {
                erro
                &&
                !modalFormularioAberto
                &&
                !clienteExcluir
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
                                <th>Nome</th>
                                <th>Sobrenome</th>
                                <th>Telefone</th>
                                <th>E-mail</th>
                                <th>CPF</th>
                                <th>Cidade</th>
                                <th>Estado</th>
                                <th>Ações</th>
                            </tr>

                        </thead>


                        <tbody>

                            {
                                clientesPaginados.length
                                === 0

                                    ? (

                                        <tr>

                                            <td
                                                colSpan="8"
                                                className={
                                                    styles.empty
                                                }
                                            >
                                                Nenhum usuário
                                                encontrado.
                                            </td>

                                        </tr>
                                    )

                                    : clientesPaginados.map(
                                        (cliente) => (

                                            <tr
                                                key={
                                                    cliente.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        cliente.nome
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        cliente.sobrenome
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        cliente.telefone
                                                        || "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        cliente.email
                                                        || "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        cliente.cpf
                                                        || "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        cliente.cidade
                                                        || "-"
                                                    }
                                                </td>


                                                <td>
                                                    {
                                                        cliente.estado
                                                        || "-"
                                                    }
                                                </td>


                                                <td>

                                                    <div
                                                        className={
                                                            styles.actions
                                                        }
                                                    >

                                                        <button
                                                            type="button"
                                                            title="Editar"
                                                            onClick={() =>
                                                                editar(
                                                                    cliente
                                                                )
                                                            }
                                                        >

                                                            <Pencil
                                                                size={15}
                                                            />

                                                        </button>


                                                        <button
                                                            type="button"
                                                            title="Excluir"
                                                            onClick={() =>
                                                                abrirExcluir(
                                                                    cliente
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
                        setPaginaAtual
                    }
                    onItensPorPaginaChange={
                        alterarItensPorPagina
                    }
                />

            </section>


            {
                modalFormularioAberto
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
                                            clienteEditando
                                                ? "Editar usuário"
                                                : "Adicionar usuário"
                                        }
                                    </h2>

                                    <p>
                                        {
                                            clienteEditando
                                                ? "Atualize os dados do usuário."
                                                : "Preencha os dados do novo usuário."
                                        }
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharFormulario
                                    }
                                    disabled={
                                        carregando
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
                                    styles.modalBody
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
                                                Sobrenome *
                                            </label>

                                            <input
                                                name="sobrenome"
                                                value={
                                                    formulario.sobrenome
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Telefone
                                            </label>

                                            <input
                                                name="telefone"
                                                value={
                                                    formulario.telefone
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                E-mail
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                value={
                                                    formulario.email
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                CPF
                                            </label>

                                            <input
                                                name="cpf"
                                                value={
                                                    formulario.cpf
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                maxLength="14"
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                CEP
                                            </label>

                                            <div
                                                className={
                                                    styles.cepInput
                                                }
                                            >

                                                <input
                                                    name="cep"
                                                    value={
                                                        formulario.cep
                                                    }
                                                    onChange={
                                                        handleCepChange
                                                    }
                                                    placeholder="00000-000"
                                                    maxLength="9"
                                                    inputMode="numeric"
                                                />


                                                {
                                                    buscandoCep
                                                    && (

                                                        <LoaderCircle
                                                            size={16}
                                                            className={
                                                                styles
                                                                    .cepLoading
                                                            }
                                                        />
                                                    )
                                                }

                                            </div>


                                            {
                                                erroCep
                                                && (

                                                    <span
                                                        className={
                                                            styles.cepError
                                                        }
                                                    >
                                                        {erroCep}
                                                    </span>
                                                )
                                            }


                                            {
                                                !erroCep
                                                &&
                                                !buscandoCep
                                                &&
                                                formulario.cidade
                                                &&
                                                formulario.estado
                                                && (

                                                    <span
                                                        className={
                                                            styles.cepSuccess
                                                        }
                                                    >
                                                        Endereço encontrado.
                                                    </span>
                                                )
                                            }

                                        </div>


                                        <div>

                                            <label>
                                                Rua
                                            </label>

                                            <input
                                                name="rua"
                                                value={
                                                    formulario.rua
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Bairro
                                            </label>

                                            <input
                                                name="bairro"
                                                value={
                                                    formulario.bairro
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Cidade
                                            </label>

                                            <input
                                                name="cidade"
                                                value={
                                                    formulario.cidade
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Estado
                                            </label>

                                            <input
                                                name="estado"
                                                value={
                                                    formulario.estado
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                placeholder="RJ"
                                                maxLength="2"
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Número
                                            </label>

                                            <input
                                                ref={
                                                    numeroEnderecoRef
                                                }
                                                name="numero_endereco"
                                                value={
                                                    formulario
                                                        .numero_endereco
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Complemento
                                            </label>

                                            <input
                                                name="complemento"
                                                value={
                                                    formulario
                                                        .complemento
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                        </div>

                                    </div>


                                    <p
                                        className={
                                            styles.required
                                        }
                                    >
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
                                            onClick={
                                                fecharFormulario
                                            }
                                            disabled={
                                                carregando
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
                                                carregando
                                                ||
                                                buscandoCep
                                            }
                                        >

                                            {
                                                carregando
                                                    ? "Salvando..."
                                                    : clienteEditando
                                                        ? "Salvar alterações"
                                                        : "Adicionar usuário"
                                            }

                                        </button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>
                )
            }


            {
                clienteExcluir
                && (

                    <div
                        className={
                            styles.modalOverlay
                        }
                    >

                        <div
                            className={
                                styles.confirmModal
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
                                        Excluir usuário
                                    </h2>

                                    <p>
                                        Confirme a exclusão
                                        deste cadastro.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className={
                                        styles.closeModal
                                    }
                                    onClick={
                                        fecharExcluir
                                    }
                                    disabled={
                                        excluindo
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
                                    styles.confirmBody
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


                                <p>
                                    Deseja realmente excluir
                                    o usuário:
                                </p>


                                <strong>
                                    {
                                        clienteExcluir.nome
                                    }
                                    {" "}
                                    {
                                        clienteExcluir.sobrenome
                                    }
                                </strong>


                                <span>
                                    {
                                        clienteExcluir.cpf
                                            ? `CPF: ${clienteExcluir.cpf}`
                                            : "CPF não informado"
                                    }
                                </span>


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
                                            fecharExcluir
                                        }
                                        disabled={
                                            excluindo
                                        }
                                    >
                                        Cancelar
                                    </button>


                                    <button
                                        type="button"
                                        className={
                                            styles.deleteButton
                                        }
                                        onClick={
                                            confirmarExclusao
                                        }
                                        disabled={
                                            excluindo
                                        }
                                    >
                                        {
                                            excluindo
                                                ? "Excluindo..."
                                                : "Excluir usuário"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )
            }

        </div>
    );
}


export default Usuarios;
