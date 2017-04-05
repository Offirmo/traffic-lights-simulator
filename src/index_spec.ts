import * as sinon from 'sinon'
import { expect } from 'chai'

import * as TrafficLightsController from '.'
import { TrafficFlow, TrafficLightState } from '.'

describe('traffic lights controller', function () {

	describe('behaviour', function () {
		const EXPECTED_SWITCH_PERIOD_S = 5 * 60
		const EXPECTED_SWITCH_NOTIFICATION_DURATION_S = 30

		beforeEach(function () {
			this.clock = sinon.useFakeTimers()
			this.ctrl = TrafficLightsController.factory()
		})

		afterEach(function () {
			this.ctrl.stop()
			this.clock.restore()
		})

		it('should expose the current state of traffic flows', function () {
			expect(this.ctrl).to.respondTo('getState')
			expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow')
			expect(this.ctrl.getState()).to.have.property('isChangeImminent')
		})

		it('should have a correct init state', function () {
			expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS')
			expect(this.ctrl.getState()).to.have.property('isChangeImminent', false)
		})

		it('should transition between the 2 traffic flows every 5 minutes', function () {
			for(let i = 0; i < 10; i++) {
				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS')
				this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 -1)
				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS')
				this.clock.tick(1)
				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS')
				this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1)
				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'NS')
				this.clock.tick(1)

				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW')
				this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 - 1)
				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW')
				this.clock.tick(1)
				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW')
				this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1)
				expect(this.ctrl.getState()).to.have.property('proceedingTrafficFlow', 'EW')
				this.clock.tick(1)
			}
		})

		it('should notify that a traffic flow is about to be stopped 30s before switching', function () {
			for(let i = 0; i < 10; i++) {
				expect(this.ctrl.getState()).to.have.property('isChangeImminent', false)
				this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 - 1)
				expect(this.ctrl.getState()).to.have.property('isChangeImminent', false)
				this.clock.tick(1)
				expect(this.ctrl.getState()).to.have.property('isChangeImminent', true)
				this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1)
				expect(this.ctrl.getState()).to.have.property('isChangeImminent', true)
				this.clock.tick(1)
			}
		})

		it('should have a mechanism to notify of state changes', function() {
			this.ctrl.stop()
			const onStateChange = sinon.spy()
			this.ctrl = TrafficLightsController.factory({ onStateChange })

			expect(onStateChange).to.have.been.calledOnce // init
			onStateChange.reset()

			for(let i = 0; i < 10; i++) {
				expect(onStateChange).not.to.have.been.called
				this.clock.tick((EXPECTED_SWITCH_PERIOD_S - EXPECTED_SWITCH_NOTIFICATION_DURATION_S) * 1000 - 1)
				expect(onStateChange).not.to.have.been.called // not yet
				this.clock.tick(1)
				expect(onStateChange).to.have.been.calledOnce // change notification
				expect(onStateChange).to.have.been.calledWith(this.ctrl.getState())
				onStateChange.reset()
				this.clock.tick(EXPECTED_SWITCH_NOTIFICATION_DURATION_S * 1000 - 1)
				expect(onStateChange).not.to.have.been.called // not yet
				this.clock.tick(1)
				expect(onStateChange).to.have.been.calledOnce // flow change
				expect(onStateChange).to.have.been.calledWith(this.ctrl.getState())
				onStateChange.reset()
			}
		})
	})

	describe('traffic lights', function () {

		it('should be red if corresponding traffic flow is stopped', () => {
			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.EW,
					isChangeImminent: false
				},
				'NS'
			)).to.equal(TrafficLightState.red)

			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.EW,
					isChangeImminent: true
				},
				'NS'
			)).to.equal(TrafficLightState.red)

			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.NS,
					isChangeImminent: false
				},
				'EW'
			)).to.equal(TrafficLightState.red)

			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.NS,
					isChangeImminent: true
				},
				'EW'
			)).to.equal(TrafficLightState.red)
		})

		it('should be yellow if corresponding traffic flow is about to be stopped', () => {
			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.EW,
					isChangeImminent: true
				},
				'EW'
			)).to.equal(TrafficLightState.yellow)

			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.NS,
					isChangeImminent: true
				},
				'NS'
			)).to.equal(TrafficLightState.yellow)
		})

		it('should be green if corresponding traffic flow is passing and not about to be stopped', () => {
			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.EW,
					isChangeImminent: false
				},
				'EW'
			)).to.equal(TrafficLightState.green)

			expect(TrafficLightsController.getTrafficLightStateForFlow(
				{
					proceedingTrafficFlow: TrafficFlow.NS,
					isChangeImminent: false
				},
				'NS'
			)).to.equal(TrafficLightState.green)
		})
	})
})
