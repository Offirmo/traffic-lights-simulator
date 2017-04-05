import { TrafficFlow, TrafficLightState, State } from './types'

interface InjectableDependencies {
	SWITCH_PERIOD_S: number
	SWITCH_NOTIFICATION_DURATION_S: number
	debug: boolean
	onStateChange: (state: State) => void
}

const defaultDependencies: InjectableDependencies = {
	SWITCH_PERIOD_S: 5 * 60,
	SWITCH_NOTIFICATION_DURATION_S: 30,
	debug: false,
	onStateChange: () => {}
}

function factory(dependencies: Partial<InjectableDependencies> = {}) {
	const { SWITCH_PERIOD_S, SWITCH_NOTIFICATION_DURATION_S, debug, onStateChange } = Object.assign({}, defaultDependencies, dependencies)

	let stopFlag = false

	const state: State = {
		proceedingTrafficFlow: null,
		isChangeImminent: false
	}

	// very crude state machine, this is not the point of the test
	function next(): void {
		if (!state.proceedingTrafficFlow) {
			state.proceedingTrafficFlow = TrafficFlow.NS
			if (debug) console.log('Starting with', state.proceedingTrafficFlow)
			if (!stopFlag) setTimeout(next, (SWITCH_PERIOD_S - SWITCH_NOTIFICATION_DURATION_S) * 1000)
			onStateChange(state)
			return
		}

		if (state.isChangeImminent) {
			state.isChangeImminent = false
			state.proceedingTrafficFlow = state.proceedingTrafficFlow === TrafficFlow.NS
				? TrafficFlow.EW
				: TrafficFlow.NS
			if (debug) console.log('switched to', state.proceedingTrafficFlow)
			if (!stopFlag) setTimeout(next, (SWITCH_PERIOD_S - SWITCH_NOTIFICATION_DURATION_S) * 1000)
			onStateChange(state)
			return
		}

		state.isChangeImminent = true
		if (debug) console.log('yellow')
		if (!stopFlag) setTimeout(next, SWITCH_NOTIFICATION_DURATION_S * 1000)
		onStateChange(state)
	}
	next()


	return {
		getState: (): State => state,
		stop: () => stopFlag = true,
		getTrafficLightStateForFlow: (flow: TrafficFlow) => getTrafficLightStateForFlow(state, flow),
	}
}

function getTrafficLightStateForFlow(state: State, flow: TrafficFlow): TrafficLightState {
	if (flow !== state.proceedingTrafficFlow)
		return TrafficLightState.red
	if (state.isChangeImminent)
		return TrafficLightState.yellow
	return TrafficLightState.green
}

export {
	TrafficFlow,
	TrafficLightState,
	State,
	InjectableDependencies,
	factory,
	getTrafficLightStateForFlow,
}
