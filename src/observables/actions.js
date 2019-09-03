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

const request = require('request')
const Rx = require('rxjs')
const Logger = require('@mojaloop/central-services-shared').Logger
const ErrorHandler = require('@mojaloop/central-services-error-handling')

const dictionary = {
  //todo implement a method that receives an object with a completed settlement details and an array of dfxp details
  // and makes an HTTP call to each one of them in order to inform them that a settlement has been completed
  makeApiCall: async ({ payload }) => {
    const settlementDetails = payload.settlementDetails
    const dfxpsDetails = payload.dfxpsDetails
    const requests = []

    for (const dfxpDetails in dfxpsDetails) {
      requests.push(request({
          method: 'POST',
          uri: `http://${dfxpDetails.api.host}:${dfxpDetails.api.port}/settlement-completed`,
          data: {
            value: settlementDetails.value
            //...
          }
      }));
    }

    Promise.all(requests).then(() => {
      //..
    });
  }
}

const actionBuilder = (action) => {
  if (action in dictionary) {
    return dictionary[action]
  } else {
    throw ErrorHandler.Factory.createInternalServerFSPIOPError('Action are not supported')
  }
}

const actionObservable = (message) => {
  return Rx.Observable.create(async observer => {
    try {
      const result = await actionBuilder(message.value.content.payload.messageDetails.action)({ payload: message.value.content.payload })
      observer.next(result)
    } catch (err) {
      Logger.info(`action observer failed with error - ${err}`)
      observer.error(err)
    }
  })
}

module.exports = { actionObservable }
