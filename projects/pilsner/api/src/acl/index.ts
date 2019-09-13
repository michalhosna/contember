import { PermissionsBuilder } from '@contember/schema-definition'
import { Acl, Model } from '@contember/schema'

const aclFactory = (model: Model.Schema): Acl.Schema => ({
	roles: {
		admin: {
			variables: {},
			stages: '*',
			entities: PermissionsBuilder.create(model).allowAll().permissions,
		},
		regionManager: {
			variables: {
				site_id: {
					type: Acl.VariableType.entity,
					entityName: 'Site',
				},
			},
			stages: '*',
			entities: PermissionsBuilder.create(model)

				.allowAll()

				.onEntity('Site')
				.addPredicate('site', { id: 'site_id' })
				.allowOnlyRead('site')
				.onField(PermissionsBuilder.everyField().except('name', 'slug', 'order'))
				.allowUpdate('site')

				.onEntity(PermissionsBuilder.everyEntity().havingRelation('site'))
				.addPredicate('site', { site: PermissionsBuilder.predicateReference('site') })
				.allowAll('site')

				.onEntity(['Deployment', 'DeploymentConfig', 'Translatable'])
				.allowOnlyRead()

				.onEntity('MenuItem')
				.addPredicate('site', { menu: PermissionsBuilder.predicateReference('site') })
				.allowAll('site')

				.onEntity('AttributeSet')
				.addPredicate('site', {
					and: [
						{ or: [{ pub: { id: { ['null']: true } } }, { pub: PermissionsBuilder.predicateReference('site') }] },
						{
							or: [{ tapster: { id: { ['null']: true } } }, { tapster: PermissionsBuilder.predicateReference('site') }],
						},
					],
				})
				.allowAll('site')

				.onEntity('Attribute')
				.addPredicate('site', {
					set: PermissionsBuilder.predicateReference('site'),
				})
				.allowAll('site')

				.onEntity('AttributeValue')
				.addPredicate('site', {
					attribute: PermissionsBuilder.predicateReference('site'),
				})
				.allowAll('site')

				.onEntity('FooterLink')
				.addPredicate('site', {
					footer: PermissionsBuilder.predicateReference('site'),
				})
				.allowAll('site')

				.onEntity('Redirect')
				.disallowAll()

				.onEntity('Content')
				.addPredicate('site', {
					and: [
						{ or: [{ pub: { id: { ['null']: true } } }, { pub: PermissionsBuilder.predicateReference('site') }] },
						{
							or: [{ tapster: { id: { ['null']: true } } }, { tapster: PermissionsBuilder.predicateReference('site') }],
						},
						{
							or: [
								{ frontPage: { id: { ['null']: true } } },
								{ frontPage: PermissionsBuilder.predicateReference('site') },
							],
						},
						{
							or: [
								{ genericPage: { id: { ['null']: true } } },
								{ genericPage: PermissionsBuilder.predicateReference('site') },
							],
						},
						{
							or: [{ post: { id: { ['null']: true } } }, { post: PermissionsBuilder.predicateReference('site') }],
						},
					],
				})
				.allowAll('site')

				.onEntity('ContentBlock')
				.addPredicate('site', { content: PermissionsBuilder.predicateReference('site') })
				.allowAll('site')

				.onEntity('ContentGallery')
				.addPredicate('site', { block: PermissionsBuilder.predicateReference('site') })
				.allowAll('site')

				.onEntity('ContentImage')
				.addPredicate('site', { gallery: PermissionsBuilder.predicateReference('site') })
				.allowAll('site').permissions,
		},
	},
})

export default aclFactory
