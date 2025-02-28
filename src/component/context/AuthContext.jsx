import React, { createContext, useContext, useState, useEffect } from "react";
import { Axios } from "../../utils/axios/Axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [project, setProject] = useState(null);
    const [projectName, setProjectName] = useState("");

    const fetchToken = async () => {
        try {
            const res = await Axios.GET("/jwt-validation");

            if (res?.data?.result === "Success") {
                setIsAuthenticated(true);
                setUser({
                    uno: res?.data?.values?.claims?.uno,
                    userId: res?.data?.values?.claims?.user_id,
                    userName: res?.data?.values?.claims?.user_name,
                    role: res?.data?.values?.claims?.role,
                });

            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error("fetchToken 실패:", error);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchToken(); // 앱 실행 시 토큰 검증
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, fetchToken, project, setProject, projectName, setProjectName }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
