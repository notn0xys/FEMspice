import PageNav from "@/components/page-nav";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Lock, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { apiUrl } from "@/lib/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  async function verify_login(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!username || !password) return;
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      persistTokenAndGoHome(responseData.access_token);
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Invalid username or password");
    } finally {
      setIsLoading(false);
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
        <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border bg-card shadow-sm md:h-[540px] md:flex-row">
          <div className="relative hidden h-full flex-1 overflow-hidden md:block">
            <img
              src="/slideshow1.png"
              alt="Slideshow"
              className="h-full w-full object-cover blur-[4px]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-black text-3xl font-bold drop-shadow-lg text-center px-4">
                Start your project with FEMspice
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
              <h2 className="text-xl font-bold">Welcome Back!</h2>
              <p className="text-sm text-gray-400">Login to your account</p>
              <form className="flex flex-col gap-4">
                <div className="grid gap-2 mt-6">
                  <div className="relative w-full">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="user"
                      type="text"
                      placeholder="username"
                      required
                      className="w-full pl-10 pr-3 py-2"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="password"
                      required
                      className="w-full pl-10 pr-3 py-2"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs underline-offset-4 hover:underline text-gray-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <div className="flex w-full flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  onClick={verify_login}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Login"}
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
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs text-gray-400">Don't have an account?</p>
                  <Link
                    to="/signup"
                    className="text-xs text-blue-600 underline hover:text-blue-1000"
                  >
                    <u>Signup</u>
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
