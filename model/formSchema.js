const formElementSchema = {
  type: 'object',
  required: ['tag'],
  properties: {
    tag: { type: 'string', minLength: 1 },
    attributes: {
      type: 'object',
      propertyNames: { type: 'string', minLength: 1 },
      additionalProperties: {
        type: ['string', 'number', 'boolean', 'null'],
      },
    },
    textContent: { type: 'string' },
    data: {
      type: ['object', 'array', 'string', 'number', 'boolean', 'null'],
    },
    children: {
      type: 'array',
      items: 'formDataSchema',
    },
  },
  additionalProperties: true,
};

const formDataSchema = {
  anyOf: [
    formElementSchema,
    {
      type: 'array',
      items: {
        anyOf: [formElementSchema, { type: 'string' }, { type: 'number' }, { type: 'boolean' }, { type: 'null' }],
      },
    },
    { type: 'string' },
    { type: 'number' },
    { type: 'boolean' },
    { type: 'null' },
  ],
};

const formMetadataSchema = {
  type: 'object',
  required: ['objectId', 'objectName', 'objectSlug'],
  properties: {
    objectId: { type: 'string', minLength: 1 },
    objectName: { type: 'string', minLength: 1 },
    objectSlug: { type: 'string', minLength: 1 },
    userCreated: { type: 'string', minLength: 1 },
    userModified: { type: 'string', minLength: 1 },
    creationDate: { type: 'string' },
    modificationDate: { type: 'string' },
  },
  additionalProperties: true,
};

const formPayloadSchema = {
  allOf: [formMetadataSchema, { type: 'object', required: ['formData'], properties: { formData: formDataSchema } }],
};

function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === null
  );
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function validateMetadata(data, path, errors) {
  if (!isPlainObject(data)) {
    errors.push({ path, message: 'metadata must be an object' });
    return;
  }

  for (const field of formMetadataSchema.required) {
    if (data[field] === undefined) {
      errors.push({ path: `${path}${path ? '.' : ''}${field}`, message: 'is required' });
    }
  }

  const stringFields = ['objectId', 'objectName', 'objectSlug', 'userCreated', 'userModified'];
  for (const field of stringFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] !== 'string' || data[field].trim() === '') {
        errors.push({ path: `${path}${path ? '.' : ''}${field}`, message: 'must be a non-empty string' });
      }
    }
  }
}

function validateAttributes(attributes, path, errors) {
  if (!isPlainObject(attributes)) {
    errors.push({ path, message: 'attributes must be an object' });
    return;
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (typeof key !== 'string' || key.trim() === '') {
      errors.push({ path: `${path}.${key}`, message: 'attribute keys must be non-empty strings' });
    }
    if (!isPrimitive(value)) {
      errors.push({ path: `${path}.${key}`, message: 'attribute values must be string, number, boolean, or null' });
    }
  }
}

function validateFormElement(element, path, errors) {
  if (!isPlainObject(element)) {
    errors.push({ path, message: 'form element must be an object' });
    return;
  }

  if (typeof element.tag !== 'string' || element.tag.trim() === '') {
    errors.push({ path: `${path}.tag`, message: 'tag is required and must be a non-empty string' });
  }

  if (element.attributes !== undefined) {
    validateAttributes(element.attributes, `${path}.attributes`, errors);
  }

  if (element.children !== undefined) {
    if (!Array.isArray(element.children)) {
      errors.push({ path: `${path}.children`, message: 'children must be an array' });
    } else {
      element.children.forEach((child, index) => {
        validateFormData(child, `${path}.children[${index}]`, errors);
      });
    }
  }
}

function validateFormData(data, path, errors) {
  if (isPrimitive(data)) {
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => validateFormData(item, `${path}[${index}]`, errors));
    return;
  }

  validateFormElement(data, path, errors);
}

function normalizeFormPayload(payload, overrides = {}) {
  const base = isPlainObject(payload) ? payload : {};
  const normalized = { ...base, ...overrides };

  if (typeof normalized.formData === 'string') {
    try {
      normalized.formData = JSON.parse(normalized.formData);
    } catch (error) {
      const parseError = new SyntaxError('Invalid JSON in formData');
      parseError.cause = error;
      throw parseError;
    }
  }

  return normalized;
}

function validateFormPayload(payload, sourcePayload = payload) {
  const errors = [];

  if (!isPlainObject(sourcePayload)) {
    errors.push({ path: '', message: 'payload must be an object' });
  }

  validateMetadata(payload, '', errors);

  if (payload.formData === undefined) {
    errors.push({ path: 'formData', message: 'formData is required' });
  } else {
    validateFormData(payload.formData, 'formData', errors);
  }

  return { valid: errors.length === 0, errors };
}

function formatValidationErrors(errors) {
  return errors.map(({ path, message }) => ({ path, message }));
}

module.exports = {
  formElementSchema,
  formDataSchema,
  formMetadataSchema,
  formPayloadSchema,
  normalizeFormPayload,
  validateFormPayload,
  formatValidationErrors,
};
