import { CONTRACT_LIST, GET_FILE_INFO } from '@/constants/sdk-methods'

function randomStr() {
  return Math.random()
    .toString(36)
    .substring(7)
}

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
  }
  return returnData
}

export default data => {
  console.log('calling sdk ', data.method)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(mockData(data.method))
    }, 1000)
  })
}
