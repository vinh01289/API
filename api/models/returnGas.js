module.exports = {
    attributes: {
        idCompany: {
            model: 'manufacture'
        },
        serialCylinder: {
          type: 'string',
          //required: true
        },
        idCylinder: {
            model: 'cylinder'
        },
        dateReceived: {
            type: 'string',
            required: true
        },

        weight: {
            type: 'number',
            //required: true
        },
        createBy: {
            model: 'user'
        },
        updateBy: {
            model: 'user'
        }
    }
}