import { remote } from 'electron'
import { CANCEL_DOWNLOAD } from '../constants/sdk-methods'

const ppioUser = remote.getGlobal('ppioUser')

/**
 * @typedef {Object} DownloadCost
 * @property {number} totalCost
 * @property {number} downloadCost
 */

/**
 * get download cost from sdk
 * @param params
 * @returns {Promise<DownloadCost>}
 */
export const getEstimateCost = params => {
  console.log('request download file cost')
  console.log(params)
  return ppioUser
    .getCost({
      size: params.size,
    })
    .then(costs => {
      // The total download cost contains only one part, so totalCost === downloadCost
      const totalCost = costs.reduce((acc, cur) => cur + acc, 0)
      const downloadCost = costs.reduce((acc, cur) => cur + acc, 0)
      return { totalCost, downloadCost }
    })
    .catch(err => {
      console.error('get download cost fail')
      console.error(err)
      return Promise.reject(err)
    })
}

/**
 * start download, returns object key for taskId
 * @param {object} params
 * @param {String} params.objectKey
 * @param {String} params.shareCode - share code of file
 * @param {number} params.chiPrice
 * @param {number} params.exportPath - path to export file
 * @param {string} [params.auth = ''] - auth information
 * @param {string} [params.owner = ''] - the file owner's id
 * @returns {Promise<{taskId: string} | never>}
 */
export const startDownload = async params => {
  console.log('start download service')
  console.log(params)
  return ppioUser
    .getObject({
      key: params.objectKey,
      'share-code': params.shareCode,
      chiprice: params.chiPrice,
      outFile: params.exportPath,
    })
    .then(
      () => ({
        taskId: params.objectKey,
      }),
      err => {
        console.error('get object error')
        console.error(err)
        return Promise.reject(err)
      },
    )
}

export const pauseDownload = params => {
  console.log('pausing download')
  console.log(params)
  return ppioUser.pauseDownload()
}

export const resumeDownload = params => {
  console.log('resuming download')
  console.log(params)
  return ppioUser.resumeDownload()
}

export const cancelDownload = taskId => ({
  method: CANCEL_DOWNLOAD,
  params: {
    taskId,
  },
})
