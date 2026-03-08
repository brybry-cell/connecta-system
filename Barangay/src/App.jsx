import Dashboard from "./pages/Dashboard";
import News from "./pages/News";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SystemSettings from "./pages/SystemSettings";
import User from "./pages/User";
import Login from "./pages/Login"
import {HashRouter as Router, Routes, Route} from "react-router-dom";

function App() {
  return(
    <Router>
      <Routes>
        <Route path="/?" element={<Login />}/>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/news" element={<News />}/>
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />}/>
        <Route path="/systemsettings" element={<SystemSettings />}/>
        <Route path="/Users" element={<User />}/>


      </Routes>
    </Router>
  )
}

export default App;