import { remote } from 'electron'

const poss = remote.getGlobal('poss')

export const getFile = async params => {
  console.log('get file service fired')
  console.log(params)

  return poss
    .objectCopy({
      key: params.key,
      copies: params.copies,
      duration: params.duration,
      gasprice: params.chiPrice,
      owner: params.ownerId,
      auth: '',
    })
    .then(() => ({ taskId: params.key }))
}

export const cancelGet = taskId => Promise.resolve(taskId)
