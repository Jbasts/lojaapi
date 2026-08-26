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
    useNavigate
} from "react-router-dom";

import {
    useState
} from "react";

import {
    useAuth
} from "../../hooks/useAuth";

import styles from "./Sidebar.module.css";


function Sidebar() {

    const navigate = useNavigate();

    const { logout } = useAuth();

    const [
        produtosAberto,
        setProdutosAberto
    ] = useState(false);


    function handleLogout() {

        logout();

        navigate("/");
    }


    function linkClass({ isActive }) {

        return isActive
            ? `${styles.link} ${styles.active}`
            : styles.link;
    }


    return (

        <aside className={styles.sidebar}>

            <div className={styles.brand}>

                <div className={styles.logo}>
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


            <nav className={styles.navigation}>

                <span className={styles.sectionTitle}>
                    GESTÃO
                </span>

                <NavLink
                    to="/dashboard"
                    className={linkClass}
                >
                    <LayoutDashboard size={18} />

                    Dashboard
                </NavLink>


                <NavLink
                    to="/vendas"
                    className={linkClass}
                >
                    <ShoppingCart size={18} />

                    Vendas
                </NavLink>


                <NavLink
                    to="/contas"
                    className={linkClass}
                >
                    <WalletCards size={18} />

                    Contas
                </NavLink>


                <NavLink
                    to="/relatorios"
                    className={linkClass}
                >
                    <FileText size={18} />

                    Relatórios
                </NavLink>


                <span className={styles.sectionTitle}>
                    OPERAÇÃO
                </span>


                <NavLink
                    to="/pedidos"
                    className={linkClass}
                >
                    <ClipboardList size={18} />

                    Pedidos
                </NavLink>


                <NavLink
                    to="/pagamentos"
                    className={linkClass}
                >
                    <CreditCard size={18} />

                    Pagamentos
                </NavLink>


                <NavLink
                    to="/compras"
                    className={linkClass}
                >
                    <PackagePlus size={18} />

                    Compras
                </NavLink>


                <NavLink
                    to="/estoque"
                    className={linkClass}
                >
                    <Boxes size={18} />

                    Estoque
                </NavLink>


                <NavLink
                    to="/desperdicios"
                    className={linkClass}
                >
                    <Trash2 size={18} />

                    Desperdícios
                </NavLink>


                <span className={styles.sectionTitle}>
                    CADASTROS
                </span>


                <NavLink
                    to="/usuarios"
                    className={linkClass}
                >
                    <Users size={18} />

                    Usuários
                </NavLink>


                <button
                    className={styles.productButton}
                    onClick={() =>
                        setProdutosAberto(
                            !produtosAberto
                        )
                    }
                >

                    <div>
                        <Package size={18} />

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
                    produtosAberto && (

                        <div className={styles.submenu}>

                            <NavLink
                                to="/produtos-estoque"
                                className={linkClass}
                            >
                                Produto Estoque
                            </NavLink>

                            <NavLink
                                to="/produtos-venda"
                                className={linkClass}
                            >
                                Produto Venda
                            </NavLink>

                        </div>
                    )
                }


                <NavLink
                    to="/custos-produtos"
                    className={linkClass}
                >
                    <Calculator size={18} />

                    Custos dos produtos
                </NavLink>


                <NavLink
                    to="/despesas"
                    className={linkClass}
                >
                    <ReceiptText size={18} />

                    Despesas
                </NavLink>

            </nav>


            <button
                className={styles.logout}
                onClick={handleLogout}
            >
                <LogOut size={18} />

                Sair
            </button>

        </aside>
    );
}


export default Sidebar;