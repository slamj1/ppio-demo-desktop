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
  }
}
