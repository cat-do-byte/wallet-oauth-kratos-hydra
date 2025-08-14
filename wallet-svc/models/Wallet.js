module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define("Wallet", {
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
    },
    /* userId: {
      // ← Must be defined here
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    }, */
  })

  return Wallet
}
