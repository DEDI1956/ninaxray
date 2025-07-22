const axios = require('axios');

const setWebhook = async (botToken, webhookUrl) => {
  const response = await axios.get(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`);
  return response.data;
};

module.exports = {
  setWebhook,
};
