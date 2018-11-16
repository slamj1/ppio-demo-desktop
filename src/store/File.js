export default function File(fileData) {
  return {
    id: fileData.id,
    filename: fileData.filename,
    size: fileData.size,
    type: fileData.type || 'file',
    isSecure: fileData.isSecure,
    isPublic: fileData.isPublic,
  }
}
