import * as React from 'react'
import cn from 'classnames'
import { CollapsibleTransition } from '../types'
import { toEnumViewClass, toStateClass } from '../utils'

export interface CollapsibleProps {
	expanded: boolean
	transition?: CollapsibleTransition
	children?: React.ReactNode
}

export const Collapsible = React.memo(({ transition = 'topInsert', ...props }: CollapsibleProps) => {
	const contentRef = React.useRef<HTMLDivElement>(null)
	const [isTransitioning, setIsTransitioning] = React.useState(false)
	const [contentHeight, setContentHeight] = React.useState('auto')
	const [delayedExpanded, setDelayedExpanded] = React.useState(props.expanded)

	const onTransitionEnd = () => {
		setContentHeight('auto')
		setIsTransitioning(false)
	}

	const updateContentHeight = () => {
		const contentHeight = `${contentRef.current!.getBoundingClientRect().height}px`
		setContentHeight(contentHeight)
	}

	React.useEffect(() => {
		if (props.expanded !== delayedExpanded) {
			setIsTransitioning(true)
			updateContentHeight()
			requestAnimationFrame(() => {
				contentRef.current!.clientHeight // Force reflow
				setDelayedExpanded(props.expanded)
			})
		}
	}, [delayedExpanded, props.expanded])

	return (
		<div
			className={cn(
				'collapsible',
				toEnumViewClass(`transition-${transition}`),
				toStateClass('expanded', delayedExpanded),
				toStateClass('transitioning', isTransitioning),
			)}
			style={
				{
					'--cui-collapsible-content-height': contentHeight,
				} as React.CSSProperties // Custom properties not supported workaround
			}
			aria-hidden={!props.expanded}
			onTransitionEnd={onTransitionEnd}
		>
			<div className="collapsible-content" ref={contentRef}>
				{props.children}
			</div>
		</div>
	)
})
Collapsible.displayName = 'Collapsible'
