import { Navigate, useLocation } from "react-router-dom";
import ContentLayout from "./ContentLayout";

const PrivateRoute = () => {
    const pathname = useLocation().pathname;
    
    console.log(pathname);
    if(pathname === "/"){
        return <Navigate replace to="/login" />
    }

    return <ContentLayout />
}

export default PrivateRoute;