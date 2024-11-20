import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import router from '@/router/index'
import '@/api/interceptor'
import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme/theme.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <App />
      {/* <RouterProvider router={router} /> */}
    </ChakraProvider>
  </StrictMode>,
)
