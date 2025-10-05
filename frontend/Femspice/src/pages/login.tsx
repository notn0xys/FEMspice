import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Lock } from "lucide-react"
import { User } from "lucide-react"
import { Link } from 'react-router-dom'
import { motion } from "framer-motion";


export default function Login() {
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
                className="object-cover w-full h-full blur-[4px] "
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-black text-3xl font-bold drop-shadow-lg text-center px-4">
                  Start your project with FEMspice
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
                    className="w-full pl-10 pr-3 py-2 "
                  />
                </div>
                <div className="relative w-full">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    id="password"
                    type="password"
                    placeholder="password"
                    required
                    className="w-full pl-10 pr-3 py-2 "
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                <p className="text-xs text-gray-400">Remember me?</p>
                <a
                    href="https://www.youtube.com/watch?v=npyiiInMA0w&list=RDlbvpP-CEwhk&index=3"
                    className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                
              </div>
              </form>
          </CardContent>
          <CardFooter>
              <div className="flex w-full flex-col gap-2">
                <Button type="submit" className="w-full">Login</Button>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs text-gray-400">
                    Don't have an account? 
                  </p>
                  <Link
                    to="/singup"
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
    </motion.div>
  );
}
