import { remote } from 'electron'
import { CANCEL_DOWNLOAD } from '../constants/sdk-methods'
import { APP_SECURE_KEY } from '../constants/constants'

const ppioUser = remote.getGlobal('ppioUser')

export const getEstimateCost = params => {
  console.log('request download file cost')
  console.log(params)
  return ppioUser.getCost({
    size: params.size,
  })
}

/**
 * start download
 * @param {object} params
 * @param {String} params.objectHash
 * @param {number} params.chiPrice
 * @param {string} [params.auth = ''] - auth information
 * @param {string} [params.owner = ''] - the file owner's id
 * @returns {Promise<PromiseLike<{taskId: string} | never> | Promise<{taskId: *} | never> | *>}
 */
export const startDownload = async params => {
  console.log('start download service')
  console.log(params)
  return ppioUser
    .objectGet({
      objectHash: params.objectHash,
      gasprice: params.chiPrice,
      auth: params.auth || '',
      owner: params.owner || '',
    })
    .then(
      () => ({
        taskId: params.objectHash,
      }),
      err => {
        console.error('get object error')
        console.error(err)
        return err
      },
    )
}

export const exportObject = async params => {
  console.log('exporting object')
  console.log(params)
  const exportParams = {
    objectHash: params.objectHash,
    output: params.exportPath,
  }
  if (params.isSecure) {
    exportParams.encrypt = 'AES'
    exportParams.key = APP_SECURE_KEY
  }
  return ppioUser.objectExport(exportParams)
}

export const cancelDownload = taskId => ({
  method: CANCEL_DOWNLOAD,
  params: {
    taskId,
  },
})
