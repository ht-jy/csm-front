import { Outlet } from "react-router-dom";
import Header from "./Header";
import SideNav from "./SideNav";
import Footer from "./Footer";

function ContentLayout() {
    return (
        <>
            <Header />
            <div id="layoutSidenav">
                <SideNav />
                <div id="layoutSidenav_content">
                    <Outlet />
                    {/* <Footer /> */}
                </div>
            </div> 
        </>
    );
}

export default ContentLayout;