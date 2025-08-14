const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'oauth.db',
});

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Client = require('./Client')(sequelize, Sequelize.DataTypes);

User.hasMany(Client, { onDelete: 'CASCADE' });
Client.belongsTo(User);

module.exports = { sequelize, User, Client };