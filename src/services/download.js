import sdk from './sdk'
import { randomStr } from './utils'
import {
  GET_FILE_INFO,
  CREATE_DOWNLOAD,
  GET_DOWNLOAD_STATUS,
  CANCEL_DOWNLOAD,
} from '../constants/sdk-methods'

export const startDownload = async fileHash => {
  console.log('start download service')
  let hash = randomStr()
  try {
    const fileRes = await sdk({
      method: GET_FILE_INFO,
      params: {
        hash,
      },
    })
    const dlRes = await sdk({
      method: CREATE_DOWNLOAD,
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
  method: GET_DOWNLOAD_STATUS,
  params: {
    taskId,
  },
})

export const cancelDownload = taskId => ({
  method: CANCEL_DOWNLOAD,
  params: {
    taskId,
  },
})
