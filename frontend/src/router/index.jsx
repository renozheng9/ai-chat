import { createBrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login/index'
import Homepage from '@/pages/Homepage'
import Checkout from '@/pages/Checkout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Homepage />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/checkout',
    element: <Checkout />
  }
])

export default router