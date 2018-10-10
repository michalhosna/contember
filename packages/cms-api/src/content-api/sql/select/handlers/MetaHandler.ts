import SelectExecutionHandler from '../SelectExecutionHandler'
import Path from '../Path'
import ObjectNode from '../../../graphQlResolver/ObjectNode'
import { Acl, Input } from 'cms-common'
import PredicateFactory from '../../../../acl/PredicateFactory'
import WhereBuilder from '../WhereBuilder'

class MetaHandler implements SelectExecutionHandler<{}> {
	constructor(private readonly whereBuilder: WhereBuilder, private readonly predicateFactory: PredicateFactory) {}

	process(context: SelectExecutionHandler.Context): void {
		const { field, path } = context
		for (let metaField of (field as ObjectNode).fields) {
			const columnPath = path.for(metaField.alias)
			for (let metaInfo of (metaField as ObjectNode).fields) {
				if (metaInfo.name === Input.FieldMeta.updatable) {
					this.addMetaFlag(context, metaField.name, columnPath.for(metaInfo.alias), Acl.Operation.update)
				}
				if (metaInfo.name === Input.FieldMeta.readable) {
					this.addMetaFlag(context, metaField.name, columnPath.for(metaInfo.alias), Acl.Operation.read)
				}
			}
		}
	}

	private addMetaFlag(
		context: SelectExecutionHandler.Context,
		fieldName: string,
		metaPath: Path,
		operation: Acl.Operation.read | Acl.Operation.update
	): void {
		const { entity, path } = context
		if (entity.primary === fieldName) {
			return
		}
		const fieldPredicate = this.predicateFactory.create(entity, operation, [fieldName])
		context.addColumn(qb => {
			qb.select(
				expr =>
					expr.selectCondition(condition => {
						this.whereBuilder.buildInternal(qb, condition, entity, path.back(), fieldPredicate)
						if (condition.isEmpty()) {
							condition.raw('true')
						}
					}),
				metaPath.getAlias()
			)
		}, metaPath)
	}
}

export default MetaHandler