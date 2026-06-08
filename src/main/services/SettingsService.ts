import type { AppSettings } from '@shared/domain'
import { SettingsRepository } from '../repositories/SettingsRepository'

/** Business logic for application settings. */
export class SettingsService {
  constructor(private readonly repo: SettingsRepository = new SettingsRepository()) {}

  get(): AppSettings {
    return this.repo.get()
  }

  update(patch: Partial<AppSettings>): AppSettings {
    return this.repo.update(patch)
  }
}
