import { remote } from 'electron'

export const startDaemon = dataDir =>
  remote.getGlobal('startDaemon')({ datadir: '/Volumes/ExtCard/user6' })

export const stopDaemon = () => remote.getGlobal('stopDaemon')()
