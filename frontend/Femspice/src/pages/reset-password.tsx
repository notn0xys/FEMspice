import PageNav from "@/components/page-nav";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Lock } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/auth/reset-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not reset password");
      }
      setDone(true);
      toast.success("Password updated. You can sign in now.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      toast.error(err.message || "Reset failed");
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
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Choose a new password</CardTitle>
          </CardHeader>
          <CardContent>
            {!token ? (
              <p className="text-sm text-red-500">
                This reset link is missing a token. Request a new one from the
                <Link to="/forgot-password" className="text-blue-600 underline ml-1">
                  forgot password
                </Link>{" "}
                page.
              </p>
            ) : done ? (
              <p className="text-sm text-gray-500">
                Password updated. Redirecting to login...
              </p>
            ) : (
              <form className="flex flex-col gap-4">
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="New password (min 8 chars)"
                    required
                    className="w-full pl-10 pr-3 py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    className="w-full pl-10 pr-3 py-2"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col gap-3">
              {token && !done && (
                <Button
                  type="submit"
                  className="w-full"
                  onClick={submit}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update password"}
                </Button>
              )}
              <div className="flex items-center justify-center gap-2">
                <Link to="/login" className="text-xs text-blue-600 underline">
                  Back to login
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </motion.div>
  );
}
