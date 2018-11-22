import { remote } from 'electron'
import { APP_SECURE_KEY } from '../constants/constants'
import { CANCEL_DOWNLOAD } from '../constants/sdk-methods'

const ppioUser = remote.getGlobal('ppioUser')

export const getFileInfoByShareCode = code =>
  new Promise((resolve, reject) => {
    if (code === '') {
      reject(new Error('share code is empty'))
    }
    // TODO: get file info from share code
    resolve({
      result: {
        hashCode: 'd22bf98693531795ca8b13ec766df9b70af82581001e82d6c73a1a3629ba56ad',
        ownerId:
          '0025080212210302ac7cd300d311299ef1fd4a4c7ccdda413271afa44a14eee94414aa5e63942b',
        filename: '111.sketch',
        fileType: 'plain',
        encryptKey: APP_SECURE_KEY,
        size: parseInt(Math.random() * 10000000),
      },
    })
  })

export const getFile = async params => {
  console.log('get file service fired')
  console.log(params)

  try {
    await ppioUser.objectCopy({
      copies: params.copies,
      duration: params.duration,
      gasprice: params.chiPrice,
      acl: params.acl || 'private',
      objectHash: params.objectHash,
      owner: params.ownerId,
      auth: '',
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

export const cancelGet = taskId => ({
  method: CANCEL_DOWNLOAD,
  params: {
    taskId,
  },
})
