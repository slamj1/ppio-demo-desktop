import mime from 'mime-types'

export default filename => {
  const mimeType = mime.lookup(filename)
  console.log(`mime type of ${filename}: ${mimeType}`)
  if (!mimeType) {
    return 'plain'
  }
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
  if (mimeType.match('application/pdf')) {
    return 'pdf'
  }

  let type = ''
  const mediaTypes = ['audio', 'video', 'image']
  for (let i = 0; i < mediaTypes.length; i++) {
    if (mimeType.match(`${mediaTypes[i]}/`)) {
      type = mediaTypes[i]
      break
    }
  }
  if (type.length === 0) {
    type = 'plain'
  }
  console.log(type)
  return type
}
