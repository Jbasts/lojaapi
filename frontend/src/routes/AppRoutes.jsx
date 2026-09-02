import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Login
    from "../pages/Login/Login";

import Dashboard
    from "../pages/Dashboard/Dashboard";

import MainLayout
    from "../layouts/MainLayout/MainLayout";

import PrivateRoute
    from "./PrivateRoute";

import PagePlaceholder
    from "../components/PagePlaceholder/PagePlaceholder";

import Usuarios
    from "../pages/Usuarios/Usuarios";

import ProdutosEstoque
    from "../pages/ProdutosEstoque/ProdutosEstoque";

import ProdutosVenda
    from "../pages/ProdutosVenda/ProdutosVenda";

import CustosProdutos
    from "../pages/CustosProdutos/CustosProdutos";

import Despesas
    from "../pages/Despesas/Despesas";

import Compras
    from "../pages/Compras/Compras";

import Estoque
    from "../pages/Estoque/Estoque";

function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <Login />
                    }
                />


                <Route
                    element={

                        <PrivateRoute>

                            <MainLayout />

                        </PrivateRoute>
                    }
                >

                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard />
                        }
                    />


                    <Route
                        path="/vendas"
                        element={
                            <PagePlaceholder
                                titulo="Vendas"
                                descricao="Gestão e consulta das vendas."
                            />
                        }
                    />


                    <Route
                        path="/contas"
                        element={
                            <PagePlaceholder
                                titulo="Contas"
                                descricao="Despesas, faturamento e lucro."
                            />
                        }
                    />


                    <Route
                        path="/relatorios"
                        element={
                            <PagePlaceholder
                                titulo="Relatórios"
                                descricao="Relatórios do sistema."
                            />
                        }
                    />


                    <Route
                        path="/pedidos"
                        element={
                            <PagePlaceholder
                                titulo="Pedidos"
                                descricao="Gerenciamento dos pedidos."
                            />
                        }
                    />


                    <Route
                        path="/pagamentos"
                        element={
                            <PagePlaceholder
                                titulo="Pagamentos"
                                descricao="Controle dos pagamentos."
                            />
                        }
                    />


                    <Route
                        path="/compras"
                        element={
                            <Compras />
                        }
                    />


                    <Route
                        path="/estoque"
                        element={
                            <Estoque />
                        }
                    />


                    <Route
                        path="/desperdicios"
                        element={
                            <PagePlaceholder
                                titulo="Desperdícios"
                                descricao="Controle das perdas e desperdícios."
                            />
                        }
                    />


                    <Route
                        path="/usuarios"
                        element={
                            <Usuarios />
                        }
                    />


                    <Route
                        path="/produtos-estoque"
                        element={
                            <ProdutosEstoque />
                        }
                    />


                    <Route
                        path="/produtos-venda"
                        element={
                            <ProdutosVenda />
                        }
                    />


                    <Route
                        path="/custos-produtos"
                        element={
                            <CustosProdutos />
                        }
                    />


                    <Route
                        path="/despesas"
                        element={
                            <Despesas />
                        }
                    />

                </Route>


                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default AppRoutes;