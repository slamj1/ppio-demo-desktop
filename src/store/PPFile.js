// TODO: add multiple file types to determine from real-file/shown-in-list/download/upload etc.
// Cannot call instance method to mutate its props
// Must be in vuex mutations

export class PPFile {
  constructor(fileData) {
    if (fileData instanceof PPFile) {
      return fileData
    }
    if (!fileData.key) {
      throw new Error('invalid file params')
    }
    this.key = fileData.key
    this.bucket = fileData.bucket
    this.filename = fileData.filename || fileData.key.split('/').slice(-1)[0]
    this.size = fileData.size
    this.type = fileData.type || 'plain'
  }
}

export class HomeListFile extends PPFile {
  constructor(fileData) {
    if (fileData instanceof HomeListFile) {
      return fileData
    }
    if (!fileData.status) {
      throw new Error('invalid file params')
    }
    super(fileData)
    this.status = fileData.status
    this.metadata = fileData.metadata || null
    this.startTime = fileData.startTime || 0 // timestamp in seconds
    this.expireTime = fileData.expireTime || 0 // timestamp in seconds
    this.duration = this.expireTime - this.startTime
    if (this.startTime && this.duration) {
      this.daysLeft = Math.ceil(
        (this.startTime + this.duration - Math.round(Date.now() / 1000)) / 86400,
      )
    }
  }
}

export class TaskFile extends PPFile {
  constructor(fileData) {
    if (TaskFile instanceof HomeListFile) {
      return fileData
    }
    super(fileData)
  }
}
