"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
exports.TrafficFlow = types_1.TrafficFlow;
exports.TrafficLightState = types_1.TrafficLightState;
const defaultDependencies = {
    SWITCH_PERIOD_S: 5 * 60,
    SWITCH_NOTIFICATION_DURATION_S: 30,
    debug: false,
    onStateChange: () => { }
};
function factory(dependencies = {}) {
    const { SWITCH_PERIOD_S, SWITCH_NOTIFICATION_DURATION_S, debug, onStateChange } = Object.assign({}, defaultDependencies, dependencies);
    let stopFlag = false;
    const state = {
        proceedingTrafficFlow: null,
        isChangeImminent: false
    };
    // very crude state machine, this is not the point of the test
    function next() {
        if (!state.proceedingTrafficFlow) {
            state.proceedingTrafficFlow = types_1.TrafficFlow.NS;
            if (debug)
                console.log('Starting with', state.proceedingTrafficFlow);
            if (!stopFlag)
                setTimeout(next, (SWITCH_PERIOD_S - SWITCH_NOTIFICATION_DURATION_S) * 1000);
            onStateChange(state);
            return;
        }
        if (state.isChangeImminent) {
            state.isChangeImminent = false;
            state.proceedingTrafficFlow = state.proceedingTrafficFlow === types_1.TrafficFlow.NS
                ? types_1.TrafficFlow.EW
                : types_1.TrafficFlow.NS;
            if (debug)
                console.log('switched to', state.proceedingTrafficFlow);
            if (!stopFlag)
                setTimeout(next, (SWITCH_PERIOD_S - SWITCH_NOTIFICATION_DURATION_S) * 1000);
            onStateChange(state);
            return;
        }
        state.isChangeImminent = true;
        if (debug)
            console.log('yellow');
        if (!stopFlag)
            setTimeout(next, SWITCH_NOTIFICATION_DURATION_S * 1000);
        onStateChange(state);
    }
    next();
    return {
        getState: () => state,
        stop: () => stopFlag = true,
    };
}
exports.factory = factory;
function getTrafficLightStateForFlow(state, flow) {
    if (flow !== state.proceedingTrafficFlow)
        return types_1.TrafficLightState.red;
    if (state.isChangeImminent)
        return types_1.TrafficLightState.yellow;
    return types_1.TrafficLightState.green;
}
exports.getTrafficLightStateForFlow = getTrafficLightStateForFlow;
//# sourceMappingURL=index.js.map