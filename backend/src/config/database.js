const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'contact_book',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: false,
    },
  },
);

async function connectDb() {
  await sequelize.authenticate();
  const { Contact } = require('../models/contact.model');
  await Contact.sync();
}

module.exports = { sequelize, connectDb };
