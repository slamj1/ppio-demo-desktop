import { remote } from 'electron'
import { APP_BUCKET_NAME } from '../constants/constants'

const ppioUser = remote.getGlobal('ppioUser')

export const listBuckets = () => {
  console.log('listing buckets')
  return ppioUser
    .listBuckets()
    .then(res => {
      console.log('user buckets: ')
      console.log(res)
      return res || []
    })
    .catch(err => {
      console.error('list bucket failed')
      console.error(err)
      return Promise.reject(err)
    })
}

export const createBucket = bucketName => {
  console.log('creating bucket: ', bucketName)
  return ppioUser
    .createBucket({ bucket: bucketName })
    .then(res => {
      console.log(`${bucketName} bucket created`)
      return res
    })
    .catch(err => {
      console.error('create bucket failed')
      console.error(err)
      return Promise.reject(err)
    })
}

export const createDefaultBucket = () => createBucket(APP_BUCKET_NAME)

/**
 * Check if default bucket("ppio-demo") exists. If not, create one.
 * @returns {PromiseLike<T | never>}
 */
export const checkDefaultBucket = () => {
  console.log('checking bucket')
  return listBuckets()
    .then(res => {
      if (res.indexOf(APP_BUCKET_NAME) > -1) {
        console.log('default bucket exists')
        return true
      }
      return createDefaultBucket().then(() => {
        console.log('default bucket created')
        return true
      })
    })
    .then(() => ppioUser.setGlobalBucket(APP_BUCKET_NAME))
}

// unused
export const deleteBucket = bucketName => {
  console.log(`deleting bucket ${bucketName}`)
  return ppioUser
    .deleteBucket({ bucket: bucketName })
    .then(res => {
      console.log(`${bucketName} bucket deleted`)
      return res
    })
    .catch(err => {
      console.error('delete bucket failed')
      console.error(err)
      return Promise.reject(err)
    })
}
