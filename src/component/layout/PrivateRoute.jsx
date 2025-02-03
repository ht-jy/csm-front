import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Axios } from "../../utils/axios/Axios";
import { Storage } from "../../utils/Storage";
import ContentLayout from "./ContentLayout";
import Loading from "../module/Loading";

const PrivateRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 현재 쿠키에 유효한 토큰이 있는지 서버에 요청하여 검사
    const tokenCheck = async () => {
        try {
            const res = await Axios.GET("/jwt-validation");
            if (res?.data?.result === "Success") {
                // 토큰이 유효하다면 현재 브라우저에서는 불필요한 유효성 검사가 없도록 임시적으로 세션에 추가
                Storage.setSession("login", true);
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(Storage.getSession("login")){
            setIsAuthenticated(true);
            setIsLoading(false);
        }else{
            tokenCheck();
        }
    }, []);

    if (isLoading) {
        // 토큰 검증이 진행 중일 때는 로딩 화면이나 스피너를 표시
        return <Loading isOpen={isLoading} />
    }

    if (!isAuthenticated) {
        return <Navigate replace to="/login" />;
    }

    return <ContentLayout />;
}

export default PrivateRoute;