import './index.css'
import ICON_VOICE from '@/assets/voice.svg'

function Wave(props) {
  const { isPlaying = false } = props

  return (
    <div className="w-full min-w-[107px] flex flex-row justify-between items-center">
      {
        isPlaying ? 
          <div className="w-[30px] h-[30px] flex justify-center items-center border-[2px] border-[#950bd3] rounded-[50%]">
            <div className="w-[12px] h-[12px] bg-[#950bd3]"></div>
          </div> :
          <img src={ICON_VOICE} className="w-[30px] h-[30px]" />
      }
      <div className={`music ${isPlaying ? 'play' : ''}`}>
        <div class="item one"></div>
        <div class="item two"></div>
        <div class="item three"></div>
        <div class="item four"></div>
        <div class="item five"></div>
        <div class="item six"></div>
        <div class="item seven"></div>
      </div>
    </div>
  )
}

export default Wave