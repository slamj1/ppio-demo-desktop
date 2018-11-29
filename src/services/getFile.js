import { remote } from 'electron'
import { APP_SECURE_KEY } from '../constants/constants'

const ppioUser = remote.getGlobal('ppioUser')

export const getFileInfoByShareCode = code =>
  new Promise((resolve, reject) => {
    if (code === '') {
      reject(new Error('share code is empty'))
    }
    // TODO: get file info from share code
    resolve({
      result: {
        hashCode: 'fb643353d6cb6012d81e9e5f8ffce281c2df0eae3e844078f95750c3c22305f6',
        ownerId:
          '0025080212210302ac7cd300d311299ef1fd4a4c7ccdda413271afa44a14eee94414aa5e63942b',
        filename: 'Hopper.4.3.3.dmg',
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

export const cancelGet = taskId => Promise.resolve(taskId)
