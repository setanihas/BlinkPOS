import type { ApiClient } from './types'
import { ipcApiClient } from './ipc/ipcClient'

/**
 * Single place that decides which transport backs the data layer. Today it is
 * IPC; to migrate to a backend, implement an HTTP ApiClient and return it here
 * (optionally based on an env flag). The rest of the app imports `api` only.
 */
export function createApiClient(): ApiClient {
  return ipcApiClient
}

export const api: ApiClient = createApiClient()
