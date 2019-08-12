import { Authorizator, AuthorizationScope } from '@contember/authorization'
import { DatabaseQuery } from '@contember/database'
import { DatabaseQueryable } from '@contember/database'
import { ConditionBuilder } from '@contember/database'
import { Identity } from '@contember/engine-common'
import Actions from '../authorization/Actions'
import ProjectsQuery from './ProjectsQuery'

class ProjectsByIdentityQuery extends DatabaseQuery<ProjectsByIdentityQuery.Result> {
	constructor(private readonly authorizator: Authorizator<Identity>, private readonly identityId: string) {
		super()
	}

	async fetch(queryable: DatabaseQueryable): Promise<ProjectsByIdentityQuery.Result> {
		const identityResult = await queryable
			.createSelectBuilder<{ roles: string[] }>()
			.from('identity')
			.where({
				id: this.identityId,
			})
			.select('roles')
			.getResult()
		const identityRow = this.fetchOneOrNull(identityResult)
		if (!identityRow) {
			return []
		}
		const identity = new Identity.StaticIdentity(this.identityId, identityRow.roles, {})
		if (await this.authorizator.isAllowed(identity, new AuthorizationScope.Global(), Actions.PROJECT_VIEW_ALL)) {
			return await new ProjectsQuery().fetch(queryable)
		}

		return await queryable
			.createSelectBuilder<ProjectsByIdentityQuery.Row>()
			.select(['project', 'id'])
			.select(['project', 'name'])
			.select(['project', 'slug'])
			.from('project')
			.join('project_member', 'project_member', clause =>
				clause.compareColumns(['project_member', 'project_id'], ConditionBuilder.Operator.eq, ['project', 'id']),
			)
			.where(where => where.compare(['project_member', 'identity_id'], ConditionBuilder.Operator.eq, this.identityId))
			.getResult()
	}
}

namespace ProjectsByIdentityQuery {
	export type Row = {
		readonly id: string
		readonly name: string
		readonly slug: string
	}
	export type Result = Array<Row>
}

export default ProjectsByIdentityQuery
