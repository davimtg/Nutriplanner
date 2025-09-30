import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import Login from "./pages/Login/Login";
import Registrar from "./pages/Registrar/Registrar";
import Compras from "./pages/Compras/Compras";

function AppContent() {
  const location = useLocation();

  const hideHeaderRoutes = ["/", "/login", "/registrar", "/compras"];
  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        <Route path="/compras" element={<Compras />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;