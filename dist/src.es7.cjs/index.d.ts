import { TrafficFlow, TrafficLightState, State } from './types';
interface InjectableDependencies {
    SWITCH_PERIOD_S: number;
    SWITCH_NOTIFICATION_DURATION_S: number;
    debug: boolean;
    onStateChange: (state: State) => void;
}
declare function factory(dependencies?: Partial<InjectableDependencies>): {
    getState: () => State;
    stop: () => boolean;
};
declare function getTrafficLightStateForFlow(state: State, flow: TrafficFlow): TrafficLightState;
export { TrafficFlow, TrafficLightState, State, InjectableDependencies, factory, getTrafficLightStateForFlow };
