import { MouseEventHandler } from 'react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Manager, Popper, Reference } from 'react-popper'
import { DropdownAlignment } from '../types/DropdownAlignment'
import { assertNever } from '../utils'
import { Collapsible } from './Collapsible'
import { Button, ButtonBasedButtonProps } from './forms'

interface DropdownRenderProps {
	requestClose: () => void
}

export interface DropdownProps {
	buttonProps?: ButtonBasedButtonProps
	alignment?: DropdownAlignment
	contentContainer?: HTMLElement
	children?: React.ReactElement | ((props: DropdownRenderProps) => React.ReactNode)
}

const alignmentToPlacement = (alignment: DropdownAlignment | undefined) => {
	if (alignment === 'start') {
		return 'bottom-start'
	} else if (alignment === 'end') {
		return 'bottom-end'
	} else if (alignment === 'center' || alignment === 'default' || alignment === undefined) {
		return 'auto'
	} else {
		return assertNever(alignment)
	}
}

const useCloseOnEscapeOrClickOutside = <T extends Node, K extends Node>(isOpen: boolean, close: () => void) => {
	const buttonRef = React.useRef<T>(null)
	const contentRef = React.useRef<K>(null)

	React.useEffect(() => {
		if (isOpen) {
			const closeOnEscapeKey = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					close()
				}
			}
			const closeOnClickOutside = (event: MouseEvent) => {
				if (
					!(
						buttonRef.current &&
						contentRef.current &&
						event.target instanceof Node &&
						(buttonRef.current.contains(event.target) || contentRef.current.contains(event.target))
					)
				) {
					close()
				}
			}

			window.addEventListener('keydown', closeOnEscapeKey)
			window.addEventListener('click', closeOnClickOutside)
			return () => {
				window.removeEventListener('keydown', closeOnEscapeKey)
				window.removeEventListener('click', closeOnClickOutside)
			}
		}
	}, [close, isOpen])

	return { buttonRef, contentRef }
}

export const DropdownContentContainerContext = React.createContext<HTMLElement | undefined>(undefined)

export const Dropdown = React.memo((props: DropdownProps) => {
	const suppliedButtonOnClickHandler = props.buttonProps && props.buttonProps.onClick
	const [isOpen, setIsOpen] = React.useState(false)
	const [popperEventsEnabled, setPopperEventsEnabled] = React.useState(false)
	const onButtonClick = React.useCallback<MouseEventHandler<HTMLButtonElement>>(
		e => {
			setPopperEventsEnabled(!isOpen)
			suppliedButtonOnClickHandler && suppliedButtonOnClickHandler(e)
		},
		[isOpen, suppliedButtonOnClickHandler],
	)
	const close = React.useCallback(() => {
		setPopperEventsEnabled(false)
	}, [])
	const refs = useCloseOnEscapeOrClickOutside<HTMLDivElement, HTMLDivElement>(isOpen, close)

	React.useEffect(() => {
		setIsOpen(popperEventsEnabled)
	}, [popperEventsEnabled])

	const contentContainerFromContent = React.useContext(DropdownContentContainerContext)
	const contentContainer = props.contentContainer || contentContainerFromContent || document.body

	return (
		<Manager>
			<div className="dropdown">
				<Reference>
					{({ ref }) => (
						<div className="dropdown-button" ref={ref}>
							<Button ref={refs.buttonRef} {...props.buttonProps} onClick={onButtonClick} />
						</div>
					)}
				</Reference>
				{createPortal(
					<Popper placement={alignmentToPlacement(props.alignment)} eventsEnabled={popperEventsEnabled}>
						{({ ref, style, placement }) => (
							<div ref={refs.contentRef} className="dropdown-content" style={style} data-placement={placement}>
								<Collapsible expanded={isOpen} transition="fade">
									<div ref={ref} className="dropdown-content-in">
										{typeof props.children === 'function' ? props.children({ requestClose: close }) : props.children}
									</div>
								</Collapsible>
							</div>
						)}
					</Popper>,
					contentContainer,
				)}
			</div>
		</Manager>
	)
})

export interface DropdownContainerProviderProps {
	children?: React.ReactNode
}

export const DropdownContentContainerProvider = React.memo((props: DropdownContainerProviderProps) => {
	const [contentContainer, setContentContainer] = React.useState<HTMLElement | undefined>(undefined)
	const contentContainerRef = React.useRef<HTMLDivElement>(null)
	React.useEffect(() => {
		// Run once ref is set
		setContentContainer(contentContainerRef.current || undefined)
	}, [])

	return (
		<div className="dropdown-contentContainer" ref={contentContainerRef}>
			<DropdownContentContainerContext.Provider value={contentContainer}>
				{props.children}
			</DropdownContentContainerContext.Provider>
		</div>
	)
})
