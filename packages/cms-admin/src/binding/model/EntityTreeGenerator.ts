import * as React from 'react'
import DataMarkerProvider from '../coreComponents/DataMarkerProvider'
import DataBindingError from '../dao/DataBindingError'
import EntityMarker, { EntityFields } from '../dao/EntityMarker'
import FieldMarker from '../dao/FieldMarker'
import ReferenceMarker from '../dao/ReferenceMarker'

type NodeResult = FieldMarker | EntityMarker | ReferenceMarker
type RawNodeResult = NodeResult | NodeResult[] | undefined

export default class EntityTreeGenerator {
	public constructor(private sourceTree: React.ReactNode) {}

	public generate(): EntityMarker {
		const processed = this.processNode(this.sourceTree)

		let entityMarker: NodeResult | undefined = undefined

		if (!Array.isArray(processed)) {
			entityMarker = processed
		} else {
			if (processed.length === 1) {
				entityMarker = processed[0]
			}
		}

		if (entityMarker instanceof EntityMarker) {
			return entityMarker
		}

		return this.reportInvalidTreeError(entityMarker)
	}

	private processNode(node: React.ReactNode | Function): RawNodeResult {
		if (!node || typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
			return undefined
		}

		if (typeof node === 'function') {
			throw new DataBindingError(
				'Render props (functions as React Component children) are not supported within the schema. ' +
					'Please refer to the documentation.'
			)
		}

		if (Array.isArray(node)) {
			let mapped: NodeResult[] = []

			for (const subNode of node) {
				const processed = this.processNode(subNode)

				if (processed) {
					if (Array.isArray(processed)) {
						mapped = mapped.concat(processed)
					} else {
						mapped.push(processed)
					}
				}
			}

			return mapped
		}

		let children: React.ReactNode

		if ('type' in node) {
			children = node.props.children

			if (!(typeof node.type === 'string')) {
				// React.Component
				const dataMarker = node.type as DataMarkerProvider & (React.ComponentClass<any> | React.SFC<any>)

				if ('generateFieldMarker' in dataMarker && dataMarker.generateFieldMarker) {
					return dataMarker.generateFieldMarker(node.props)
				}

				if ('generateFieldMarkers' in dataMarker && dataMarker.generateFieldMarkers) {
					return dataMarker.generateFieldMarkers(node.props)
				}

				if ('generateEntityMarker' in dataMarker && dataMarker.generateEntityMarker) {
					if (children) {
						return dataMarker.generateEntityMarker(
							node.props,
							this.mapNodeResultToEntityFields(this.processNode(children))
						)
					}
					throw new DataBindingError(
						`Each ${
							node.type.displayName
						} component must have children that refer to its fields as otherwise, it would be redundant.`
					)
				}
				if ('generateReferenceMarker' in dataMarker && dataMarker.generateReferenceMarker) {
					if (children) {
						const processed = this.processNode(children)

						if (processed instanceof EntityMarker) {
							return dataMarker.generateReferenceMarker(node.props, processed)
						}
						throw new DataBindingError(
							`Each ${node.type.displayName} component must have an <Entity /> component (or equivalent) as its child.`
						)
					}
					throw new DataBindingError(`Each ${node.type.displayName} component must have children.`)
				}

				return undefined
			}
		} else if ('children' in node) {
			// React Portal
			children = node.children
		}

		return this.processNode(children)
	}

	private mapNodeResultToEntityFields(result: RawNodeResult): EntityFields {
		const fields: EntityFields = {}

		if (!result) {
			return fields
		}

		if (!Array.isArray(result)) {
			result = [result]
		}

		for (const marker of result) {
			if (marker instanceof FieldMarker) {
				fields[marker.name] = marker
			} else if (marker instanceof ReferenceMarker) {
				fields[marker.name] = marker.reference
			} else {
				throw new DataBindingError(
					'Detected a sub-entity directly within another one. Use a <Repeater /> or a similar component for relations.'
				)
			}
		}

		return fields
	}

	private reportInvalidTreeError(marker: FieldMarker | ReferenceMarker | undefined): never {
		if (marker) {
			const kind = marker instanceof FieldMarker ? 'field' : 'relation'

			throw new DataBindingError(
				`Top-level ${kind} discovered. Any repeaters or similar components need to be used from within an <Entity />.`
			)
		}
		throw new DataBindingError('Empty form discovered. Try adding some fields…')
	}
}