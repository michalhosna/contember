import { GraphQlBuilder } from 'cms-client'
import * as React from 'react'
import { Menu, MenuList, MenuPageLink, LinkAppearance } from 'cms-admin'

export default class Side extends React.Component {
	render() {
		return (
			<Menu>
				<MenuList>
					<MenuPageLink
						change={() => ({ name: 'dashboard' })}
						appearance={LinkAppearance.Primary}
						frontIcon="dashboard"
					>
						Dashboard
					</MenuPageLink>
				</MenuList>
				<MenuList title="General">
					<MenuPageLink
						change={() => ({ name: 'edit_frontPage', params: { unique: new GraphQlBuilder.Literal('one') } })}
						frontIcon="application"
					>
						Front page
					</MenuPageLink>
					<MenuPageLink change={() => ({ name: 'edit_footer', params: { unique: new GraphQlBuilder.Literal('one') } })} frontIcon="widget-footer">
						Footer
					</MenuPageLink>
				</MenuList>
				<MenuList title="Team">
					<MenuPageLink change={() => ({ name: 'multiEdit_person' })} frontIcon="people">
						Member list
					</MenuPageLink>
					<MenuPageLink change={() => ({ name: 'create_person' })} frontIcon="person">
						Create new
					</MenuPageLink>
				</MenuList>
				<MenuList title="Contact">
					{/*<MenuPageLink change={() => ({ name: 'edit_contactPage' })} frontIcon="envelope">
						Contact page
					</MenuPageLink>*/}
					<MenuPageLink change={() => ({ name: 'multiEdit_contactLocation' })} frontIcon="locate">
						Contact locations
					</MenuPageLink>
				</MenuList>
			</Menu>
		)
	}
}
