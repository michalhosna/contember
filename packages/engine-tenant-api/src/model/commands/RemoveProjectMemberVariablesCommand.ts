import { Command, UpdateProjectMemberVariablesCommand } from './'

class RemoveProjectMemberVariablesCommand implements Command<void> {
	constructor(
		private readonly projectId: string,
		private readonly identityId: string,
		private readonly except: readonly UpdateProjectMemberVariablesCommand.VariableUpdate[],
	) {}

	async execute({ db }: Command.Args): Promise<void> {
		await db
			.deleteBuilder()
			.where({
				project_id: this.projectId,
				identity_id: this.identityId,
			})
			.where(expr => expr.not(expr => expr.in('variable', this.except.map(it => it.name))))
			.from('project_member_variable')
			.execute()
	}
}

export { RemoveProjectMemberVariablesCommand }
