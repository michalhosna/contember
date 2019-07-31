import { GraphQlBuilder } from 'cms-client'
import { Input } from 'cms-common'
import * as React from 'react'
import { EntityName, FieldName } from '../bindingTypes'
import { Environment, MarkerTreeRoot } from '../dao'
import { MarkerTreeGenerator } from '../model'
import { QueryLanguage } from '../queryLanguage'
import { DataRendererProps, getDataProvider } from './DataProvider'
import { EnforceSubtypeRelation } from './EnforceSubtypeRelation'
import { EnvironmentContext } from './EnvironmentContext'
import { MarkerTreeRootProvider } from './MarkerProvider'

export interface SingleEntityDataProviderProps<DRP> {
	entityName: EntityName
	associatedField?: FieldName
	where: string | Input.UniqueWhere<GraphQlBuilder.Literal>
	renderer?: React.ComponentType<DRP & DataRendererProps>
	rendererProps?: DRP
	children: React.ReactNode
}

export class SingleEntityDataProvider<DRP> extends React.PureComponent<SingleEntityDataProviderProps<DRP>> {
	public static displayName = 'SingleEntityDataProvider'

	public render() {
		return (
			<EnvironmentContext.Consumer>
				{(environment: Environment) => {
					const markerTreeGenerator = new MarkerTreeGenerator(
						<SingleEntityDataProvider {...this.props}>{this.props.children}</SingleEntityDataProvider>,
						environment
					)
					const DataProvider = getDataProvider<DRP>()

					return (
						<DataProvider
							markerTree={markerTreeGenerator.generate()}
							renderer={this.props.renderer}
							rendererProps={this.props.rendererProps}
						>
							{this.props.children}
						</DataProvider>
					)
				}}
			</EnvironmentContext.Consumer>
		)
	}

	public static generateMarkerTreeRoot(
		props: SingleEntityDataProviderProps<unknown>,
		fields: MarkerTreeRoot['fields'],
		environment: Environment
	): MarkerTreeRoot {
		return new MarkerTreeRoot(
			props.entityName,
			fields,
			{
				where: typeof props.where === 'string' ? QueryLanguage.parseUniqueWhere(props.where, environment) : props.where,
				whereType: 'unique'
			},
			props.associatedField
		)
	}
}

type EnforceDataBindingCompatibility = EnforceSubtypeRelation<
	typeof SingleEntityDataProvider,
	MarkerTreeRootProvider<SingleEntityDataProviderProps<any>>
>
