import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Axios } from "../../utils/axios/Axios";
import ContentLayout from "./ContentLayout";
import Loading from "../module/Loading";
import ErrorPage from "../error/ErrorPage";

const PrivateRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();
    const [isMenuValid, setIsMenuValid] = useState(undefined);

    // 사용자 메뉴 접근 권한 체크
    useEffect(() => {
        const checkMenuValid = async () => {
            if (user?.uno && location?.pathname) {
                try {
                    const res = await Axios.GET(`/user-role/menu-valid?role=${user?.role}&menu_id=${location?.pathname}`);
                    setIsMenuValid(res?.data?.values);
                } catch {
                    return <ErrorPage />
                }
            }
        };
        checkMenuValid();
    }, [user?.role, location?.pathname]);

    if (isLoading) {
        return <Loading isOpen={isLoading} />;
    }

    if (!isAuthenticated) {
        return <Navigate replace to="/login" />;
    }

    if (isMenuValid === undefined) {
        return <Loading isOpen={true} />;
    }

    return <ContentLayout isMenuValid={isMenuValid}/>;
};

export default PrivateRoute;
