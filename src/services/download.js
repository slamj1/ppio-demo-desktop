import { remote } from 'electron'
import { CANCEL_DOWNLOAD } from '../constants/sdk-methods'
import { APP_SECURE_KEY } from '../constants/constants'

const ppioUser = remote.getGlobal('ppioUser')

export const startDownload = async params => {
  console.log('start download service')
  console.log(params)
  try {
    await ppioUser.objectGet({
      objectHash: params.objectHash,
      gasprice: params.chiPrice,
      auth: params.auth,
      owner: params.owner,
    })

    return {
      taskId: params.objectHash,
    }
  } catch (err) {
    console.error('get object error')
    console.error(err)
    return err
  }
}

export const exportObject = async params => {
  console.log('exporting object')
  console.log(params)
  try {
    const exportParams = {
      objectHash: params.objectHash,
      output: params.exportPath,
    }
    if (params.isSecure) {
      exportParams.encrypt = 'AES'
      exportParams.key = APP_SECURE_KEY
    }
    const exported = await ppioUser.objectExport(exportParams)
    console.log(exported)
    return exported
  } catch (err) {
    console.error(err)
    return err
  }
}

export const cancelDownload = taskId => ({
  method: CANCEL_DOWNLOAD,
  params: {
    taskId,
  },
})
