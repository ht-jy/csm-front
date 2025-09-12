import { useEffect, useState } from "react";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import { useNavigate } from "react-router-dom";
import "../../../assets/css/Login.css";
import Logo from "../../../assets/image/hitecheng_logo_default.png";
import { Axios } from "../../../utils/axios/Axios";
import { useAuth } from "../../context/AuthContext"; // AuthContext 가져오기
import Loading from "../../module/Loading";
import Modal from "../../module/Modal";

function Login() {
    const navigate = useNavigate();
    const { fetchToken, isAuthenticated, isLoading } = useAuth(); // fetchToken 가져오기

    const [isOpen, setIsOpen] = useState(false);
    const [isSave, setIsSave] = useState(false);
    const [userId, setUserId] = useState("");
    const [pwd, setPwd] = useState("");
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [modalText, setModalText] = useState("");
    //협력업체로그인
    const [isCompany, setIsCompany] = useState(false);

    const handleUser = (e) => {
        e.preventDefault();
        setUserId(e.target.value);
    };

    const handlePwd = (e) => {
        e.preventDefault();
        setPwd(e.target.value);
    };

    const onClickConfirm = () => {
        setIsOpen(false);
    }

    const login = async (e) => {
        e.preventDefault();
        const user = {
            user_id: userId,
            user_pwd: pwd,
            is_saved: isSave,
            is_company: isCompany,
        };
        
        try {
            setIsLoginLoading(true);

            const res = await Axios.POST("/login", user);
            
            if (res?.data?.result === "Success") {
                await fetchToken();  // 로그인 후 fetchToken 실행 (사용자 정보 업데이트)
                navigate("/site");  // 페이지 이동
            } else {
                setIsOpen(true);
                setModalText("로그인 실패. 아이디 또는 비밀번호를 확인해주세요.")
            }
        } catch (error) {
            setIsOpen(true);
            setModalText("로그인 실패. 다시 시도해주세요.")
        } finally {
            setIsLoginLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate("/site");
        }
    }, [isLoading, isAuthenticated]);
    

    return (
        <div>
            <Loading isOpen={isLoginLoading}/>
            <Modal
                isOpen={isOpen}
                title={"로그인"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={onClickConfirm}
                isConfirmFocus={true}
            />

            <section className="w3l-login">
                <div className="overlay">
                    <div className="wrapper">
                        <div className="form-section">
                            <img src={Logo} alt="hitech_logo" />
                            <h6>공 사 관 리 시 스 템</h6>
                            <form className="signin-form">
                                <div className="login-input">
                                    <input onChange={handleUser} type="text" name="login_user_id" placeholder="아이디" required="" autoComplete="username"/>
                                </div>
                                <div className="login-input">
                                    <input onChange={handlePwd} type="password" name="password" placeholder="패스워드" required="" autoComplete="current-password"/>
                                </div>
                                <div className="checkbox-container">
                                    <div className="save-checkbox-left">
                                        <FormCheckInput className="" checked={isSave} onChange={() => setIsSave(!isSave)}/> 로그인 상태 유지
                                    </div>
                                    <div className="save-checkbox-right">
                                        <FormCheckInput checked={isCompany} onChange={() => setIsCompany(!isCompany)}/> 협력업체 로그인
                                    </div>
                                </div>
                                <button onClick={login} className="btn btn-primary theme-button mt-3">Log in</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
