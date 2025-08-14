module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define("Transaction", {
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("deposit", "withdrawal", "transfer", "received"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    /*     walletId: {
      // ← Must be defined here
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    }, */
  })

  return Transaction
}
