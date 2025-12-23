import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import AllDoctors from './pages/AllDoctors'
import BloodBank from './pages/BloodBank'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<AllDoctors />} />
        <Route path='/blood-bank' element={<BloodBank />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/patient' element={<PatientDashboard />} />
        <Route path='/doctor' element={<DoctorDashboard />} />
        <Route path='/admin' element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

export default App
