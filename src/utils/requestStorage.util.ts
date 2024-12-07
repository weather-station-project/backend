import { AsyncLocalStorage } from 'async_hooks'
import { ReqId } from 'pino-http'

export const RequestIdStorage = {
  storage: new AsyncLocalStorage<ReqId>(),
  get() {
    return this.storage.getStore()
  },
  set(id: ReqId) {
    return this.storage.enterWith(id)
  },
}
