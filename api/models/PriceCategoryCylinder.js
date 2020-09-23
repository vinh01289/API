/**
 * PriceCategoryCylinder.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    regionId: {
      model: 'region'
    },

    categorycylinderId: {
      model: 'categorycylinder'
    },

    price: {
      type: 'number',
      required: true,
    },

    code: {
      type: 'string',
      required: true,
    },

    regionName: {
      type: 'string',
      required: true,
    },

    dateApply: {
      type: 'string',
      columnType: 'datetime',
      required: true,
    },

    isLastest: {
      type: 'boolean',
      defaultsTo: true
    },

  },

};

