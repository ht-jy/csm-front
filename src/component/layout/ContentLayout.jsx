import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideNav from "./SideNav";
import Forbidden from "../error/Forbidden";

function ContentLayout({isMenuValid}) {
    return (
        <>
            <Header />
            <div id="layoutSidenav">
                <SideNav />
                <div id="layoutSidenav_content">
                    <div className="outlet-wrapper">
                        {/* <Outlet /> */}
                        {
                            isMenuValid === false ? <Forbidden /> : <Outlet />
                        }
                    </div>
                </div>
            </div> 
        </>
    );
}

export default ContentLayout;