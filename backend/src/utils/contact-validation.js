const { EMAIL_REGEX, PHONE_REGEX } = require('../constants/contact.constants');

function normalizeContactInput(payload = {}) {
  return {
    name: String(payload.name || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    phone: String(payload.phone || '').trim(),
    company: String(payload.company || '').trim(),
    address: String(payload.address || '').trim(),
    notes: String(payload.notes || '').trim(),
  };
}

function validateContactRow(payload) {
  const contact = normalizeContactInput(payload);
  const errors = [];

  if (!contact.name) errors.push('Name is required.');
  if (!contact.email) errors.push('Email is required.');
  if (!contact.phone) errors.push('Phone is required.');
  if (contact.email && !EMAIL_REGEX.test(contact.email)) errors.push('Invalid email format.');
  if (contact.phone && !PHONE_REGEX.test(contact.phone)) errors.push('Invalid phone format.');

  return { contact, errors };
}

module.exports = { normalizeContactInput, validateContactRow };
