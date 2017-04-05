"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meow = require("meow");
const sinon = require("sinon");
const styleString = require("chalk");
const TrafficLightsController = require(".");
const _1 = require(".");
const cli = meow(`
	Usage
	  $ simulate <simulation duration in seconds>
`);
const simulationDurationS = Number(cli.input[0]) || 1800;
simulateFor(simulationDurationS);
function getTrafficLightRepresentationFor(light) {
    if (styleString.supportsColor) {
        switch (light) {
            case _1.TrafficLightState.red:
                return styleString.red('●') + styleString.gray('●') + styleString.gray('●');
            case _1.TrafficLightState.yellow:
                return styleString.gray('●') + styleString.yellow('●') + styleString.gray('●');
            default:
                return styleString.gray('●') + styleString.gray('●') + styleString.green('●');
        }
    }
    switch (light) {
        case _1.TrafficLightState.red:
            return 'R..';
        case _1.TrafficLightState.yellow:
            return '.Y.';
        default:
            return '..G';
    }
}
function logState(state) {
    const elapsedSeconds = Date.now() / 1000;
    const lightsForNS = getTrafficLightRepresentationFor(TrafficLightsController.getTrafficLightStateForFlow(state, 'NS'));
    const lightsForEW = getTrafficLightRepresentationFor(TrafficLightsController.getTrafficLightStateForFlow(state, 'EW'));
    console.log(`T=${('000000' + elapsedSeconds).slice(-6)}s N ${lightsForNS}  S ${lightsForNS}  W ${lightsForEW}  E ${lightsForEW}`);
}
function simulateFor(simulationDurationS) {
    console.log(`
${styleString.red.bold('Traffic Lights Simulator')}
Now simulating traffic lights for ${styleString.red(`${simulationDurationS}`)}s…`);
    const clock = sinon.useFakeTimers();
    TrafficLightsController.factory({ onStateChange: logState });
    clock.tick(simulationDurationS * 60 * 1000);
}
//# sourceMappingURL=simulator.js.map