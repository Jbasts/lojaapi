/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useState
} from "react";

import { realizarLogin }
    from "../services/authService";



export const AuthContext =
    createContext(null);


export function AuthProvider({ children }) {

    const [usuario, setUsuario] =
        useState(() => {

            const usuarioSalvo =
                localStorage.getItem(
                    "usuario"
                );

            return usuarioSalvo
                ? JSON.parse(usuarioSalvo)
                : null;
        });


    async function login(
        email,
        senha
    ) {

        const resultado =
            await realizarLogin(
                email,
                senha
            );

        localStorage.setItem(
            "token",
            resultado.access_token
        );

        localStorage.setItem(
            "usuario",
            JSON.stringify(
                resultado.usuario
            )
        );

        setUsuario(
            resultado.usuario
        );

        return resultado;
    }


    function logout() {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "usuario"
        );

        setUsuario(null);
    }


    const autenticado =
        Boolean(
            localStorage.getItem(
                "token"
            )
        );


    return (

        <AuthContext.Provider
            value={{
                usuario,
                autenticado,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}