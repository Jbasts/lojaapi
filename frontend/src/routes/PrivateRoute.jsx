import {
    Navigate
} from "react-router-dom";

import {
    useAuth
} from "../hooks/useAuth";


function PrivateRoute({ children }) {

    const {
        autenticado
    } = useAuth();


    if (!autenticado) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    return children;
}


export default PrivateRoute;