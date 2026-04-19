const fs = require('fs');
const { Op } = require('sequelize');
const { Contact } = require('../models/contact.model');
const { contactSchema } = require('../validators/contact.validator');
const { ApiError } = require('../utils/api-error');
const { parseWorkbook } = require('../utils/excel.utils');
const { normalizeContactInput, validateContactRow } = require('../utils/contact-validation');

const LOCK_TIMEOUT_MINUTES = Number(process.env.LOCK_TIMEOUT_MINUTES || 10);

async function getContacts({ page = 1, limit = 10, search = '', sortBy = 'updatedAt', sortOrder = 'DESC', filter = '' }) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const sortableColumns = new Set(['name', 'email', 'phone', 'company', 'createdAt', 'updatedAt']);
  const safeSortBy = sortableColumns.has(sortBy) ? sortBy : 'updatedAt';
  const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (filter) {
    where.company = { [Op.like]: `%${filter}%` };
  }

  const { rows, count } = await Contact.findAndCountAll({
    where,
    offset: (safePage - 1) * safeLimit,
    limit: safeLimit,
    order: [[safeSortBy, safeSortOrder]],
  });

  return {
    data: rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: count,
      totalPages: Math.ceil(count / safeLimit),
    },
  };
}

async function getContactById(id) {
  const contact = await Contact.findByPk(id);
  if (!contact) {
    throw new ApiError(404, 'Contact not found.');
  }

  if (contact.isLocked && contact.lockExpiresAt && new Date(contact.lockExpiresAt) <= new Date()) {
    await contact.update({ isLocked: false, lockedBy: null, lockExpiresAt: null });
  }

  return contact;
}

async function createContact(payload) {
  const value = await contactSchema.validateAsync(payload, { abortEarly: false });
  return Contact.create(normalizeContactInput(value));
}

async function updateContact(id, payload, editorId) {
  const contact = await getContactById(id);
  if (contact.isLocked && contact.lockedBy && contact.lockedBy !== editorId && new Date(contact.lockExpiresAt) > new Date()) {
    throw new ApiError(423, `Contact is locked by ${contact.lockedBy}.`);
  }

  const value = await contactSchema.validateAsync(payload, { abortEarly: false });
  await contact.update(normalizeContactInput(value));
  return contact;
}

async function deleteContact(id) {
  const contact = await getContactById(id);
  await contact.destroy();
}

async function batchDelete(ids = []) {
  const deleted = await Contact.destroy({
    where: { id: { [Op.in]: ids } },
  });
  return { deleted };
}

async function lockContact(id, editorId) {
  const contact = await getContactById(id);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TIMEOUT_MINUTES * 60 * 1000);

  if (contact.isLocked && contact.lockedBy !== editorId && contact.lockExpiresAt && new Date(contact.lockExpiresAt) > now) {
    throw new ApiError(423, `Contact is already being edited by ${contact.lockedBy}.`);
  }

  await contact.update({
    isLocked: true,
    lockedBy: editorId,
    lockExpiresAt: expiresAt,
  });

  return contact;
}

async function unlockContact(id, editorId) {
  const contact = await getContactById(id);
  if (contact.lockedBy && contact.lockedBy !== editorId) {
    throw new ApiError(403, 'Only the editor holding the lock can release it.');
  }

  await contact.update({
    isLocked: false,
    lockedBy: null,
    lockExpiresAt: null,
  });
}

async function uploadContacts(filePath) {
  try {
    const rows = parseWorkbook(filePath);
    const invalidRows = [];
    const validRows = [];
    const seenEmails = new Set();
    const seenPhones = new Set();

    const existingContacts = await Contact.findAll({
      attributes: ['email', 'phone'],
    });

    existingContacts.forEach((contact) => {
      seenEmails.add(String(contact.email).toLowerCase());
      seenPhones.add(String(contact.phone));
    });

    rows.forEach((row, index) => {
      const mappedRow = {
        name: row.Name || row.name || '',
        email: row.Email || row.email || '',
        phone: row.Phone || row.phone || '',
        company: row.Company || row.company || '',
        address: row.Address || row.address || '',
        notes: row.Notes || row.notes || '',
      };

      const { contact, errors } = validateContactRow(mappedRow);

      if (seenEmails.has(contact.email)) {
        errors.push('Email already exists.');
      }
      if (seenPhones.has(contact.phone)) {
        errors.push('Phone already exists.');
      }

      if (errors.length) {
        invalidRows.push({
          rowNumber: index + 2,
          ...mappedRow,
          errors,
        });
        return;
      }

      seenEmails.add(contact.email);
      seenPhones.add(contact.phone);
      validRows.push(contact);
    });

    if (validRows.length) {
      await Contact.bulkCreate(validRows);
    }

    return {
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      validData: validRows,
      invalidRows,
    };
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

async function exportContacts(ids = []) {
  const where = ids.length ? { id: { [Op.in]: ids } } : {};
  return Contact.findAll({
    where,
    order: [['name', 'ASC']],
  });
}

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  batchDelete,
  lockContact,
  unlockContact,
  uploadContacts,
  exportContacts,
};
