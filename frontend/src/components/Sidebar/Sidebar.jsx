import {
    useEffect,
    useState
} from "react";

import {
    LayoutDashboard,
    ShoppingCart,
    WalletCards,
    FileText,
    ClipboardList,
    CreditCard,
    PackagePlus,
    Boxes,
    Trash2,
    Users,
    Package,
    Calculator,
    ReceiptText,
    LogOut,
    ChevronDown
} from "lucide-react";

import {
    NavLink,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../../hooks/useAuth";

import styles from "./Sidebar.module.css";


function Sidebar() {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    const { logout } =
        useAuth();


    const caminhoAtual =
        location.pathname;


    const rotaGestaoAtiva =
        [
            "/dashboard",
            "/vendas",
            "/contas",
            "/relatorios"
        ].some(
            (rota) =>
                caminhoAtual.startsWith(
                    rota
                )
        );


    const rotaOperacaoAtiva =
        [
            "/pedidos",
            "/pagamentos",
            "/compras",
            "/estoque",
            "/desperdicios"
        ].some(
            (rota) =>
                caminhoAtual.startsWith(
                    rota
                )
        );


    const rotaProdutosAtiva =
        [
            "/produtos-estoque",
            "/produtos-venda"
        ].some(
            (rota) =>
                caminhoAtual.startsWith(
                    rota
                )
        );


    const rotaCadastrosAtiva =
        [
            "/usuarios",
            "/produtos-estoque",
            "/produtos-venda",
            "/custos-produtos",
            "/despesas"
        ].some(
            (rota) =>
                caminhoAtual.startsWith(
                    rota
                )
        );


    const [
        gestaoAberto,
        setGestaoAberto
    ] = useState(
        rotaGestaoAtiva
        || true
    );


    const [
        operacaoAberto,
        setOperacaoAberto
    ] = useState(
        rotaOperacaoAtiva
        || true
    );


    const [
        cadastrosAberto,
        setCadastrosAberto
    ] = useState(
        rotaCadastrosAtiva
        || true
    );


    const [
        produtosAberto,
        setProdutosAberto
    ] = useState(
        rotaProdutosAtiva
    );


    useEffect(
        () => {

            if (
                rotaGestaoAtiva
            ) {

                // eslint-disable-next-line react-hooks/set-state-in-effect
                setGestaoAberto(
                    true
                );
            }


            if (
                rotaOperacaoAtiva
            ) {

                setOperacaoAberto(
                    true
                );
            }


            if (
                rotaCadastrosAtiva
            ) {

                setCadastrosAberto(
                    true
                );
            }


            if (
                rotaProdutosAtiva
            ) {

                setProdutosAberto(
                    true
                );
            }

        },
        [
            rotaGestaoAtiva,
            rotaOperacaoAtiva,
            rotaCadastrosAtiva,
            rotaProdutosAtiva
        ]
    );


    function handleLogout() {

        logout();

        navigate("/");
    }


    function linkClass({
        isActive
    }) {

        return isActive
            ? `${styles.link} ${styles.active}`
            : styles.link;
    }


    return (

        <aside
            className={
                styles.sidebar
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


                <div>

                    <strong>
                        MARDRI
                    </strong>

                    <span>
                        Gestão
                    </span>

                </div>

            </div>


            <nav
                className={
                    styles.navigation
                }
            >

                <button
                    type="button"
                    className={
                        styles.sectionButton
                    }
                    onClick={() =>
                        setGestaoAberto(
                            !gestaoAberto
                        )
                    }
                >

                    <span>
                        GESTÃO
                    </span>


                    <ChevronDown
                        size={15}
                        className={
                            gestaoAberto
                                ? styles.rotate
                                : ""
                        }
                    />

                </button>


                {
                    gestaoAberto
                    && (

                        <div
                            className={
                                styles.sectionContent
                            }
                        >

                            <NavLink
                                to="/dashboard"
                                className={
                                    linkClass
                                }
                            >
                                <LayoutDashboard
                                    size={18}
                                />

                                Dashboard
                            </NavLink>


                            <NavLink
                                to="/vendas"
                                className={
                                    linkClass
                                }
                            >
                                <ShoppingCart
                                    size={18}
                                />

                                Vendas
                            </NavLink>


                            <NavLink
                                to="/contas"
                                className={
                                    linkClass
                                }
                            >
                                <WalletCards
                                    size={18}
                                />

                                Contas
                            </NavLink>


                            <NavLink
                                to="/relatorios"
                                className={
                                    linkClass
                                }
                            >
                                <FileText
                                    size={18}
                                />

                                Relatórios
                            </NavLink>

                        </div>
                    )
                }


                <button
                    type="button"
                    className={
                        styles.sectionButton
                    }
                    onClick={() =>
                        setOperacaoAberto(
                            !operacaoAberto
                        )
                    }
                >

                    <span>
                        OPERAÇÃO
                    </span>


                    <ChevronDown
                        size={15}
                        className={
                            operacaoAberto
                                ? styles.rotate
                                : ""
                        }
                    />

                </button>


                {
                    operacaoAberto
                    && (

                        <div
                            className={
                                styles.sectionContent
                            }
                        >

                            <NavLink
                                to="/pedidos"
                                className={
                                    linkClass
                                }
                            >
                                <ClipboardList
                                    size={18}
                                />

                                Pedidos
                            </NavLink>


                            <NavLink
                                to="/pagamentos"
                                className={
                                    linkClass
                                }
                            >
                                <CreditCard
                                    size={18}
                                />

                                Pagamentos
                            </NavLink>


                            <NavLink
                                to="/compras"
                                className={
                                    linkClass
                                }
                            >
                                <PackagePlus
                                    size={18}
                                />

                                Compras
                            </NavLink>


                            <NavLink
                                to="/estoque"
                                className={
                                    linkClass
                                }
                            >
                                <Boxes
                                    size={18}
                                />

                                Estoque
                            </NavLink>


                            <NavLink
                                to="/desperdicios"
                                className={
                                    linkClass
                                }
                            >
                                <Trash2
                                    size={18}
                                />

                                Desperdícios
                            </NavLink>

                        </div>
                    )
                }


                <button
                    type="button"
                    className={
                        styles.sectionButton
                    }
                    onClick={() =>
                        setCadastrosAberto(
                            !cadastrosAberto
                        )
                    }
                >

                    <span>
                        CADASTROS
                    </span>


                    <ChevronDown
                        size={15}
                        className={
                            cadastrosAberto
                                ? styles.rotate
                                : ""
                        }
                    />

                </button>


                {
                    cadastrosAberto
                    && (

                        <div
                            className={
                                styles.sectionContent
                            }
                        >

                            <NavLink
                                to="/usuarios"
                                className={
                                    linkClass
                                }
                            >
                                <Users
                                    size={18}
                                />

                                Usuários
                            </NavLink>


                            <button
                                type="button"
                                className={
                                    rotaProdutosAtiva
                                        ? `${styles.productButton} ${styles.productButtonActive}`
                                        : styles.productButton
                                }
                                onClick={() =>
                                    setProdutosAberto(
                                        !produtosAberto
                                    )
                                }
                            >

                                <div>

                                    <Package
                                        size={18}
                                    />

                                    Produtos

                                </div>


                                <ChevronDown
                                    size={16}
                                    className={
                                        produtosAberto
                                            ? styles.rotate
                                            : ""
                                    }
                                />

                            </button>


                            {
                                produtosAberto
                                && (

                                    <div
                                        className={
                                            styles.submenu
                                        }
                                    >

                                        <NavLink
                                            to="/produtos-estoque"
                                            className={
                                                linkClass
                                            }
                                        >
                                            Produto Estoque
                                        </NavLink>


                                        <NavLink
                                            to="/produtos-venda"
                                            className={
                                                linkClass
                                            }
                                        >
                                            Produto Venda
                                        </NavLink>

                                    </div>
                                )
                            }


                            <NavLink
                                to="/custos-produtos"
                                className={
                                    linkClass
                                }
                            >
                                <Calculator
                                    size={18}
                                />

                                Custos dos produtos
                            </NavLink>


                            <NavLink
                                to="/despesas"
                                className={
                                    linkClass
                                }
                            >
                                <ReceiptText
                                    size={18}
                                />

                                Despesas
                            </NavLink>

                        </div>
                    )
                }

            </nav>


            <button
                type="button"
                className={
                    styles.logout
                }
                onClick={
                    handleLogout
                }
            >

                <LogOut
                    size={18}
                />

                Sair

            </button>

        </aside>
    );
}


export default Sidebar;
