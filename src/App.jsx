import { Routes, Route } from "react-router-dom";
import Login from './component/layout/login/Login';
import PrivateRoute from "./component/layout/PrivateRoute";
import Temp from "./component/layout/content/Temp";
import Site from "./component/layout/content/management/site/Site";
import SiteBase from "./component/layout/content/management/worker/SiteBase"
import Total from "./component/layout/content/management/worker/total"
import Device from "./component/layout/content/management/device/Device";
import { AuthProvider } from "./component/context/AuthContext";

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
            <Route path="/device" element={<Device />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
