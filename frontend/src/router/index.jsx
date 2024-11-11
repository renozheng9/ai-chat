import { createBrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login/index'
import Homepage from '@/pages/Homepage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />
  },
  {
    path: '/login',
    element: <Login />
  }
])

export default router