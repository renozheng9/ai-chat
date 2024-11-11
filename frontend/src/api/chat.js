import axios from 'axios'

export function getReply( { text = '' }) {
  return axios.post('http://127.0.0.1:8000/chat/getReply', {
    text
  })
}