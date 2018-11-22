// Cannot call instance method to mutate its props
// Must be in vuex mutations

export class Task {
  constructor(initData) {
    if (!initData || !initData.id || !initData.type) {
      throw new Error('invalid task data')
    }
    this.type = initData.type
    this.id = initData.id
    this.status = new TaskStatus()
    this.file = initData.file || null
    this.exportPath = initData.exportPath || null
    this.localPath = initData.localPath || null
  }
}

export class TaskStatus {
  constructor() {
    this.transferringData = false // downloading or uploading
    this.transferProgress = 0 // transferred percentage, in number
    this.transferSpeed = '0b/s' // transfer speed, in string
    this.addingFileIndex = false // adding file to metadata after upload
    this.exportingFile = false // exporting file after download
    this.finished = false
    this.failed = false
    this.failMsg = ''
  }
}
