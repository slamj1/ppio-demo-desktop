import mime from 'mime-types'

const fileTypes = ['audio', 'video', 'pdf', 'image', 'plain']

export default filename => {
  const mimeType = mime.lookup(filename)
  console.log(`mime type of ${filename}: ${mimeType}`)

  if (
    mimeType.match('ms-powerpoint') ||
    mimeType.match('officedocument.presentationml.presentation')
  ) {
    return 'ppt'
  }
  if (
    mimeType.match('ms-excel') ||
    mimeType.match('officedocument.spreadsheetml.sheet')
  ) {
    return 'xls'
  }
  if (
    mimeType.match('msword') ||
    mimeType.match('officedocument.wordprocessingml.document')
  ) {
    return 'doc'
  }
  if (mimeType.match('compressed') || mimeType.match('zip') || mimeType.match('gzip')) {
    return 'zip'
  }

  let type = ''
  for (let i = 0; i < fileTypes.length; i++) {
    if (mimeType.match(fileTypes[i])) {
      type = fileTypes[i]
      break
    }
  }
  if (type.length === 0) {
    type = 'plain'
  }
  console.log(type)
  return type
}
