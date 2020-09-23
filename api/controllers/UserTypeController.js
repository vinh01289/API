/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


module.exports = {
    createUserType: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }

        try {
            const userType = {
                name: req.body.name,
                orderNo: req.body.orderNo,
                note: req.body.note,
                objectId: req.body.objectId
            };

            const createUserType = await UserType.create(userType).fetch();

            return res.json({
                success: true,
                UserType: createUserType
            });
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            });
        }
    },

    getAllUserType: async function (req, res) {
        try {
            const userType = await UserType.find()
            return res.json({ userType });
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    },

    addUserType: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }

        try {
            const userType = {
                name: req.body.name,
                orderNo: req.body.orderNo,
                note: req.body.note,
                objectId: req.body.objectId
            };

            const addUserType = await UserType.create(userType).fetch();

            return res.json({
                success: true,
                UserType: addUserType
            });
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            });
        }
    },


    updateUserType: async function (req, res) {
        var { idUserType, name, orderNo, note, objectId } = req.body;

        var data = await UserType.findOne({ _id: idUserType });

        if (data == undefined || data == "" || data == null) {
            return res.json({ error: true, message: 'loi !' });
        }

        if (!name) {
            name = data.name;
        }
        if (!orderNo) {
            orderNo = data.orderNo;
        }
        if (!note) {
            note = data.note;
        }
        if (!objectId) {
            objectId = data.objectId;
        }

        console.log(data);
        let a = await UserType.updateOne({ id: data.id }).set({
            //isDeleted: true,
            name: name,
            orderNo: orderNo,
            note: note,
            objectId: objectId
        });

        if (a) {
            return res.json({ error: false, data: a });
        }
        else {
            return res.json({ error: true, message: 'loi updata !' });
        }
    },

    // deleteUserType: async function (req, res) {

    //     var { idUserType, name, orderNo, note, objectId } = req.body;

    //     var data = await UserType.findOne({ _id: idUserType });

    //     if (data == undefined || data == "" || data == null) {
    //         return res.json({ error: true, message: 'loi !' });
    //     }

    //     if (!name) {
    //         name = data.name;
    //     }
    //     if (!orderNo) {
    //         orderNo = data.orderNo;
    //     }
    //     if (!note) {
    //         note = data.note;
    //     }
    //     if (!objectId) {
    //         objectId = data.objectId;
    //     }

    //     console.log(data);
    //     let a = await UserType.updateOne({ id: data.id }).set({
    //         name: name,
    //         orderNo: orderNo,
    //         note: note,
    //         objectId: objectId
    //     });
    //     isDeleted: false;

    //     if (a) {
    //         return res.json({ error: false, data: a });
    //     }
    //     else {
    //         return res.json({ error: true, message: 'loi updata !' });
    //     }
    // }
};