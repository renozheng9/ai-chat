import axios from 'axios'
import { getStorage, KEY_TOKEN } from '@/utils/storage'

axios.interceptors.request.use(function (config) {
  config.headers = {
    ...(config.headers || {}),
    'Authorization': `Bearer ${getStorage(KEY_TOKEN)}`
  }
  return config
})

axios.interceptors.response.use(function (response) {
  console.log(response)
  return response
}, function (err) {
  console.log(err)
  return Promise.reject(err)
})