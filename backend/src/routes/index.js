const { Router } = require('express');
const { contactRouter } = require('./contact.routes');

const apiRouter = Router();

apiRouter.use('/contacts', contactRouter);

module.exports = { apiRouter };
