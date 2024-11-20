import { createBrowserRouter } from 'react-router-dom'
import Login from '@/pages/Login/index'
import Homepage from '@/pages/Homepage'
import Complete from '@/pages/Complete'

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
    path: '/complete',
    element: <Complete />
  }
])

export default router