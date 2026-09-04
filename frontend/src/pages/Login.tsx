import {
  useState,
} from "react";

import type {
  FormEvent,
  ReactNode,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../lib/supabase";


export default function Login() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    rememberMe,
    setRememberMe,
  ] = useState(false);

  const [
    signingIn,
    setSigningIn,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    notice,
    setNotice,
  ] = useState("");


  // =======================================================
  // LOGIN
  // =======================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (signingIn) {
      return;
    }

    setError("");
    setNotice("");

    if (
      !email.trim() ||
      !password
    ) {
      setError(
        "Enter your email and password.",
      );

      return;
    }

    try {
      setSigningIn(true);

      const {
        data,
        error:
          signInError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email:
              email
                .trim()
                .toLowerCase(),

            password,
          },
        );

      if (signInError) {
        setError(
          signInError.message,
        );

        return;
      }

      if (
        !data.user ||
        !data.session
      ) {
        setError(
          "Unable to start your RecoverAI session.",
        );

        return;
      }

      setNotice(
        "Signed in successfully. Opening RecoverAI...",
      );

      window.setTimeout(
        () => {
          navigate(
            "/",
            {
              replace: true,
            },
          );
        },
        650,
      );
    } catch (err) {
      console.error(
        "RecoverAI login error:",
        err,
      );

      setError(
        "Unable to sign in. Please try again.",
      );
    } finally {
      setSigningIn(false);
    }
  }


  return (
    <main className="signup-page">

      <div
        className="signup-grid-background"
        aria-hidden="true"
      />


      <motion.div
        className="signup-glow signup-glow-one"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [
            1,
            1.08,
            1,
          ],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />


      <motion.div
        className="signup-glow signup-glow-two"
        animate={{
          x: [
            0,
            -30,
            0,
          ],

          y: [
            0,
            25,
            0,
          ],

          scale: [
            1,
            1.1,
            1,
          ],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />


      <div className="signup-shell">

        <motion.div
          className="signup-unified-panel"
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,

            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
        >

          {/* ============================================= */}
          {/* VIDEO                                         */}
          {/* ============================================= */}

          <section className="signup-visual-panel signup-video-panel">

            <motion.div
              className="signup-video-container"
              initial={{
                opacity: 0,
                scale: 1.02,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.1,
                duration: 1,
              }}
            >

              <div className="signup-video-shell">

                <video
                  className="signup-recoverai-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                >
                  <source
                    src="/recoverai-recovery.mp4"
                    type="video/mp4"
                  />
                </video>


                <div
                  className="signup-video-inner-border"
                  aria-hidden="true"
                />

              </div>

            </motion.div>


            <motion.div
              className="signup-video-trust"
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.7,
              }}
            >

              <div>
                <span className="signup-trust-dot" />

                Deterministic recovery
              </div>


              <div>
                <ShieldCheck
                  size={12}
                />

                Guardrail protected
              </div>


              <div>
                <LockKeyhole
                  size={12}
                />

                Auditable execution
              </div>

            </motion.div>

          </section>


          {/* ============================================= */}
          {/* LOGIN FORM                                    */}
          {/* ============================================= */}

          <motion.section
            className="signup-form-side"
            initial={{
              opacity: 0,
              x: 30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.25,
              duration: 0.72,

              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
          >

            <div className="signup-form-card signup-card">

              <div className="signup-form-top">

                <motion.div
                  className="signup-form-icon"
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.45,
                    type: "spring",
                    stiffness: 180,
                    damping: 18,
                  }}
                >
                  <ShieldCheck
                    size={18}
                  />
                </motion.div>


                <h2>
                  Welcome back
                </h2>


                <p>
                  Sign in to continue to
                  your RecoverAI revenue
                  recovery workspace.
                </p>

              </div>


              <form
                className="signup-form"
                onSubmit={
                  handleSubmit
                }
              >

                {/* EMAIL */}

                <FormField
                  label="Work email"
                  icon={
                    <Mail
                      size={15}
                    />
                  }
                >

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={
                      signingIn
                    }
                  />

                </FormField>


                {/* PASSWORD */}

                <FormField
                  label="Password"
                  icon={
                    <LockKeyhole
                      size={15}
                    />
                  }
                >

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={
                      signingIn
                    }
                  />


                  <button
                    type="button"
                    className="signup-password-toggle"
                    disabled={
                      signingIn
                    }
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff
                        size={15}
                      />
                    ) : (
                      <Eye
                        size={15}
                      />
                    )}
                  </button>

                </FormField>


                {/* OPTIONS */}

                <div className="login-options">

                  <label className="signup-checkbox-row">

                    <input
                      type="checkbox"
                      checked={
                        rememberMe
                      }
                      disabled={
                        signingIn
                      }
                      onChange={(
                        event,
                      ) =>
                        setRememberMe(
                          event.target.checked,
                        )
                      }
                    />


                    <span className="signup-custom-checkbox">

                      {rememberMe && (
                        <Check
                          size={11}
                        />
                      )}

                    </span>


                    <span>
                      Remember me
                    </span>

                  </label>


                  <button
                    type="button"
                    className="login-forgot"
                  >
                    Forgot password?
                  </button>

                </div>


                {/* MESSAGES */}

                <AnimatePresence
                  mode="wait"
                >

                  {error && (

                    <motion.div
                      key="error"
                      className="signup-message signup-message-error"
                      initial={{
                        opacity: 0,
                        y: -6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                    >
                      {error}
                    </motion.div>

                  )}


                  {notice && (

                    <motion.div
                      key="notice"
                      className="signup-message signup-message-info"
                      initial={{
                        opacity: 0,
                        y: -6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                    >
                      {notice}
                    </motion.div>

                  )}

                </AnimatePresence>


                {/* SIGN IN */}

                <motion.button
                  type="submit"
                  className="signup-submit"
                  disabled={
                    signingIn
                  }
                  whileHover={
                    signingIn
                      ? undefined
                      : {
                          y: -2,
                          scale: 1.005,
                        }
                  }
                  whileTap={
                    signingIn
                      ? undefined
                      : {
                          scale: 0.985,
                        }
                  }
                  style={{
                    opacity:
                      signingIn
                        ? 0.78
                        : 1,

                    cursor:
                      signingIn
                        ? "wait"
                        : "pointer",
                  }}
                >

                  <span>
                    {signingIn
                      ? "Signing in..."
                      : "Sign in"}
                  </span>


                  {signingIn ? (

                    <motion.span
                      className="signup-submit-arrow"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <LoaderCircle
                        size={16}
                      />
                    </motion.span>

                  ) : (

                    <motion.span
                      className="signup-submit-arrow"
                      animate={{
                        x: [
                          0,
                          4,
                          0,
                        ],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight
                        size={16}
                      />
                    </motion.span>

                  )}

                </motion.button>

              </form>


              {/* CREATE ACCOUNT */}

              <div className="login-signup-link">

                New to RecoverAI?{" "}

                <Link to="/signup">
                  Create account
                </Link>

              </div>


              <div className="signup-form-footer">

                <ShieldCheck
                  size={12}
                />

                Protected by RecoverAI
                security boundaries

              </div>

            </div>

          </motion.section>

        </motion.div>

      </div>

    </main>
  );
}


// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="signup-field">

      <span className="signup-field-label">
        {label}
      </span>


      <div className="signup-input-shell">

        <span className="signup-input-icon">
          {icon}
        </span>

        {children}

      </div>

    </label>
  );
}