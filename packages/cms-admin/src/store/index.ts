import { applyMiddleware, compose, createStore, Middleware, Reducer, Store as ReduxStore } from 'redux'
import { createAction } from 'redux-actions'

import thunk from 'redux-thunk'
import { Dispatch } from '../actions/types'
import ContentClientFactory from '../model/ContentClientFactory'
import GraphqlClient from '../model/GraphqlClient'
import LocalStorageManager from '../model/LocalStorageManager'
import rootReducer from '../reducer'
import { SET_TOKEN } from '../reducer/auth'
import State from '../state'

export interface Services {
	localStorageManager: LocalStorageManager
	tenantClient: GraphqlClient
	contentClientFactory: ContentClientFactory
}

export function createServices(): Services {
	const localStorageManager = new LocalStorageManager()
	const tenantClient = new GraphqlClient(process.env.SERVER_URL + '/tenant')
	const contentClientFactory = new ContentClientFactory(process.env.SERVER_URL)
	return {
		localStorageManager,
		tenantClient,
		contentClientFactory
	}
}

export interface Store extends ReduxStore<State> {
	dispatch: Dispatch
}

export function persistState(services: Services) {
	return (next: Function) => (reducer: Reducer, initialState: State): Store => {
		const store: Store = next(reducer, initialState)

		const persistedApiToken = services.localStorageManager.get(LocalStorageManager.Keys.API_TOKEN)
		if (persistedApiToken) {
			store.dispatch(createAction(SET_TOKEN, () => persistedApiToken)())
		}

		store.subscribe(() => {
			const state = store.getState()
			const token = state.auth.token
			if (token) {
				services.localStorageManager.set(LocalStorageManager.Keys.API_TOKEN, token)
			} else {
				services.localStorageManager.unset(LocalStorageManager.Keys.API_TOKEN)
			}
		})

		return store
	}
}

export function configureStore(initialState: State): Store {
	const composeEnhancers: typeof compose = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
	const services = createServices()
	const middlewares: Middleware[] = [thunk.withExtraArgument(services)]

	const middlewareEnhancer = applyMiddleware(...middlewares)

	// "as any" is a workaround for typescript exceeding max call stack size (tsc's bug)
	return (createStore as any)(rootReducer, initialState, composeEnhancers(middlewareEnhancer, persistState(services)))
}
