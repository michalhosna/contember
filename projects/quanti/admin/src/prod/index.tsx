import { H1 } from '@blueprintjs/core'
import {
	Button,
	CreatePage,
	EditPage,
	FieldText,
	GenericPage,
	Literal,
	MultiEditPage,
	PageLink,
	Pages,
	Repeater,
	SelectField,
	TableCell,
	TextField,
	DiffView,
	DiffDialog,
} from 'cms-admin'
import * as React from 'react'
import { Category } from './components/Category'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { FrontPage } from './components/FrontPage'
import { MenuItem } from './components/MenuItem'
import { Page, PageListCells, PageListHeader } from './components/Page'
import { Person } from './components/Person'
import { Place } from './components/Place'
import { SocialNetwork } from './components/SocialNetwork'
import { Layout } from './Layout'
import { LocaleSideDimension } from './LocaleSideDimension'
import '../../../src/prod/_theme.sass'

export default () => (
	<Pages layout={Layout}>
		<GenericPage pageName="dashboard">
			<H1>Quanti admin</H1>
		</GenericPage>
		<GenericPage pageName="diff">
			<DiffDialog viewPageName="diff_stage" />
		</GenericPage>

		<GenericPage pageName="diff_stage">
			<DiffView />
		</GenericPage>

		<MultiEditPage entityName="Locale" pageName="locales" rendererProps={{ title: 'Locale' }}>
			<TextField label="Slug" name="slug" />
			<TextField label="Label of switching link" name="switchToLabel" />
		</MultiEditPage>

		<EditPage entityName="FrontPage" where="(unique = one)" rendererProps={{ title: 'Front page' }}>
			<FrontPage />
		</EditPage>

		<MultiEditPage
			entityName="MenuItem"
			pageName="menuItems"
			rendererProps={{
				title: 'Menu',
				sortable: {
					sortBy: 'order',
				},
			}}
		>
			<MenuItem />
		</MultiEditPage>

		<MultiEditPage entityName="Category" pageName="categories" rendererProps={{ title: 'Categories' }}>
			<Category />
		</MultiEditPage>
		<MultiEditPage
			entityName="Page"
			rendererProps={{
				title: 'Pages',
				//tableHeader: <PageListHeader />,
				beforeContent: (
					<PageLink
						to="create_page"
						Component={props => (
							<Button {...props} Component="a">
								Create
							</Button>
						)}
					/>
				),
			}}
		>
			<PageListCells />
		</MultiEditPage>

		<CreatePage entityName="Page" rendererProps={{ title: 'Create page' }}>
			<Page />
		</CreatePage>

		<EditPage entityName="Page" rendererProps={{ title: 'Edit page' }} where="(id = $id)">
			<Page />
		</EditPage>

		<MultiEditPage
			entityName="Place"
			pageName="places"
			rendererProps={{ sortable: { sortBy: 'order' }, title: 'Places' }}
		>
			<Place />
		</MultiEditPage>

		<MultiEditPage
			entityName="Person"
			pageName="people"
			rendererProps={{ sortable: { sortBy: 'order' }, title: 'People' }}
		>
			<Person />
		</MultiEditPage>

		<MultiEditPage entityName="Social" pageName="social" rendererProps={{ title: 'Social' }}>
			<SocialNetwork name="network" />
			<TextField label="Url" name="url" />
		</MultiEditPage>

		<EditPage entityName="Footer" pageName="footer" where="(unique = one)" rendererProps={{ title: 'Footer' }}>
			<Footer />
		</EditPage>

		<EditPage entityName="Contact" pageName="contact" where="(unique = one)" rendererProps={{ title: 'Contact' }}>
			<Contact />
		</EditPage>

		<EditPage entityName="JoinUsRoot" pageName="joinUs" where="(unique = one)" rendererProps={{ title: 'Join us' }}>
			<LocaleSideDimension>
				<TextField label="Label" name="joinUs(locale.slug='$currentLocaleSlug').label" />
				<SelectField
					label="Link target"
					name="joinUs(locale.slug='$currentLocaleSlug').target"
					options="Linkable.url"
				/>
			</LocaleSideDimension>
		</EditPage>

		<EditPage
			entityName="TranslationRoot"
			pageName="translations"
			where="(unique = one)"
			rendererProps={{ title: 'Translations' }}
		>
			<Repeater field="translated">
				<SelectField name="locale" label="Locale" options="Locale.slug" />
				<SelectField
					name="translatable"
					label="String"
					//inline={true}
					options={[
						{ value: new Literal('emailContent'), label: 'emailContent' },
						{ value: new Literal('emailContact'), label: 'emailContact' },
						{ value: new Literal('emailSend'), label: 'emailSend' },
						{ value: new Literal('emailSentMessage'), label: 'emailSentMessage' },
					]}
				/>
				<TextField label="Translated" name="translated" />
			</Repeater>
		</EditPage>

		<MultiEditPage
			entityName="ContactMessage"
			pageName="contactMessages"
			rendererProps={{
				title: 'Contact messages',
			}}
		>
			<TableCell>
				<FieldText<string | number> name="sentAt" format={val => val && new Date(val).toLocaleString()} />
			</TableCell>
			<TableCell>
				<FieldText name="contact" />
			</TableCell>
			<TableCell>
				<FieldText name="message" />
			</TableCell>
		</MultiEditPage>
	</Pages>
)
