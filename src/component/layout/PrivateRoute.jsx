import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ContentLayout from "./ContentLayout";
import Loading from "../module/Loading";

const PrivateRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <Loading isOpen={isLoading} />;
    }

    if (!isAuthenticated) {
        return <Navigate replace to="/login" />;
    }

    return <ContentLayout />;
};

export default PrivateRoute;
