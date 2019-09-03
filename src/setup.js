/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation
 - Name Surname <name.surname@gatesfoundation.com>

 * Vassilis Barzokas <vassilis.barzokas@modusbox.com>
 --------------
 ******/

'use strict'

/**
 * @module src/setup
 */

const Rx = require('rxjs')
const { filter, flatMap } = require('rxjs/operators')
const Logger = require('@mojaloop/central-services-shared').Logger
const HealthCheck = require('@mojaloop/central-services-shared').HealthCheck.HealthCheck
const { createHealthCheckServer, defaultHealthHandler } = require('@mojaloop/central-services-health')

const Consumer = require('./lib/kafka/consumer')
const Utility = require('./lib/utility')
const { getSubServiceHealthBroker } = require('./lib/healthCheck/subServiceHealth')
const packageJson = require('../package.json')
const Observables = require('./observables')
const Config = require('./lib/config')

const setup = async () => {
  const hubName = Config.get('HUB_PARTICIPANT').NAME
  await Consumer.registerNotificationHandler()
  const topicName = Utility.transformGeneralTopicName(Utility.ENUMS.NOTIFICATION, Utility.ENUMS.EVENT)
  const consumer = Consumer.getConsumer(topicName)

  const healthCheck = new HealthCheck(packageJson, [
    getSubServiceHealthBroker
  ])
  await createHealthCheckServer(Config.get('PORT'), defaultHealthHandler(healthCheck))

  const topicObservable = Rx.Observable.create((observer) => {
    consumer.on('message', async (data) => {
      Logger.info(`Central-Event-Processor :: Topic ${topicName} :: Payload: \n${JSON.stringify(data.value, null, 2)}`)
      observer.next(data)
      if (!Consumer.isConsumerAutoCommitEnabled(topicName)) {
        consumer.commitMessageSync(data)
      }
    })
  })

  const fltr = filter(data => data.value.from === hubName)
  const flatM = flatMap(Observables.actionObservable)

  const apiNotification = topicObservable.pipe(fltr, flatM)

  apiNotification.subscribe(result => {
    Logger.info(result)
  })
  return true
}

module.exports = {
  setup
}
