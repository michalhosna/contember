import { DatabaseCredentials } from '../tenant-api/config'
import * as Knex from 'knex'
import BaseCommand from './BaseCommand'
import CommandConfiguration from '../core/cli/CommandConfiguration'

class DropCommand extends BaseCommand<{}, {}> {
	protected configure(configuration: CommandConfiguration): void {
		configuration.name('drop')
		configuration.description('Deletes all db schemas (including tenant and both data and system schemas of projects)')
	}

	protected async execute(): Promise<void> {
		const config = await this.readConfig()

		const queries = []

		queries.push(this.clear(config.tenant.db, ['tenant']))

		for (const project of config.projects) {
			const schemas = [...project.stages.map(stage => 'stage_' + stage.slug), 'system']
			queries.push(this.clear(project.dbCredentials, schemas))
		}

		await Promise.all(queries)
	}

	private async clear(db: DatabaseCredentials, schemas: string[]) {
		await Knex({
			debug: false,
			client: 'pg',
			connection: db,
		}).transaction(async trx => {
			await Promise.all(
				schemas.map(async schema => {
					await trx.raw('DROP SCHEMA IF EXISTS ?? CASCADE', [schema])
					console.log(`Dropped schema ${schema} in DB ${db.database}`)
				})
			)
		})
	}
}

export default DropCommand
