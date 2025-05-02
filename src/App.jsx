import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./component/context/AuthContext";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Login from './component/layout/login/Login';
import PrivateRoute from "./component/layout/PrivateRoute";
import Temp from "./component/layout/content/Temp";
import Site from "./component/layout/content/management/site/Site";
import SiteBase from "./component/layout/content/management/worker/SiteBase";
import Total from "./component/layout/content/management/worker/total";
import Equip from "./component/layout/content/management/equip/Equip";
import Device from "./component/layout/content/management/device/Device";
import Company from "./component/layout/content/management/company/Company";
import Wage from "./component/layout/content/management/wage/Wage";
import Schedule from "./component/layout/content/management/schedule/Schedule";
import Notice from "./component/layout/content/management/notice/Notice";
import Code from "./component/layout/content/management/code/Code";
import RetireDeduction from "./component/layout/content/management/retire/RetireDeduction";
import ErrorBoundary from "./component/error/ErrorBoundary";
import ErrorPage from "./component/error/ErrorPage";
import NotFound from "./component/error/NotFound";
import "./assets/css/Tooltip.css";

// 라우팅 모듈
// /login을 제외한 요청은 PrivateRouter을 통하여 처리됨
function App() {

    return (
        <div className="App">
            <AuthProvider>
                {/* <ErrorBoundary> */}
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/error" element={<ErrorPage />} />
                        <Route exact path="/" element={<PrivateRoute />} >
                            {/* 기본경로 */}
                            <Route index element={<Navigate to="/site" replace />} />
                            <Route path="/temp" element={<Temp />} />
                            <Route path="/site" element={<Site />} />
                            <Route path="/site-base" element={<SiteBase />} />
                            <Route path="/total" element={<Total />} />
                            <Route path="/equip" element={<Equip />} />
                            <Route path="/device" element={<Device />} />
                            <Route path="/company" element={<Company />} />
                            <Route path="/wage" element={<Wage />} />
                            <Route path="/schedule" element={<Schedule />} />
                            <Route path="/notice" element={<Notice />} />
                            <Route path="/code" element={<Code />} />
                            <Route path="/retire" element={<RetireDeduction />} />
                        </Route>
                        {/* 잘못된 경로 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                {/* </ErrorBoundary> */}
            </AuthProvider>
            {/* 툴팁 전역 설정 */}
            <ReactTooltip id="highlightTooltip" delayShow={0} positionStrategy="fixed" style={{ zIndex: 99999 }}/>
        </div>
    );
}

export default App;
