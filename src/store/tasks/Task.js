// Cannot call instance method to mutate its props
// Must be in vuex mutations

import filesize from 'filesize'
import {
  TASK_TYPE_UPLOAD,
  TASK_TYPE_DOWNLOAD,
  TASK_TYPE_GET,
} from '../../constants/store'
import { TASK_GET_PROGRESS_INTERVAL } from '../../constants/constants'
import {
  TASK_STATUS_RUNNING,
  TASK_STATUS_FAIL,
  TASK_STATUS_SUCC,
  TASK_STATUS_PAUSED,
} from '../../constants/task'

export class Task {
  constructor(initData) {
    if (!initData || !initData.id || !initData.type) {
      throw new Error('invalid task data')
    }
    this.type = initData.type
    this.id = initData.id
    this.file = initData.file || null
    this.initStatus()
  }
  initStatus() {
    this.lasttransferredData = 0 // used to calculate transfer speed
    this.transferredData = 0 // transferred bytes
    this.wholeDataLenth = 0 // whole file size
    this.transferSpeed = 0 // transfer speed, bytes/s
    this.displayTransferSpeed = '0b/s' // transfer speed for display
    this.finished = false
    this.status = TASK_STATUS_RUNNING
    this.failMsg = ''
  }

  get transferProgress() {
    if (this.wholeDataLenth === 0) {
      return 0
    }
    console.log(
      `calculating transfer progress: ${this.transferredData}, ${this.wholeDataLenth}`,
    )
    return (this.transferredData * 100) / this.wholeDataLenth
  }

  set transferredData(length) {
    this.lasttransferredData = this.transferredData
    this.transferredData = length
    this.transferSpeed =
      (length - this.lasttransferredData) / (TASK_GET_PROGRESS_INTERVAL / 1000)
    console.log('computed speed: ', this.transferSpeed)
  }

  set transferSpeed(speed) {
    this.transferSpeed = speed
    this.displayTransferSpeed = filesize(speed)
  }

  set status(status) {
    if (status === TASK_STATUS_SUCC || status === TASK_STATUS_FAIL) {
      this.finished = true
      this.transferSpeed = 0
    }
    if (status === TASK_STATUS_PAUSED) {
      this.transferSpeed = 0
    }
  }

  // TODO: for test
  pause() {
    this.status = TASK_STATUS_PAUSED
  }

  resume() {
    this.status = TASK_STATUS_RUNNING
  }

  finish() {
    this.status = TASK_STATUS_SUCC
  }

  fail(failMsg) {
    this.status = TASK_STATUS_FAIL
    this.failMsg = failMsg
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
    // this.addingFileIndex = false // adding file to metadata after upload
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
    // this.exportingFile = false // exporting file after download
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
