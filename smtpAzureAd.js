/*!
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


module.exports = function(app,session, passport) {


  require('dotenv').config();
  const { Client } = require('@microsoft/microsoft-graph-client');
  const { ConfidentialClientApplication } = require('@azure/msal-node');
  
  async function getAuthenticatedClient() {
      const msalConfig = {
          auth: {
              clientId: app.config.authentication.azureAd.clientId,
              authority: `https://login.microsoftonline.com/${app.config.authentication.azureAd.tenantId}`,
              clientSecret: app.config.authentication.azureAd.clientSecret,
          }
      };
  
      const cca = new ConfidentialClientApplication(msalConfig);
      const authResponse = await cca.acquireTokenByClientCredential({
          scopes: ["https://graph.microsoft.com/.default"],
      });
  
      if (!authResponse) {
          throw new Error('Authentication failed.');
      }
  
      const client = Client.init({
          authProvider: (done) => {
              done(null, authResponse.accessToken);
          }
      });
  
      return client;
  }
  
  async function sendMail() {
      const client = await getAuthenticatedClient();
  
      const mail = {
          message: {
              subject: "Hello from Microsoft Graph API",
              body: {
                  contentType: "Text",
                  content: "Hello, world!"
              },
              toRecipients: [
                  {
                      emailAddress: {
                          address: "massimiliano.speranza@mediasoft-sa.ch"
                      }
                  }
              ],
          },
          saveToSentItems: "true"
      };
  
      try {
          await client.api('/users/massimiliano.speranza@mediasoft-sa.ch/sendMail')
              .post({ message: mail.message, saveToSentItems: mail.saveToSentItems });
          console.log("Mail sent.");
      } catch (error) {
          console.error(error);
      }
  }
  
  sendMail();
  

};
