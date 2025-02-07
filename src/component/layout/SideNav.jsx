import { Link } from "react-router-dom";
import htencLogo from "../../assets/image/hitecheng_logo_default.png"

const SideNav = () => {
    return(
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div style={{textAlign:"center"}}>
                        <img src={htencLogo} style={{backgroundColor: "white", width:"200px", padding:"15px", borderRadius:"5px"}}/>
                    </div>
                    <div className="nav">
                        
                        <Link className="nav-link" to="/temp">
                            <div className="sb-nav-link-icon"><i className="fas fa-tachometer-alt" /></div>
                            임시
                        </Link>

                        <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#collapsePages" aria-expanded="false" aria-controls="collapsePages">
                            <div className="sb-nav-link-icon"><img src="/svg/menu/management.svg" width='20px' /></div>
                            관리 메뉴
                            <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                        </a>
                        <div className="collapse" id="collapsePages" aria-labelledby="headingTwo" data-bs-parent="#sidenavAccordion">
                            <nav className="sb-sidenav-menu-nested nav accordion" id="sidenavAccordionPages">
                                <Link className="nav-link" to="/site">
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/site-management.svg" width='20px' /></div>
                                    현장 관리
                                </Link>

                                <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#pagesCollapseAuth" aria-expanded="false" aria-controls="pagesCollapseAuth">
                                    <div className="sb-nav-link-icon"><img src="/svg/menu/worker-management.svg" width='20px' /></div>
                                    근로자 관리
                                    <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                </a>
                                <div className="collapse" id="pagesCollapseAuth" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordionPages">
                                    <nav className="sb-sidenav-menu-nested nav">
                                        <Link className="nav-link" to="/total">전체 근로자</Link>
                                        <Link className="nav-link" to="/site-base">현장 근로자</Link>
                                    </nav>
                                </div>

                            </nav>
                        </div>

                    </div>
                </div>
                <div className="sb-sidenav-footer">
                    <div className="small">Logged in as:</div>
                    Start Bootstrap
                </div>
            </nav>
        </div>
    );
}

export default SideNav;
