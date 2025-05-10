// import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'

import AdminRoute from './routes/adminRoute'
import UserRoute from './routes/userRoute'
import HostRoute from './routes/hostRoute'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/admin/*' element={<AdminRoute/>}/>
      <Route path='/user/*' element={<UserRoute/>} />
      <Route path='/host/*' element={<HostRoute/>} />
    </Routes>
  )
}

export default App
