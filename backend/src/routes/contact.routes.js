const { Router } = require('express');
const controller = require('../controllers/contact.controller');
const { upload } = require('../middleware/upload.middleware');

const contactRouter = Router();

contactRouter.post('/upload', upload.single('file'), controller.uploadContacts);
contactRouter.get('/export', controller.exportContacts);
contactRouter.get('/', controller.getContacts);
contactRouter.post('/', controller.createContact);
contactRouter.post('/batch-delete', controller.batchDelete);
contactRouter.get('/:id', controller.getContact);
contactRouter.put('/:id', controller.updateContact);
contactRouter.delete('/:id', controller.deleteContact);
contactRouter.post('/:id/lock', controller.lockContact);
contactRouter.post('/:id/unlock', controller.unlockContact);

module.exports = { contactRouter };
