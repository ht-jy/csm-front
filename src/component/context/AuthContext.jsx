import React, { createContext, useContext, useState, useEffect } from "react";
import { Axios } from "../../utils/axios/Axios";
import { userRole as userRoles } from "../../utils/Enum";

/**
 * @description: 로그인 사용자 정보 저장 및 상단 프로젝트 저장
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-??
 * @modified 최종 수정일: 2025-07-09
 * @modifiedBy 최종 수정자: 김진우
 * @modified Description: 
 * 2025-07-01: 프로젝트 선택시 사용자의 프로젝트권한 state 추가
 * 2025-07-09: 프로젝트별 권한 state 추가
 *
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /jwt-validation (사용자 jwt 유효성 검사)
 *    Http Method - POST : 
 *    Http Method - PUT : 
 *    Http Method - DELETE : 
 */

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);             // user.role: IRIS_USER_ROLE_MAP 테이블에 저장된 기본 권한(jno가 0인 모든 프로젝트 기준)
    const [project, setProject] = useState(null);
    const [projectName, setProjectName] = useState("");
    const [jobRole, setJobRole] = useState(null);       // 조직도에 지정되어 있는 권한
    const [userRole, setUserRole]= useState([]);        // IRIS_USER_ROLE_MAP 테이블에 저장된 프로젝트 별 권한
    const [isProject, setIsProject] = useState(true);
    const [loginCompany, setLoginCompany] = useState({}); // 협력업체

    const fetchToken = async () => {
        try {
            const res = await Axios.GET("/jwt-validation");
            
            if (res?.data?.result === "Success") {
                setIsAuthenticated(true);
                setUser({
                    uno: res?.data?.values?.claims?.uno,
                    userId: res?.data?.values?.claims?.user_id,
                    userName: res?.data?.values?.claims?.user_name,
                    role: res?.data?.values?.claims?.role, // USER_ROLE_MAP 테이블에서 JNO가 0으로 되어 있는 기본 권한 or go서버에 하드코딩 되어 있는 권한만 가져옴
                });
                
                if(res?.data?.values?.claims?.role === userRoles.CO_MANAGER.code || res?.data?.values?.claims?.role === userRoles.CO_USER.code){
                    const match = res?.data?.values?.claims?.user_name?.match(/\(([^)]+)\)/); // () 안에 있는 협력업체명 추출 
                    setLoginCompany({name: match ? match[1] : "", is: true});
                }else{
                    setLoginCompany({name: "", is: false});
                }
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
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
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user, fetchToken, project, setProject, projectName, setProjectName, jobRole, setJobRole, userRole, setUserRole, isProject, setIsProject, loginCompany }}>
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
