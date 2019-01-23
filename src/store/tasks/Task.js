// Cannot call instance method to mutate its props
// Must be in vuex mutations
// ALERT: Do not add instance methods, those will not be in storage.

import filesize from 'filesize'
import { TASK_TYPE_UPLOAD, TASK_TYPE_DOWNLOAD } from '../../constants/store'
import { TASK_GET_PROGRESS_INTERVAL } from '../../constants/constants'
import {
  TASK_STATUS_STARTING,
  TASK_STATUS_RUNNING,
  TASK_STATUS_FAIL,
  TASK_STATUS_SUCC,
  TASK_STATUS_PAUSED,
} from '../../constants/task'

function pad(num) {
  return `0${num}`.slice(-2)
}
function secondConverter(secs) {
  var minutes = Math.floor(secs / 60)
  secs = secs % 60
  var hours = Math.floor(minutes / 60)
  minutes = minutes % 60
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
  }
  return `${pad(minutes)}:${pad(secs)}`
}

export class Task {
  constructor(initData) {
    if (initData instanceof Task) {
      return initData
    }
    if (!initData || !initData.id || !initData.type) {
      throw new Error('invalid task data')
    }
    console.log('creating new task with: ')
    console.log(initData)
    this.type = initData.type
    this.id = initData.id
    this.file = initData.file || null
    this.lastTransferredData = initData.transferredData || 0 // used to calculate transfer speed
    this.transferredData = initData.transferredData || 0 // transferred bytes
    this.wholeDataLength = initData.wholeDataLength || 0 // whole file size
    if (this.wholeDataLength === 0) {
      this.transferProgress = 0
    } else {
      console.log('calculating transfer progress')
      const progress = (this.transferredData * 100) / this.wholeDataLength
      this.transferProgress = progress > 100 ? 100 : progress
    }
    this.transferSpeed = 0 // transfer speed, bytes/s
    this.displayTransferSpeed = '0b/s' // transfer speed for display
    this.displayLeftTime = ''
    this.status = initData.status || TASK_STATUS_STARTING
    this.failMsg = initData.failMsg || ''
    this.speedCheckerTick = 0
    this.finished = this.status === TASK_STATUS_SUCC || this.status === TASK_STATUS_FAIL
    console.log(this.status)
  }

  setTransferredData(length) {
    console.log(
      'setting transferred data: ',
      this.lastTransferredData,
      this.transferredData,
      length,
    )
    console.log('speed checker tick: ', this.speedCheckerTick)
    if (length > this.wholeDataLength) {
      console.error('transferred data more than whole length')
    }
    this.speedCheckerTick += 1
    this.transferredData = length
    const speed = Math.round(
      (length - this.lastTransferredData) /
        ((TASK_GET_PROGRESS_INTERVAL * this.speedCheckerTick) / 1000),
    )
    this.setTransferSpeed(speed)
    if (this.speedCheckerTick === 5) {
      this.lastTransferredData = length
      this.speedCheckerTick = 0
    }
    if (length < this.transferredData) {
      console.log('transfer backed')
      if (length < this.transferredData - 16 * 1024 * 1024) {
        console.error('transfer backed more than 16MB')
      }
    }
    if (this.wholeDataLength === 0) {
      this.transferProgress = 0
    } else {
      this.transferProgress = (this.transferredData * 100) / this.wholeDataLength
    }
    return this
  }

  setTransferSpeed(speed) {
    console.log('setting transfer speed:', speed)
    if (speed < 0) {
      speed = 0
    }
    this.displayTransferSpeed = `${filesize(speed)}/s`
    this.transferSpeed = speed
    if (speed > 0) {
      const leftSeconds = Math.round(
        (this.wholeDataLength - this.transferredData) / speed,
      )
      console.log(leftSeconds)
      if (leftSeconds > 3600 * 6) {
        this.displayLeftTime = 'Over 6 hours'
      } else if (leftSeconds > 60) {
        this.displayLeftTime = `${secondConverter(leftSeconds)} remaining`
      } else {
        this.displayLeftTime = `${leftSeconds} seconds remaining`
      }
    } else {
      this.displayLeftTime = ''
    }
    console.log('computed speed: ', this.transferSpeed)
    return this
  }

  setStatus(status) {
    console.log('status set', status)
    if (this.status !== status) {
      this.speedCheckerTick = 0
    }
    if (status === TASK_STATUS_SUCC || status === TASK_STATUS_FAIL) {
      this.finished = true
      this.setTransferSpeed(0)
    }
    if (status === TASK_STATUS_PAUSED) {
      this.setTransferSpeed(0)
    }
    this.status = status
    return this
  }

  setProgress(progress) {
    console.log('setting transfer progress')
    console.log(progress)
    this.wholeDataLength = progress.wholeDataLength
    this.setTransferredData(progress.transferredData)
    return this
  }

  start() {
    console.log('task start')
    return this.setStatus(TASK_STATUS_RUNNING)
  }

  pause() {
    console.log('task paused')
    return this.setStatus(TASK_STATUS_PAUSED)
  }

  resume() {
    console.log('task resumed')
    return this.setStatus(TASK_STATUS_RUNNING)
  }

  finish() {
    console.log('task finished succ')
    return this.setStatus(TASK_STATUS_SUCC)
  }

  fail(failMsg) {
    console.log('task failed')
    this.failMsg = failMsg || 'task failed'
    return this.setStatus(TASK_STATUS_FAIL)
  }
}

export class UploadTask extends Task {
  constructor(initData) {
    console.log('create new UploadTask')
    console.log(initData)
    if (initData instanceof UploadTask) {
      return initData
    }
    if (!initData || !initData.localPath) {
      throw new Error('invalid upload task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_UPLOAD }))
    this.localPath = initData.localPath
  }
}

export class DownloadTask extends Task {
  constructor(initData) {
    console.log('create new DownloadTask')
    console.log(initData)
    if (initData instanceof DownloadTask) {
      return initData
    }
    if (!initData || !initData.exportPath) {
      throw new Error('invalid download task init data')
    }
    super(Object.assign(initData, { type: TASK_TYPE_DOWNLOAD }))
    this.exportPath = initData.exportPath
  }
}
