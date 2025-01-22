const hubspot = require('@hubspot/api-client');

// Function to validate access token
async function validateToken(client) {
  try {
    // Make a simple API call to test the token
    await client.oauth.accessTokensApi.get();
    return true;
  } catch (error) {
    return false;
  }
}

async function updateCustomAction({ accessToken, definitionId, appId, updates }) {
  const hubspotClient = new hubspot.Client({ accessToken });

  try {
    // First validate the token
    const isValidToken = await validateToken(hubspotClient);
    if (!isValidToken) {
      throw new Error('Invalid or expired access token');
    }

    // Proceed with the update
    const response = await hubspotClient.automation.actions.definitionsApi.update(
      definitionId,
      appId,
      updates
    );

    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed: Please check your access token or refresh it if expired');
    }
    throw error;
  }
}

// Usage example
(async () => {
  try {
    const result = await updateCustomAction({
      accessToken: 'CIbJkr3IMhIHMAEAQAAAARi9xqsXIMWQlyQoj9KyAzIULZUY5YlqgYAGJ87CAkDZilThiiY6aQAECMEAAAAAAAAAAAAAAAAAgAAAAAAAAAAAACAcAAAAAOABAAAAAAAAAAAAAAAQCgAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEIUf0YOgZYlLzVcmKysDQAJ9ZP0UEJKA25hMVIAWgBgAA',
      definitionId: '187733514',
      appId: '7121167',
      updates: {
        name: 'Updated Action Name',
        category: 'Updated Category',
        inputFields: [
          {
            name: 'example_field',
            label: 'Updated Example Field',
            type: 'STRING',
          },
        ],
      }
    });

    console.log('Custom Action Updated Successfully:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Response:', JSON.stringify(error.response, null, 2));
    }
  }
})();