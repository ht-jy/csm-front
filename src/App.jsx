import { Routes, Route, useLocation } from "react-router-dom";
import Login from './component/layout/login/Login';
import PrivateRoute from "./component/layout/PrivateRoute";
import Temp from "./component/layout/content/Temp";

// 라우팅 모듈
// /login을 제외한 요청은 PrivateRouter을 통하여 처리됨
function App() {
  const location = useLocation();

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route exact path="/" element={<PrivateRoute />} >
          <Route path="/temp" element={<Temp />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
