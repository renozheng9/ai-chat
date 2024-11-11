import ReactMarkdown from 'react-markdown'
import Card from './card/Card'

export default function MessageBox(props) {
  const { output } = props

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
    >
      <ReactMarkdown className="font-medium">
        {output ? output : ''}
      </ReactMarkdown>
    </Card>
  )
}
