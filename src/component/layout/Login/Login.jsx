import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import "../../../assets/css/Login.css";
import Logo from "../../../assets/image/hitecheng_logo_default.png";
import { Axios } from "../../../utils/axios/Axios";
import { useAuth } from "../../context/AuthContext";  // AuthContext 가져오기
import Modal from "../../module/Modal";

function Login() {
    const navigate = useNavigate();
    const { fetchToken, isAuthenticated, isLoading } = useAuth(); // fetchToken 가져오기

    const [isOpen, setIsOpen] = useState(false);
    const [isSave, setIsSave] = useState(false);
    const [userId, setUserId] = useState("");
    const [pwd, setPwd] = useState("");
    const [modalText, setModalText] = useState("");

    const handleCheckbox = (e) => {
        e.preventDefault();
        setIsSave(!isSave);
    };

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
        };
        
        try {
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
        }
    };

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate("/site");
        }
    }, [isLoading, isAuthenticated]);
    

    return (
        <div>
            <Modal
                isOpen={isOpen}
                title={"로그인"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={onClickConfirm}
            />

            <section className="w3l-login">
                <div className="overlay">
                    <div className="wrapper">
                        <div className="form-section">
                            <img src={Logo} alt="hitech_logo" />
                            <h6>현 장 근 태 관 리 시 스 템</h6>
                            <form className="signin-form">
                                <div className="form-input">
                                    <input onChange={handleUser} type="text" name="userId" placeholder="아이디" required="" autoComplete="username"/>
                                </div>
                                <div className="form-input">
                                    <input onChange={handlePwd} type="password" name="password" placeholder="패스워드" required="" autoComplete="current-password"/>
                                </div>
                                <div className="save-checkbox">
                                    <FormCheckInput checked={isSave} onChange={handleCheckbox}/> 아이디 저장
                                </div>
                                <button onClick={login} className="btn btn-primary theme-button mt-4">Log in</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Login;
