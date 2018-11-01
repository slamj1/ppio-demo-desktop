import { TASK_TYPE_DOWNLOAD, TASK_TYPE_UPLOAD } from '@/constants/store'
import { startDownload, getProgress as getDownloadProgress } from '@/services/download'
import { startUpload, getProgress as getUploadProgress } from '@/services/upload'

export default class Task {
  type = ''
  id = ''
  transferringData = false // downloading or uploading
  transferProgress = 0 // transferred percentage, in number
  transferSpeed = '0b/s' // transfer speed, in string
  finished = false
  file = null

  constructor(initData) {
    this.type = initData.type
    this.file = initData.file
    this.id = initData.id
    if (this.type === TASK_TYPE_UPLOAD) {
      this.startTransfer = startUpload
      this.getTransferProgress = getUploadProgress
    }
    if (this.type === TASK_TYPE_DOWNLOAD) {
      this.startTransfer = startDownload
      this.getTransferProgress = getDownloadProgress
    }
  }

  setStatus(status) {
    this.transferSpeed = status.speed
    this.transferProgress = status.progress
  }

  start() {
    this.transferringData = true
    this.finished = false
    this.transferProgress = 0
    return this
  }

  getProgress() {
    console.log('getting progress')
    this.getTransferProgress()
      .then(res => {
        this.finished = res.finished
        this.transferProgress = res.progress
        if (res.finished) {
          this.transferringData = false
        } else {
          setTimeout(() => {
            this.getProgress()
          }, 1000)
        }
        return true
      })
      .catch(err => {
        console.log(err)
        return Promise.resolve()
      })
  }
}
