const os = require('os')

const isDevPoss = process.env.DEV_POSS === 'true'

module.exports = () => {
  let binFilename = ''
  if (os.platform() === 'darwin') {
    binFilename = isDevPoss ? 'poss_mac_dev' : 'poss_mac'
  } else if (os.platform() === 'win32') {
    binFilename = isDevPoss ? 'poss_win_dev.exe' : 'poss_win.exe'
  } else if (os.platform() === 'linux') {
    binFilename = isDevPoss ? 'poss_linux_dev' : 'poss_linux'
  }
  return binFilename
}
