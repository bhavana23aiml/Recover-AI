import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  supabase,
} from "../../lib/supabase";


type AuthState =
  | "loading"
  | "authenticated"
  | "guest";


export default function ProtectedRoute() {
  const location =
    useLocation();

  const [
    authState,
    setAuthState,
  ] =
    useState<AuthState>(
      "loading",
    );


  useEffect(() => {
    let active = true;


    async function checkSession() {
      const {
        data,
        error,
      } =
        await supabase.auth.getSession();


      if (!active) {
        return;
      }


      if (
        error ||
        !data.session
      ) {
        setAuthState(
          "guest",
        );

        return;
      }


      setAuthState(
        "authenticated",
      );
    }


    checkSession();


    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session,
        ) => {
          if (!active) {
            return;
          }


          setAuthState(
            session
              ? "authenticated"
              : "guest",
          );
        },
      );


    return () => {
      active = false;

      authListener.subscription.unsubscribe();
    };
  }, []);


  if (
    authState ===
    "loading"
  ) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-mark">
          R
        </div>

        <div>
          Securing RecoverAI...
        </div>
      </div>
    );
  }


  if (
    authState === "guest"
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  return <Outlet />;
}