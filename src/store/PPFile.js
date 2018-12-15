// TODO: add multiple file types to determine from real-file/shown-in-list/download/upload etc.
// Cannot call instance method to mutate its props
// Must be in vuex mutations

export default class PPFile {
  constructor(fileData) {
    if (fileData instanceof PPFile) {
      return fileData
    }
    if (!fileData.key) {
      throw new Error('invalid file params')
    }
    this.key = fileData.key
    this.hash = fileData.hash
    this.bucket = fileData.bucket
    this.filename = fileData.filename || fileData.key.split('/').slice(-1)[0]
    this.size = fileData.size
    this.type = fileData.type || 'plain'
    this.metadata = fileData.metadata || null
    this.isSecure = !!fileData.isSecure // @deprecated
    this.isPublic = !!fileData.isPublic // @deprecated
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
