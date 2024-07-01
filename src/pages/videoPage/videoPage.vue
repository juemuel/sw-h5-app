<template>
    <div>
      <!-- <JoinForm ref="formRef"></JoinForm> -->
      <van-nav-bar left-arrow @click-left="goPrePage" :title="title" />
      <div class="btn-wrapper mt-10">
        <!-- <el-button type="primary" :disabled="joined" @click="join">Join</el-button>
        <el-button type="primary" :disabled="!joined" @click="leave">Leave</el-button> -->
        <!-- <AdvancedSetting :style="{ marginLeft: '10px' }" @profileChange="profileChange" @codecChange="codecChange"
          :audioTrack="audioTrack" :videoTrack="videoTrack">
        </AdvancedSetting> -->
      </div>
      <div class="remote mt-10" v-if="joined" width="33vw">
        <AgoraVideoPlayer :audioTrack="audioTrack" :videoTrack="videoTrack" :isLocal="true" 
         width="33vw" height="30vh" style="border: 1px solid #ccc;position: fixed;top: 46px;right: 10px;width: 33vw;height: 30vh;;z-index: 1001;"></AgoraVideoPlayer>
      </div>
      <div class="remote mt-10" width="33vw" v-else >
        <div style="border: 1px solid #ccc;background: black;position: fixed;top: 46px;right: 10px;width: 33vw;height: 30vh;;z-index: 1001;"></div>
      </div>
      <div class="local mt-10" v-if="Object.keys(remoteUsers).length" width="100%">
        <AgoraVideoPlayer v-for="item in remoteUsers" :key="item.uid" :videoTrack="item.videoTrack"
          :audioTrack="item.audioTrack" :text="item.uid" width="100vw" height="100vh" style="border: 1px solid #ccc;position: fixed;top: 0;left: 0;width: 100%;height: 100%;z-index: 1000;">
        </AgoraVideoPlayer>
      </div>
      <div class="local mt-10" v-else width="100%">
        <div style="border: 1px solid #ccc;background: black;position: fixed;top: 0;left: 0;width: 100%;height: 100%;z-index: 1000;"></div>
      </div>
      <div class="bottom-toolbar" style="z-index: 1002;position: fixed; bottom: 10px; left: 50%; transform: translateX(-50%); width: 90%; display: flex; justify-content: space-around;">
        <div class="common-button" :disabled="!joined" @click="changeCamera" >
            <el-icon style="font-size: 24px"><Refresh /></el-icon>
        </div>
        <div class="common-button" :disabled="!joined" @click="toggleCamera" :class="{ 'activeCamera': isActiveCamera }">
            <el-icon style="font-size: 24px"><CameraFilled /></el-icon>
        </div>
        <div class="hangUp-button" :disabled="!joined" @click="hangUp">
            <el-icon style="font-size: 24px"><PhoneFilled /></el-icon>
        </div>
        <div class="common-button" :disabled="!joined" @click="toggleMic" :class="{ 'activeMicrophone': isActiveMicrophone }">
            <el-icon style="font-size: 24px"><Microphone /></el-icon>
        </div>
    </div>
    </div>
  </template>
  
  <script setup>
  import AgoraRTC from "agora-rtc-sdk-ng"
  import { onMounted, onUnmounted, ref, reactive} from "vue"
  import { ElMessage } from 'element-plus'
  import { useRoute, useRouter } from "vue-router"
  import { showJoinedMessage } from "../../utils/utils"
import { Toast } from "vant"

  const route = useRoute()
  const router = useRouter()
  const channel = route.query.channel || ''
  const appId = '9a2da36a48e14b3fa8804d55e916f006'; // 固定的App ID
  const token = '007eJxTYJh41m/ZBGHFztDCD49vnzy7KEXsYJ/5MTeW33euZL8ViNiqwGCZaJSSaGyWaGKRamiSZJyWaGFhYJJiappqaWiWZmBg1nSiOq0hkJEheeNlZkYGCATxuRiKMzILMvPSDQwMGRgAxUMjlg=='; // 固定的Token，根据实际情况可能需要动态获取
  const uid = null; // 或者设定一个固定的uid策略

  let client = null
  let codec = 'vp8'
  
  const joined = ref(false)
  const remoteUsers = ref({})
  const audioTrack = ref(null)
  const videoTrack = ref(null)
  const stream = ref(null)
  const formRef = ref()
  const isActiveCamera = ref(true)
  const isActiveMicrophone = ref(true)
  const isActiveFirstCamera = ref(true)
  const data = reactive({
    cameraList:[]
  })
  onMounted(async () => {
      await initTracks()
      console.log(appId, channel)
      if (appId && channel) {
        console.log('进入')
         join();
      }
  })
  
  onUnmounted(() => {
    if (joined.value) {
      leave()
    }
  })
  
  const profileChange = async (val) => {
    await videoTrack.value?.setEncoderConfiguration(val)
  }
  
  const codecChange = (val) => {
    codec = val
  }
  
  const initTracks = async () => {
    if (audioTrack.value && videoTrack.value) {
      return
    }
    AgoraRTC.getCameras().then(devices => {
    data.cameraList = devices
        console.log("first device id", devices[0].deviceId, data.cameraList[0].deviceId);
        console.log('data.cameraList', data.cameraList)
        data.cameraList.forEach(item => {
        console.log(item.label, ': ', item.deviceId )
        });
    }).catch(e => {
        console.log("get devices error!", e);
    })
    const tracks = await Promise.all([
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ])
    audioTrack.value = tracks[0]
    videoTrack.value = tracks[1]

  }
  
  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType)
    delete remoteUsers.value[user.uid]
    remoteUsers.value[user.uid] = user
  }
  
  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType == 'video') {
      delete remoteUsers.value[user.uid]
    }
  }
  
  
  
