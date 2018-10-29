import { TASK_TYPE_DOWNLOAD, TASK_TYPE_UPLOAD } from '@/constants/store'
import { startDownload, getProgress as getDownloadProgress } from '@/services/download'
import { startUpload, getProgress as getUploadProgress } from '@/services/upload'

export default class Task {
  type = ''
  mode = 0 // 0 for non-Coinpool, 1 for Coinpool
  transferringData = false // downloading or uploading
  taskData = {} // different based on task type

  constructor(initData) {
    this.type = initData.type
    this.mode = initData.mode
  }

  setTaskData(data) {
    this.taskData = Object.assign({}, this.taskData, data)
  }

  startTransfer(postData) {
    if (this.type === TASK_TYPE_UPLOAD) {
      this.transferringData = true
      return startUpload(postData)
    }
    if (this.type === TASK_TYPE_DOWNLOAD) {
      this.transferringData = true
      return startDownload(postData)
    }
    return Promise.reject(new Error('not a download or upload task'))
  }

  getProgress(postData) {
    if (this.type === TASK_TYPE_UPLOAD) {
      return getUploadProgress(postData)
    }
    if (this.type === TASK_TYPE_DOWNLOAD) {
      return getDownloadProgress(postData)
    }
    return Promise.reject(new Error('not a download or upload task'))
  }
}
