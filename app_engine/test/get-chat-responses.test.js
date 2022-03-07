/**
 * Copyright 2020 Quantiphi, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 const chai = require("chai");

 const should = chai.should();
 
 const assert = require('assert');
 
 const { chatResponses } = require("../intent-library/helper/get-chat-responses");
 const { CHIPS, CONTEXTS } = require("../helper/constants")

 //NOTE: Test cases might fail in future if there are any changes in the api
 
 describe("Get response for the status and possible chips", () => {``
     let params = {
        chatConfigApi : {
            "welcomeMsgWithCustomer": "I'm the $client_name Roadside Assistance Virtual Agent",
            "welcomeMsg": "Hi! I'm the $client_name Roadside Assistance Virtual Agent",
            "greeting": "Hi $name",
            "etaExpired": "It seems like the SP provider is running late and has exceeded the provided ETA. What would you like to do?",
            "endFlow": "We’re glad we were able to assist you. Thanks for chatting with us, and have a great rest of your day!",
            "askCallbackNumber": "To best assist you, please provide me with the number associated with your current roadside request",
            "askNumber": "Please provide a valid 10-digit number.",
            "invalidNumber": "I can’t seem to locate that phone number, but let me connect you with an agent now to help you with your request.",
            "getUserIntent": "Sure, I’m happy to connect you with one of our agents. In a few words, please tell me what you need assistance with?",
            "agentTransfer": "Please wait while I connect you to an agent.",
            "initialApiFail": "Thanks, what can I help you with today?",
            "apiFailure": "I am currently unable to process your request. Please wait while I connect you to an agent.",
            "confirmCancelRequest": "Are you sure you want to cancel your service request at $address?",
            "confirmCancelRequestFallback": "Sorry, I didn’t get that. Are you sure you want to cancel your service request at $address",
            "reasonForCancel": "Okay, I can start the process for you. Why are you looking to cancel?",
            "anythingElse": "Is there anything else I can help you with?",
            "cancelSuccess": "Thanks, I’ve gone ahead and cancelled your request. Is there anything else I can help you with today?",
            "rephraseQuery": "Sorry, I didn’t quite get that. Would you rephrase the request?",
            "SPDetails": "Your service provider $SPName can be reached at $SPnumber",
            "askToChatWithAgent": "Would you like to chat with an agent?",
            "modifyRequest": "What would you like to change?",
            "getPickupLocation": "I can certainly help you with that. What is the address of your new pick-up location?",
            "getDropoffLocation": "I can certainly help you with that. What is the address of your new drop-off location?",
            "towTruckInfo": "It looks like your tow truck will arrive in $time minutes. \n\nWe’re monitoring their progress to make sure it reaches you on time. \n\nIs there anything else I can help you with today?",
            "ETAAvailable": "It looks like your Service Provider is scheduled to arrive in $time minutes. \n\nIs there anything else I can help you with today?",
            "smsTriggered": "I’ve just sent you a text message with a link to begin a new request. Thanks!",
            "smsWait": "It can take up to 30 seconds for you to receive the text. Click on that URL to begin a new request. Thank you!",
            "ETAPassed": "We’re sorry for the inconvenience. It looks like your service is slightly delayed. Would you like me to connect you with one of our agents?",
            "SPNotArrived": "We’re sorry for the inconvenience. Would you like to contact the Service Provider directly?",
            "initial": "I see that your request is in process. What would you like to do?",
            "connectToAgentForHelp": "To help you further around this let me connect you to an agent.",
            "created": "I see that your request is in process. We are working on allocating a suitable service provider for your request. What would you like to do?",
            "processOfAllocatingSP": "I see that your request is in process. We are in process of allocating a suitable service provider for your request. What would you like to do?",
            "requestInProcess": "I see that your request is in process. We are awaiting dispatch details from our partner. What would you like to do?",
            "SPShouldArriveInMinutes": "I see that your service provider, $SPName, for a $serviceType should arrive within $minutes minutes at $location. What would you like to do?",
            "revisedETAAvailable": "I see that your service provider, $SPName, for a $serviceType has revised the ETA and will now arrive within $minutes minutes at $location. What would you like to do?",
            "revisedETAUnavailable": "I see that your service provider, $SPName, for a $serviceType has revised the ETA, which will be available shortly. What would you like to do?",
            "SPArrivedPickup": "I see that your service provider, $SPName, for a $serviceType has arrived at the requested location. Is there anything else I can help you with ?",
            "SPArrivedPickupTowing": "I see that your service provider, $SPName, for a $serviceType has arrived at the requested location and is in process of towing your vehicle.",
            "SPArrivedDropoff": "I see that your service provider, $SPName has reached the drop off location with your vehicle. Is there anything else I can help you with ?",
            "completed": "I see that your service for a $serviceType has been completed as required. Is there anything else I can help you with ?",
            "cancelled": "I see that your service for a $serviceType has been cancelled. What would you like to do?",
            "GOA": "I see that the tow truck arrived at the $location but was unable to locate you or locate your vehicle. What would you like to do?",
            "unsuccessful": "I see that this service request for a $serviceType requires a different equipment to be completed. A new request will be triggered shortly for which the details will be shared over a text message.",
            "numberForNewRequest": "Please provide valid mobile number to raise new request.",
            "sessionRefresh": "To re-initiate chat, please click on the END CHAT button."
          }
     }

     /*Should return response for accepted status and possible chips  */
     it("Should return response for accepted status and possible chips", async () => {
        let jobDetailsParams = {
            "swcid": 1918163,
            "id": "2dzSoKQ2Zj7HEJpNel9bZb",
            "createdAt": "2021-08-24T17:06:59Z",
            "status": "Accepted",
            "service": {
                "name": "Tire Change",
                "__typename": "JobService"
            },
            "eta": {
                "current": "2021-08-24T17:17:54Z"
            },
            "customer": {
                "name": "Sairam",
                "phone": "+14153456789"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Low Clearance",
                    "address": "238 Sansome St, San Francisco, CA 94104"
                }
            },
            "partner": {
                "company": {
                    "name": "Patrick's Towing",
                    "phone": "+12065551234"
                }
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.have.property('res').and.to.be.a('string');
        responses.should.have.property('contexts').to.be.an('array');
        responses.should.have.property('contexts').not.to.be.an('object');
        responses.should.have.property('chips').to.have.lengthOf(3);
     });    
     /*Should return response, chips for cancelled status  */
     it("Should return response, chips for cancelled status", async () => {
        let jobDetailsParams = {
            "swcid": 1904361,
            "id": "7WVBGdlhDWFpta4370irap",
            "createdAt": "2021-08-18T13:54:23Z",
            "status": "Canceled",
            "service": {
                "name": "Tow",
                "__typename": "JobService"
            },
            "eta": {
                "current": null
            },
            "customer": {
                "name": "Michael Beard",
                "phone": "+12105550111"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Highway",
                    "address": "1372 Rockledge Ln, Walnut Creek, CA 94595"
                }
            },
            "partner": {
                "company": null
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.have.property('res').and.to.be.a('string');
        responses.should.have.property('contexts').to.be.an('array');
        responses.should.have.property('chips').to.have.lengthOf(3);
     });     
     /*Should return agent trasfer property true for reassigned status  */
     it("Should return agent trasfer property true for reassigned status ", async () => {
        let jobDetailsParams = {
            "swcid": 1904361,
            "id": "7WVBGdlhDWFpta4370irap",
            "createdAt": "2021-08-18T13:54:23Z",
            "status": "Reassigned",
            "service": {
                "name": "Tow",
                "__typename": "JobService"
            },
            "eta": {
                "current": null
            },
            "customer": {
                "name": "Michael Beard",
                "phone": "+12105550111"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Highway",
                    "address": "1372 Rockledge Ln, Walnut Creek, CA 94595"
                }
            },
            "partner": {
                "company": null
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.have.property('res').and.to.be.a('string');
        responses.should.have.property('contexts').to.be.an('array');
        responses.should.have.property('agentTransfer').equal(true);
     });     
     /*Should return possible chips and respose message for pending status*/
     it("Should return possible chips and respose message for pending status", async () => {
        let jobDetailsParams = {
            "swcid": 1917725,
            "id": "38b2GSU5Jko1oBK7EsEMwA",
            "createdAt": "2021-08-24T14:19:11Z",
            "status": "Pending",
            "service": {
                "name": "Tow",
                "__typename": "JobService"
            },
            "eta": {
                "current": null
            },
            "customer": {
                "name": "Joan Kiernan",
                "phone": "+15165552122"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Point of Interest",
                    "address": "115 Foster Dr, McDonough, GA 30253"
                }
            },
            "partner": {
                "company": null
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.have.property('res').not.to.be.an('object');
        responses.should.have.property('contexts').to.be.an('array');
        responses.should.not.have.property('agentTransfer')
     });     
     /*Should return for chips and response forn unsuccessful status */
     it("Should return for chips and response for unsuccessful status ", async () => {
        let jobDetailsParams = {
            "swcid": 1771994,
            "id": "6hcadBQg787RtaT30CzAln",
            "createdAt": "2021-07-07T14:58:50Z",
            "status": "Unsuccessful",
            "service": {
                "name": "Tow",
                "__typename": "JobService"
            },
            "eta": {
                "current": "2021-07-07T21:53:45Z"
            },
            "customer": {
                "name": "Audria Orsini",
                "phone": "+14239681417"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Parking Lot",
                    "address": "2775 40th Ave, San Francisco, CA 94116"
                }
            },
            "partner": {
                "company": {
                    "name": "test towing",
                    "phone": "+13092871570"
                }
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.have.property('res').not.to.be.an('object');
        responses.should.have.property('contexts').to.be.an('array');
        responses.should.have.property('contexts').to.have.lengthOf(2);
        responses.should.have.property('chips').to.be.an('array');
        responses.should.have.property('chips').to.have.lengthOf(2);
        responses.should.not.have.property('agentTransfer')
     });     
     /*Should return possiable chips and response for  complted status */
     it("Should return possiable chips and response for  complted status", async () => {
        let jobDetailsParams = {
            "swcid": 1866967,
            "id": "4cFK27E5wANXVN8jYrSv4Q",
            "createdAt": "2021-08-06T08:24:18Z",
            "status": "Completed",
            "service": {
                "name": "Tow",
                "__typename": "JobService"
            },
            "eta": {
                "current": "2021-08-06T08:58:54Z"
            },
            "customer": {
                "name": "Test",
                "phone": "+17865679875"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Highway",
                    "address": "6029-5997 Whiteford Dr, Highland Heights, OH 44143"
                }
            },
            "partner": {
                "company": {
                    "name": "Test SNA Company",
                    "phone": "+17065556907"
                }
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.not.have.property('agentTransfer')
        responses.should.have.property('chips').to.have.members([CHIPS.newRequest, CHIPS.thanks]);
        responses.should.have.property('contexts')
     });     
     /*Should return agent trasfer for deleted status */
     it("Should return agent trasfer for deleted status ", async () => {
        let jobDetailsParams = {
            "swcid": 1856566,
            "id": "7JLCjzutNyBCUuX8tbyK9k",
            "createdAt": "2021-08-04T17:43:12Z",
            "status": "Deleted",
            "service": {
                "name": "Accident Tow",
                "__typename": "JobService"
            },
            "eta": {
                "current": null
            },
            "customer": {
                "name": "Quinn Baetz",
                "phone": "+12315555555"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Auto Body Shop",
                    "address": "1235 Mission St, San Francisco, CA 94103"
                }
            },
            "partner": {
                "company": null
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.have.property('agentTransfer').equal(true);
        responses.should.not.have.property('chips');
        responses.should.have.property('contexts').to.eql([]);
     });     
     /*Should return response and chips for Draft status  */
     it("Should return response and chips for Draft status  ", async () => {
        let jobDetailsParams = {
            "swcid": 1916686,
            "id": "5s8OrT2nkPHP5boWbASYRJ",
            "createdAt": "2021-08-24T00:05:41Z",
            "status": "Draft",
            "service": {
                "name": "Winch Out",
                "__typename": "JobService"
            },
            "eta": {
                "current": null
            },
            "customer": {
                "name": "Wendi Villa",
                "phone": "+17816795828"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Local Roadside",
                    "address": "22598-22590 Mines Rd, Livermore, CA 94550"
                }
            },
            "partner": {
                "company": null
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.not.have.property('agentTransfer')
        responses.should.have.property('chips').to.have.members([CHIPS.editRequest, CHIPS.cancelRequest, CHIPS.towTruckTime]);
        responses.should.have.property('contexts').to.have.lengthOf(5);
     }); 
     /*Should return response and chips for GOA status  */    
     it("Should return response and chips for GOA status ", async () => {
        let jobDetailsParams = {
            "swcid": 1852509,
            "id": "14i0MWuM7TnlYalVEbdsAs",
            "createdAt": "2021-08-03T13:43:50Z",
            "status": "GOA",
            "service": {
                "name": "Tire Change",
                "__typename": "JobService"
            },
            "eta": {
                "current": "2021-08-03T15:19:50Z"
            },
            "customer": {
                "name": "Peter3",
                "phone": "+18148889999"
            },
            "location": {
                "serviceLocation": {
                    "locationType": "Residence",
                    "address": "2145 Market St, San Francisco, CA 94114"
                }
            },
            "partner": {
                "company": {
                    "name": "Juanderful Wreckers",
                    "phone": "+13055555555"
                }
            }
        }
        let responses = await chatResponses(jobDetailsParams, params)
        responses.should.not.have.property('agentTransfer')
        responses.should.have.property('contexts').to.have.members([CONTEXTS.ChatRaiseReq, CONTEXTS.ChatSpeakToSP, CONTEXTS.ChatEndFlow, CONTEXTS.ChatSomethingElse]);
        responses.should.have.property('chips').to.have.lengthOf(3);
     });     
 });