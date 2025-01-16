import {Navigate, useLocation} from "react-router-dom";

// 몇개의 url요청시 분기처리를 하기 위한 모듈
function PrivateRouter() {
    return <Navigate replace to="/login" />
}

export default PrivateRouter;