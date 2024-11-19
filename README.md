### ai-chat

#### 功能

* 交互功能
  - 根据用户的输入给出回应-支持广东话/普通话
      - 用户输入广东话，给出广东话回应
      - 用户输入普通话，给出普通话回应
  - 用llm 模型
    
* 评分功能
  - 对话1分钟完成之后也，给出评分； 或者用户点击结束（<1分钟），给出评分
    
* 捐赠功能
  - stripe
 
* tg or whatsapp?
  - [Connect a bot to Telegram](https://learn.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-telegram?view=azure-bot-service-4.0)

#### meeting at 9:00 on 2024-11-14
* 交互功能
* 评分功能

#### meeting at 8:00 0n 2024-11-18
* 新模型的廣東話功能 和交互
  - 發送“廣東話語句”給reno
* 改進評分功能
* 捐贈功能
  - stripe 帳戶
  
* whatsapp or tg?
* TODO
  - 頁面排版畫圖 - Raymond
  - 支付功能 - reno
    + 加到頁面下面
    + 支付完成後，倒計時或直接返回首頁
    + 版權文字加到頁面最後面
  - 寫如何本地運行 - reno
  - 支持本地運行 - reno+raymond

#### meeting at 8:00 on 2024-11-20
  
#### issues

#### 技术栈

* 前端：react，charkra-ui
* 后端：python，fastapi

#### 模型

* 对话：lordjia/Llama-3.1-Cantonese-8B-Instruct
* 语音识别：SenseVoice
* 语种识别：`damo/speech_campplus_five_lre_16k`
* 语音合成：cosyvoice
* 情感分析：`agentlans/mdeberta-v3-base-sentiment`

#### 调用过程

核心接口服务跑8000端口，对话服务跑8001端口，语音识别和语种识别跑8002端口，语音合成跑8003端口，情感分析跑8004端口，静态资源服务跑8005端口

* 文本对话：前端调用getReply方法，方法内请求8000端口/chat/getTextReply接口，该接口内请求8001服务/getTextReply接口获取对话结果并返回给前端。
* 语音对话：前端调用handleBeginRecord方法开始录音，调用handleStopRecord结束录音，在结束方法中先请求8000服务/chat/getAudioTranslation接口，该接口先将用户语音存为文件，再调用8002服务/getTextByAudio接口获取翻译及语种并返回，前端拿到翻译及语种后请求8000服务/chat/getAudioReply接口，接口内首先请求8001服务/getTextReply接口获取对话回复，之后将该对话回复内容和语种作为参数请求8003服务/getAudioByText服务，该服务内进行语音合成，合成完成后返回音频文件链接，前端即可用于播放。

注：语音合成，即8003服务的部署，需要克隆<https://github.com/FunAudioLLM/CosyVoice>中readme并按照readme下载并安装相关依赖，再将text2audio/text2audio.py放入克隆项目的根目录下运行

#### 运行说明
* 前端：进入frontend目录，执行npm install安装依赖，之后执行npm run dev运行前端项目
* 后端主服务：进入backend目录，使用conda创建环境（python 3.10）并按照requirements.txt安装依赖，随后python main.py运行服务
* 文本对话服务：进入text2text目录，使用conda创建环境（python 3.10）并按照requirements.txt安装依赖，随后python text2text.py运行服务
* 语音识别服务：进入text2text目录，使用conda创建环境（python 3.8）并按照requirements.txt安装依赖，运行pip install tranformers huggingface huggingface_hub更新依赖，随后python audio2text.py运行服务
* 语音合成服务：使用conda创建环境（python 3.8），克隆<https://github.com/FunAudioLLM/CosyVoice>，并按照readme进行相关依赖安装及模型下载，并配置环境变量，随后拷贝text2audio目录下的text2audio.py文件到根目录，最后python text2audio.py运行服务
* 情感分析服务：进入sentiment目录，使用conda创建环境（python 3.10）并按照requirements.txt安装依赖，随后python sentiment.py运行服务
* 静态资源服务：进入fileServer目录，使用conda创建环境（python 3.10）并按照requirements.txt安装依赖，随后python main.py运行服务