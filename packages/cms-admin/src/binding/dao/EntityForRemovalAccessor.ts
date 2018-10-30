import EntityAccessor from './EntityAccessor'
import EntityData from './EntityData'

export default class EntityForRemovalAccessor {
	constructor(
		public readonly primaryKey: string,
		public readonly data: EntityData,
		public readonly replaceWith: (replacement: EntityAccessor) => void
	) {}
}