import { remote } from 'electron'

const ppioUser = remote.getGlobal('ppioUser')

export default params =>
  ppioUser
    .objectList()
    .then(res => {
      console.log('get file list')
      console.log(res)
      if (res) {
        return res.map(file => {
          const fileInfo = file.ObjectBasicInfo
          return {
            id: fileInfo.ObjectHash,
            filename: '111',
            size: fileInfo.ObjectLength,
            type: 'file',
            isSecure: false,
            isPublic: fileInfo.ObjectAclType === 'Public',
          }
        })
      }
      return []
    })
    .catch(err => {
      console.error(err)
    })
