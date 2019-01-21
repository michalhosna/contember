import { Event } from '../../dtos/Event'
import { EventType } from '../../EventType'
import DependencyBuilder from '../DependencyBuilder'

/**
 * Every migration event depends on every previous event until previous migration event
 * Also, every event depends on previous migration
 *
 *        v--v--v--\
 *  v--v-\         |
 * E1 E2 M1 E3 E4 M2 E5
 *        ^-/  |     |
 *        ^---/      |
 *                 ^-/
 *
 */
class MigrationsDependencyBuilder implements DependencyBuilder {
	async build(events: Event[]): Promise<DependencyBuilder.Dependencies> {
		let processedEvents: string[] = []
		const processedMigrations: string[] = []
		const dependencies: DependencyBuilder.Dependencies = {}
		for (const event of events) {
			if (event.type === EventType.runMigration) {
				processedMigrations.push(event.id)
				dependencies[event.id] = [...processedEvents]
				processedEvents = []
			} else {
				dependencies[event.id] = [processedMigrations[processedMigrations.length - 1]]
			}
			processedEvents.push(event.id)
		}
		return dependencies
	}
}

export default MigrationsDependencyBuilder
