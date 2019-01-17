import { remote } from 'electron'
import moment from 'moment'
import { APP_BUCKET_NAME } from '../constants/constants'
import * as FILE_STATUS from '../constants/file'

const poss = remote.getGlobal('poss')

function getFileStatus(objectStatus) {
  let fileStatus
  switch (objectStatus) {
    case 'Bid':
      fileStatus = FILE_STATUS.FILE_STATUS_BROKEN
      break
    case 'Part-Deal':
      fileStatus = FILE_STATUS.FILE_STATUS_PART_AVAILABLE
      break
    case 'Deal':
      fileStatus = FILE_STATUS.FILE_STATUS_AVAILABLE
      break
    case 'Pending-End':
      fileStatus = FILE_STATUS.FILE_STATUS_PENDING_END
      break
    case 'End':
      fileStatus = FILE_STATUS.FILE_STATUS_END
      break
    default:
      fileStatus = FILE_STATUS.FILE_STATUS_END
      break
  }
  return fileStatus
}

export const getObjectList = bucket =>
  poss.listObjects(bucket ? { bucket } : null).then(res => {
    console.log('get file list')
    console.log(res)
    if (res) {
      const objectList = res.filter(object => object.isdir === false).map(object => ({
        key: object.key,
        bucket: object.bucket || APP_BUCKET_NAME,
        status: getFileStatus(object.status),
        startTime: Math.round(new Date(object.created).getTime() / 1000), // in seconds
        filename: object.key.split('/').slice(-1)[0],
        size: object.length,
      }))
      return objectList.filter(res => !!res).sort((a, b) => a.startTime - b.startTime)
    }
    return []
  })

export const getObjectStatus = objectKey => {
  console.log('get object status')
  console.log(objectKey)
  return poss
    .objectStatusSync({ key: objectKey })
    .then(res => {
      console.log('get object status success for: ', objectKey)
      console.log(res)
      const expireTime = Math.round(new Date(res.expires).getTime() / 1000)
      return { expireTime }
    })
    .catch(err => {
      console.error('get object status error')
      console.error(err)
      return Promise.reject(err)
    })
}

export const headObject = objectKey => {
  console.log('getting object metadata')
  return poss.headObject({ key: objectKey }).catch(err => {
    console.error('head object error')
    console.error(err)
    return Promise.reject(err)
  })
}

export const renameFile = (oriKey, newKey) => {
  console.log('renaming file ', oriKey, newKey)
  return poss.renameObject({ key: newKey, source: `${APP_BUCKET_NAME}/${oriKey}` })
}

export const deleteFile = objectKey => {
  console.log('delete file service fired ', objectKey)
  return poss
    .deleteObject({ key: objectKey })
    .then(taskId => {
      console.log('Delete object task created. Task id: ', taskId)
      return taskId
    })
    .catch(err => {
      console.error('delete object error')
      console.error(err)
      throw err
    })
}

export const deleteFileSync = objectKey => {
  console.log('delete file (sync) service fired ', objectKey)
  return poss.deleteObjectSync({ key: objectKey }).catch(err => {
    console.error('delete object error')
    console.error(err)
    throw err
  })
}

export const renewFile = params => {
  console.log('renew object')
  return poss
    .renewObject({
      key: params.objectKey,
      chiprice: params.chiPrice,
      copies: params.copyCount,
      expires: moment(Date.now() + params.storageTime * 1000).toISOString(),
      encrypt: params.isSecure,
    })
    .then(res => res)
    .catch(err => {
      console.error('renew file error')
      console.error(err)
      return Promise.reject(err)
    })
}

export const getShareCode = objectKey =>
  poss.shareObject({ key: objectKey }).catch(err => {
    console.error('get share code failed')
    console.error(err)
    return Promise.reject(err)
  })
