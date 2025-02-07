import { useState, useEffect } from "react";

const Header = () => {
    const [isSidebarToggled, setIsSidebarToggled] = useState(false);

    const handleSidebarToggle = () => {
        setIsSidebarToggled(prevState => !prevState);
    };

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
            {/* Navbar Brand*/}
            <a className="navbar-brand ps-3" href="index.html">현장근태관리시스템</a>
            {/* Sidebar Toggle*/}
            <button className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0" id="sidebarToggle" onClick={handleSidebarToggle}><i className="fas fa-bars" /></button>
            {/* Navbar Search*/}
            <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
                <div className="input-group">
                <input className="form-control" type="text" placeholder="Search for..." aria-label="Search for..." aria-describedby="btnNavbarSearch" />
                <button className="btn btn-primary" id="btnNavbarSearch" type="button"><i className="fas fa-search" /></button>
                </div>
            </form>
            {/* Navbar*/}
            <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
                <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#!" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i className="fas fa-user fa-fw" /></a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    {/* <li><a className="dropdown-item" href="#!">Settings</a></li> */}
                    <li><a className="dropdown-item" href="#!">사용자</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#!">로그아웃</a></li>
                </ul>
                </li>
            </ul>
        </nav>
    );
}

export default Header;
