const os = require('os')

module.exports = () => {
  let binFilename = ''
  if (os.platform() === 'darwin') {
    binFilename = 'poss_mac'
  } else if (os.platform() === 'win32') {
    binFilename = 'poss_win.exe'
  } else if (os.platform() === 'linux') {
    binFilename = 'poss_linux'
  }
  return binFilename
}
