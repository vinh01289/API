/**
 * OrderGas.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    orderCode: {
      type: 'string',
      unique: true
    },

    customerId: {
      model: 'customer'
    },

    deliveryDate: {
      type: 'string',
      columnType: 'datetime',
    },

    note: {
      type: 'string'
    },

    total: {
      type: 'number'
    },

    status: {
      type: 'string'
    },
    

  },

};

