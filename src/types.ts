import { Enum } from 'typescript-string-enums'


export const TrafficLightState = Enum(
	'red',
	'yellow',
	'green'
)
export type TrafficLightState = Enum<typeof TrafficLightState>



export const TrafficFlow = Enum(
	'NS',
	'EW'
)
export type TrafficFlow = Enum<typeof TrafficFlow>



export interface State {
	proceedingTrafficFlow: TrafficFlow | null
	isChangeImminent: boolean
}
