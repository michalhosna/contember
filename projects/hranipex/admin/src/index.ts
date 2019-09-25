import { ProjectConfig } from 'cms-admin'

const routes = {
	dashboard: { path: '/' },

	frontPage: { path: '/front-page' },
	postList: { path: '/posts' },
	postCreate: { path: '/posts/new' },
	postEdit: { path: '/posts/:id' },

	sites: { path: '/sites' },
	translations: { path: '/translations' },
	translationSetEdit: { path: '/translations/:id' },
	translationSets: { path: '/translation-sets' },
}
const config: ProjectConfig[] = [
	{
		project: 'hranipex',
		stage: 'prod',
		component: () => import('./prod'),
		defaultDimensions: {
			site: ['en'],
		},
		routes: routes,
	},
	{
		project: 'hranipex-beta',
		stage: 'prod',
		component: () => import('./prod'),
		defaultDimensions: {
			site: ['en'],
		},
		routes: routes,
	},
]

export default config
