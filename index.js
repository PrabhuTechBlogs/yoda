const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');

const ABOUT = "about";

exports.about_handle = functions.https.onRequest((request,response) =>{
    const agent = new WebhookClient({request, response });
    let operator = request.body.queryResult.parameters.operator;
    
    function about(agent){
        if(operator.toLowerCase() == "verizon"){
            agent.add("Verizon, is an American multinational telecommunications conglomerate and a corporate component of the Dow Jones Industrial Average.");
        }else if(operator.toLowerCase() == "optus"){
            agent.add("Singtel Optus Pty Limited Optus is the second largest telecommunications company in Australia. It is a wholly owned subsidiary of SingTel since 2001");
        }else if(operator.toLowerCase() == "telstra"){
            agent.add("Telstra Corporation Limited is Australia's largest telecommunications company which builds and operates telecommunications networks and markets voice, mobile, internet access, pay television and other products and services.");
        }else{
            agent.add("I am sorry, this does not look like anything to me");
        }
    }
    
    let intentMap = new Map();
    intentMap.set(ABOUT, about);
    
    agent.handleRequest(intentMap);
});