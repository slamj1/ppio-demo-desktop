import { remote } from 'electron'

const ppioUser = remote.getGlobal('ppioUser')

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

export const changeObjectAcl = async params => {
  console.log('changing object acl')
  return ppioUser
    .ObjectUpdateAcl({
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

export const renewFile = id => {}
