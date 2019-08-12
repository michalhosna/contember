import Command from './Command'
import { Client } from '@contember/database'
import ApiKey from '../type/ApiKey'

class DisableOneOffApiKeyCommand implements Command<void> {
	constructor(private readonly apiKeyId: string) {}

	async execute(db: Client): Promise<void> {
		const qb = db
			.updateBuilder()
			.table('api_key')
			.where({
				id: this.apiKeyId,
				type: ApiKey.Type.ONE_OFF,
			})
			.values({ disabled_at: new Date() })

		await qb.execute()
	}
}

export default DisableOneOffApiKeyCommand
