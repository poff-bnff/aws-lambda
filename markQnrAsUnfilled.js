var AWS = require('aws-sdk');


exports.handler = (event, context, callback) => {
    console.log(event);
    let identities = event.request.userAttributes.identities;
    identities = identities.replace('[', '');
    identities = identities.replace(']', '');


    console.log(identities);

    identities = JSON.parse(identities);
    console.log(typeof(identities));
    console.log(identities);
    console.log(identities.userId);

    let username1 = (identities.providerName).toLowerCase() + '_' + identities.userId;
    console.group(username1);


    var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'eu-central-1'});

    var params = {
        UserAttributes: [ /* required */
          {
            Name: 'custom:qnrFilled', /* required */
            Value: 'unfilled'
          },
          /* more items */
        ],
        UserPoolId: 'eu-central-1_ockBtdcsP', /* required */
        Username: username1 /* required */
      };
      cognitoidentityserviceprovider.adminUpdateUserAttributes(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });

    
    callback(null, event);
     
};