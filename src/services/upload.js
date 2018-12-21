import moment from 'moment'
import { remote } from 'electron'

const poss = remote.getGlobal('poss')

const timeToExpireDate = storageTime =>
  moment(Date.now() + storageTime * 1000).format('YYYY-MM-DD')

/**
 * @typedef {Object} UploadCost
 * @property {number} totalCost
 * @property {number} storageCost
 * @property {number} uploadCost
 */

/**
 * get upload cost from sdk
 * @param params
 * @returns {Promise<UploadCost>}
 */
export const getEstimateCost = params => {
  console.log('request upload file cost')
  console.log(params)
  return poss
    .putCost({
      size: params.size,
      copies: params.copyCount,
      expires: timeToExpireDate(params.storageTime),
    })
    .then(costs => {
      // The total upload cost contains two parts: storage and upload
      const storageCost = parseInt(costs.miner)
      const uploadCost = parseInt(costs.service)
      const totalCost = storageCost + uploadCost
      return { totalCost, storageCost, uploadCost }
    })
    .catch(err => {
      console.error('get upload cost fail')
      console.error(err)
      return Promise.reject(err)
    })
}

/**
 * start upload, returns object key for taskId
 * @param params
 * @param {object} params
 * @param {String} params.objectKey - file's key, use file name for now
 * @param {number} params.chiPrice - chi price
 * @param {number} params.copyCount - copies
 * @param {number} params.localPath - the file's path
 * @param {number} params.storageTime - time to storage, in seconds
 * @param {number} params.isSecure - whether to encrypt the file, enforced to be true in demo
 * @param {number} params.cpoolId - the coin pool's id to use
 * @returns {Promise<{taskId: string} | never>}
 */
export const startUpload = async params => {
  console.log('start upload service')
  console.log(params)
  return poss
    .putObject({
      key: params.objectKey,
      body: params.localPath,
      copies: params.copyCount,
      metadata: '',
      expires: timeToExpireDate(params.storageTime),
      chiprice: params.chiPrice,
      encrypt: params.isSecure,
      // 'cpool-id': params.cpoolId, TODO: cpool
    })
    .then(taskId => {
      console.log('Upload task created. Task id: ', taskId)
      return taskId
    })
    .catch(err => {
      console.error('put object error')
      console.error(err)
      return Promise.reject(err)
    })
}
