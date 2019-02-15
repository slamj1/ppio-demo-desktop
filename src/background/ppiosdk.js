import path from 'path'
import Poss from 'ppio'
import getPossBinFilename from '../utils/getPossBinFilename'

const possBinPath = path.join(
  path.dirname(__dirname),
  process.env.NODE_ENV === 'development' ? 'src/poss-bin' : 'extraResources',
  getPossBinFilename(),
)
console.log(possBinPath)

const possIns = new Poss({
  ppioExecutablePath: possBinPath,
  debug: !!process.argv.debug,
})
console.log('poss instance created')
console.log('poss path: ', possIns.ppioPath)

export default possIns
