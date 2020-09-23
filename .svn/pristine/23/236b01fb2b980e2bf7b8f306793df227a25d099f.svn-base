/**
 * TransInvoiceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



module.exports = {
    createTransInvoice: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        } 

        try {
            const order = {
                code: req.body.TransInvoice.code.trim(),
                status: 1,
                deliveryDate: req.body.TransInvoice.deliveryDate.trim(),
                carrierId: req.body.TransInvoice.carrierId.trim(),
                userId: req.body.TransInvoice.userId.trim(),
                createdBy: req.body.TransInvoice.createdBy ? req.body.TransInvoice.updatedBy : null,
                updatedBy: req.body.TransInvoice.createdBy ? req.body.TransInvoice.updatedBy : null,
            }

            const transInvoiceDetail = await Promise.all(req.body.TransInvoiceDetail.map(async element =>{
                return {
                    orderGasId: element.orderGasId,
                    lat: element.lat,
                    long: element.long,
                    note: element.note,
                    createdBy: element.createdBy
                };
            }))
    
            if (!order.code) {
                return res.json({
                    success: false,
                    message: 'code is not defined. Please check out again.' 
                });
            }
    
            if (!order.status) {
                return res.json({
                    success: false,
                    message: 'status is not defined. Please check out again.' 
                });
            }
    
            if (!order.deliveryDate) {
                return res.json({
                    success: false,
                    message: 'deliveryDate is not defined. Please check out again.' 
                });
            }
    
            if (!order.userId) {
                return res.json({
                    success: false,
                    message: 'userId is not defined. Please check out again.' 
                });
            }

            if (!order.carrierId) {
                return res.json({
                    success: false,
                    message: 'carrierId is not defined. Please check out again.' 
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
            });
    
            if (!checkUser) {
                return res.json({
                    success: false,
                    message: 'Không tìm thấy id cửa hàng giao gas.'
                });
            }
    
    
            const checkCarrier = await Carrier.findOne({
                _id: order.carrierId,
                isDeleted: false
            });
    
            if (!checkCarrier) {
                return res.json({
                    success: false,
                    message: 'Người vận chuyển không tồn tại.'
                });
            }

            const checkCode = await Carrier.findOne({
                code: order.code,
                isDeleted: false
            });
    
            if (checkCode) {
                return res.json({
                    success: false,
                    message: 'Code đã tồn tại.'
                });
            }

            for (let i = 0; i < transInvoiceDetail.length; i++ ) {
                for (let j = i + 1; j < transInvoiceDetail.length; j++) {
                    if (transInvoiceDetail[i].orderGasId === transInvoiceDetail[j].orderGasId) {
                        return res.json({
                            success: false,
                            message: 'Danh sách mã đơn hàng truyền lên bị trùng.'
                        });
                    }
                }
    
                const checkOrder = await OrderGas.findOne({
                    _id: transInvoiceDetail[i].orderGasId
                });
        
                if (!checkOrder) {
                    return res.json({
                        success: false,
                        message: 'Đơn hàng không tồn tại.'
                    });
                }
    
    
                if (transInvoiceDetail[i].createdBy) {
                    const checkUserCreate = await User.findOne({
                        _id: transInvoiceDetail[i].createdBy
                    });
            
                    if (!checkUserCreate) {
                        return res.json({
                            success: false,
                            message: 'User Create không tồn tại.'
                        });
                    }
                }
            }
    
            const newTransInvoice = await TransInvoice.create(order).fetch();
    
            if (!newTransInvoice || newTransInvoice == '' || newTransInvoice == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Tạo đơn vận chuyển không thành công.'
                });
            } else {
                for (let i = 0; i < transInvoiceDetail.length; i++) {
                    
                    await TransInvoiceDetail.create({
                        transInvoiceId: newTransInvoice.id,
                        orderGasId: transInvoiceDetail[i].orderGasId,
                        status: 1,
                        lat: transInvoiceDetail[i].lat,
                        long: transInvoiceDetail[i].long,
                        note: transInvoiceDetail[i].long,
                        createdBy: transInvoiceDetail[i].createdBy,
                    }).fetch();
                }
    
                const listDetail = await TransInvoiceDetail.find({
                    transInvoiceId: newTransInvoice.id,
                    isDeleted: false
                })
                
                return res.json({
                    success: true,
                    TransInvoice: newTransInvoice,
                    TransInvoiceDetail: listDetail,
                })
            }

        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    },

    getTransInvoiceById: async function(req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }    
    
        try {
            const transInvoiceId = req.body.transInvoiceId.trim();
    
            if (!transInvoiceId) {
                return res.json({
                    success: false,
                    message: 'transInvoiceId is not defined. Please check out again.' 
                });
            }
    
            const checkTransInvoice = await TransInvoice.findOne({
                _id: transInvoiceId,
                isDeleted: false
            });
    
            if (!checkTransInvoice || checkTransInvoice == '' || checkTransInvoice == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Không tìm thấy TransInvoice.'
                });
            } else {
                return res.json({
                    success: true,
                    TransInvoice: checkTransInvoice
                })
            }
        
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    
    },

    getAllTransInvoice: async function(req, res) {
        try {
            const checkTransInvoice = await TransInvoice.find({
                isDeleted: false
            });
    
            if (!checkTransInvoice || checkTransInvoice == '' || checkTransInvoice == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Không tìm thấy TransInvoice.'
                });
            } else {
                return res.json({
                    success: true,
                    TransInvoices: checkTransInvoice
                })
            }
        
        } catch (error) {
            return res.json({
                success: false,
                message: error.message
            })
        }
    
    },

    updateTransInvoice: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        }
    
        try {
            const update = {
                transInvoiceId: req.body.transInvoiceId.trim(),
                status: req.body.status,
                deliveryDate: req.body.deliveryDate,
                carrierId: req.body.carrierId,
                userId: req.body.userId,
                updatedBy: req.body.updatedBy ? req.body.updatedBy : null
            }
    
            if (update.carrierId) {
                const checkCarrier = await Carrier.findOne({
                    _id: update.carrierId,
                    isDeleted: false
                });
        
                if (!checkCarrier) {
                    return res.json({
                        success: false,
                        message: 'Người vận chuyển không tồn tại.'
                    });
                }
            }

            if (update.userId) {
                const checkUser = await User.findOne({
                    _id: update.userId,
                });
        
                if (!checkUser) {
                    return res.json({
                        success: false,
                        message: 'Không tìm thấy id cửa hàng giao gas.'
                    });
                }
            }

            if (!update.status) {
                return res.json({
                    success: false,
                    message: 'status is not defined. Please check out again.' 
                });
            }
    
            if (!update.deliveryDate) {
                return res.json({
                    success: false,
                    message: 'deliveryDate is not defined. Please check out again.' 
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
    
    
            const updateTransInvoice = await TransInvoice.updateOne({
                _id: update.transInvoiceId,
            })
            .set({
                status: update.status,
                deliveryDate: update.deliveryDate,
                carrierId: update.carrierId,
                userId: update.userId,
                updatedBy: update.updatedBy
            });
    
            if (!updateTransInvoice || updateTransInvoice == '' || updateTransInvoice == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Không thể cập nhật thông tin TransInvoice.'
                });
            } else {
                return res.json({
                    success: true,
                    TransInvoice: updateTransInvoice
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
    cancelTransInvoice: async function (req, res) {
        if (!req.body) {
            return res.badRequest(Utils.jsonErr('Empty body'));
        } 
        
        try {
            const transInvoiceId = req.body.transInvoiceId.trim();
            const deletedBy = req.body.deletedBy ? req.body.deletedBy : null;
            if (!transInvoiceId) {
                return res.json({
                    success: false,
                    message: 'transInvoiceId is not defined. Please check out again.' 
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
    
            const checkTransInvoice = await TransInvoice.findOne({
                _id: transInvoiceId,
                isDeleted: false
            });
    
            if (!checkTransInvoice) {
                return res.json({
                    success: false,
                    message: 'TransInvoice không tồn tại.'
                });
            }

    
            const cancelTransInvoice = await TransInvoice.updateOne({
                _id: transInvoiceId,
                isDeleted: false
            })
            .set({
                isDeleted: true,
                deletedBy: deletedBy,
                deletedAt: Date.now()
            });
    
            if (!cancelTransInvoice || cancelTransInvoice == '' || cancelTransInvoice == null) {
                return res.json({
                    success: false, 
                    message: 'Lỗi...Hủy TransInvoice không thành công.'
                });
            } else {
                return res.json({
                    success: true,
                    message: 'TransInvoice đã được hủy thành công'
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

