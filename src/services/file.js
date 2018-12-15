import { remote } from 'electron'
import moment from 'moment'
import { APP_BUCKET_NAME } from '../constants/constants'

const poss = remote.getGlobal('poss')

export const getObjectList = bucket =>
  poss.listObjects(bucket ? { bucket } : null).then(res => {
    console.log('get file list')
    console.log(res)
    if (res) {
      const getDetailsReqArr = res.map(objectKey =>
        getObjectStatus(objectKey)
          .then(res => {
            console.log('get contract details success')
            console.log(res)
            const contract = res[0].Contracts[0]
            const expireTime = contract.ExpireTime
            const isDeal = contract.Status === 'SC_AVAILABLE'
            return {
              key: objectKey,
              bucket: bucket || APP_BUCKET_NAME,
              hash: res[0].Hash,
              isDeal,
              contractId: contract.ContractID,
              expireTime: expireTime, // in seconds
              filename: objectKey.split('/').slice(-1)[0],
            }
          })
          .then(object => {
            return headObject(object.key).then(res => {
              console.log('get object details success ')
              console.log(res)
              const startTime = Math.round(new Date(res.Created).getTime() / 1000)
              const finalObject = Object.assign({}, object, {
                startTime,
                size: res.ContentLength,
                metadata: res.Metadata,
              })
              console.log(finalObject)
              return finalObject
            })
          })
          .catch(err => {
            console.log('get object details error')
            console.error(err)
            return Promise.resolve(null)
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
  return poss.objectStatus({ key: objectKey }).catch(err => {
    console.error('get upload object status error')
    console.error(err)
    return Promise.reject(err)
  })
}

export const headObject = objectKey => {
  console.log('getting object metadata')
  return poss.headObject({ key: objectKey }).catch(err => {
    console.error('get upload object status error')
    console.error(err)
    return Promise.reject(err)
  })
}

export const changeObjectAcl = params => {
  console.log('changing object acl')
  return poss
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
  return poss.deleteObject({ key: objectKey })
}

export const renewFile = params => {
  console.log('renew object')
  return poss
    .objectRenew({
      key: params.objectKey,
      chiprice: params.chiPrice,
      copies: params.copyCount,
      expires: moment(Date.now() + params.storageTime).format('YYYY-MM-DD'),
      encrypt: params.isSecure,
      'cpool-id': params.cpoolId,
    })
    .then(res => res)
    .catch(err => {
      console.error('get upload object status error')
      console.error(err)
      return err
    })
}

export const getShareCode = objectKey =>
  poss
    .shareObject({ key: objectKey })
    .then(res => res['share-code'])
    .catch(err => {
      console.error(err)
      return Promise.reject(err)
    })
