/**
 * CarrierController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



module.exports = {
    createCarrier: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        } 

        try {
            const order = {
                code: req.body.code.trim(),
                name: req.body.name.trim(),
                driverNumber: req.body.driverNumber.trim(),
                userId: req.body.userId.trim(),
                createdBy: req.body.createdBy ? req.body.updatedBy : null,
                updatedBy: req.body.createdBy ? req.body.updatedBy : null,
            }
    
            if (!order.code) {
                return res.json({
                    success: false,
                    message: 'code is not defined. Please check out again.' 
                });
            }
    
            if (!order.name) {
                return res.json({
                    success: false,
                    message: 'name is not defined. Please check out again.' 
                });
            }
    
            if (!order.driverNumber) {
                return res.json({
                    success: false,
                    message: 'driverNumber is not defined. Please check out again.' 
                });
            }
    
            if (!order.userId) {
                return res.json({
                    success: false,
                    message: 'userId is not defined. Please check out again.' 
                });
            }

            if (order.createdBy) {
                const checkUserCreate = await User.findOne({
                    _id: order.createdBy
                });
        
                if (!checkUserCreate) {
                    return res.json({
                        success: false,
                        message: 'User Create không tồn tại.'
                    });
                }
            }
    
            const checkUser = await User.findOne({
                _id: order.userId,
                userRole: 'Deliver'
            });
    
            if (!checkUser) {
                return res.json({
                    success: false,
                    message: 'Tài xế không tồn tại.'
                });
            }
    
    
            const checkCarrier = await Carrier.findOne({
                code: order.code,
                isDeleted: false
            });
    
            if (checkCarrier) {
                return res.json({
                    success: false,
                    message: 'Mã tài xế đã tồn tại.'
                });
            }

            const checkUserId = await Carrier.findOne({
                userId: order.userId,
                isDeleted: false
            });
    
            if (checkUserId) {
                return res.json({
                    success: false,
                    message: 'UserId đã tồn tại.'
                });
            }
    
            const newCarrier = await Carrier.create(order).fetch();
    
            if (!newCarrier || newCarrier == '' || newCarrier == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Tạo tài xế không thành công.'
                });
            } else {
                return res.json({
                    success: true,
                    Carrier: newCarrier,
                })
            }

        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    },

    getCarrierByCode: async function(req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }    
    
        try {
            const carrierCode = req.body.carrierCode.trim();
    
            if (!carrierCode) {
                return res.json({
                    success: false,
                    message: 'carrierCode is not defined. Please check out again.' 
                });
            }
    
            const checkCarrier = await Carrier.findOne({
                code: carrierCode,
                isDeleted: false
            });
    
            if (!checkCarrier || checkCarrier == '' || checkCarrier == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Không tìm thấy tài xế.'
                });
            } else {
                return res.json({
                    success: true,
                    Carrier: checkCarrier
                })
            }
        
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    
    },

    getAllCarrier: async function(req, res) {
        try {
            const checkCarrier = await Carrier.find({
                isDeleted: false
            });
    
            if (!checkCarrier || checkCarrier == '' || checkCarrier == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Không tìm thấy tài xế.'
                });
            } else {
                return res.json({
                    success: true,
                    Carrier: checkCarrier
                })
            }
        
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    
    },

    updateCarrier: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }
    
        try {
            const update = {
                carrierId: req.body.carrierId.trim(),
                name: req.body.name,
                driverNumber: req.body.driverNumber,
                updatedBy: req.body.updatedBy ? req.body.updatedBy : null
            }
    
            if (!update.carrierId) {
                return res.json({
                    success: false,
                    message: 'carrierId is not defined. Please check out again.' 
                });
            }

            if (update.updatedBy) {
                const checkUserUpdate = await User.findOne({
                    _id: update.updatedBy
                });
        
                if (!checkUserUpdate) {
                    return res.json({
                        success: false,
                        message: 'User Update không tồn tại.'
                    });
                }
            }
    
            const checkCarrier = await Carrier.findOne({
                _id: update.carrierId,
                isDeleted: false
            });
    
            if (!checkCarrier) {
                return res.json({
                    success: false,
                    message: 'Tài xế không tồn tại.'
                });
            }

    
            const updateCarrier = await Carrier.updateOne({
                _id: update.carrierId
            })
            .set({
                name: update.name,
                driverNumber: update.driverNumber,
                updatedBy: update.updatedBy
            });
    
            if (!updateCarrier || updateCarrier == '' || updateCarrier == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Không thể cập nhật thông tin tài xế.'
                });
            } else {
                return res.json({
                    success: true,
                    Carrier: updateCarrier
                })
            }
    
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    },


     // Hủy đơn
    cancelCarrier: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        } 
        
        try {
            const carrierId = req.body.carrierId.trim();
            const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;
            if (!carrierId) {
                return res.json({
                    success: false,
                    message: 'carrierId is not defined. Please check out again.' 
                });
            }

            if (deletedBy) {
                const checkUserDelete = await User.findOne({
                    _id: deletedBy
                });
        
                if (!checkUserDelete) {
                    return res.json({
                        success: false,
                        message: 'User Delete không tồn tại.'
                    });
                }
            }
    
            const checkCarrier = await Carrier.findOne({
                _id: carrierId,
                isDeleted: false
            });
    
            if (!checkCarrier) {
                return res.json({
                    success: false,
                    message: 'Tài xế không tồn tại.'
                });
            }

    
            const cancelCarrier = await Carrier.updateOne({
                _id: carrierId,
                isDeleted: false
            })
            .set({
                isDeleted: true,
                deletedBy: deletedBy,
                deletedAt: Date.now()
            });
    
            if (!cancelCarrier || cancelCarrier == '' || cancelCarrier == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Hủy tài xế không thành công.'
                });
            } else {
                return res.json({
                    success: true,
                    message: 'Tài xế đã được hủy thành công'
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

