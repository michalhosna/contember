import KnexQuery from '../../../core/knex/KnexQuery'
import KnexQueryable from '../../../core/knex/KnexQueryable'

class LatestMigrationByCurrentEventQuery extends KnexQuery<LatestMigrationByCurrentEventQuery.Result> {
	constructor(private readonly eventId: string) {
		super()
	}

	async fetch(queryable: KnexQueryable): Promise<LatestMigrationByCurrentEventQuery.Result> {
		const rows = (await queryable.createWrapper().raw(
			`
			WITH RECURSIVE recent_events(type, previous_id, data) AS (
					SELECT type, previous_id, data
					FROM system.event
					WHERE event.id = ?
				UNION ALL
					SELECT event.type, event.previous_id, event.data
					FROM system.event, recent_events
					WHERE event.id = recent_events.previous_id
			)
			SELECT *
			FROM recent_events
			WHERE type = 'run_migration'
			LIMIT 1
		`,
			this.eventId
		)).rows

		return this.fetchOneOrNull(rows)
	}
}

namespace LatestMigrationByCurrentEventQuery {
	export type Result = null | {
		readonly type: string
		readonly previous_id: string
		readonly data: any
	}
}

export default LatestMigrationByCurrentEventQuery