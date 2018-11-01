import { randomStr } from '@/utils/functions'

export const login = seedPhrase => {
  console.log('calling login method')
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (seedPhrase === 'success') {
        resolve('success')
      } else {
        reject(new Error('fail'))
      }
    }, 1000)
  })
}

export const generatePhraseSeed = () => {
  console.log('calling generatePhraseSeed method')
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(randomStr())
    }, 1000)
  })
}

export const logout = () => {}

export const getUserData = () => {}

export const getBillingRecords = () => {}
