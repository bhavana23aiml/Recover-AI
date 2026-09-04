import {
  useMemo,
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
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../lib/supabase";


export default function Signup() {
  const navigate =
    useNavigate();


  // =======================================================
  // FORM STATE
  // =======================================================

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [
    creatingAccount,
    setCreatingAccount,
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
  // PASSWORD STRENGTH
  // =======================================================

  const passwordStrength =
    useMemo(() => {
      let score = 0;

      if (
        password.length >= 8
      ) {
        score += 1;
      }

      if (
        /[A-Z]/.test(password)
      ) {
        score += 1;
      }

      if (
        /[0-9]/.test(password)
      ) {
        score += 1;
      }

      if (
        /[^A-Za-z0-9]/.test(
          password,
        )
      ) {
        score += 1;
      }

      return score;
    }, [password]);


  // =======================================================
  // SIGNUP
  // =======================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (creatingAccount) {
      return;
    }

    setError("");
    setNotice("");


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Complete all required fields.",
      );

      return;
    }


    if (
      password.length < 8
    ) {
      setError(
        "Password must contain at least 8 characters.",
      );

      return;
    }


    if (
      password !==
      confirmPassword
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }


    if (!acceptedTerms) {
      setError(
        "Accept the terms to continue.",
      );

      return;
    }


    // -----------------------------------------------------
    // SUPABASE SIGNUP
    // -----------------------------------------------------

    try {
      setCreatingAccount(
        true,
      );


      const {
        data,
        error:
          signUpError,
      } =
        await supabase.auth.signUp(
          {
            email:
              email
                .trim()
                .toLowerCase(),

            password,

            options: {
              data: {
                full_name:
                  fullName.trim(),
              },
            },
          },
        );


      if (signUpError) {
        setError(
          signUpError.message,
        );

        return;
      }


      if (!data.user) {
        setError(
          "Account could not be created.",
        );

        return;
      }


      // ---------------------------------------------------
      // CONFIRM EMAIL OFF
      // ---------------------------------------------------

      if (data.session) {
        setNotice(
          "Account created successfully. Opening RecoverAI...",
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
          700,
        );

        return;
      }


      // ---------------------------------------------------
      // FALLBACK IF EMAIL CONFIRMATION IS EVER ENABLED
      // ---------------------------------------------------

      setNotice(
        "Account created. Check your email to confirm your account, then sign in.",
      );
    } catch (err) {
      console.error(
        "RecoverAI signup error:",
        err,
      );


      setError(
        "Unable to create your account. Please try again.",
      );
    } finally {
      setCreatingAccount(
        false,
      );
    }
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <main className="signup-page">

      {/* ================================================= */}
      {/* BACKGROUND                                        */}
      {/* ================================================= */}

      <div
        className="signup-grid-background"
        aria-hidden="true"
      />


      <motion.div
        className="signup-glow signup-glow-one"
        animate={{
          x: [
            0,
            30,
            0,
          ],

          y: [
            0,
            -20,
            0,
          ],

          scale: [
            1,
            1.08,
            1,
          ],
        }}
        transition={{
          duration: 11,

          repeat:
            Infinity,

          ease:
            "easeInOut",
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

          repeat:
            Infinity,

          ease:
            "easeInOut",
        }}
        aria-hidden="true"
      />


      {/* ================================================= */}
      {/* UNIFIED SIGNUP PANEL                              */}
      {/* ================================================= */}

      <div className="signup-shell">

        <motion.div
          className="signup-unified-panel"
          initial={{
            opacity: 0,

            y: 20,

            scale:
              0.985,
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
          {/* LEFT — RECOVERAI VIDEO                        */}
          {/* ============================================= */}

          <section className="signup-visual-panel signup-video-panel">

            <motion.div
              className="signup-video-container"
              initial={{
                opacity: 0,

                scale:
                  1.02,
              }}
              animate={{
                opacity: 1,

                scale: 1,
              }}
              transition={{
                delay: 0.1,

                duration: 1,

                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
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


            {/* TRUST INDICATORS */}

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
                delay: 0.75,

                duration: 0.6,
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
          {/* RIGHT — CREATE ACCOUNT                        */}
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

              duration:
                0.72,

              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
          >

            <div className="signup-form-card signup-card">

              {/* ========================================= */}
              {/* FORM HEADER                               */}
              {/* ========================================= */}

              <div className="signup-form-top">

                <motion.div
                  className="signup-form-icon"
                  initial={{
                    opacity: 0,

                    scale:
                      0.8,
                  }}
                  animate={{
                    opacity: 1,

                    scale: 1,
                  }}
                  transition={{
                    delay: 0.5,

                    type:
                      "spring",

                    stiffness:
                      180,

                    damping:
                      18,
                  }}
                >
                  <ShieldCheck
                    size={18}
                  />
                </motion.div>


                <motion.h2
                  initial={{
                    opacity: 0,

                    y: 10,
                  }}
                  animate={{
                    opacity: 1,

                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.36,

                    duration:
                      0.5,
                  }}
                >
                  Create your account
                </motion.h2>


                <motion.p
                  initial={{
                    opacity: 0,

                    y: 8,
                  }}
                  animate={{
                    opacity: 1,

                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.42,

                    duration:
                      0.5,
                  }}
                >
                  Start building safer,
                  explainable payment
                  recovery workflows.
                </motion.p>

              </div>


              {/* ========================================= */}
              {/* FORM                                      */}
              {/* ========================================= */}

              <form
                className="signup-form"
                onSubmit={
                  handleSubmit
                }
              >

                {/* FULL NAME */}

                <FormField
                  label="Full name"
                  icon={
                    <UserRound
                      size={15}
                    />
                  }
                >

                  <input
                    type="text"
                    value={
                      fullName
                    }
                    onChange={(
                      event,
                    ) =>
                      setFullName(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Your name"
                    autoComplete="name"
                    disabled={
                      creatingAccount
                    }
                  />

                </FormField>


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
                        event.target
                          .value,
                      )
                    }
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={
                      creatingAccount
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
                        event.target
                          .value,
                      )
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    disabled={
                      creatingAccount
                    }
                  />


                  <button
                    type="button"
                    className="signup-password-toggle"
                    disabled={
                      creatingAccount
                    }
                    onClick={() =>
                      setShowPassword(
                        (
                          current,
                        ) =>
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


                {/* PASSWORD STRENGTH */}

                <AnimatePresence>

                  {password.length >
                    0 && (

                    <motion.div
                      className="signup-password-strength"
                      initial={{
                        opacity: 0,

                        height: 0,

                        y: -4,
                      }}
                      animate={{
                        opacity: 1,

                        height:
                          "auto",

                        y: 0,
                      }}
                      exit={{
                        opacity: 0,

                        height: 0,
                      }}
                    >

                      <div className="signup-strength-bars">

                        {[1, 2, 3, 4].map(
                          (
                            level,
                          ) => (

                            <motion.span
                              key={
                                level
                              }
                              animate={{
                                opacity:
                                  level <=
                                  passwordStrength
                                    ? 1
                                    : 0.18,

                                scaleX:
                                  level <=
                                  passwordStrength
                                    ? 1
                                    : 0.92,
                              }}
                            />

                          ),
                        )}

                      </div>


                      <span>

                        {passwordStrength <=
                        1
                          ? "Weak"
                          : passwordStrength ===
                              2
                            ? "Fair"
                            : passwordStrength ===
                                3
                              ? "Strong"
                              : "Excellent"}

                      </span>

                    </motion.div>

                  )}

                </AnimatePresence>


                {/* CONFIRM PASSWORD */}

                <FormField
                  label="Confirm password"
                  icon={
                    <ShieldCheck
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
                      confirmPassword
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmPassword(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    disabled={
                      creatingAccount
                    }
                  />

                </FormField>


                {/* TERMS */}

                <label className="signup-checkbox-row">

                  <input
                    type="checkbox"
                    checked={
                      acceptedTerms
                    }
                    disabled={
                      creatingAccount
                    }
                    onChange={(
                      event,
                    ) =>
                      setAcceptedTerms(
                        event.target
                          .checked,
                      )
                    }
                  />


                  <span className="signup-custom-checkbox">

                    {acceptedTerms && (
                      <Check
                        size={11}
                      />
                    )}

                  </span>


                  <span>
                    I agree to the{" "}

                    <strong>
                      Terms
                    </strong>

                    {" "}and{" "}

                    <strong>
                      Privacy Policy
                    </strong>
                  </span>

                </label>


                {/* ======================================= */}
                {/* ERROR / SUCCESS                         */}
                {/* ======================================= */}

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

                        y: -4,
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

                        y: -4,
                      }}
                    >
                      {notice}
                    </motion.div>

                  )}

                </AnimatePresence>


                {/* ======================================= */}
                {/* CREATE ACCOUNT                          */}
                {/* ======================================= */}

                <motion.button
                  type="submit"
                  className="signup-submit"
                  disabled={
                    creatingAccount
                  }
                  whileHover={
                    creatingAccount
                      ? undefined
                      : {
                          y: -2,

                          scale:
                            1.005,
                        }
                  }
                  whileTap={
                    creatingAccount
                      ? undefined
                      : {
                          scale:
                            0.985,
                        }
                  }
                  style={{
                    opacity:
                      creatingAccount
                        ? 0.78
                        : 1,

                    cursor:
                      creatingAccount
                        ? "wait"
                        : "pointer",
                  }}
                >

                  <span>

                    {creatingAccount
                      ? "Creating account..."
                      : "Create account"}

                  </span>


                  {creatingAccount ? (

                    <motion.span
                      className="signup-submit-arrow"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration:
                          0.9,

                        repeat:
                          Infinity,

                        ease:
                          "linear",
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
                        duration:
                          1.8,

                        repeat:
                          Infinity,

                        ease:
                          "easeInOut",
                      }}
                    >
                      <ArrowRight
                        size={16}
                      />
                    </motion.span>

                  )}

                </motion.button>

              </form>


              {/* ========================================= */}
              {/* LOGIN LINK                                */}
              {/* ========================================= */}

              <div className="signup-login-link">

                Already have an
                account?{" "}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/login",
                    )
                  }
                >
                  Sign in
                </button>

              </div>


              {/* ========================================= */}
              {/* SECURITY FOOTER                           */}
              {/* ========================================= */}

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