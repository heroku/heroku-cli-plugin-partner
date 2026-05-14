import {APIClient, Command} from '@heroku-cli/command'

const PARTNER_CONNECT_ACCEPT_HEADER = 'application/vnd.heroku+json; version=3.partner'

export default abstract class BaseCommand extends Command {
  get apiClient(): APIClient {
    this.heroku.defaults.headers = {
      ...this.heroku.defaults.headers,
      Accept: PARTNER_CONNECT_ACCEPT_HEADER,
    }
    return this.heroku
  }
}
