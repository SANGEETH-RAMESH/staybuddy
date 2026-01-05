import './App.css'
import { Route, Routes } from 'react-router-dom'

import AdminRoute from './routes/adminRoute'
import UserRoute from './routes/userRoute'
import HostRoute from './routes/hostRoute'

function App() {

  return (
    <Routes>
      <Route path='/admin/*' element={<AdminRoute/>}/>
      <Route path='/*' element={<UserRoute/>} />
      <Route path='/host/*' element={<HostRoute/>} />
    </Routes>
  )
}

export default App
