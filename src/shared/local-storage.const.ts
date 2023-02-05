import * as path from 'node:path';

export const LOCAL_STORAGE = path.join(path.sep, 'home', 'duytv', 'server-storage');
export const LOCAL_STORAGE_UPLOAD_FILE = path.join(LOCAL_STORAGE, 'upload-file');
export const LOCAL_STORAGE_CONVERT_FILE = path.join(LOCAL_STORAGE, 'convert-file');
export const LOCAL_STORAGE_AVATAR = path.join(LOCAL_STORAGE, 'avatar');