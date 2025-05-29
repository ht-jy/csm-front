import { Link } from "react-router-dom";
import htencLogo from "../../assets/image/hitecheng_logo_default.png";
import CompareIcon from "../../assets/image/compare.png";
import Deducted from "../../assets/image/deducted.png";
import DeadlineIcon from "../../assets/image/deadline.png";

const SideNav = () => {
    return(
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div style={{textAlign:"center"}}>
                        <img src={htencLogo} style={{backgroundColor: "white", width:"200px", padding:"15px", borderRadius:"5px"}}/>
                    </div>
                    <div className="nav">
                        <div style={{height:"15px"}}></div>
                        {/* <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapsePages" aria-expanded="false" aria-controls="collapsePages">
                            <div className="sb-nav-link-icon"><img src="/svg/menu/management.svg" width='20px' /></div>
                            관리 메뉴
                            <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                        </a>
                        <div className="collapse" id="collapsePages" aria-labelledby="headingTwo" data-bs-parent="#sidenavAccordion">
                            <nav className="sb-sidenav-menu-nested nav accordion" id="sidenavAccordionPages"> */}
                                <Link className="nav-link" to="/site" style={{color: "white"}}>
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/site-management.svg" width='20px' /></div>
                                    현장 관리
                                </Link>

                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#pagesCollapseAuth" aria-expanded="false" aria-controls="pagesCollapseAuth" style={{color: "white"}}>
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/worker-management.svg" width='20px' /></div>
                                    근로자 관리
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="pagesCollapseAuth" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordionPages">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link className="nav-link" to="/total" style={{color: "white"}}>전체 근로자</Link>
                                        <Link className="nav-link" to="/site-base" style={{color: "white"}}>현장 근로자</Link>
                                    </nav>
                                </div>

                                {/* <Link className="nav-link" to="/retire">
                                    <div className="sb-nav-link-icon"><img src={Deducted} width='20px' /></div>
                                    퇴직 공제
                                </Link> */}

                                {/* <Link className="nav-link" to="/daily-deadline">
                                    <div className="sb-nav-link-icon"><img src={DeadlineIcon} width='20px' /></div>
                                    일일 마감
                                </Link> */}

                                <Link className="nav-link" to="/daily-compare">
                                    <div className="sb-nav-link-icon"><img src={CompareIcon} width='19px' /></div>
                                    일일근로자 비교
                                </Link>

                                <Link className="nav-link" to="/equip">
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/equip-management.svg" width='20px' /></div>
                                    장비 관리
                                </Link>

                                <Link className="nav-link" to="/device" style={{color: "white"}}>
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/device-management.svg" width='20px' /></div>
                                    근태인식기 관리
                                </Link>

                                <Link className="nav-link" to="/company" style={{color: "white"}}>
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/company-management.svg" width='20px' /></div>
                                    협력업체 관리
                                </Link>

                                <Link className="nav-link" to="/wage">
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/wage-management.svg" width='20px' /></div>
                                    표준단가 관리
                                </Link>

                                <Link className="nav-link" to="/schedule" style={{color: "white"}}>
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/calendar-management.svg" width='20px' /></div>
                                    일정 관리
                                </Link>

                                <Link className="nav-link" to="/notice" style={{color: "white"}}>
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/notice-management.svg" width='20px' /></div>
                                    공지사항 관리
                                </Link>

                                <Link className="nav-link" to="/code" style={{color: "white"}}>
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/code-management.svg" width='20px' /></div>
                                    코드 관리
                                </Link>

                                <Link className="nav-link" to="/project">
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/project-management.svg" width='20px' /></div>
                                    프로젝트 설정
                                </Link>

                            {/* </nav>
                        </div> */}

                    </div>
                </div>
                {/* <div className="sb-sidenav-footer">
                    <div className="small"></div>
                </div> */}
            </nav>
        </div>
    );
}

export default SideNav;
