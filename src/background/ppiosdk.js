import path from 'path'
import poss from 'poss-sdk'
import { BOOTSTRAP_HOST, INDEXER_URL } from '../constants/ports'

const possIns = poss.create({
  indexerUrl: INDEXER_URL,
  bootstrapip: BOOTSTRAP_HOST,
})

console.log('poss path: ', possIns.possBin)
if (process.env.NODE_ENV === 'production') {
  possIns.setPossBinPath(
    possIns.possBin.replace('app.asar', 'app.asar.unpacked/node_modules/poss-sdk'),
  )
  console.log('prod poss path: ', possIns.possBin)
} else {
  possIns.setPossBinPath(path.join(process.cwd(), './node_modules/poss-sdk/bin/poss'))
  console.log('dev poss path: ', possIns.possBin)
}

export default possIns