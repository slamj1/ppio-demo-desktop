// Cannot call instance method to mutate its props
// Must be in vuex mutations

import filesize from 'filesize'
import {
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
  TASK_TYPE_GET,
} from '../../constants/store'
import { TASK_GET_PROGRESS_INTERVAL } from '../../constants/constants'

export class Task {
  constructor(initData) {
    if (!initData || !initData.id || !initData.type) {
      throw new Error('invalid task data')
    }
    this.type = initData.type
    this.id = initData.id
    this.file = initData.file || null
  }
  initStatus() {
    this.transferringData = false // downloading or uploading
    this.transferProgress = 0 // transferred percentage, in number
    this.lastProgress = 0
    this.transferSpeed = '0b/s' // transfer speed, in string
    this.finished = false
    this.succeeded = false
    this.failed = false
    this.failMsg = ''
  }
  set transferProgress(progress) {
    this.lastProgress = this.transferProgress
    this.transferProgress = progress
    this.transferSpeed = `${filesize(
      ((progress - this.lastProgress) * this.file.size) /
        (TASK_GET_PROGRESS_INTERVAL / 1000),
    )}/s`
    console.log('computed speed: ', this.transferSpeed)
  }
}

export class UploadTask extends Task {
  constructor(initData) {
    if (!initData || !initData.localPath) {
      throw new Error('invalid upload task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_UPLOAD }))
    this.localPath = initData.localPath
  }
  initStatus() {
    super.initStatus()
    this.addingFileIndex = false // adding file to metadata after upload
  }
}

export class DownloadTask extends Task {
  constructor(initData) {
    if (!initData || !initData.exportPath) {
      throw new Error('invalid download task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_DOWNLOAD }))
    this.exportPath = initData.exportPath
  }
  initStatus() {
    super.initStatus()
    this.exportingFile = false // exporting file after download
  }
}

export class GetTask extends Task {
  constructor(initData) {
    if (!initData || !initData.localPath) {
      throw new Error('invalid upload task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_GET }))
  }
}
