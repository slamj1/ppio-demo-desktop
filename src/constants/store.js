export const MUT_SET_APP_MODE = 'mutation_setAppMode'

export const MUT_SET_USER_DATA = 'mutation_setUserData'
export const ACT_GET_USER_DATA = 'action_getUserData'
export const MUT_SET_USER_META_DATA = 'mutation_setUserMetadata'
export const ACT_GET_USER_META_DATA = 'action_getUserMetadata'
export const ACT_SET_USER_META_DATA = 'action_setUserMetadata'
export const MUT_METADATA_ADD_FILE = 'mutation_metadataAddFile'
export const ACT_METADATA_ADD_FILE = 'action_metadataAddFile'
export const MUT_METADATA_MODIFY_FILE = 'mutation_metadataModifyFile'
export const ACT_METADATA_MODIFY_FILE = 'action_metadataModifyFile'
export const MUT_METADATA_REMOVE_FILE = 'mutation_metadataRemoveFile'
export const ACT_METADATA_REMOVE_FILE = 'action_metadataRemoveFile'
export const MUT_LOGIN = 'mutation_login'
export const ACT_LOGIN = 'action_login'
export const MUT_LOGOUT = 'mutation_logout'
export const ACT_LOGOUT = 'action_login'
export const MUT_SET_BILLING_RECORDS = 'mutation_setUserJournal'
export const ACT_GET_BILLING_RECORDS = 'action_getUserJournal'
export const ACT_REFRESH_USER = 'action_refresh'
export const USAGE_PERCENT_GETTER = 'getter_usagePercent'
export const USAGE_STORAGE_GETTER = 'getter_storageUsage'

export const MUT_SET_FILE_LIST = 'mutation_setFileList'
export const ACT_GET_FILE_LIST = 'action_getFileList'
export const MUT_REMOVE_FILE = 'mutation_removeFile'
export const ACT_REMOVE_FILE = 'action_removeFile'
export const MUT_RENAME_FILE = 'mutation_renameFile'
export const ACT_RENAME_FILE = 'action_renameFile'
export const MUT_GET_FILE = 'mutation_getFile'
export const ACT_GET_FILE = 'action_getFile'

export const MUT_SECURE_FILE = 'mutation_secureFile'
export const ACT_SECURE_FILE = 'action_secureFile'
export const MUT_SHARE_FILE = 'mutation_shareFile'
export const ACT_SHARE_FILE = 'action_shareFile'

export const DL_TASK = {
  MUT_ADD_TASK: 'mutation_addDownloadTask',
  ACT_CREATE_TASK: 'action_createDownloadTask',
  MUT_REMOVE_TASK: 'mutation_removeDownloadTask',
  ACT_CANCEL_TASK: 'action_cancelDownloadTask',
  MUT_SET_STATUS: 'mutation_setDownloadStatus',
  ACT_GET_STATUS: 'action_getDownloadStatus',
  GET_TASK_COUNT: 'getter_downloadTaskCount',
}

export const UL_TASK = {
  MUT_ADD_TASK: 'mutation_addUploadTask',
  ACT_CREATE_TASK: 'action_createUploadTask',
  MUT_REMOVE_TASK: 'mutation_removeUploadTask',
  ACT_CANCEL_TASK: 'action_cancelUploadTask',
  MUT_SET_STATUS: 'mutation_setUploadStatus',
  ACT_GET_STATUS: 'action_getUploadStatus',
  GET_TASK_COUNT: 'getter_uploadTaskCount',
}

export const TASK_TYPE_DOWNLOAD = 'taskType_download'
export const TASK_TYPE_UPLOAD = 'taskType_upload'
