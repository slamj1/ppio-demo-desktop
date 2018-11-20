import { remote } from 'electron'

const ppioUser = remote.getGlobal('ppioUser')

export const getFileInfoByShareCode = code =>
  new Promise((resolve, reject) => {
    if (code === '') {
      reject(new Error('share code is empty'))
    }
    resolve({
      result: {
        hashCode: '5bfb028c3a2a617539b324743c0ad868b4ba6dba83e4cde8038451855ae1f082',
        ownerId:
          '00250802122102416bc64849b47a4ce3689a4b8da2273794a287c50189cd58753cfc767b3149c9',
        filename: '9bc6667cfcb409',
        fileType: 'plain',
        size: parseInt(Math.random() * 10000000),
      },
    })
  })

export const getFile = fileInfo =>
  ppioUser
    .objectCopy({
      copies: fileInfo.copies,
      duration: fileInfo.duration * 3600 * 24,
      gasprice: fileInfo.gasprice,
      acl: fileInfo.acl,
      objectHash: fileInfo.hashCode,
      owner: fileInfo.ownerId,
      auth: '',
    })
    .then(data => data, err => Promise.reject(err))

export const getObjectStatus = objectHash =>
  ppioUser
    .objectStatus({
      objectHash: objectHash,
    })
    .then(data => data, err => err)

export const renameFile = id =>
  new Promise((resolve, reject) => {
    if (id === '') {
      reject(new Error('rename file error'))
    } else {
      resolve('rename file success')
    }
  })

export const deleteFile = id =>
  new Promise((resolve, reject) => {
    if (id === '') {
      reject(new Error('delete file error'))
    } else {
      resolve('delete file success')
    }
  })

export const renewFile = id => {}
