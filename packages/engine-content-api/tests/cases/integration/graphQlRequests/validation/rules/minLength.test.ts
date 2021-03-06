import { suite } from 'uvu'
import { InputValidation as v } from '@contember/schema-definition'
import { SchemaDefinition as d } from '@contember/schema-definition/dist/src/model'
import { createSchema, testCreate } from '../utils'

const test = suite('Min length rule')

class Item {
	@v.assert(v.rules.minLength(5), 'failure')
	value = d.stringColumn()
}

const schema = createSchema({
	Item,
})
test('fails when value not valid', async () => {
	await testCreate({
		schema,
		entity: 'Item',
		data: { value: 'abc' },
		errors: ['failure'],
	})
})

test('succeeds when value valid', async () => {
	await testCreate({
		schema,
		entity: 'Item',
		data: { value: 'abcdef' },
		errors: [],
	})
})

test.run()
