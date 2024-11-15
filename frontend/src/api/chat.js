import axios from 'axios'

export function getTextReply( { text = '' }) {
  return axios.post('http://127.0.0.1:8000/chat/getTextReply', {
    text
  })
}