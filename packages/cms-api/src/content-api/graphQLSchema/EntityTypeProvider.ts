import { GraphQLFieldConfig, GraphQLObjectType, GraphQLObjectTypeConfig, GraphQLOutputType } from 'graphql'
import { Model } from 'cms-common'
import { acceptFieldVisitor, getEntity as getEntityFromSchema } from '../../content-schema/modelUtils'
import singletonFactory from '../../utils/singletonFactory'
import ColumnTypeResolver from './ColumnTypeResolver'
import FieldTypeVisitor from './entities/FieldTypeVisitor'
import FieldArgsVisitor from './entities/FieldArgsVisitor'
import { GqlTypeName } from './utils'
import WhereTypeProvider from './WhereTypeProvider'
import Authorizator from '../../acl/Authorizator'
import { GraphQLFieldResolver } from 'graphql/type/definition'

export default class EntityTypeProvider {
	private entities = singletonFactory(name => this.createEntity(name))

	constructor(
		private schema: Model.Schema,
		private authorizator: Authorizator,
		private columnTypeResolver: ColumnTypeResolver,
		private whereTypeProvider: WhereTypeProvider
	) {}

	public getEntity(entityName: string): GraphQLObjectType {
		return this.entities(entityName)
	}

	private createEntity(entityName: string) {
		return new GraphQLObjectType({
			name: GqlTypeName`${entityName}`,
			fields: () => this.getEntityFields(entityName)
		} as GraphQLObjectTypeConfig<any, any>)
	}

	private getEntityFields(entityName: string) {
		const entity = getEntityFromSchema(this.schema, entityName)
		const fields: { [field: string]: GraphQLFieldConfig<any, any> } = {}

		for (const fieldName in entity.fields) {
			if (!entity.fields.hasOwnProperty(fieldName)) {
				continue
			}
			if (!this.authorizator.isAllowed(Authorizator.Operation.read, entityName, fieldName)) {
				continue
			}

			const fieldTypeVisitor = new FieldTypeVisitor(this.columnTypeResolver, this)
			const type: GraphQLOutputType = acceptFieldVisitor(this.schema, entity, fieldName, fieldTypeVisitor)

			const fieldArgsVisitor = new FieldArgsVisitor(this.whereTypeProvider)
			const fieldResolver: GraphQLFieldResolver<any, any> = (source, args, context, info) => {
				if (!info.path) {
					return undefined
				}
				return source[info.path.key]
			}
			fields[fieldName] = {
				type,
				args: acceptFieldVisitor(this.schema, entity, fieldName, fieldArgsVisitor),
				resolve: fieldResolver
			}
		}
		return fields
	}
}
