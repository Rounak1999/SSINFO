const Joi = require('joi');
const { EMAIL_REGEX, PHONE_REGEX } = require('../constants/contact.constants');

const contactSchema = Joi.object({
  name: Joi.string().trim().max(120).required(),
  email: Joi.string().trim().lowercase().pattern(EMAIL_REGEX).required(),
  phone: Joi.string().trim().pattern(PHONE_REGEX).required(),
  company: Joi.string().allow('').max(120),
  address: Joi.string().allow('').max(255),
  notes: Joi.string().allow('').max(2000),
});

const batchDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
});

const lockSchema = Joi.object({
  editorId: Joi.string().trim().min(3).max(120).required(),
});

module.exports = { contactSchema, batchDeleteSchema, lockSchema };
