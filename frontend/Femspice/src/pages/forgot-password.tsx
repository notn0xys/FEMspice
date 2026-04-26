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
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const response = await fetch(apiUrl("/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not send reset email");
      }
      setSubmitted(true);
      toast.success("If that email is registered, a reset link is on its way.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
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
            <CardTitle>Forgot password</CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <p className="text-sm text-gray-500">
                If an account exists for <span className="font-medium">{email}</span>,
                you'll receive a reset link shortly. The link expires in 30 minutes.
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  Enter your account email and we'll send you a link to reset your password.
                </p>
                <form className="flex flex-col gap-4">
                  <div className="relative w-full">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-3 py-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </form>
              </>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col gap-3">
              {!submitted && (
                <Button
                  type="submit"
                  className="w-full"
                  onClick={submit}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset link"}
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
