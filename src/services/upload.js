import { remote } from 'electron'
import { CANCEL_UPLOAD } from '../constants/sdk-methods'
import { APP_SECURE_KEY } from '../constants/constants'

const ppioUser = remote.getGlobal('ppioUser')

export const importObject = async params => {
  console.log('importing object')
  try {
    const importParams = {
      localPath: params.localPath,
    }
    if (params.isSecure) {
      importParams.encrypt = 'AES'
      importParams.key = APP_SECURE_KEY
    }
    const imported = await ppioUser.objectImport(importParams)
    console.log(imported)
    return imported
  } catch (err) {
    console.error(err)
    return err
  }
}

export const startUpload = async params => {
  console.log('start upload service')
  console.log(params)
  try {
    await ppioUser.objectPut({
      objectHash: params.objectHash,
      copies: params.copyCount,
      duration: params.storageTime,
      gasprice: params.chiPrice,
      acl: 'private',
    })

    return {
      taskId: params.objectHash,
    }
  } catch (err) {
    console.error('put object error')
    console.error(err)
    return err
  }
}

export const cancelUpload = taskId => ({
  method: CANCEL_UPLOAD,
  params: {
    taskId,
  },
})
