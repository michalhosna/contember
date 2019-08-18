import * as React from 'react'
import {
	Component,
	AlternativeFields,
	Literal,
	TextField,
	SortableRepeater,
	RichTextField,
	SelectField,
	Block as BlockType,
	Mark,
} from 'cms-admin'
import { Image } from './Image'
import { ImageGrid } from './ImageGrid'

export const Block = Component(
	() => (
		<>
			<AlternativeFields
				name="type"
				label={undefined}
				alternatives={[
					[new Literal('Heading'), 'Heading', <TextField name="text" label="Heading" />],
					[
						new Literal('Text'),
						'Text',
						<RichTextField
							name="text"
							blocks={[{ block: BlockType.PARAGRAPH, marks: [Mark.BOLD, Mark.LINK] }]}
							label="Text"
						/>,
					],
					[new Literal('Image'), 'Image', <Image name="image" />],
					[new Literal('ImageGrid'), 'ImageGrid', <ImageGrid name="imageGrid" />],
					[
						new Literal('Numbers'),
						'Numbers',
						<SortableRepeater field="numbers" sortBy="order">
							<TextField label="number" name="number" />
							<TextField label="label" name="label" />
						</SortableRepeater>,
					],
					[
						new Literal('Perks'),
						'Perks',
						<SortableRepeater field="perks" sortBy="order">
							<TextField label="title" name="title" />
							<TextField label="description" name="description" />
						</SortableRepeater>,
					],
					[
						new Literal('People'),
						'People',
						<SortableRepeater field="people" sortBy="order">
							<SelectField label="Person" name="person" options="Person.locales(locale.slug='cs').name" />
						</SortableRepeater>,
					],
					[
						new Literal('Category'),
						'Category',
						<SelectField label="Category" name="category" options="Category.locales(locale.slug='cs').name" />,
					],
					[
						new Literal('Collapse'),
						'Collapse',
						<>
							<TextField name="collapse.title" label={undefined} />
							<SortableRepeater field="collapse.items" sortBy="order">
								<TextField label="heading" name="heading" />
								<RichTextField
									name="text"
									blocks={[{ block: BlockType.PARAGRAPH, marks: [Mark.BOLD, Mark.LINK] }]}
									label={undefined}
								/>
								<Image name="image" />
								<TextField label="link URL" name="linkTarget" />
								<TextField label="link caption" name="linkCaption" />
							</SortableRepeater>
						</>,
					],
				]}
			/>
		</>
	),
	'Block',
)
