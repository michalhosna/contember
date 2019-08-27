import * as React from 'react'
import cn from 'classnames'
import { ProjectUserRolesRevealer, TokenExposer } from './Dev'
import LogoutLink from './LogoutLink'
import { Avatar, AvatarSize, Dropdown } from './ui'
import { Icon } from '@blueprintjs/core'
import { default as PageLink } from './pageRouting/PageLink'
import { connect } from 'react-redux'
import State from '../state'
import { Button, Dropdown2 } from '@contember/ui'
import SwitchProjectLink from './SwitchProjectLink'

export interface LayoutOwnProps {
	header: {
		title?: React.ReactNode
		left: React.ReactNode
		center?: React.ReactNode
		right: React.ReactNode
	}
	side: React.ReactNode
	content: React.ReactNode
}

export interface LayoutStateProps {
	identity: string | undefined
}

interface LayoutDefaultState {
	menuOpen: boolean
	isAvatarDropdownOpen: boolean
}

class LayoutDefault extends React.PureComponent<LayoutOwnProps & LayoutStateProps, LayoutDefaultState> {
	state: LayoutDefaultState = {
		menuOpen: false,
		isAvatarDropdownOpen: false,
	}

	private sideRef = React.createRef<HTMLElement>()

	toggleMenu = (event: React.MouseEvent) => {
		event.preventDefault()
		this.setState(
			state => ({ ...state, menuOpen: !state.menuOpen }),
			() => {
				const el = this.sideRef.current
				if (el) {
					let executed = false
					el.addEventListener(
						'transitionend',
						() => {
							if (!executed) {
								el.scrollTo(0, 0)
								executed = true
							}
						},
						{ once: true },
					)
				}
			},
		)
	}

	render() {
		return (
			<>
				<header className="layout-navbar">
					<div className="navbar-left">
						{this.props.side && (
							<button className="layout-menuBtn" onClick={this.toggleMenu}>
								<Icon icon="menu" />
							</button>
						)}
						{this.props.header.title && (
							<PageLink to="dashboard" className="navbar-title">
								{this.props.header.title}
							</PageLink>
						)}
						{this.props.header.left}
						{<TokenExposer />}
						{<ProjectUserRolesRevealer />}
					</div>
					<div className="navbar-center">{this.props.header.center}</div>
					<div className="navbar-right">
						{this.props.header.right}
						<Dropdown2
							isOpen={this.state.isAvatarDropdownOpen}
							alignment="end"
							handle={
								<Button size="large" distinction="seamless" flow="circular" onClick={this.toggleAvatarDropdownOpen}>
									<Avatar size={AvatarSize.Size2} email={this.props.identity} />
								</Button>
							}
							onCloseRequest={this.closeAvatarDropdown}
						>
							<SwitchProjectLink
								Component={({ onClick }) => (
									<Button distinction="seamless" flow="block" onClick={onClick}>
										Switch project
									</Button>
								)}
							/>
							<LogoutLink
								Component={props => (
									<Button distinction="seamless" flow="block" {...props}>
										Sign Out
									</Button>
								)}
							/>
						</Dropdown2>
					</div>
				</header>

				<div className={cn('layout-container', this.state.menuOpen && 'layout-menuOpen')}>
					{this.props.side && (
						<>
							<div className="layout-menuShadow" onClick={this.toggleMenu} />
							<aside className="layout-side" ref={this.sideRef}>
								{this.props.side}
							</aside>
						</>
					)}

					<main className="layout-content">{this.props.content}</main>
				</div>
			</>
		)
	}

	toggleAvatarDropdownOpen = () => {
		this.setState({
			isAvatarDropdownOpen: !this.state.isAvatarDropdownOpen,
		})
	}

	closeAvatarDropdown = () => {
		this.setState({
			isAvatarDropdownOpen: false,
		})
	}
}

export default connect<LayoutStateProps, {}, LayoutOwnProps, State>(state => {
	return {
		identity: state.auth.identity ? state.auth.identity.email : undefined,
	}
})(LayoutDefault)
