import sdk from './sdk'
import { CONTRACT_LIST, GET_FILE_INFO } from '@/constants/sdk-methods'

export default params =>
  sdk({
    method: CONTRACT_LIST,
    params,
  })
    .then(res => res.result)
    .then(result =>
      Promise.all(
        result.map(fileHash =>
          sdk({
            method: GET_FILE_INFO,
            params: { hash: fileHash },
          })
            .then(res => {
              console.log(res)
              return Promise.resolve(res.result)
            })
            .catch(err => {
              console.log(err)
              return Promise.resolve()
            }),
        ),
      ),
    )
    .then(results => {
      console.log(results)
      return results.filter(result => result !== undefined)
    })
