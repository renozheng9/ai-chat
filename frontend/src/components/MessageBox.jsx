import ReactMarkdown from 'react-markdown'
import Wave from '@/components/Wave'
import Card from './card/Card'

export default function MessageBox(props) {
  const { data, onItemAudioClick } = props
  const { text = '', audio = '', isPlaying = false } = data || {}

  function handleItemAudioClick() {
    onItemAudioClick(data)
  }

  return (
    <Card
      display={'flex'}
      px="22px !important"
      pl="22px !important"
      color="#1B254B"
      // minH="450px"
      fontSize={{ base: 'sm', md: 'md' }}
      lineHeight={{ base: '24px', md: '26px' }}
      fontWeight="500"
      style={{ width: 'auto' }}
    >
      {
        audio ?
        <div>
            <div onClick={handleItemAudioClick}>
              <Wave isPlaying={isPlaying} />
            </div>
            <div>{data.text}</div>
        </div>

          :
          <ReactMarkdown className="font-medium">
            {text ? text : ''}
          </ReactMarkdown>
      }
    </Card>
  )
}
