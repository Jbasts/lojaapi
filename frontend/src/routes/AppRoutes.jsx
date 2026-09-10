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

import Desperdicios
    from "../pages/Desperdicios/Desperdicios";

import Pedidos
    from "../pages/Pedidos/Pedidos";

import Pagamentos
    from "../pages/Pagamentos/Pagamentos";

import Vendas
    from "../pages/Vendas/Vendas";

import Contas
    from "../pages/Contas/Contas";

import Relatorios
    from "../pages/Relatorios/Relatorios";


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
                            <Vendas />
                        }
                    />

                    <Route
                        path="/contas"
                        element={
                            <Contas />
                        }
                    />

                    <Route
                        path="/relatorios"
                        element={
                            <Relatorios />
                        }
                    />

                    <Route
                        path="/pedidos"
                        element={
                            <Pedidos />
                        }
                    />

                    <Route
                        path="/pagamentos"
                        element={
                            <Pagamentos />
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
                            <Desperdicios />
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