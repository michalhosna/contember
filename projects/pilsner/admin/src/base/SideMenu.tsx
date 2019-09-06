import * as React from 'react'
import { UserRoles } from './acl'
import { DeployButton } from './components'
import { Menu, useProjectUserRoles } from 'cms-admin'

interface LayoutProps {
	deployButton: boolean
}

export const SideMenu = React.memo<LayoutProps>(props => {
	const userRoles = useProjectUserRoles()

	const isAdmin = userRoles.has(UserRoles.Admin)

	return (
		<Menu>
			<Menu.Item>
				<Menu.Item title="Front page" to="frontPage" />
				<Menu.Item title="Stories">
					<Menu.Item title="All stories" to="blogList" />
					<Menu.Item title="Add a new story" to="blogCreate" />
					<Menu.Item title="Stories page" to="blogPage" />
				</Menu.Item>
				<Menu.Item title="Pubs">
					<Menu.Item title="All pubs" to="pubList" />
					<Menu.Item title="Add a new pub" to="pubCreate" />
					<Menu.Item title="Pubs page" to="pubsPage" />
				</Menu.Item>
				<Menu.Item title="Tapsters">
					<Menu.Item title="All tapsters" to="tapsterList" />
					<Menu.Item title="Add a new tapster" to="tapsterCreate" />
					<Menu.Item title="Tapsters page" to="tapstersPage" />
				</Menu.Item>
				<Menu.Item title="Pages">
					<Menu.Item title="All pages" to="pageList" />
					<Menu.Item title="Add a new page" to="pageCreate" />
				</Menu.Item>
			</Menu.Item>
			<Menu.Item title="Settings">
				<Menu.Item title="Footer" to="footer" />
				<Menu.Item title="Menu" to="menu" />
				<Menu.Item title="Categories" to="categories" />
				<Menu.Item title="Tags" to="tags" />
				<Menu.Item title="Locations" to="locations" />
				<Menu.Item title="Social networks" to="social" />
				<Menu.Item title="Translations" to="translations" />
				{isAdmin && <Menu.Item title="Sites" to="sites" />}
				{isAdmin && <Menu.Item title="Users" to="tenantUsers" />}
			</Menu.Item>
			{props.deployButton && (
				<Menu.Item title="Deployment">
					<Menu.Item title={<DeployButton />} />
				</Menu.Item>
			)}
		</Menu>
	)
})
