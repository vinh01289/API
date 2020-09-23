/**
 * RentalPartners.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },

    email: {
      type: 'string'
    },

    phone: {
      type: 'string'
    },

    address: {
      type: 'string'
    },

    code: {
      type: 'string'
    },

    cylindersOfRentalPartner: {
      collection: 'cylinder',
      via: 'rentalPartner'
    }
  },

};

