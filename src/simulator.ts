import * as meow from 'meow'
import * as sinon from 'sinon'
import * as styleString from 'chalk'

import * as TrafficLightsController from '.'
import { TrafficLightState } from '.'


const cli = meow(`
	Usage
	  $ simulate <simulation duration in seconds>
`)

const simulationDurationS = Number(cli.input[0]) || 1800
simulateFor(simulationDurationS)


function getTrafficLightRepresentationFor(light: TrafficLightState): string {
	if (styleString.supportsColor) {
		switch(light) {
			case TrafficLightState.red:
				return styleString.red('●') + styleString.gray('●') + styleString.gray('●')
			case TrafficLightState.yellow:
				return styleString.gray('●') + styleString.yellow('●') + styleString.gray('●')
			default:
				return styleString.gray('●') + styleString.gray('●') + styleString.green('●')
		}
	}

	switch(light) {
		case TrafficLightState.red:
			return 'R..'
		case TrafficLightState.yellow:
			return '.Y.'
		default:
			return '..G'
	}
}


function logState(state: TrafficLightsController.State): void {
	const elapsedSeconds = Date.now() / 1000
	const lightsForNS = getTrafficLightRepresentationFor(
		TrafficLightsController.getTrafficLightStateForFlow(state, 'NS')
	)
	const lightsForEW = getTrafficLightRepresentationFor(
		TrafficLightsController.getTrafficLightStateForFlow(state, 'EW')
	)
	console.log(`T=${('000000' + elapsedSeconds).slice(-6)}s N ${lightsForNS}  S ${lightsForNS}  W ${lightsForEW}  E ${lightsForEW}`)
}


function simulateFor(simulationDurationS: number) {
	console.log(`
${styleString.red.bold('Traffic Lights Simulator')}
Now simulating traffic lights for ${styleString.red(`${simulationDurationS}`)}s…`
	)

	const clock = sinon.useFakeTimers()
	TrafficLightsController.factory({ onStateChange: logState })
	clock.tick(simulationDurationS * 60 * 1000)
}
