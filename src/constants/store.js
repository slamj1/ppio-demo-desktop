export const MUT_REPLACE_STATE_HOOK = 'mutation_replaceStateHook' // dispatched after replaceState in App.vue, to convert tasks/files into Task/File instance

export const MUT_CLEAR_DATA = 'mutation_clearAppData'
export const ACT_CLEAR_DATA = 'action_clearAppData'
export const MUT_SET_DATA_DIR = 'mutation_setDataDir'
export const MUT_SET_CHI_PRICE = 'mutation_setChiPrice'
export const ACT_START_POLLING_CHI_PRICE = 'action_startPollingChiPrice'

export const MUT_SET_USER_DATA = 'mutation_setUserData'
export const ACT_GET_USER_DATA = 'action_getUserData'
export const ACT_GET_USER_CPOOL = 'action_getUserCpool'
export const MUT_SET_USER_CPOOL = 'mutation_setUserCpool'
export const ACT_GET_ACCOUNT_DETAILS = 'action_getUserBalance'
export const MUT_WRITE_USER_INDEX_DATA = 'mutation_setUserMetadata'
export const ACT_GET_USER_INDEX_DATA = 'action_getUserMetadata'
export const ACT_FLUSH_USER_INDEX_DATA = 'action_flushUserMetadata'
export const ACT_LOGOUT = 'action_logout'
export const MUT_SET_BILLING_RECORDS = 'mutation_setUserJournal'
export const ACT_GET_BILLING_RECORDS = 'action_getUserJournal'
export const USAGE_STORAGE_GETTER = 'getter_storageUsage'
export const MUT_CLEAR_USER_DATA = 'mutation_clearUserData'

export const MUT_SET_FILE_LIST = 'mutation_setFileList'
export const ACT_GET_FILE_LIST = 'action_getFileList'
export const ACT_GET_FILE_LIST_DETAILS = 'action_getFileListDetails'
export const MUT_REMOVE_FILE = 'mutation_removeFile'
export const ACT_REMOVE_FILE = 'action_removeFile'
export const ACT_RENAME_FILE = 'action_renameFile'
export const ACT_REFRESH_FILE_LIST = 'action_addFileMetadata'
export const MUT_SECURE_FILE = 'mutation_secureFile'
export const MUT_SHARE_FILE = 'mutation_shareFile'
export const ACT_SHARE_FILE = 'action_shareFile'
export const MUT_CLEAR_FILE_DATA = 'mutation_clearFileData'

export const ACT_RESTORE_BG_TASKS = 'action_restoreBackgroundTasks'
export const ACT_SYNC_POSS_TASKS = 'action_syncTasksFromPoss'
export const ACT_START_POLLING_TASK_PROGRESS = 'action_startPollingTaskProgress'

export const DL_TASK = {
  MUT_RESTORE_BG_TASKS: 'mutation_restoreBackgroundDownloadTask',
  MUT_ADD_TASK: 'mutation_addDownloadTask',
  ACT_CREATE_TASK: 'action_createDownloadTask',
  MUT_START_TASK: 'action_startDownloadTask',
  ACT_PAUSE_TASK: 'action_pauseDownloadTask',
  MUT_PAUSE_TASK: 'mutation_pauseDownloadTask',
  ACT_RESUME_TASK: 'action_resumeDownloadTask',
  MUT_RESUME_TASK: 'mutation_resumeDownloadTask',
  MUT_FINISH_TASK: 'mutation_finishDownloadTask',
  MUT_FAIL_TASK: 'mutation_failDownloadTask',
  MUT_REMOVE_TASK: 'mutation_removeDownloadTask',
  MUT_CANCEL_TASK: 'mutation_cancelDownloadTask',
  ACT_CANCEL_TASK: 'action_cancelDownloadTask',
  ACT_DELETE_TASK: 'action_deleteDownloadTask',
  MUT_SET_PROGRESS: 'mutation_setDownloadProgress',
  ACT_GET_PROGRESS: 'action_getDownloadProgress',
  GET_TASK_COUNT: 'getter_downloadTaskCount',
  MUT_SET_TASK_STATUS: 'mutation_setDownloadTaskStatus',
  MUT_SET_POLLING_TASK_TIMER: 'mutation_setPollingDownloadTaskTimer',
}

export const UL_TASK = {
  MUT_RESTORE_BG_TASKS: 'mutation_restoreBackgroundUploadTask',
  MUT_ADD_TASK: 'mutation_addUploadTask',
  ACT_CREATE_TASK: 'action_createUploadTask',
  MUT_START_TASK: 'action_startUploadTask',
  ACT_PAUSE_TASK: 'action_pauseUploadTask',
  MUT_PAUSE_TASK: 'mutation_pauseUploadTask',
  ACT_RESUME_TASK: 'action_resumeUploadTask',
  MUT_RESUME_TASK: 'mutation_resumeUploadTask',
  MUT_FINISH_TASK: 'mutation_finishUploadTask',
  MUT_FAIL_TASK: 'mutation_failUploadTask',
  MUT_REMOVE_TASK: 'mutation_removeUploadTask',
  MUT_CANCEL_TASK: 'mutation_cancelUploadTask',
  ACT_CANCEL_TASK: 'action_cancelUploadTask',
  ACT_DELETE_TASK: 'action_deleteUploadTask',
  MUT_SET_PROGRESS: 'mutation_setUploadProgress',
  ACT_GET_PROGRESS: 'action_getUploadProgress',
  GET_TASK_COUNT: 'getter_uploadTaskCount',
  MUT_SET_TASK_STATUS: 'mutation_setUploadTaskStatus',
  MUT_SET_POLLING_TASK_TIMER: 'mutation_setPollingUploadTaskTimer',
}

export const TASK_TYPE_DOWNLOAD = 'taskType_download'
export const TASK_TYPE_UPLOAD = 'taskType_upload'

export const MUT_CLEAR_TASK_DATA = 'mutation_clearTaskData'
