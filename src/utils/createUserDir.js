import os from 'os'
import path from 'path'
import fx from 'mkdir-recursive'

export default userAddress => {
  console.log('creating datadir for: ', userAddress)
  const homeDir = os.homedir()
  const datadir = path.resolve(homeDir, `./.ppio-demo/${userAddress}`)
  try {
    fx.mkdirSync(datadir)
    return datadir
  } catch (err) {
    console.error(err)
    return null
  }
}
