import { Routes, Route } from 'react-router-dom'
import Landing from './components/landing/Landing'
import Login from './components/logs/instagram/Login'
import SignUp from './components/logs/instagram/SignUp'
import FLogin from './components/logs/facebook/FLogin'
import FSignUp from './components/logs/facebook/FSignUp'
import TLogin from './components/logs/twitter/Tlogin'
import TSignUp from './components/logs/twitter/TSignUp'
import InstagramHome from './pages/InstagramHome'
import FacebookHome from './pages/FacebookHome'
import TwitterHome from './pages/TwitterHome'
function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Landing />} ></Route>

        <Route path='/login' element={<Login />} ></Route>
        <Route path='/signup' element={<SignUp />} ></Route>
        <Route path='/instagram-home' element={<InstagramHome />} ></Route>

        <Route path='/flogin' element={<FLogin />} ></Route>
        <Route path='/fsignup' element={<FSignUp />} ></Route>
        <Route path='/facebook-home' element={<FacebookHome />} ></Route>

        <Route path='/tlogin' element={<TLogin />} ></Route>
        <Route path='/tsignup' element={<TSignUp />} ></Route>
        <Route path='/twitter-home' element={<TwitterHome />} ></Route>

      </Routes>

    </>
  )
}

export default App
