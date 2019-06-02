'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const googleapis = require('googleapis');
const kgsearch = googleapis.kgsearch('v1');

process.env.DEBUG = 'dialogflow:debug';

const OPERATOR = "operator";

function formatSlackMessage (query, response) {
  let entity;
  console.log("----> formatSlackMessage")
  // Extract the first entity from the result list, if any
  if (response && response.itemListElement && response.itemListElement.length > 0) {
    entity = response.itemListElement[0].result;
  }
  console.log("----> entity is "+ entity.detailedDescription.articleBody);
  // Prepare a rich Slack message
  // See https://api.slack.com/docs/message-formatting
  const slackMessage = {
    response_type: 'in_channel',
    text: `Query: ${query}`,
    attachments: []
  };
  
  var text="";

  if (entity) {
    text = entity.detailedDescription.articleBody;
    const attachment = {
      color: '#3367d6'
    };
    if (entity.name) {
      attachment.title = entity.name;
      if (entity.description) {
        attachment.title = `${attachment.title}: ${entity.description}`;
      }
    }
    if (entity.detailedDescription) {
      if (entity.detailedDescription.url) {
        attachment.title_link = entity.detailedDescription.url;
      }
      if (entity.detailedDescription.articleBody) {
        attachment.text = entity.detailedDescription.articleBody;
      }
    }
    if (entity.image && entity.image.contentUrl) {
      attachment.image_url = entity.image.contentUrl;
    }
    slackMessage.attachments.push(attachment);
  } else {
    slackMessage.attachments.push({
      text: 'No results match your query...'
    });
  }

  //return slackMessage;
  return text;
}

function makeSearchRequest (query) {
  return new Promise((resolve, reject) => {
    console.log("makeSearchRequest");
    kgsearch.entities.search({
      auth: "AIzaSyBg-LcAS21hQ0d9MQ4MSYGKmWLwrwT7LsU",
      query: query,
      limit: 1
    }, (err, response) => {
      console.log(response + "in makeSearchRequest");
      if (err) {
        reject(err);
        return;
      }

      // Return a formatted message
      resolve(formatSlackMessage(query, response));
      //resolve(response)
    });
  });
}

exports.kg_search = functions.https.onRequest((request,response) =>{
    const agent = new WebhookClient({request, response });
    let operator = request.body.queryResult.parameters.operator;
    console.log(operator + "6");
    
    return operator_about(agent);

    function operator_about(agent){
        //makeSearchRequest(operator)
        console.log("inside operator_about");
        makeSearchRequest(operator).then((output) => {
            response.json({ 'fulfillmentText': output }); // Return the results of the weather API to Dialogflow
            agent.add("Who are you ?" + operator);
          }).catch(() => {
            response.json({ 'fulfillmentText': `I don't know the weather but I hope it's good!` });
          })
        
    }
        
    //let intentMap = new Map();
    //intentMap.set(OPERATOR, operator_about);

    //agent.handleRequest(intentMap);
});