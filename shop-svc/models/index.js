// models/index.js
const Sequelize = require("sequelize")

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "shop.db",
  logging: false,
})

const User = require("./User")(sequelize, Sequelize.DataTypes)
const Order = require("./Order")(sequelize, Sequelize.DataTypes)

User.hasMany(Order, { foreignKey: "userId" })
Order.belongsTo(User, { foreignKey: "userId" })

module.exports = { sequelize, User, Order }
