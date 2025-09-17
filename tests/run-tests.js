const assert = require('node:assert/strict');

const {
  validateFormPayload,
  normalizeFormPayload,
} = require('../model/formSchema');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('validateFormPayload accepts a valid payload', () => {
  const payload = {
    objectId: 'form-123',
    objectName: 'Sample Form',
    objectSlug: 'sample-form',
    userCreated: 'tester',
    userModified: 'tester',
    formData: {
      tag: 'div',
      attributes: { id: 'root' },
      children: [
        {
          tag: 'span',
          attributes: { class: 'label' },
          textContent: 'Hello',
        },
      ],
    },
  };

  const normalized = normalizeFormPayload(payload);
  const { valid, errors } = validateFormPayload(normalized, payload);

  assert.equal(valid, true, `Expected payload to be valid. Errors: ${JSON.stringify(errors)}`);
});

test('validateFormPayload rejects missing metadata fields', () => {
  const payload = {
    objectName: 'Incomplete Form',
    objectSlug: 'incomplete-form',
    formData: { tag: 'div' },
  };

  const normalized = normalizeFormPayload(payload);
  const { valid, errors } = validateFormPayload(normalized, payload);

  assert.equal(valid, false, 'Expected payload to be invalid');
  assert(errors.some((error) => error.path === 'objectId'), 'Expected error for missing objectId');
});

test('validateFormPayload rejects invalid formData structure', () => {
  const payload = {
    objectId: 'form-456',
    objectName: 'Invalid Form',
    objectSlug: 'invalid-form',
    formData: {
      attributes: { id: 'missing-tag' },
    },
  };

  const normalized = normalizeFormPayload(payload);
  const { valid, errors } = validateFormPayload(normalized, payload);

  assert.equal(valid, false, 'Expected payload to be invalid');
  assert(errors.some((error) => error.path.startsWith('formData')), 'Expected error in formData tree');
});

test('validateFormPayload rejects non-object payloads', () => {
  const payload = 'not-an-object';

  const normalized = normalizeFormPayload(payload);
  const { valid, errors } = validateFormPayload(normalized, payload);

  assert.equal(valid, false, 'Expected payload to be invalid');
  assert(errors.some((error) => error.path === '' && error.message.includes('payload')), 'Expected payload type error');
});

async function run() {
  const failures = [];

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
    } catch (error) {
      failures.push({ name, error });
      console.error(`✗ ${name}`);
      console.error(error);
    }
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

run();
