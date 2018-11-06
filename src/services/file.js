import { randomStr } from './utils'

export const getFileInfoByShareCode = code =>
  new Promise((resolve, reject) => {
    if (code === '') {
      reject(new Error('share code is empty'))
    }
    const id = randomStr()
    resolve({
      result: {
        id,
        filename: `testfile ${id}`,
        fileType: 'plain',
        size: parseInt(Math.random() * 1000),
        isSecure: !!Math.round(Math.random()),
        isPublic: !!Math.round(Math.random()),
      },
    })
  })

export const getFile = id =>
  new Promise((resolve, reject) => {
    if (id === '') {
      reject(new Error('get file error'))
    } else {
      resolve('get file success')
    }
  })

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
