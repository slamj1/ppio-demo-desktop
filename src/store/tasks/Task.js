export default function Task(initData) {
  if (!initData.id || !initData.file) {
    throw new Error('invalid task data')
  }
  return {
    type: initData.type,
    id: initData.id,
    transferringData: false, // downloading or uploading
    transferProgress: 0, // transferred percentage, in number
    transferSpeed: '0b/s', // transfer speed, in string
    finished: false,
    file: initData.file,
  }
}
