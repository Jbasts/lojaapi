import {
    useEffect,
    useState
} from "react";

import {
    Pencil,
    Trash2,
    Plus,
    Search
} from "lucide-react";

import {
    listarClientes,
    criarCliente,
    atualizarCliente,
    excluirCliente
} from "../../services/clienteService";

import styles from "./Usuarios.module.css";


const formularioInicial = {
    nome: "",
    sobrenome: "",
    telefone: "",
    email: "",
    cpf: "",
    cep: "",
    bairro: "",
    rua: "",
    numero_endereco: "",
    complemento: ""
};


function Usuarios() {

    const [clientes, setClientes] =
        useState([]);

    const [busca, setBusca] =
        useState("");

    const [formulario, setFormulario] =
        useState(formularioInicial);

    const [clienteEditando, setClienteEditando] =
        useState(null);

    const [erro, setErro] =
        useState("");

    const [mensagem, setMensagem] =
        useState("");

    const [carregando, setCarregando] =
        useState(false);


    async function carregarClientes(
        textoBusca = ""
    ) {

        try {

            const dados = await listarClientes(
                textoBusca
            );

            setClientes(dados);

        // eslint-disable-next-line no-unused-vars
        } catch (error) {

            setErro(
                "Não foi possível carregar os usuários."
            );
        }
    }


    useEffect(() => {
// eslint-disable-next-line react-hooks/set-state-in-effect
        carregarClientes();

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

        const valor = event.target.value;

        setBusca(valor);

        await carregarClientes(
            valor
        );
    }


    function editar(cliente) {

        setClienteEditando(
            cliente.id
        );

        setFormulario({
            nome: cliente.nome || "",
            sobrenome: cliente.sobrenome || "",
            telefone: cliente.telefone || "",
            email: cliente.email || "",
            cpf: cliente.cpf || "",
            cep: cliente.cep || "",
            bairro: cliente.bairro || "",
            rua: cliente.rua || "",
            numero_endereco:
                cliente.numero_endereco || "",
            complemento:
                cliente.complemento || ""
        });

        setErro("");
        setMensagem("");
    }


    function cancelar() {

        setClienteEditando(null);

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

            if (clienteEditando) {

                await atualizarCliente(
                    clienteEditando,
                    formulario
                );

                setMensagem(
                    "Usuário atualizado com sucesso."
                );

            } else {

                await criarCliente(
                    formulario
                );

                setMensagem(
                    "Usuário cadastrado com sucesso."
                );
            }

            setClienteEditando(null);

            setFormulario(
                formularioInicial
            );

            await carregarClientes(
                busca
            );

        } catch (error) {

            const mensagemErro =
                error.response?.data?.erro
                ||
                "Não foi possível salvar o usuário.";

            setErro(
                mensagemErro
            );

        } finally {

            setCarregando(false);
        }
    }


    async function remover(cliente) {

        const confirmar = window.confirm(
            `Deseja excluir ${cliente.nome} ${cliente.sobrenome}?`
        );

        if (!confirmar) {
            return;
        }

        try {

            await excluirCliente(
                cliente.id
            );

            setMensagem(
                "Usuário excluído com sucesso."
            );

            await carregarClientes(
                busca
            );

        } catch (error) {

            setErro(
                error.response?.data?.erro
                ||
                "Não foi possível excluir o usuário."
            );
        }
    }


    return (

        <div className={styles.page}>

            <div className={styles.header}>

                <div>

                    <h1>
                        Usuários
                    </h1>

                    <p>
                        Cadastro e gerenciamento de clientes.
                    </p>

                </div>

                <button
                    className={styles.addButton}
                    onClick={cancelar}
                >
                    <Plus size={16} />

                    Adicionar
                </button>

            </div>


            <div className={styles.searchBox}>

                <Search size={17} />

                <input
                    type="text"
                    placeholder="Buscar usuário..."
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

                <div className={styles.tableWrapper}>

                    <table>

                        <thead>

                            <tr>

                                <th>Nome</th>
                                <th>Sobrenome</th>
                                <th>Telefone</th>
                                <th>E-mail</th>
                                <th>CPF</th>
                                <th>Ações</th>

                            </tr>

                        </thead>


                        <tbody>

                            {
                                clientes.length === 0
                                    ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className={styles.empty}
                                            >
                                                Nenhum usuário encontrado.
                                            </td>

                                        </tr>
                                    )

                                    : clientes.map(
                                        (cliente) => (

                                            <tr key={cliente.id}>

                                                <td>
                                                    {cliente.nome}
                                                </td>

                                                <td>
                                                    {cliente.sobrenome}
                                                </td>

                                                <td>
                                                    {cliente.telefone || "-"}
                                                </td>

                                                <td>
                                                    {cliente.email || "-"}
                                                </td>

                                                <td>
                                                    {cliente.cpf || "-"}
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
                                                                editar(cliente)
                                                            }
                                                        >
                                                            <Pencil size={15} />
                                                        </button>

                                                        <button
                                                            title="Excluir"
                                                            onClick={() =>
                                                                remover(cliente)
                                                            }
                                                        >
                                                            <Trash2 size={15} />
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
                        clienteEditando
                            ? "Editar Usuário"
                            : "Adicionar Usuário"
                    }
                </h2>


                <form onSubmit={handleSubmit}>

                    <div className={styles.formGrid}>

                        <div>

                            <label>
                                Nome *
                            </label>

                            <input
                                name="nome"
                                value={formulario.nome}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div>

                            <label>
                                Sobrenome *
                            </label>

                            <input
                                name="sobrenome"
                                value={formulario.sobrenome}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div>

                            <label>
                                Telefone
                            </label>

                            <input
                                name="telefone"
                                value={formulario.telefone}
                                onChange={handleChange}
                            />

                        </div>


                        <div>

                            <label>
                                E-mail
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formulario.email}
                                onChange={handleChange}
                            />

                        </div>


                        <div>

                            <label>
                                CPF
                            </label>

                            <input
                                name="cpf"
                                value={formulario.cpf}
                                onChange={handleChange}
                                maxLength="14"
                            />

                        </div>


                        <div>

                            <label>
                                CEP
                            </label>

                            <input
                                name="cep"
                                value={formulario.cep}
                                onChange={handleChange}
                                maxLength="9"
                            />

                        </div>


                        <div>

                            <label>
                                Bairro
                            </label>

                            <input
                                name="bairro"
                                value={formulario.bairro}
                                onChange={handleChange}
                            />

                        </div>


                        <div>

                            <label>
                                Rua
                            </label>

                            <input
                                name="rua"
                                value={formulario.rua}
                                onChange={handleChange}
                            />

                        </div>


                        <div>

                            <label>
                                Número
                            </label>

                            <input
                                name="numero_endereco"
                                value={
                                    formulario.numero_endereco
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div>

                            <label>
                                Complemento
                            </label>

                            <input
                                name="complemento"
                                value={
                                    formulario.complemento
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    <p className={styles.required}>
                        * Campos obrigatórios
                    </p>


                    <div className={styles.formActions}>

                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={cancelar}
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={carregando}
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


export default Usuarios;