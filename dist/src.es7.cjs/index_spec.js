"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sinon = require("sinon");
const chai_1 = require("chai");
const TrafficLightsController = require(".");
const _1 = require(".");
describe('traffic lights controller', function () {
    describe('behaviour', function () {
        const EXPECTED_SWITCH_PERIOD_S = 5 * 60;
        const EXPECTED_SWITCH_NOTIFICATION_DURATION_S = 30;
        beforeEach(function () {
            this.clock = sinon.useFakeTimers();
            this.ctrl = TrafficLightsController.factory();
        });
        afterEach(function () {
            this.ctrl.stop();
            this.clock.restore();
        });
        it('should expose the current state of traffic flows', function () {
            chai_1.expect(this.ctrl).to.respondTo('getState');
            chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow');
            chai_1.expect(this.ctrl.getState()).to.have.property('isChangeImminent');
        });
        it('should have a correct init state', function () {
            chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS');
            chai_1.expect(this.ctrl.getState()).to.have.property('isChangeImminent', false);
        });
        it('should transition between the 2 traffic flows every 5 minutes', function () {
            for (let i = 0; i < 10; i++) {
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS');
                this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 - 1);
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS');
                this.clock.tick(1);
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS');
                this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1);
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS');
                this.clock.tick(1);
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW');
                this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 - 1);
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW');
                this.clock.tick(1);
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW');
                this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1);
                chai_1.expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW');
                this.clock.tick(1);
            }
        });
        it('should notify that a traffic flow is about to be stopped 30s before switching', function () {
            for (let i = 0; i < 10; i++) {
                chai_1.expect(this.ctrl.getState()).to.have.property('isChangeImminent', false);
                this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 - 1);
                chai_1.expect(this.ctrl.getState()).to.have.property('isChangeImminent', false);
                this.clock.tick(1);
                chai_1.expect(this.ctrl.getState()).to.have.property('isChangeImminent', true);
                this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1);
                chai_1.expect(this.ctrl.getState()).to.have.property('isChangeImminent', true);
                this.clock.tick(1);
            }
        });
        it('should have a mechanism to notify of state changes', function () {
            this.ctrl.stop();
            const onStateChange = sinon.spy();
            this.ctrl = TrafficLightsController.factory({ onStateChange });
            chai_1.expect(onStateChange).to.have.been.calledOnce; // init
            onStateChange.reset();
            for (let i = 0; i < 10; i++) {
                chai_1.expect(onStateChange).not.to.have.been.called;
                this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 - 1);
                chai_1.expect(onStateChange).not.to.have.been.called; // not yet
                this.clock.tick(1);
                chai_1.expect(onStateChange).to.have.been.calledOnce; // change notification
                chai_1.expect(onStateChange).to.have.been.calledWith(this.ctrl.getState());
                onStateChange.reset();
                this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1);
                chai_1.expect(onStateChange).not.to.have.been.called; // not yet
                this.clock.tick(1);
                chai_1.expect(onStateChange).to.have.been.calledOnce; // flow change
                chai_1.expect(onStateChange).to.have.been.calledWith(this.ctrl.getState());
                onStateChange.reset();
            }
        });
    });
    describe('traffic lights', function () {
        it('should be red if corresponding traffic flow is stopped', () => {
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.EW,
                isChangeImminent: false
            }, 'NS')).to.equal(_1.TrafficLightState.red);
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.EW,
                isChangeImminent: true
            }, 'NS')).to.equal(_1.TrafficLightState.red);
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.NS,
                isChangeImminent: false
            }, 'EW')).to.equal(_1.TrafficLightState.red);
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.NS,
                isChangeImminent: true
            }, 'EW')).to.equal(_1.TrafficLightState.red);
        });
        it('should be yellow if corresponding traffic flow is about to be stopped', () => {
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.EW,
                isChangeImminent: true
            }, 'EW')).to.equal(_1.TrafficLightState.yellow);
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.NS,
                isChangeImminent: true
            }, 'NS')).to.equal(_1.TrafficLightState.yellow);
        });
        it('should be green if corresponding traffic flow is passing and not about to be stopped', () => {
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.EW,
                isChangeImminent: false
            }, 'EW')).to.equal(_1.TrafficLightState.green);
            chai_1.expect(TrafficLightsController.getTrafficLightStateForFlow({
                proceedingTrafficFlow: _1.TrafficFlow.NS,
                isChangeImminent: false
            }, 'NS')).to.equal(_1.TrafficLightState.green);
        });
    });
});
//# sourceMappingURL=index_spec.js.map