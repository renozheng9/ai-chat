import axios from 'axios'

export function login({ username = '', password = '' }) {
  // return axios.post('http://127.0.0.1:8000/chat/getReply', {
  //   text: '123'
  // }, {
  //   headers: {
  //     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huIiwiZXhwIjoxNzMxNzQ5OTQ4fQ.aIwmFvJS81R9VKQwZ4VuQbAB8BHrlsuFZzB0FdgAQyw'
  //   }
  // })
  const form = new FormData()
  form.append('username', username)
  form.append('password', password)
  return axios.post('http://127.0.0.1:8000/token', form)
}