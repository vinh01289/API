/**
 * CustomerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  createInfo: async function (req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    } 
    
    try {
        const info = {
            name: req.body.name.trim(),
            phone: req.body.phone.trim(),
            address: req.body.address.trim(),
            lat: req.body.lat,
            long: req.body.long,
        };

        if (!info.name) {
            return res.json({
                success: false,
                message: 'name is not defined. Please check out again.'
            });
        }

        if (!info.phone) {
            return res.json({
                success: false,
                message: 'phone is not defined. Please check out again.'
            });
        }

        if (!info.address) {
            return res.json({
                success: false,
                message: 'address is not defined. Please check out again.'
            });
        }

        if (!info.lat) {
            return res.json({
                success: false,
                message: 'lat is not defined. Please check out again.'
            });
        }

        if (!info.long) {
            return res.json({
                success: false,
                message: 'long is not defined. Please check out again.'
            });
        }

        const checkExist = await Customer.findOne({
            phone: info.phone
        })

        if (checkExist) {
            return res.json({
                success: false, 
                message: 'Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.'
            });
        }

        const newInfo = await Customer.create(info).fetch();

        if (!newInfo || newInfo == '' || newInfo == null) {
            return res.json({
                success: false, 
                message: 'Lỗi...Không thể tạo thông tin khách hàng.'
            });
        } else {
            return res.json({
                success: true,
                customerInfo: newInfo
            });
        }

        
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
  },


  updateAddress: async function (req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    } 
    
    try {
        const update = {
            customerId: req.body.customerId.trim(),
            address: req.body.address.trim(),
            lat: req.body.lat,
            long: req.body.long,
        };

        if (!update.customerId) {
            return res.json({
                success: false,
                message: 'customerId is not defined. Please check out again.' 
            });
        }

        if (!update.address) {
            return res.json({
                success: false,
                message: 'address is not defined. Please check out again.' 
            });
        }

        if (!update.lat) {
            return res.json({
                success: false,
                message: 'lat is not defined. Please check out again.' 
            });
        }

        if (!update.long) {
            return res.json({
                success: false,
                message: 'long is not defined. Please check out again.' 
            });
        }

        const checkCustomer = await Customer.findOne({
            _id: update.customerId
        });

        if (!checkCustomer) {
            return res.json({
                success: false,
                message: 'Khách hàng không tồn tại.'
            });
        }

        const changeAddress = await Customer.updateOne({
            _id: update.customerId
        })
        .set({
            address: update.address,
            lat: update.lat,
            long: update.long
        });

        if (!changeAddress || changeAddress == '' || changeAddress == null) {
            return res.json({
                success: false, 
                message: 'Lỗi...Không thể thay đổi thông tin khách hàng.'
            });
        } else {
            return res.json({
                success: true,
                Customer: changeAddress
            })
        }

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
  },



  checkCustomerIsExist: async function (req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    } 
    
    try {
        const customer = {
            phone: req.body.phone.trim()
        };

        if (!customer.phone) {
            return res.json({
                success: false,
                message: 'phone is not defined. Please check out again.' 
            });
        }

        const checkIsExist = await Customer.findOne({
            phone: customer.phone
        });

        if (!checkIsExist || checkIsExist == '' || checkIsExist == null) {
            return res.json({
                success: false, 
                message: 'Số điện thoại chưa được liên kết với bất kỳ tài khoản nào.'
            });
        } else {
            return res.json({
                success: true,
                Customer: checkIsExist
            })
        }

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
  },


};

