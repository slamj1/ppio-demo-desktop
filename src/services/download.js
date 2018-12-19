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
    .getCost({
      size: params.size,
      chiPrice: 100, // TODO: delete
    })
    .then(costs => {
      console.log(costs)
      // The total download cost contains only one part, so totalCost === downloadCost
      // const totalCost = costs.reduce((acc, cur) => cur + acc, 0)
      // const downloadCost = costs.reduce((acc, cur) => cur + acc, 0)
      // return { totalCost, downloadCost }
      const totalCost = parseInt(costs) / 100
      const downloadCost = parseInt(costs) / 100
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
  return poss
    .getObject({
      bucket: params.bucket,
      key: params.objectKey,
      'share-code': params.shareCode,
      chiprice: params.chiPrice,
      outfile: params.exportPath,
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
