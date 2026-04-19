const XLSX = require('xlsx');
const { asyncHandler } = require('../utils/async-handler');
const { batchDeleteSchema, lockSchema } = require('../validators/contact.validator');
const contactService = require('../services/contact.service');

const getContacts = asyncHandler(async (req, res) => {
  const result = await contactService.getContacts({
    page: Number(req.query.page || 1),
    limit: Number(req.query.limit || 10),
    search: String(req.query.search || ''),
    filter: String(req.query.filter || ''),
    sortBy: String(req.query.sortBy || 'updatedAt'),
    sortOrder: String(req.query.sortOrder || 'DESC'),
  });
  res.json(result);
});

const getContact = asyncHandler(async (req, res) => {
  const contact = await contactService.getContactById(req.params.id);
  res.json(contact);
});

const createContact = asyncHandler(async (req, res) => {
  const contact = await contactService.createContact(req.body);
  res.status(201).json(contact);
});

const updateContact = asyncHandler(async (req, res) => {
  const contact = await contactService.updateContact(req.params.id, req.body, req.header('x-editor-id'));
  res.json(contact);
});

const deleteContact = asyncHandler(async (req, res) => {
  await contactService.deleteContact(req.params.id);
  res.status(204).send();
});

const batchDelete = asyncHandler(async (req, res) => {
  const value = await batchDeleteSchema.validateAsync(req.body, { abortEarly: false });
  const result = await contactService.batchDelete(value.ids);
  res.json(result);
});

const uploadContacts = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Excel file is required.' });
    return;
  }

  const result = await contactService.uploadContacts(req.file.path);
  res.status(201).json(result);
});

const exportContacts = asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || '')
    .split(',')
    .filter(Boolean)
    .map((id) => Number(id));
  const contacts = await contactService.exportContacts(ids);
  const worksheet = XLSX.utils.json_to_sheet(
    contacts.map((contact) => ({
      Name: contact.name,
      Email: contact.email,
      Phone: contact.phone,
      Company: contact.company,
      Address: contact.address,
      Notes: contact.notes,
      CreatedAt: contact.createdAt,
      UpdatedAt: contact.updatedAt,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=contacts.xlsx');
  res.send(buffer);
});

const lockContact = asyncHandler(async (req, res) => {
  const value = await lockSchema.validateAsync(req.body);
  const contact = await contactService.lockContact(req.params.id, value.editorId);
  res.json(contact);
});

const unlockContact = asyncHandler(async (req, res) => {
  const value = await lockSchema.validateAsync(req.body);
  await contactService.unlockContact(req.params.id, value.editorId);
  res.status(204).send();
});

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  batchDelete,
  uploadContacts,
  exportContacts,
  lockContact,
  unlockContact,
};
