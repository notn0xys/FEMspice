import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login  from './pages/login'
import About from './pages/about'
import MainPage from './pages/mainpage'
import Signup from './pages/signup'
import Profile from './pages/profile'
import { useEffect } from 'react';
import PublicRoute from './routes/PublicRoute';
import UserRoute from './routes/UserRoute'
import { Toaster } from '@/components/ui/sonner';
function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div>
      <Routes>
        <Route path='/' element = {<PublicRoute><Login/></PublicRoute>}/>
        <Route path='/login' element = {<PublicRoute><Login/></PublicRoute>}/>
        <Route path='/about' element = {<PublicRoute><About/></PublicRoute>}/>
        <Route path='/home' element = {<UserRoute><MainPage/></UserRoute>}/>
        <Route path='/signup' element = {<PublicRoute><Signup/></PublicRoute>}/>
        <Route path='/profile' element = {<PublicRoute><Profile/></PublicRoute>}/>
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}

export default App;
