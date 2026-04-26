import PageNav from "@/components/page-nav";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Lock, User, Mail, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { apiUrl } from "@/lib/api";

type Step = "details" | "verify";

export default function Signup() {
  const [step, setStep] = useState<Step>("details");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home");
  }, [navigate]);

  function persistTokenAndGoHome(accessToken: string) {
    const decoded: any = jwtDecode(accessToken);
    localStorage.setItem("sub", decoded.sub);
    localStorage.setItem("token", accessToken);
    navigate("/home");
  }

  async function startRegister(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!username || !password || !email) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/auth/register/start"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, full_name: "" }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || `Sign up failed (${response.status})`);
      }

      toast.success("We sent a verification code to your email");
      setStep("verify");
    } catch (err: any) {
      toast.error(err.message || "Could not start sign up");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!code || code.length < 4) {
      toast.error("Enter the code from your email");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/auth/register/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid code");
      }
      const data = await response.json();
      persistTokenAndGoHome(data.access_token);
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCode() {
    if (!email) return;
    try {
      const response = await fetch(apiUrl("/auth/register/resend"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not resend code");
      }
      toast.success("Code resent");
    } catch (err: any) {
      toast.error(err.message || "Could not resend code");
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      toast.error("Google sign-in did not return a credential");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/auth/google"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Google sign-in failed");
      }
      const data = await response.json();
      persistTokenAndGoHome(data.access_token);
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      className="min-h-screen w-full bg-background flex flex-col"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <PageNav />
      <div className="flex w-full flex-1 items-center justify-center px-6 pb-12">
        <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-card shadow-sm md:h-[560px] md:flex-row">
          <div className="relative hidden h-full flex-1 overflow-hidden md:block">
            <img
              src="/slideshow1.png"
              alt="Slideshow"
              className="h-full w-full object-cover blur-[4px]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-black text-3xl font-bold drop-shadow-lg text-center px-4">
                Join FEMspice and start your journey!
              </h2>
            </div>
          </div>

          <Card className="flex w-full max-w-md flex-1 flex-col justify-between border-0 bg-card md:h-full md:max-w-sm md:rounded-none">
            <CardHeader>
              <CardTitle className="flex justify-center">
                <img
                  src="/FEMSpicelogoDark.png"
                  alt="FEMspice Logo Dark"
                  className="w-32 h-auto block dark:hidden"
                />
                <img
                  src="/FEMSpicelogoLight.png"
                  alt="FEMspice Logo Light"
                  className="w-32 h-auto hidden dark:block"
                />
              </CardTitle>
            </CardHeader>

            <CardContent>
              {step === "details" ? (
                <>
                  <h2 className="text-xl font-bold">Create an Account</h2>
                  <p className="text-sm text-gray-400">
                    Sign up with your details below
                  </p>

                  <form className="flex flex-col gap-4">
                    <div className="grid gap-2 mt-6">
                      <div className="relative w-full">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="Username"
                          required
                          className="w-full pl-10 pr-3 py-2"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>

                      <div className="relative w-full">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Example@gmail.com"
                          required
                          className="w-full pl-10 pr-3 py-2"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="relative w-full">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Password (min 8 chars)"
                          required
                          className="w-full pl-10 pr-3 py-2"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold">Verify your email</h2>
                  <p className="text-sm text-gray-400">
                    We sent a 6-digit code to <span className="font-medium">{email}</span>.
                    It expires in 10 minutes.
                  </p>
                  <form className="flex flex-col gap-4">
                    <div className="grid gap-2 mt-6">
                      <div className="relative w-full">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          placeholder="123456"
                          required
                          className="w-full pl-10 pr-3 py-2 tracking-[6px] text-center"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resendCode}
                      className="text-xs text-blue-600 underline self-start"
                    >
                      Didn't get it? Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="text-xs text-gray-500 underline self-start"
                    >
                      Use a different email
                    </button>
                  </form>
                </>
              )}
            </CardContent>

            <CardFooter>
              <div className="flex w-full flex-col gap-3">
                {step === "details" ? (
                  <>
                    <Button
                      type="submit"
                      className="w-full"
                      onClick={startRegister}
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending code..." : "Sign Up"}
                    </Button>
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-gray-400">or</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => toast.error("Google sign-in failed")}
                        useOneTap={false}
                      />
                    </div>
                  </>
                ) : (
                  <Button
                    type="submit"
                    className="w-full"
                    onClick={verifyCode}
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Create Account"}
                  </Button>
                )}
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs text-gray-400">Already have an account?</p>
                  <Link
                    to="/login"
                    className="text-xs text-blue-600 underline hover:text-blue-1000"
                  >
                    <u>Login</u>
                  </Link>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}
