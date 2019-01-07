// import fs from 'fs'

export default (content, logPath) => {
  console.log('sending feedback')
  // if (logPath) {
  //   console.log('uploading log file from ', logPath)
  //   const logFileBuffer = fs.readFileSync(`${logPath}/poss.log`)
  //   console.log(logFileBuffer)
  //   console.log(Uint8Array.from(logFileBuffer).buffer)
  //   const arrayBuffer = Uint8Array.from(logFileBuffer).buffer
  //   const logFile = new File([arrayBuffer], 'poss.log')
  //   console.log('log file generated')
  //   console.log(logFile.size)
  // }
  return Promise.reject(new Error('api not implemented'))
}
