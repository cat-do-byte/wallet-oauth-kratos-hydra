const axios = require('axios');
const { Client, User } = require('../models');

const HYDRA_ADMIN_URL = 'http://localhost:4445';

function parseArrayField(field) {
  return Array.isArray(field) ? field : field.split(',').map(s => s.trim());
}

function formatArrayField(field) {
  return Array.isArray(field) ? field.join(',') : field;
}

exports.createClient = async (req, res) => {
  try {
    const { client_id, client_secret, redirect_uris, grant_types, response_types, scope } = req.body;
    const userId = req.user.id;

    if (!client_id || !client_secret || !redirect_uris || !grant_types || !response_types) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hydraClient = {
      client_id,
      client_secret,
      redirect_uris: parseArrayField(redirect_uris),
      grant_types: parseArrayField(grant_types),
      response_types: parseArrayField(response_types),
      scope: scope || '',
    };

    await axios.post(`${HYDRA_ADMIN_URL}/clients`, hydraClient);

    const client = await Client.create({
      client_id,
      client_secret,
      redirect_uris: formatArrayField(redirect_uris),
      grant_types: formatArrayField(grant_types),
      response_types: formatArrayField(response_types),
      scope,
      owner: user.email,
    });

    res.status(201).json({ message: 'Client registered with Hydra', client });
  } catch (error) {
    console.error('Hydra registration failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to register client with Hydra' });
  }
};

exports.getClients = async (req, res) => {
  try {
    const userId = req.user.id;
    const clients = await Client.findAll({ where: { userId } });
    res.json({ clients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      include: { model: User, attributes: ['email'] },
    });
    res.json({ clients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};