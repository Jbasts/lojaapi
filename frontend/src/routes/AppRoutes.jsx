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
                            <PagePlaceholder
                                titulo="Compras"
                                descricao="Registro das compras."
                            />
                        }
                    />


                    <Route
                        path="/estoque"
                        element={
                            <PagePlaceholder
                                titulo="Estoque"
                                descricao="Controle de produtos e lotes."
                            />
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
                            <PagePlaceholder
                                titulo="Produtos de Venda"
                                descricao="Cadastro dos produtos comercializados."
                            />
                        }
                    />


                    <Route
                        path="/custos-produtos"
                        element={
                            <PagePlaceholder
                                titulo="Custos dos Produtos"
                                descricao="Composição e cálculo dos custos."
                            />
                        }
                    />


                    <Route
                        path="/despesas"
                        element={
                            <PagePlaceholder
                                titulo="Despesas Extras"
                                descricao="Cadastro das despesas adicionais."
                            />
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