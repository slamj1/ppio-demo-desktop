import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { remote } from 'electron'
import archiver from 'archiver'

const poss = remote.getGlobal('poss')

const genZip = (fileArr, zipPath) => {
  const output = fs.createWriteStream(zipPath)
  return new Promise((resolve, reject) => {
    console.log('waiting for open')
    output.on('open', () => {
      console.log('write stream open')

      const archive = archiver('zip', {
        zlib: { level: 9 },
      })
      output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`)
        console.log(
          'archiver has been finalized and the output file descriptor has closed.',
        )
        resolve(zipPath)
      })
      output.on('end', () => {
        console.log('Data has been drained')
      })
      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          console.warn(err)
        } else {
          // throw error
          throw err
        }
      })
      archive.on('error', err => {
        throw err
      })
      archive.pipe(output)

      fileArr.forEach(file => {
        if (typeof file === 'string') {
          archive.append(fs.createReadStream(file), { name: path.basename(file) })
        } else if (typeof file === 'object') {
          archive.append(JSON.stringify(file, null, 2), { name: 'desc.json' })
        }
      })
      archive.finalize()
    })
  })
}

export const feedback = (descObj, userAddress, userDir) => {
  const timestamp = Date.now()
  const logFileName = path.basename(poss.possPath, path.extname(poss.possPath))
  const curLogFile = path.join(userDir, `./${logFileName}.log`)
  let logFileSize
  try {
    logFileSize = fs.statSync(curLogFile).size
  } catch (err) {
    console.error(err)
    return Promise.reject(err)
  }
  console.log(logFileSize)

  const descFileObj = {
    systemInfo: {
      arch: os.arch(),
      platform: os.platform(),
      version: os.release(),
    },
    ...descObj,
  }

  const logFileList = [curLogFile]
  if (logFileSize < 50 * 1024 * 1024) {
    const olderLogFile = path.join(userDir, `./${logFileName}.1.log`)
    if (fs.existsSync(olderLogFile)) {
      logFileList.push(olderLogFile)
    }
  }
  const zipPath = path.join(userDir, `./log-report-${timestamp}.zip`)
  return genZip(logFileList.concat([descFileObj]), zipPath)
    .then(filePath => {
      uploadFile(filePath, userAddress)
        .then(() => {
          console.log('upload finished, unlinking file')
          fs.unlinkSync(filePath, err => {
            if (err) {
              console.error('unlink failed ', filePath)
            } else {
              console.log('unlink success')
            }
          })
          return true
        })
        .catch(err => {
          console.error('upload log failed!')
          console.error(err)
        })
      return filePath
    })
    .catch(err => {
      console.error('feedback failed')
      console.error(err)
      return Promise.reject(err)
    })
}

export const uploadFile = (filePath, address) => {
  console.log('uploading log file from ', filePath)
  const filename = path.basename(filePath)
  return getPutUrl(filename, address)
    .then(postData => {
      console.log('post data got: ')
      console.log(postData)
      const logFileBuffer = fs.readFileSync(filePath)
      console.log(logFileBuffer)
      console.log(Uint8Array.from(logFileBuffer).buffer)
      const arrayBuffer = Uint8Array.from(logFileBuffer).buffer
      const logFile = new File([arrayBuffer], 'poss.log')
      console.log('log file generated')
      console.log(logFile.size)
      return uploadToS3(logFile, postData)
    })
    .catch(err => {
      console.error('upload file failed')
      console.error(err)
      return Promise.reject(err)
    })
}

export const getPutUrl = (filename, address) => {
  console.log('getting s3 pre-signed url')
  return axios({
    url: 'https://0nxk8m91ka.execute-api.us-west-2.amazonaws.com/dev/api/getreporturl',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      address,
      filename,
    },
  }).then(res => {
    if (res.data.code === 0) {
      return res.data.data
    }
    return Promise.reject(res.data)
  })
}

export const uploadToS3 = (file, postData) => {
  console.log('uploading file to s3')
  console.log(file.size)
  console.log(postData)
  // return axios({
  //   url,
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'binary/octet-stream',
  //   },
  //   data: file,
  // })
  const postForm = new FormData()
  postForm.append('key', postData.key)
  postForm.append('acl', 'authenticated-read')
  postForm.append('x-amz-server-side-encryption', 'AES256')
  postForm.append('X-Amz-Credential', postData.amzCredential)
  postForm.append('X-Amz-Algorithm', 'AWS4-HMAC-SHA256')
  postForm.append('X-Amz-Date', postData.amzDate)
  postForm.append('Policy', postData.policy)
  postForm.append('X-Amz-Signature', postData.signature)
  postForm.append('file', file)
  return axios({
    url: `http://${postData.bucket}.s3.amazonaws.com/`,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: postForm,
  })
}
