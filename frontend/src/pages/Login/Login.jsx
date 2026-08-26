import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../hooks/useAuth";

import styles
    from "./Login.module.css";


function Login() {

    const navigate =
        useNavigate();

    const {
        login
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [senha, setSenha] =
        useState("");

    const [erro, setErro] =
        useState("");

    const [
        carregando,
        setCarregando
    ] = useState(false);


    async function handleSubmit(event) {

        event.preventDefault();

        setErro("");
        setCarregando(true);

        try {

            await login(
                email,
                senha
            );

            navigate(
                "/dashboard"
            );

        } catch (error) {

            const mensagem =
                error.response
                    ?.data
                    ?.erro
                ||
                "Não foi possível realizar o login.";

            setErro(
                mensagem
            );

        } finally {

            setCarregando(false);
        }
    }


    return (

        <main
            className={
                styles.page
            }
        >

            <section
                className={
                    styles.container
                }
            >

                <div
                    className={
                        styles.brand
                    }
                >

                    <div
                        className={
                            styles.logo
                        }
                    >
                        M
                    </div>

                    <h1>
                        MARDRI
                    </h1>

                    <p>
                        Gestão inteligente
                        para doces e salgados
                    </p>

                    <div
                        className={
                            styles.brandFooter
                        }
                    >
                        Controle simples,
                        organização e gestão
                        do seu negócio.
                    </div>

                </div>


                <div
                    className={
                        styles.formArea
                    }
                >

                    <div
                        className={
                            styles.formContent
                        }
                    >

                        <span
                            className={
                                styles.smallTitle
                            }
                        >
                            MARDRI
                        </span>

                        <h2>
                            Bem-vindo de volta!
                        </h2>

                        <p
                            className={
                                styles.subtitle
                            }
                        >
                            Entre para acessar
                            o sistema de gestão.
                        </p>


                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div
                                className={
                                    styles.field
                                }
                            >

                                <label>
                                    Usuário
                                </label>

                                <input
                                    type="email"
                                    placeholder="Digite seu e-mail"
                                    value={email}
                                    onChange={
                                        (event) =>
                                            setEmail(
                                                event.target.value
                                            )
                                    }
                                    required
                                />

                            </div>


                            <div
                                className={
                                    styles.field
                                }
                            >

                                <label>
                                    Senha
                                </label>

                                <input
                                    type="password"
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={
                                        (event) =>
                                            setSenha(
                                                event.target.value
                                            )
                                    }
                                    required
                                />

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


                            <button
                                className={
                                    styles.submit
                                }
                                type="submit"
                                disabled={
                                    carregando
                                }
                            >

                                {
                                    carregando
                                        ? "Entrando..."
                                        : "Entrar"
                                }

                            </button>

                        </form>

                    </div>

                </div>

            </section>

        </main>
    );
}


export default Login;