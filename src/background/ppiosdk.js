import path from 'path'
import Poss from 'ppio'
import getPossBinFilename from '../utils/getPossBinFilename'

const possBinPath = path.join(
  path.dirname(__dirname),
  process.env.NODE_ENV === 'development' ? 'src/poss-bin' : 'extraResources',
  getPossBinFilename(),
)
console.log(possBinPath)

let isDebug = false
// const args = {}

for (let i = 0; i < process.argv.length; i++) {
  const arg = process.argv[i]
  if (arg.split('=')[0] === '--debug') {
    let value = arg.split('=')[1]
    if (value === undefined || value === 'true') {
      isDebug = true
    }
    break
  }
}
if (isDebug) {
  console.log('run in debug mode')
} else {
  console.log('run in normal mode')
}
// process.argv.forEach(arg => {
//   const key = arg.split('=')[0]
//   let value = arg.split('=')[1]
//   if (value === undefined || value === 'true') {
//     value = true
//   }
//   args[key] = value
// })

const possIns = new Poss({
  ppioExecutablePath: possBinPath,
  debug: isDebug,
})
console.log('poss instance created')
console.log('poss path: ', possIns.ppioPath)

export default possIns
