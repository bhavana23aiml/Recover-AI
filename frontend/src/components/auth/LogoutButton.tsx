import {
  useState,
} from "react";

import {
  LogOut,
  LoaderCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../../lib/supabase";


export default function LogoutButton() {
  const navigate =
    useNavigate();

  const [
    signingOut,
    setSigningOut,
  ] = useState(false);


  async function handleLogout() {
    if (signingOut) {
      return;
    }

    try {
      setSigningOut(true);

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "RecoverAI logout error:",
          error,
        );

        return;
      }

      navigate(
        "/login",
        {
          replace: true,
        },
      );
    } finally {
      setSigningOut(false);
    }
  }


  return (
    <button
      type="button"
      className="sidebar-logout"
      onClick={
        handleLogout
      }
      disabled={
        signingOut
      }
    >
      {signingOut ? (
        <LoaderCircle
          size={16}
          className="sidebar-logout-spinner"
        />
      ) : (
        <LogOut
          size={16}
        />
      )}

      <span>
        {signingOut
          ? "Signing out..."
          : "Sign out"}
      </span>
    </button>
  );
}