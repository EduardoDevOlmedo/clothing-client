import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AddPrendaPage from "./pages/AddPrendaPage.jsx";
import Summarize from "./pages/Summarize.jsx";
import { isAuthed } from "./auth.js";

function Protected({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />
      <Route
        path="/nueva-prenda"
        element={
          <Protected>
            <AddPrendaPage />
          </Protected>
        }
      />
      <Route
        path="/resumen"
        element={
          <Protected>
            <Summarize />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