const join = async () => {
    try {
      if (!client) {
        client = AgoraRTC.createClient({
          mode: "rtc",
          codec: codec
        });
      }
  
      // Add event listeners to the client.
      client.on("user-published", handleUserPublished)
      client.on("user-unpublished", handleUserUnpublished);
    //   console.log('当前的远程用户数', Object.keys(remoteUsers).length)
    //   const options = formRef.value.getValue()
      const options = {
        appId: appId,
        channel: channel,
        token: token,
        uid: uid
        }
      console.log('正在加入频道', options)
      options.uid = await client.join(appId, channel, token || null, uid || null)
      await initTracks()
      const tracks = [audioTrack.value, videoTrack.value]
      await client.publish(tracks)
      showJoinedMessage(options)
      joined.value = true
    } catch (error) {
      console.error(error)
      ElMessage.error({message: error.message, duration: 1000})
    }
  }
  
const leave = async () => {
    if (audioTrack.value) {
        audioTrack.value.close()
        audioTrack.value = null
    }
    if (videoTrack.value) {
        videoTrack.value.close()
        videoTrack.value = null
    }
    remoteUsers.value = {}
    await client.leave()
    joined.value = false
    ElMessage.success({message: '您已经成功退出频道！', duration: 1000})
    return true
}
async function goPrePage() {
    console.log('goPrePage')
    let flag = await leave()
    if (flag) {
        await new Promise(resolve => {
            setTimeout(() => {
                router.go(-1);
                resolve(); // 在延迟结束后执行resolve以继续异步链
            }, 500);
        });
    }
}
function hangUp() {
   goPrePage()
}
function toggleCamera() {
    if (videoTrack.value.enabled) {
        videoTrack.value.setEnabled(false)
        isActiveCamera.value = false
    } else {
        videoTrack.value.setEnabled(true)
        // 此处高亮按钮，激活activeCamera样式
        isActiveCamera.value = true
    }
    console.log('toggleCamera', videoTrack.value.enabled)
}
function changeCamera() {
    if (data.cameraList.length <= 1) {
        Toast.fail('没有其他摄像头')
    } else {
        if (isActiveFirstCamera.value) {
            console.log('set后置')
            videoTrack.value.setDevice(data.cameraList[data.cameraList.length - 1].deviceId)
            isActiveFirstCamera.value = false
        } else {
            console.log('set前置')
            videoTrack.value.setDevice(data.cameraList[0].deviceId)
            isActiveFirstCamera.value = true
        }
    }
}
function toggleMic() {
    if (audioTrack.value._volume > 0) {
        audioTrack.value.setVolume(0)
        isActiveMicrophone.value = false
    } else {
        audioTrack.value.setVolume(100)
        isActiveMicrophone.value = true
    }
    console.log('togglMic', audioTrack.value._volume)
}
  </script>
  <style scoped>
::v-deep(.van-nav-bar) {
    background-color: transparent !important;
    z-index: 1001;
}
.van-hairline--bottom:after {
    border-bottom: none;
}
.common-button {
    height: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    box-shadow: var(--el-box-shadow-lighter);
    border-radius: 50%; /* 添加圆角 */
    background-color: #ffffff;
    color: black;
    cursor: pointer; /* 添加鼠标指针样式 */
    transition: all 0.2s ease-in-out; /* 添加过渡效果 */
  }
  .activeCamera {
    /* 这里添加你希望在按钮激活时应用的样式，例如改变背景色或边框 */
    background-color: #409EFF; /* 示例：改变背景色 */
    color: white; /* 示例：改变文字颜色 */
  }
  .activeMicrophone {
    /* 这里添加你希望在按钮激活时应用的样式，例如改变背景色或边框 */
    background-color: #409EFF; /* 示例：改变背景色 */
    color: white; /* 示例：改变文字颜色 */
  }
  .hangUp-button {
    height: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    box-shadow: var(--el-box-shadow-lighter);
    border-radius: 50%; /* 添加圆角 */
    background-color: #fe5051;
    color: black;
    cursor: pointer; /* 添加鼠标指针样式 */
    transition: all 0.2s ease-in-out; /* 添加过渡效果 */
  }

    </style>