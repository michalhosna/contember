#!/usr/bin/env node
import { register } from 'ts-node'
import { CommandManager } from './cli/CommandManager'
import { DiffCommand } from './commands/DiffCommand'
import Application from './cli/Application'
import DryRunCommand from './commands/DryRunCommand'
import SetupCommand from './commands/SetupCommand'
import { WorkspaceCreateCommand } from './commands/WorkspaceCreateCommand'
import { ProjectCreateCommand } from './commands/ProjectCreateCommand'
import { InstanceStartCommand } from './commands/InstanceStartCommand'
import { InstanceInfoCommand } from './commands/InstanceInfoCommand'
import { InstanceStopCommand } from './commands/InstanceStopCommand'
import { ProjectRegisterCommand } from './commands/ProjectRegisterCommand'
import { InstanceReloadApiCommand } from './commands/InstanceReloadApiCommand'
import { InstanceLogsCommand } from './commands/InstanceLogsCommand'
import { InstanceValidateConfigCommand } from './commands/InstanceValidateConfigCommand'
import { InstanceCreateCommand } from './commands/InstanceCreateCommand'
;(async () => {
	register({
		compilerOptions: {
			experimentalDecorators: true,
		},
	})
	const diffCommandFactory = () => new DiffCommand()
	const commandManager = new CommandManager({
		['migrations:diff']: diffCommandFactory,
		['migrations:dry-run']: () => new DryRunCommand(),
		['workspace:create']: () => new WorkspaceCreateCommand(),
		['project:create']: () => new ProjectCreateCommand(),
		['project:register']: () => new ProjectRegisterCommand(),
		['instance:create']: () => new InstanceCreateCommand(),
		['instance:setup']: () => new SetupCommand(),
		['instance:info']: () => new InstanceInfoCommand(),
		['instance:up']: () => new InstanceStartCommand(),
		['instance:down']: () => new InstanceStopCommand(),
		['instance:logs']: () => new InstanceLogsCommand(),
		['instance:validate-config']: () => new InstanceValidateConfigCommand(),
		['instance:reload:api']: () => new InstanceReloadApiCommand(),
		['diff']: diffCommandFactory,
	})
	const app = new Application(commandManager)
	await app.run(process.argv)
})().catch(e => {
	console.log(e)
	process.exit(1)
})
