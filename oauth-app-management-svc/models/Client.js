module.exports = (sequelize, DataTypes) => {
  const Client = sequelize.define('Client', {
    client_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    client_secret: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    redirect_uris: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    grant_types: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response_types: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scope: {
      type: DataTypes.TEXT,
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Client;
};