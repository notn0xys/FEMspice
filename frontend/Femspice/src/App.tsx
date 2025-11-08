import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login  from './pages/login'
import About from './pages/about'
import MainPage from './pages/mainpage'
import Signup from './pages/signup'
import { useEffect } from 'react';
import PublicRoute from './routes/PublicRoute';
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
        <Route path='/' element = {<PublicRoute><Login/></PublicRoute>}  / >
        <Route path='/login' element = {<PublicRoute><Login/></PublicRoute>}  / >
        <Route path='/about' element = {<PublicRoute><About/></PublicRoute>}/>
        <Route path='/home' element = {<PublicRoute><MainPage/></PublicRoute>}/>
        <Route path='/signup' element = {<PublicRoute><Signup/></PublicRoute>}/>
      </Routes>
    </div>
  )
}

export default App;
