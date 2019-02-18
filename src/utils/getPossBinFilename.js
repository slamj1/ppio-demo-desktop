const os = require('os')

module.exports = () => {
  const isDevPoss = process.env.DEV_POSS === 'true'
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
