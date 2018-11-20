import { GraphQlBuilder } from 'cms-client'
import { FieldName, Scalar } from '../bindingTypes'

export class FieldAccessor<
	Persisted extends Scalar | GraphQlBuilder.Literal = Scalar | GraphQlBuilder.Literal,
	Produced extends Persisted = Persisted
> {
	constructor(
		public readonly fieldName: FieldName,
		public readonly currentValue: Persisted | null,
		public readonly onChange?: (newValue: Produced | null) => void
	) {}
}
