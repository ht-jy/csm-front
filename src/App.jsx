import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./component/context/AuthContext";
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
import Calender from "./component/layout/content/management/calender/Calender";
import Notice from "./component/layout/content/management/notice/Notice";
import Code from "./component/layout/content/management/code/Code";

// 라우팅 모듈
// /login을 제외한 요청은 PrivateRouter을 통하여 처리됨
function App() {

  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route exact path="/" element={<PrivateRoute />} >
            <Route path="/temp" element={<Temp />} />
            <Route path="/site" element={<Site />} />
            <Route path="/site-base" element={<SiteBase />} />
            <Route path="/total" element={<Total />} />
            <Route path="/equip" element={<Equip />} />
            <Route path="/device" element={<Device />} />
            <Route path="/company" element={<Company />} />
            <Route path="/wage" element={<Wage />} />
            <Route path="/calender" element={<Calender />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/code" element={<Code />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
