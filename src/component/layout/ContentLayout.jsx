import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideNav from "./SideNav";

function ContentLayout() {
    return (
        <>
            <Header />
            <div id="layoutSidenav">
                <SideNav />
                <div id="layoutSidenav_content">
                    <div className="outlet-wrapper">
                        <Outlet />
                    </div>
                </div>
            </div> 
        </>
    );
}

export default ContentLayout;