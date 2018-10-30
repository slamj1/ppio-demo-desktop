class File {
  id = ''
  filename = ''
  size = 0
  type = 0
  isSecure = false
  isPublic = false

  constructor(fileData) {
    this.id = fileData.id
    this.filename = fileData.filename
    this.size = fileData.size
    this.type = fileData.type
    this.isSecure = fileData.isSecure
    this.isPublic = fileData.isPublic
  }

  rename(newname) {
    this.filename = newname
  }
  setSecure(isSecure) {
    this.isSecure = isSecure
  }
  setPublic(isPublic) {
    this.isPublic = isPublic
  }
}

export default File
