import {
  Card,
  // CardAction,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useState, useEffect } from "react";
// import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Lock, User, Mail } from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { register } from "module";
import { jwtDecode } from "jwt-decode";

export default function Signup() {
  
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token){
      navigate("/home")
    }
  }, [navigate]);

  async function verify_login(){

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login" , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if(!response.ok) {
        throw new Error('HTTP error! status: ${response.status}');
      }

      const responseData = await response.json();
      console.log('Success: ', responseData);

      const decodedToken: any = jwtDecode(responseData.access_token);
      console.log('Decoded Token: ', decodedToken);
      localStorage.setItem("sub", decodedToken.sub);
      localStorage.setItem("token", responseData.access_token);

      navigate("/home")
    } catch (error) {
      console.error('Error: ', error)
      toast.error("Invalid username or password");

    } finally {
      setIsLoading(false);
    }
  }

  async function register_account(e: React.MouseEvent<HTMLButtonElement>){
    e.preventDefault()
    if (!username || !password || !email) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register" , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
          email: email,
          fullname: "",
        })
      });

      if(!response.ok) {
        throw new Error('HTTP error! status: ${response.status}');
      }

      const responseData = await response.json();
      console.log('Success: ', responseData);
      
      verify_login()

    } catch (error) {
      console.error('Error: ', error)
      toast.error("Invalid username or password");

    } finally {
      setIsLoading(false);
    }

  }

  return (
    <motion.div
      className="w-screen h-screen flex items-center justify-center"
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }}      
      exit={{ opacity: 0, y: -30 }}      
      transition={{ duration: 0.2, ease: "easeInOut" }} 
    >
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="w-7/10 min-w-5xl h-[500px] flex overflow-hidden border rounded-xl">
          <div className="w-7/10 h-[500px] relative overflow-hidden rounded-l-xl rounded-r-none">
            <img
              src="/slideshow1.png"
              alt="Slideshow"
              className="object-cover w-full h-full blur-[4px]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h2 className="text-black text-3xl font-bold drop-shadow-lg text-center px-4">
                Join FEMspice and start your journey!
              </h2>
            </div>
          </div>

          <Card className="w-3/10 h-[500px] flex overflow-hidden rounded-r-xl rounded-l-none border-none">
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
                      value= {username}
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
                      value= {email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      required
                      className="w-full pl-10 pr-3 py-2"
                      value= {password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </form>
            </CardContent>

            <CardFooter>
              <div className="flex w-full flex-col gap-2">
                <Button type="submit" className="w-full" onClick={register_account} disabled={isLoading}>
                  Sign Up
                </Button>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs text-gray-400">Already have an account?</p>
                  <Link
                    to="/"
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