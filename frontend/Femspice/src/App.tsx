import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Link } from 'react-router-dom'
import Login  from './pages/login'
import About from './pages/about'
import MainPage from './pages/mainpage'
import { useEffect } from 'react';

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
        <Route path='/' element = {<Login/>}  / >
        <Route path='/about' element = {<About/>}/>
        <Route path='/main' element = {<MainPage/>}/>
      </Routes>

    </div>
  )
}

export default App;
