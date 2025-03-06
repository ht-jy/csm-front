import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementSlider from "../module/AnnouncementSlider";
import SearchProjectModal from "../module/SearchProjectModal";
import { useAuth } from "../context/AuthContext";
import { Axios } from "../../utils/axios/Axios";
import SearchIcon from "../../assets/image/search_9b9d9e.png";
import Organization from "../../assets/image/organization_chart.png";
import RefreshIcon from "../../assets/image/refresh-icon.png";
import CancelIcon from "../../assets/image/cancel.png";
import ExitIcon from "../../assets/image/exit.png";
import { ObjChk } from "../../utils/ObjChk";

const Header = () => {
    const [isSidebarToggled, setIsSidebarToggled] = useState(false);
    const [isProjectOpen, setIsProjectOpen] = useState(false);

    const { user, projectName, setProject, setProjectName } = useAuth();
    const navigete = useNavigate();

    // 사이드 메뉴 열고 닫기
    const handleSidebarToggle = () => {
        setIsSidebarToggled(prevState => !prevState);
    };

    // 로그아웃
    const onClickLogout = async() => {
        const res = await Axios.POST("/logout");
        if (res?.data?.result === "Success") {
            navigete(0);
        }
    }

    // project modal 열기
    const onClickSearch = () => {
        setIsProjectOpen(true);
    }

    const handleRefreshProject = () => {
        setProject(null);
        setProjectName("");
    }

    useEffect(() => {
        
    }, []);

    useEffect(() => {
        // isSidebarToggled 상태에 따라 body 클래스 변경
        if (isSidebarToggled) {
            document.body.classList.add('sb-sidenav-toggled');
        } else {
            document.body.classList.remove('sb-sidenav-toggled');
        }
    
        // 컴포넌트가 언마운트될 때 초기화
        return () => {
            document.body.classList.remove('sb-sidenav-toggled');
        };
    }, [isSidebarToggled]);

    return(
        <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
            {/* 프로젝트 선택 모달 */}
            <SearchProjectModal
                isOpen={isProjectOpen}
                fncExit={() => setIsProjectOpen(false)}
            />
            {/* Navbar Brand*/}
            <a className="navbar-brand ps-3" href="/site">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;공사관리시스템</a>
            {/* Sidebar Toggle*/}
            <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" onClick={handleSidebarToggle}><i className="fas fa-bars" /></button>
            {/* Navbar Search*/}
            <form className="d-flex justify-content-between align-items-center w-100">
                <div className="announcement-slider-container">
                    <AnnouncementSlider />
                </div>
                <div className="input-group search-input">
                    <label htmlFor="project-search">PROJECT NAME</label>
                    <input className="form-control" style={{paddingRight: "40px"}} type="text" value={projectName} placeholder="project를 선택하세요" aria-label="project를 선택하세요" aria-describedby="btnNavbarSearch" onClick={onClickSearch} readOnly/>
                    {
                        !ObjChk.all(projectName) && (
                            <img 
                                src={CancelIcon}
                                alt="취소"
                                style={{
                                    position: "absolute",
                                    top: "52%",
                                    right: "41px",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    width: "40px"
                                }}
                                onClick={handleRefreshProject}
                            />
                        )
                    }
                    <button className="btn btn-primary" id="btnNavbarSearch" type="button"  onClick={onClickSearch}>
                        <i className="fas fa-search" />
                    </button>
                </div>
                <div className="search-icon-container">
                    <img src={SearchIcon} style={{width: "24px"}}/>
                </div>
                <div className="refresh-icon-container" onClick={handleRefreshProject}>
                    <img src={RefreshIcon} style={{width: "22px"}}/>
                </div>
                <div className="organization-icon-container">
                    <img src={Organization} style={{width: "20px"}}/>
                </div>
            </form>
            {/* Navbar*/}
            <ul className="navbar-nav ms-auto me-0 me-md-3 my-2 my-md-0">
                <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="fas fa-user fa-fw" /></a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    {/* <li><a className="dropdown-item" href="#!">Settings</a></li> */}
                    <li><a className="dropdown-item" href="#!">사용자: {user.userName||"GUEST"}</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#!" onClick={onClickLogout}>로그아웃</a></li>
                </ul>
                </li>
            </ul>
        </nav>
    );
}

export default Header;
