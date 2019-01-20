import { remote } from 'electron'

const poss = remote.getGlobal('poss')

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
  return poss
    .callMethod('GetObjectFunds', {
      objectsize: params.size,
    })
    .then(costs => {
      console.log(costs)
      const minerCost = parseInt(costs.miner)
      const serviceCost = parseInt(costs.service)
      return minerCost + serviceCost
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
 * @param {String} params.bucket - bucket name
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
  return poss
    .callMethod('GetObject', {
      bucket: params.bucket,
      key: params.objectKey,
      sharecode: params.shareCode,
      chiprice: params.chiPrice,
      file: params.exportPath,
    })
    .then(taskId => {
      console.log('Download task created. Task id: ', taskId)
      return taskId
    })
    .catch(err => {
      console.error('get object error')
      console.error(err)
      return Promise.reject(err)
    })
}
