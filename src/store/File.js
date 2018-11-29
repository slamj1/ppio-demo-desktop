// TODO: refactor File to PPFile to distinct from javascript File
// Cannot call instance method to mutate its props
// Must be in vuex mutations

export default class File {
  constructor(fileData) {
    if (!fileData.id) {
      throw new Error('invalid file params')
    }
    this.id = fileData.id
    this.filename = fileData.filename
    this.size = fileData.size
    this.type = fileData.type || 'file'
    this.isSecure = !!fileData.isSecure
    this.isPublic = !!fileData.isPublic
    this.startTime = fileData.startTime || 0
    this.duration = fileData.duration || 0
    if (this.startTime && this.duration) {
      this.daysLeft = Math.ceil(
        (this.startTime + this.duration - Math.round(Date.now() / 1000)) / 86400,
      )
    }
  }
}
