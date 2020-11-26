'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
    console.log(event)

    if (event.triggerSource === 'CustomMessage_SignUp') {

        if (event.request.userAttributes.email !== 'siim.sutt.1@eesti.ee') {
            return (event)
        }

        console.log('another')




        // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
        const { codeParameter, linkParameter } = event.request;
        const { userName } = event;
        const { clientId } = event.callerContext;
        const { email } = event.request.userAttributes;

        const url = `https://api.poff.ee/trigger/passraport?code=${codeParameter}&username=${userName}&clientId=${clientId}&email=${email}`
        event.response.emailSubject = 'Please verify your email addresss';
        event.response.emailMessage = `
        <!DOCTYPE html>
          <html>
            <a
                href="${url}"
                target="_blank"
                style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;"
                >Verify</a
            >
            <div style="display: none">${linkParameter}</div>
          </html>
        `;

        return event;
    }

    // import { CognitoIdentityServiceProvider } from 'aws-sdk';
    // import { UserMapper } from '../database';


    const { clientId, code, email, username } = event.queryStringParameters;
    const cognitoISP = new aws.CognitoIdentityServiceProvider();
    const params = {
        ClientId: clientId,
        ConfirmationCode: code,
        Username: username,
    };

    try {
        await cognitoISP.confirmSignUp(params).promise();
        // await UserMapper.verifyUser({ email: username });


        const redirect_uri = (`https://poff.ee/login/`)
        console.log('redirect_uri ', redirect_uri)
        return _h.redirect(redirect_uri)

        // return callback(null, {
        //     statusCode: 302,
        //     headers: {
        //         // Location: `https://mywebsite.com/login?verified=true&email=${email}`,
        //         Location: `https://postimees.ee`,
        //     },
        // });
    } catch (e) {
        console.log(e)
        const redirect_uri = (`https://delfi.ee`)
        console.log('redirect_uri ', redirect_uri)
        return _h.redirect(redirect_uri)
        // woops, error, redirect but without verified=true
        // return callback(null, {
        //     statusCode: 302,
        //     headers: {
        //         // Location: `https://www.mywebsite.com/login?email=${email}`,
        //         Location: `https://delfi.ee`,
        //     },
        // });
    }
}