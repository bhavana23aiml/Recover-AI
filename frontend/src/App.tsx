import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import RecoveryAgent from "./pages/RecoveryAgent";
import Activity from "./pages/Activity";
import Guardrails from "./pages/Guardrails";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

import ProtectedRoute from "./components/auth/ProtectedRoute";


export default function App() {
  return (
    <Routes>

      {/* =============================== */}
      {/* PUBLIC AUTH ROUTES              */}
      {/* =============================== */}

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =============================== */}
      {/* PROTECTED RECOVERAI ROUTES      */}
      {/* =============================== */}

      <Route element={<ProtectedRoute />}>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/transactions"
          element={<Transactions />}
        />

        <Route
          path="/recovery-agent"
          element={<RecoveryAgent />}
        />

        <Route
          path="/activity"
          element={<Activity />}
        />

        <Route
          path="/guardrails"
          element={<Guardrails />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Route>


      {/* =============================== */}
      {/* FALLBACK                        */}
      {/* =============================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}