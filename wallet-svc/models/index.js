const Sequelize = require("sequelize")

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "wallet.db",
  logging: false, // Disable SQL query logging
})

const User = require("./User")(sequelize, Sequelize.DataTypes)
const Wallet = require("./Wallet")(sequelize, Sequelize.DataTypes)
const Transaction = require("./Transaction")(sequelize, Sequelize.DataTypes)

// Associations
/* User.hasOne(Wallet)
Wallet.belongsTo(User)

Wallet.hasMany(Transaction, { onDelete: "CASCADE" })
Transaction.belongsTo(Wallet) */
// Associations
User.hasOne(Wallet, { foreignKey: "userId" })
Wallet.belongsTo(User, { foreignKey: "userId" })

Wallet.hasMany(Transaction, {
  foreignKey: "walletId",
  onDelete: "CASCADE",
})
Transaction.belongsTo(Wallet, { foreignKey: "walletId" })

module.exports = { sequelize, User, Wallet, Transaction }
