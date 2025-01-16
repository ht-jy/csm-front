import { Outlet } from "react-router-dom";

// react-router-dom의 Outlet을 이용하여 요청한 페이지를 일정 부분만 렌더링 할 수 있도록 함
// App.js의 <Route path="/" element={<PrivateRouter />} > 내부에 있는 path를 호출시 PrivateRouter를 통하여 Outlet부분으로 랜더링 됨
const Layout = () => {

    return (
        <></>
    );
}

export default Layout;