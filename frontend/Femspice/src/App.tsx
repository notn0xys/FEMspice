
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Link } from 'react-router-dom'
import Login  from './pages/login'
import About from './pages/about'
import MainPage from './pages/mainpage'

function App() {

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
