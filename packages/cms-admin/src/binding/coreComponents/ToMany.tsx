import { GraphQlBuilder } from 'cms-client'
import { Input } from 'cms-common'
import * as React from 'react'
import { FieldName } from '../bindingTypes'
import {
	EntityAccessor,
	EntityCollectionAccessor,
	EntityFields,
	EntityForRemovalAccessor,
	ReferenceMarker
} from '../dao'
import { DataContext, DataContextValue } from './DataContext'
import { EnforceSubtypeRelation } from './EnforceSubtypeRelation'
import { ReferenceMarkerProvider } from './MarkerProvider'

export interface ToManyProps {
	field: FieldName
	filter?: Input.Where<GraphQlBuilder.Literal>
}

class ToMany extends React.Component<ToManyProps> {
	static displayName = 'ToMany'

	public render() {
		return (
			<DataContext.Consumer>
				{(data: DataContextValue) => {
					if (data instanceof EntityAccessor) {
						const field = data.data.getField(
							this.props.field,
							ReferenceMarker.ExpectedCount.PossiblyMany,
							this.props.filter
						)

						if (field instanceof EntityCollectionAccessor) {
							return <ToMany.ToManyInner accessor={field}>{this.props.children}</ToMany.ToManyInner>
						}
					}
				}}
			</DataContext.Consumer>
		)
	}

	public static generateReferenceMarker(props: ToManyProps, fields: EntityFields): ReferenceMarker {
		return new ReferenceMarker(props.field, ReferenceMarker.ExpectedCount.PossiblyMany, fields, props.filter)
	}
}

namespace ToMany {
	export interface ToManyInnerProps {
		accessor: EntityCollectionAccessor
	}

	export class ToManyInner extends React.PureComponent<ToManyInnerProps> {
		public render() {
			return this.props.accessor.entities.map(
				(datum: EntityAccessor | EntityForRemovalAccessor | undefined, i: number) =>
					datum instanceof EntityAccessor && (
						<DataContext.Provider value={datum} key={i}>
							{this.props.children}
						</DataContext.Provider>
					)
			)
		}
	}
}

export { ToMany }

type EnforceDataBindingCompatibility = EnforceSubtypeRelation<typeof ToMany, ReferenceMarkerProvider>