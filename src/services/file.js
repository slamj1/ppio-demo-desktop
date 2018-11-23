import { remote } from 'electron'

const ppioUser = remote.getGlobal('ppioUser')

export const getObjectList = () =>
  ppioUser
    .objectList()
    .then(res => {
      console.log('get file list')
      console.log(res)
      if (res) {
        const objectList = res.map(file => {
          const fileInfo = file.ObjectBasicInfo
          return {
            id: fileInfo.ObjectHash,
            filename: fileInfo.ObjectHash,
            size: fileInfo.ObjectLength,
            type: 'file',
            isSecure: false,
            isPublic: fileInfo.ObjectAclType === 'Public',
          }
        })

        const getDetailsReqArr = objectList.map(file =>
          getObjectStatus(file.id)
            .then(res => {
              console.log('get object details success')
              console.log(res)
              return Object.assign({}, file, {
                isDeal: res[0].ContractStatus === 'US_DEAL',
              })
            })
            .catch(err => {
              console.log('get object details error')
              console.error(err)
              return Promise.resolve(Object.assign({}, file))
            }),
        )

        return Promise.all(getDetailsReqArr).then(detailedObjectList => {
          console.log(detailedObjectList)
          return detailedObjectList.filter(res => res.isDeal)
        })
      }
      return []
    })
    .catch(err => {
      console.error(err)
    })

export const getObjectStatus = async objectHash => {
  console.log('get object status')
  console.log(objectHash)
  return ppioUser.objectStatus({ objectHash: [objectHash] }).then(
    res => res,
    err => {
      console.error('get upload object status error')
      console.error(err)
      return err
    },
  )
}

export const getStorageStatus = async objectHash => {
  console.log('get storage status')
  console.log(objectHash)
  return ppioUser.storageObject({ objectHash: [objectHash] }).then(
    res => res,
    err => {
      console.error('get upload object status error')
      console.error(err)
      return err
    },
  )
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

export const deleteFile = objectHash => {
  console.log('delete file service fired')
  return ppioUser.objectDelete({ objectHash })
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
