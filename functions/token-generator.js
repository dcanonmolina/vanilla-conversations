exports.handler = function(context, event, callback) {
   
    let response = new Twilio.Response();
    let headers = {
        'Access-Control-Allow-Origin': '*',
      };
    

    response.setHeaders(headers);
        
    
    let AccessToken = Twilio.jwt.AccessToken;
    let token = new AccessToken(
        context.ACCOUNT_SID,
        context.TWILIO_API_KEY_SID,
        context.TWILIO_API_KEY_SECRET, {
        identity: event.identity,
        ttl: 3600
        });

    let grant = new AccessToken.ChatGrant({ serviceSid: context.SERVICE_SID });
    if(context.PUSH_CREDENTIAL_SID) {
        // Optional: without it, no push notifications will be sent
        grant.pushCredentialSid = context.PUSH_CREDENTIAL_SID; 
    }
    token.addGrant(grant);
    response.setStatusCode(200);
    response.setBody(token.toJwt());
    
    return   callback(null, response);
 
};