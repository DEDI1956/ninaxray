const axios = require('axios');

const api = (apiToken) => axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  },
});

const verifyCredentials = async (apiToken, accountId, zoneId) => {
  try {
    const response = await api(apiToken).get(`/zones/${zoneId}`);
    if (response.data.result.account.id !== accountId) {
      throw new Error('Account ID tidak valid untuk Zone ID yang diberikan.');
    }
    return true;
  } catch (error) {
    if (error.response) {
      throw new Error(`Error dari Cloudflare: ${error.response.status} ${error.response.statusText}`);
    }
    throw error;
  }
};

const listDnsRecords = async (apiToken, zoneId, type) => {
  const response = await api(apiToken).get(`/zones/${zoneId}/dns_records`, { params: { type } });
  return response.data.result;
};

const addDnsRecord = async (apiToken, zoneId, type, name, content) => {
  const response = await api(apiToken).post(`/zones/${zoneId}/dns_records`, {
    type,
    name,
    content,
    ttl: 1, // Automatic
    proxied: false,
  });
  return response.data.result;
};

const deleteDnsRecord = async (apiToken, zoneId, recordId) => {
  const response = await api(apiToken).delete(`/zones/${zoneId}/dns_records/${recordId}`);
  return response.data.result;
};

const listWorkers = async (apiToken, accountId) => {
  const response = await api(apiToken).get(`/accounts/${accountId}/workers/scripts`);
  return response.data.result;
};

const deployWorker = async (apiToken, accountId, workerName, script) => {
  const response = await api(apiToken).put(`/accounts/${accountId}/workers/scripts/${workerName}`, script, {
    headers: { 'Content-Type': 'application/javascript' },
  });
  return response.data.result;
};

const deleteWorker = async (apiToken, accountId, workerName) => {
    const response = await api(apiToken).delete(`/accounts/${accountId}/workers/scripts/${workerName}`);
    return response.data.result;
};

module.exports = {
  verifyCredentials,
  listDnsRecords,
  addDnsRecord,
  deleteDnsRecord,
  listWorkers,
  deployWorker,
  deleteWorker,
};
