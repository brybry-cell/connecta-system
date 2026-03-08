import Login from './pages/login';
import Forgotpassword from './pages/forgotpassword';
import Dashboard from './pages/dashboard';
import Signup from './pages/signup';
import Settings from './pages/settings';
import Reports from './pages/report';
import History from './pages/history';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (
   <Router>
    <Routes>
      <Route path="?" element={<Login />} />
      <Route path="/forgotpassword" element={<Forgotpassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/report" element={<Reports />} />
      <Route path="/history" element={<History />} />

    </Routes>
   </Router>
  )
}

export default App
