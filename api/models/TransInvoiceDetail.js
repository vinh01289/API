/**
 * TransInvoiceDetail.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    lat: {
      type: 'number'
    },

    long: {
      type: 'number'
    },

    status: {
      type: 'number',
      isIn: [ 1, 2, 3],
      defaultsTo: 1
    },

    note: {
      type: 'string'
    },

    transInvoiceId: {
      model: 'transinvoice'
    },

    orderGasId: {
      model: 'ordergas'
    },

    // ---
    isDeleted: {
      type: 'boolean',
      defaultsTo: false,
    },

    createdBy: {
      model: 'user',
    },

    updatedBy: {
      model: 'user',
    },

    deletedBy: {
      model: 'user',
    },

    createdAt: {
      type: 'string',
      columnType: 'datetime',
      autoCreatedAt: true,
    },

    updatedAt: {
      type: 'string',
      columnType: 'datetime',
    },

    deletedAt: {
      type: 'string',
      columnType: 'datetime',
    },


  },

};

