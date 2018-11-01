import {
  CONTRACT_LIST,
  GET_FILE_INFO,
  CREATE_DOWNLOAD,
  GET_DOWNLOAD_STATUS,
  CANCEL_DOWNLOAD,
  CREATE_UPLOAD,
  GET_UPLOAD_STATUS,
  CANCEL_UPLOAD,
} from '../constants/sdk-methods'
import { randomStr } from './utils'

function mockData(method) {
  let returnData
  switch (method) {
    case CONTRACT_LIST:
      returnData = {
        result: [
          'e91ba0972b9055187fa2efa8b5c156f487a82931',
          'e91ba0972b9055187fa2efa8b5c156f487a82932',
          'e91ba0972b9055187fa2efa8b5c156f487a82933',
          'e91ba0972b9055187fa2efa8b5c156f487a82936',
          'e91ba0972b9055187fa2efa8b5c156f487a82937',
          'e91ba0972b9055187fa2efa8b5c156f487a82934',
          'e91ba0972b9055187fa2efa8b5c156f487a82930',
        ],
      }
      break
    case GET_FILE_INFO:
      const id = randomStr()
      returnData = {
        result: {
          id,
          filename: `testfile ${id}`,
          fileType: 'plain',
          size: parseInt(Math.random() * 1000),
          isSecure: !!Math.round(Math.random()),
          isPublic: !!Math.round(Math.random()),
        },
      }
      break
    case CREATE_DOWNLOAD:
    case CREATE_UPLOAD:
      returnData = {
        taskId: randomStr(),
      }
      break
    case GET_DOWNLOAD_STATUS:
    case GET_UPLOAD_STATUS:
      console.log('getting download status')
      returnData = {
        finished: false,
        progress: Math.random() * 100,
      }
      break
    case CANCEL_DOWNLOAD:
    case CANCEL_UPLOAD:
      returnData = {}
      break
  }
  return returnData
}

export default data => {
  console.log('calling sdk ', data.method)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(mockData(data.method, data.params))
    }, 1000)
  })
}
