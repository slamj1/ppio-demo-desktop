import { remote } from 'electron'

const ppioUser = remote.getGlobal('ppioUser')

export const getObjectList = () =>
  ppioUser.listObjects().then(res => {
    console.log('get file list')
    console.log(res)
    if (res) {
      const objectList = res.map(file => {
        const fileInfo = file.ObjectBasicInfo
        // File.js
        return {
          id: fileInfo.key,
          isSecure: true, // all files are encrypted in demo verison
        }
      })

      const getDetailsReqArr = objectList.map(object =>
        getObjectStatus(object.id)
          .then(res => {
            console.log('get contract details success')
            console.log(res)
            // File.js
            return Object.assign({}, object, {
              isDeal: res[0].ContractStatus === 'US_DEAL',
              contractId: res[0].ContractId,
              startTime: res[0].StartTime,
              duration: res[0].Duration,
            })
          })
          .then(object => headObject(object.id))
          .then(res => {
            console.log('get object info success')
            console.log(res)
            if (!res.Metadata.filename) {
              console.log('no file name for ', object.id)
            }
            return Object.assign({}, object, {
              size: res.ContentLength,
              metadata: res.Metadata,
              filename: res.Metadata.filename || '',
            })
          })
          .catch(err => {
            console.log('get object details error')
            console.error(err)
            return Promise.resolve(Object.assign({}, object))
          }),
      )

      return Promise.all(getDetailsReqArr).then(detailedObjectList => {
        console.log(detailedObjectList)
        return detailedObjectList.filter(res => res.isDeal)
      })
    }
    return []
  })

export const getObjectStatus = objectKey => {
  console.log('get object status')
  console.log(objectKey)
  return ppioUser.objectStatus({ key: objectKey }).catch(err => {
    console.error('get upload object status error')
    console.error(err)
    return Promise.reject(err)
  })
}

export const headObject = objectKey => {
  console.log('getting object metadata')
  return ppioUser.headObject({ key: objectKey })
}

export const changeObjectAcl = params => {
  console.log('changing object acl')
  return ppioUser
    .objectUpdateAcl({
      objectHash: params.objectHash,
      acl: params.isPublic ? 'Public' : 'Private',
    })
    .then(
      res => res,
      err => {
        console.error('get upload object status error')
        console.error(err)
        return err
      },
    )
}

export const renameFile = id =>
  new Promise((resolve, reject) => {
    if (id === '') {
      reject(new Error('rename file error'))
    } else {
      resolve('rename file success')
    }
  })

export const deleteFile = objectKey => {
  console.log('delete file service fired')
  return ppioUser.deleteObject({ key: objectKey })
}

export const renewFile = params => {
  console.log('renew object')
  return ppioUser
    .objectRenew({
      objectHash: params.objectHash,
      copies: params.copyCount,
      duration: params.storageTime,
      gasprice: params.chiPrice,
      acl: params.isPublic ? 'Public' : 'Private',
    })
    .then(
      res => res,
      err => {
        console.error('get upload object status error')
        console.error(err)
        return err
      },
    )
}
