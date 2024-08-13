/**
 * Validates a given location object by checking if all required fields are present and not empty.
 *
 * @param {Object} location - The location object to be validated.
 * @return {Boolean} True if the location is valid, false otherwise.
 */
import mongoose from 'mongoose';

function validateLocation(location) {
  const requiredFields = ['address', 'city', 'state'];
  return requiredFields.every((field) => location[field] && location[field].trim() !== '');
}

function validateId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export { validateLocation, validateId };
