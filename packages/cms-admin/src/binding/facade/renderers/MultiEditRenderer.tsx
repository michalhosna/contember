import * as React from 'react'
import {
	DataContext,
	DataRendererProps,
	EnforceSubtypeRelation,
	Field,
	Props,
	SyntheticChildrenProvider
} from '../../coreComponents'
import { EntityAccessor, EntityCollectionAccessor } from '../../dao'
import { AddNewButton, PersistButton, RemoveButton } from '../buttons'
import { Repeater } from '../collections'
import { Sortable, SortablePublicProps } from '../collections/Sortable'
import { CommonRendererProps } from './CommonRendererProps'
import { DefaultRenderer } from './DefaultRenderer'
import EntityCollectionPublicProps = Repeater.EntityCollectionPublicProps

export interface MultiEditRendererProps extends CommonRendererProps, EntityCollectionPublicProps {
	enablePersist?: boolean
	sortable?: SortablePublicProps
}

class MultiEditRenderer extends React.PureComponent<MultiEditRendererProps & DataRendererProps> {
	public static displayName = 'MultiEditRenderer'

	public render() {
		const data = this.props.data

		if (!data) {
			return null // TODO display a message
		}

		if (data.root instanceof EntityCollectionAccessor) {
			return (
				<>
					{DefaultRenderer.renderTitle(this.props.title)}
					{this.props.beforeContent}
					{this.props.sortable === undefined && (
						<Repeater.EntityCollection
							entities={data.root}
							enableUnlinkAll={this.props.enableUnlinkAll}
							enableAddingNew={this.props.enableAddingNew}
							enableUnlink={this.props.enableUnlink}
							label={this.props.label}
						>
							{this.props.children}
						</Repeater.EntityCollection>
					)}
					{this.props.sortable !== undefined && (
						<Sortable
							enableUnlinkAll={this.props.enableUnlinkAll}
							enableAddingNew={this.props.enableAddingNew}
							enableUnlink={this.props.enableUnlink}
							label={this.props.label}
							{...this.props.sortable}
							entities={data.root}
						>
							{this.props.children}
						</Sortable>
					)}
					{this.props.enablePersist !== false && <PersistButton />}
				</>
			)
		}
	}

	public static generateSyntheticChildren(props: Props<MultiEditRendererProps>) {
		return (
			<>
				{DefaultRenderer.renderTitle(props.title)}
				{props.sortable !== undefined && <Sortable {...props.sortable} />}
				{props.children}
			</>
		)
	}
}

namespace MultiEditRenderer {
	export interface MultiEditItemProps {
		entity: EntityAccessor
		displayUnlinkButton: boolean
	}

	export class MultiEditItem extends React.PureComponent<MultiEditItemProps> {
		public render() {
			return (
				<>
					{this.props.children}
					{this.props.displayUnlinkButton && <RemoveButton />}
				</>
			)
		}
	}
}

type EnforceDataBindingCompatibility = EnforceSubtypeRelation<
	typeof MultiEditRenderer,
	SyntheticChildrenProvider<MultiEditRendererProps>
>

export { MultiEditRenderer }
