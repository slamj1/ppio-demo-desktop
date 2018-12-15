import path from 'path'
import poss from 'poss-sdk'
import { BOOTSTRAP_HOST, INDEXER_URL } from '../constants/ports'

const possIns = poss.create({
  indexerUrl: INDEXER_URL,
  bootstrapip: BOOTSTRAP_HOST,
})

if (process.env.NODE_ENV === 'production') {
  possIns.setPossBinPath(
    poss.possBin.replace('app.asar', 'app.asar.unpacked/node_modules/poss-sdk'),
  )
} else {
  possIns.setPossBinPath(path.join(process.cwd(), './node_modules/poss-sdk/bin/poss'))
}

export default possIns
