import sdk from './sdk'
import { randomStr } from './utils'
import {
  GET_FILE_INFO,
  CREATE_UPLOAD,
  GET_UPLOAD_STATUS,
  CANCEL_UPLOAD,
} from '../constants/sdk-methods'

export const startUpload = async fileHash => {
  console.log('start upload service')
  let hash = randomStr()
  try {
    const fileRes = await sdk({
      method: GET_FILE_INFO,
      params: {
        hash,
      },
    })
    const dlRes = await sdk({
      method: CREATE_UPLOAD,
      params: {
        fileHash: fileRes.result.id,
      },
    })

    console.log(fileRes)
    console.log(dlRes)
    return {
      taskId: dlRes.taskId,
      file: fileRes.result,
    }
  } catch (err) {
    console.error(err)
    return {}
  }
}

export const getProgress = taskId => ({
  method: GET_UPLOAD_STATUS,
  params: {
    taskId,
  },
})

export const cancelUpload = taskId => ({
  method: CANCEL_UPLOAD,
  params: {
    taskId,
  },
})
