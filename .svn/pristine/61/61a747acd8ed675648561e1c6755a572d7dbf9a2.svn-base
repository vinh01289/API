/**
 * OrderGasController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  createOrder: async function (req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    }    

    try {
        const order = {
            orderCode: req.body.OrderGas.orderCode,
            customerId: req.body.OrderGas.customerId,
            deliveryDate: req.body.OrderGas.deliveryDate,
            note: req.body.OrderGas.note,
            total: req.body.OrderGas.total,
            status: 'INIT'
        }

        const product = await Promise.all(req.body.OrderGasDetail.map(async element =>{
            return {
                cylinder: element.cylinder,
                quantity: element.quantity,
                price: element.price
            };
        }))

        if (!order.orderCode) {
            return res.json({
                success: false,
                message: 'orderCode is not defined. Please check out again.' 
            });
        }

        if (!order.customerId) {
            return res.json({
                success: false,
                message: 'customerId is not defined. Please check out again.' 
            });
        }

        if (!order.deliveryDate) {
            return res.json({
                success: false,
                message: 'deliveryDate is not defined. Please check out again.' 
            });
        }

        if (!order.total || order.total === 0) {
            return res.json({
                success: false,
                message: 'total is not defined. Please check out again.' 
            });
        }

        const checkCustomer = await Customer.findOne({
            _id: order.customerId
        });

        if (!checkCustomer) {
            return res.json({
                success: false,
                message: 'Khách hàng không tồn tại.'
            });
        }

        for (let i = 0; i < product.length; i++ ) {
            const checkCylinder = await Cylinder.findOne({
                _id: product[i].cylinder
            });
    
            if (!checkCylinder) {
                return res.json({
                    success: false,
                    message: 'Sản phẩm không tồn tại.'
                });
            }

            if (!product[i].quantity || product[i].quantity === 0) {
                return res.json({
                    success: false,
                    message: 'quantity is not defined. Please check out again.' 
                });
            }

            if (!product[i].price || product[i].price === 0) {
                return res.json({
                    success: false,
                    message: 'price is not defined. Please check out again.' 
                });
            }
        }
       

        const checkOrder = await OrderGas.findOne({
            orderCode: order.orderCode
        });

        if (checkOrder) {
            return res.json({
                success: false,
                message: 'Mã đơn hàng đã tồn tại.'
            });
        }

        const newOrder = await OrderGas.create(order).fetch();

        if (!newOrder || newOrder == '' || newOrder == null) {
            return res.json({
                success: false, 
                message: 'Lỗi...Tạo đơn hàng không thành công.'
            });
        } else {
            for (let i = 0; i < product.length; i++) {
                const getCylinder = await Cylinder.findOne({
                    _id: product[i].cylinder
                });

                await OrderGasDetail.create({
                    cylinder: product[i].cylinder,
                    quantity: product[i].quantity,
                    price: product[i].price,
                    orderGasId: newOrder.id,
                    serial: getCylinder.serial,
                    img_url: getCylinder.img_url,
                }).fetch();
            }

            const listProduct = await OrderGasDetail.find({orderGasId: newOrder.id})
        
            return res.json({
                success: true,
                Order: newOrder,
                Product: listProduct
            })
        }



    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
  },


  getProductOfOrder: async function(req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    }    

    try {
        const order = {
            orderGasId: req.body.orderGasId
        }

        if (!order.orderGasId) {
            return res.json({
                success: false,
                message: 'orderGasId is not defined. Please check out again.' 
            });
        }

        const checkOrder = await OrderGas.findOne({
            _id: order.orderGasId
        });

        if (!checkOrder) {
            return res.json({
                success: false,
                message: 'Đơn hàng không tồn tại.'
            });
        }
        
        const product = await OrderGasDetail.find({
            orderGasId: order.orderGasId
        })

        if (!product || product == '' || product == null) {
            return res.json({
                success: false, 
                message: 'Lỗi...Không tìm thấy sản phẩm thuộc đơn hàng.'
            });
        } else {
            return res.json({
                success: true,
                OrderGas: checkOrder,
                Product: product
            })
        }
    
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

  },

  changeOrderStatus: async function (req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    }

    try {
        const orderStatus = {
            orderGasId: req.body.orderGasId,
            status: req.body.status
        }

        if (!orderStatus.orderGasId) {
            return res.json({
                success: false,
                message: 'orderId is not defined. Please check out again.' 
            });
        }

        if (!orderStatus.status) {
            return res.json({
                success: false,
                message: 'orderStatus is not defined. Please check out again.' 
            });
        }

        const checkOrder = await OrderGas.findOne({
            _id: orderStatus.orderGasId
        });

        if (!checkOrder) {
            return res.json({
                success: false,
                message: 'Đơn hàng không tồn tại.'
            });
        }

        const changeOrderStatus = await OrderGas.updateOne({
            _id: orderStatus.orderGasId
        })
        .set({
            status: orderStatus.status
        });

        if (!changeOrderStatus || changeOrderStatus == '' || changeOrderStatus == null) {
            return res.json({
                success: false, 
                message: 'Lỗi...Không thể thay đổi trạng thái đơn hàng.'
            });
        } else {
            return res.json({
                success: true,
                OrderStatus: changeOrderStatus
            })
        }

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
  },


  getOrderOfCustomer: async function(req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    }    

    try {
        const customer = {
            customerId: req.body.customerId
        }

        if (!customer.customerId) {
            return res.json({
                success: false,
                message: 'customerId is not defined. Please check out again.' 
            });
        }

        const checkCustomer = await Customer.findOne({
            _id: customer.customerId
        });

        if (!checkCustomer) {
            return res.json({
                success: false,
                message: 'Khách hàng không tồn tại.'
            });
        }
        
        const orders = await OrderGas.find({
            customerId: customer.customerId
        })

        if (!orders || orders == '' || orders == null) {
            return res.json({
                success: false, 
                message: 'Lỗi...Không tìm thấy đơn hàng.'
            });
        } else {
            return res.json({
                success: true,
                Orders: orders
            })
        }
    
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

  },


  destroyOrder: async function(req, res) {
    if (!req.body) {
        return res.badRequest(Utils.jsonErr('Empty body'));
    }    

    try {
        const order = {
            orderGasId: req.body.orderGasId
        }

        if (!order.orderGasId) {
            return res.json({
                success: false,
                message: 'orderGasId is not defined. Please check out again.' 
            });
        }

        const checkOrder = await OrderGas.findOne({
            _id: order.orderGasId
        });

        if (!checkOrder) {
            return res.json({
                success: false,
                message: 'Đơn hàng không tồn tại.'
            });
        } else {
            if (checkOrder.status != 'INIT') {
                return res.json({
                    success: false,
                    message: 'Không thể hủy đơn hàng. <<-- Status != INIT -->>.'
                });
            }
        }
        
        const destroyOrder = await OrderGas.destroyOne({
            id: order.orderGasId
        })

        const destroyProducts = await OrderGasDetail.destroy({
            orderGasId: order.orderGasId
        }).fetch();


        if (!destroyOrder || !destroyProducts) {
            return res.json({
                success: false, 
                message: 'Lỗi...Hủy đơn hàng không thành công.'
            });
        } else {
            return res.json({
                success: true,
                message: 'Đơn hàng đã được hủy thành công.',

            });
        }

    
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

  },

};

