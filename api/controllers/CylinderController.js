/**
 * CylinderController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const API_ERRORS = require('../constants/APIErrors');
const LogType = require('../constants/LogType');
const { Factory } = require('../constants/UserTypes');
const USER_TYPE = require('../constants/UserTypes');
const USER_ROLE = require('../constants/UserRoles');

module.exports = {

  /**
	 * Action for /cylinder
	 * @param req
	 * @param res
	 * @returns {*}
	 */
  index: async function (req, res) {
    let userId = req.userInfo.id;
    let cylinders = await Cylinder
			.find({current: req.userInfo.id});
    return res.ok(cylinders);
  },

  /**
     * Action for /cylinder/:id
     * @param req
     * @param res
     * @returns {*}
     */
  detail: async function (req, res) {
    if (req.query.cyliner_id === '' || req.query.cyliner_id === '""') {
      return res.badRequest(Utils.jsonErr('Cyliner ID not found'));
    }

    try {
      const result = await Cylinder.findOne(req.query.cyliner_id);
      return res.ok({data: result});
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },


  /**
     * Action for /cylinder/import
     * @param req
     * @param res
     * @returns {*}
     */
  import: async function (req, res) {
    const user = req.userInfo;

    if (user.userType !== 'Factory') {
      return res.badRequest(Utils.jsonErr('Bạn không có đủ thẩm quyền'));
    }

    if (!req.body || req.body === {}) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    // const fixerId = req.body.fixerId;
    // const companyId = req.body.companyId;
    // const classification = req.body.classification;

    const {
      fixerId,
      companyId,
      classification,
      manufacture
    } = req.body

    if (!manufacture) return res.serverError('Missing manufacture!')

    req.file('upload_file').upload({
      dirname: require('path').resolve(sails.config.appPath, 'excel/')
    }, async (err, files) => {
      if (err) {return res.serverError(err);}

      try {
        const result = await CylinderService.excelToCylinder(files, user.id, fixerId, companyId, classification, manufacture);
        const content = result.body.length > 0 ? 'Success import Cylinders data' : result.err;
        await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content, status: result.status });
        return res.ok({status: result.status, err: result.status ? '' : result.err });
      } catch (err) {
        try {
          await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content: err.message, status: false });
        } catch (error) { console.log('catch (error)', error ) }
        console.log('catch (err)', err)
        return res.serverError(Utils.jsonErr(err));
      }
    });
  },

  // Gui req len TNSH, yeu cau tao ma binh theo danh sach trong file excel
  createReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const {      
      id_ReqTo,
      classification,
      manufacture,
      // codeReq
    } =req.body

    if (!id_ReqTo) return res.badRequest(Utils.jsonErr('Missing id_ReqTo'));
    if (!manufacture) return res.badRequest(Utils.jsonErr('Missing manufacture'));
    if (!classification) return res.badRequest(Utils.jsonErr('Missing classification'));

    const user = req.userInfo;

    if (user.userType !== 'Factory' && user.userType !== 'Fixer') {
      // can kiem tra them Truc thuoc (Owner)
      return res.badRequest(Utils.jsonErr('Bạn không có đủ thẩm quyền'));
    }

    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    //const fixerId = req.body.fixerId;

    req.file('upload_file').upload({
      dirname: require('path').resolve(sails.config.appPath, 'excel/createReqImport')
    }, async (err, files) => {
      if (err) {return res.serverError(err);}

      try {
        const result = await CylinderService.excelReqToCylinder(files, user.id, id_ReqTo, classification, manufacture);
        const content = result.body.length > 0 ? 'Success import Cylinders data' : result.err;
        await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content, status: result.status });
        return res.ok({status: result.status, err: result.status ? '' : result.err });
      } catch (err) {
        try {
          await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content: err.message, status: false });
        } catch (error) {}
        return res.serverError(Utils.jsonErr(err));
      }
    });
  },

  // Tạo bình dưới công ty con, chi nhánh trực thuộc
  importFromSubsidiary: async function (req, res) {
    const user = req.userInfo;

    if (!(user.userType === 'Factory' || user.userType === 'Fixer')) {
      return res.badRequest(Utils.jsonErr('Bạn không có đủ thẩm quyền'));
    }

    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    // return  res.badRequest(Utils.jsonErr('TEST'));

    // Tìm parentRoot

    const parent = await getRootParent(user.isChildOf)

    const {
      // fixerId,
      // companyId,
      classification,
      manufacture,
      category,
      // assetType,
      // rentalPartner,
    } = req.body

    req.file('upload_file').upload({
      dirname: require('path').resolve(sails.config.appPath, 'excel/')
    }, async (err, files) => {
      if (err) {return res.serverError(err);}

      try {
        const result = await CylinderService.excelToCylinderFromSubsidiary(files, user.id, classification, manufacture, category, /* assetType, rentalPartner, */ parent, user.userType);
        const content = result.body.length > 0 ? 'Success import Cylinders data' : result.err;
        await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content, status: result.status });
        return res.ok({status: result.status, err: result.status ? '' : result.err });
      } catch (err) {
        try {
          await Log.create({type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content: err.message, status: false });
        } catch (error) {}
        return res.serverError(Utils.jsonErr(err));
      }
    });
  },

  // Tạo bình tự động từ phần mềm in
  // Đồng bộ số liệu với GEO
  importCylinders: async function (req, res) {
    if (Object.keys(req.body).length === 0) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const {
      email,  // email
      cylinders,
    } = req.body

    if (!email) {
      return res.badRequest(Utils.jsonErr('email is required'));
    }

    if (!cylinders) {
      return res.badRequest(Utils.jsonErr('cylinders is required'));
    }

    if (!Array.isArray(cylinders)) {
      return res.badRequest(Utils.jsonErr('cylinders is wrong type'));
    }

    if (cylinders.length === 0) {
      return res.badRequest(Utils.jsonErr('List cylinders is empty'));
    }
    
    try {
      const length = cylinders.length
      const idImex = Date.now()
      // // Gán cứng id của chi nhánh Bình Khí
      // const ownerId = ''      
      const userInfo = await User.findOne({ email: email })
      if (!userInfo) {
        return res.badRequest(Utils.jsonErr('User not found'));
      }

      const parent = await getRootParent(userInfo.id)

      let result = {
        body: [],
        err:'non of error',
        status: false
      };
      let body = [];
      let errorLogs = [];
      
      for(let i = 0; i < length; i++){        
        createdData = await CylinderService.createEachCylinders(cylinders[i], userInfo.id, parent, userInfo.userType, idImex);
        if(!createdData.status) {
          errorLogs.push(createdData.err);
          //break;
        } else {
          //console.log('Created data::::', createdData);
          body.push(createdData.data);
        }
      }

      if(body.length === cylinders.length){
        result.status = true;
        result.body = body;  
      }
  
      if(errorLogs.length > 0) {
        result.err = errorLogs.join(';');
      }

      //const result = await CylinderService.excelToCylinderFromSubsidiary(files, user.id, classification, manufacture, category, /* assetType, rentalPartner, */ parent, user.userType);
      const content = result.body.length > 0 ? 'Success import Cylinders data' : result.err;
      await Log.create({ type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content, status: result.status });
      return res.ok({ status: result.status, err: result.status ? '' : result.err });
    } catch (err) {
      try {
        await Log.create({ type: LogType.IMPORT_EXCEL_CYLINDER_ACTION, content: err.message, status: false });
      } catch (error) { }
      return res.serverError(Utils.jsonErr(err));
    }
    
  },

  // Lay thong tin request
  getReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const {      
      id,
    } =req.body

    try {
      let data = await ReqImport.find({ id_ReqTo: id, status_Req: 'INIT' }).populate('detail_Req').populate('id_ReqFrom')

      if (data) {
        return res.json({ status: true, data: data, message: 'Lay du lieu thanh cong' });
      }
      else {
        return res.json({ status: false, message: 'Lay du lieu that bai'});
      }
    }
    catch (err) {
      return res.json({ status: false, message: err.message});
    }
  },

  // Xac nhan Req
  confirmReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const {  
      idUser,    
      idReq,
    } =req.body

    let createdData = []
    let errData = []

    try {
      const reqImport = await ReqImport.findOne({ id: idReq })

      if (!reqImport) return res.json({ status: false, message: `Khong co yeu cau tao binh nao voi ma : ${reqImport}`});

      const userInfor_reqImport = await User.findOne({ id: reqImport.id_ReqFrom })

      // if (userInfor_reqImport.hasOwnp)

      let placeStatus = ''
      if (userInfor_reqImport.userType === 'Factory') placeStatus = 'IN_FACTORY'
      if (userInfor_reqImport.userType === 'Fixer') placeStatus = 'IN_REPAIR'

      const detail_ReqImport = await DetailReqImport.find({request: idReq})

      for (i=0; i<detail_ReqImport.length; i++) {

        let data

        const availableManufacture = await Manufacture.findOne({ where: { owner: idUser, id: detail_ReqImport[i].manufacture } });        
        if (!availableManufacture) {
          data = `Manufacture ${data.manufacture} is not available on your system`;
          //return createdData;
          errData.push(data);
        }
        else {
          const exitsCylinder = await Cylinder.findOne({
            // where: { serial:  detail_ReqImport[i].serial, manufacture:  detail_ReqImport[i].manufacture },
           serial:  detail_ReqImport[i].serial
          });
          if (exitsCylinder) {
            data = `The cylinder with serial ${detail_ReqImport[i].serial} with manufacture ${detail_ReqImport[i].manufacture} ALREADY EXIST`;
            //return createdData;
            errData.push(data);
          }
          else {
            try {
              let createCylinder = await Cylinder.create({
                serial: detail_ReqImport[i].serial,
                //img_url: detail_ReqImport[i].img_url,
                color: detail_ReqImport[i].color,
                valve: detail_ReqImport[i].valve,
                checkedDate: detail_ReqImport[i].checkedDate,
                weight: detail_ReqImport[i].weight,
                classification: detail_ReqImport[i].classification,
                //currentImportPrice: detail_ReqImport[i].currentImportPrice,
                manufacture: detail_ReqImport[i].manufacture,
                manufacturedBy: reqImport.id_ReqFrom,
                current: reqImport.id_ReqFrom,
                factory: idUser,
                placeStatus: placeStatus
              }).fetch()
              if (createCylinder)
            data = `The cylinder with serial ${detail_ReqImport[i].serial} with manufacture ${detail_ReqImport[i].manufacture} CREATE SUCCESS`;
            }
            catch(err) {
              // await Log.create({  })
              return res.json({ status: false, data: err.message, message: 'Co loi khi tao binh'});
            }
            
            createdData.push(data);
          }
        } 
      }

      if(createdData.length>0) {
        let updatedReq = await ReqImport.updateOne({ id: idReq }).set({ status_Req: 'CREATED', updatedBy: idUser, updatedAt: new Date() });
      }

      if (errData.length<=0 &&  createdData.length>0) {
        return res.json({ status: true, data: createdData, message: 'Tao request thanh cong' });
      }
      else {
        let returnData = errData.concat(createdData)
        return res.json({ status: false, data: returnData, message: 'Co loi khi tao binh'});
      }
    }
    catch (err) {
      return res.json({ status: false, message: err.message});
    }
  },

  // Xoa request
  removeReqImport: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const {        
      idReq,
    } =req.body

    //if (!idUser) return res.json({ status: false, message: 'ID User is required'});
    if (!idReq) return res.json({ status: false, message: 'ID Request is required'});

    try {
      let data = await ReqImport.updateOne({ id: idReq }).set({ status_Req: 'REMOVE'})

      if (data) {
        return res.json({ status: true, data: data, message: 'Xoa request thanh cong' });
      }
      else {
        return res.json({ status: false, message: 'Xoa request that bai'});
      }
    }
    catch (err) {
      return res.json({ status: false, message: 'Gap loi khi cap nhat request'});
    }
  },

  /**
     * Action for /cylinder/upPlaceStatus
     * @param req
     * @param res
     * @returns {*}
     */
  upPlaceStatus: async function (req, res) {
    if (!req.body) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    try {
      const result = await CylinderService.upPlaceStatus(req.body.cyliner_id, req.userInfo);
      if(!result) {res.badRequest(Utils.jsonErr(API_ERRORS.ROLE_RESTRICT));}
      return res.ok(result);
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },

  /**
     * Action for /cylinder/create
     * @param req
     * @param res
     * @returns {*}
     */
  create: async function (req, res) {
    const body = req.body;
    if (!body || !body.manufacture || !body.serial) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    if (req.userInfo.userType !== 'Factory') {
      return res.badRequest(Utils.jsonErr('Bạn không có đủ thẩm quyền'));
    }

    try {
      const exitsCylinder = await Cylinder.findOne({
        where: {serial: body.serial, manufacture: body.manufacture},
      });
      if(exitsCylinder) {return res.badRequest(Utils.jsonErr(API_ERRORS.EXIST_MODEL));}

      body.factory = req.userInfo.id;
      if (body.cylinderAt_childFactory===undefined || !body.cylinderAt_childFactory) {
        body.current = req.userInfo.id;        
      }
      else {
        body.current = body.cylinderAt_childFactory;

        const fixerComp = await User.findOne({id: body.cylinderAt_childFactory})
        if (fixerComp.userType === 'Fixer') body.placeStatus = 'IN_REPAIR'
      }
      
      const cylinder = await Cylinder.create(body).fetch();

      // Ghi tiếp vào bảng CylinderImex
      let condition = ''
      if (!cylinder.condition) {
        const record = await CylinderImex.find({
          cylinder: cylinder.id
        }).sort('createdAt DESC')

        if (record.length > 0) {
          condition = record[0].condition
        }
        else {
          condition = 'NEW'
        }
      }

      await CylinderImex.create({
        cylinder: cylinder.id,
        status: 'EMPTY',
        condition: cylinder.condition ? cylinder.condition : condition,
        idImex: Date.now(),
        typeImex: 'IN',
        flow: 'CREATE',
        createdBy: req.userInfo.id,
        objectId: req.userInfo.id,
        // history: null,
      })

      return res.created(cylinder);
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },

  /**
     * Action for /cylinder/getInfomation
     * @param req
     * @param res
     * @returns {*}
     */
  getInfomation: async function (req, res) {
    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const user = req.userInfo;
    const actionType = req.body.action_type;
    const parentRoot = req.body.parent_root;
    const cylinderSerial = req.body.cylinder_serials;
    let credential = {};

    if (!actionType) {
      return res.ok(Utils.jsonErr('Missing action_type'));
    }

    if (!parentRoot) {
      return res.ok(Utils.jsonErr('Missing parent_root'));
    }

    if(!cylinderSerial || cylinderSerial.length === 0  )  {return res.ok(Utils.jsonErr('Empty request cylinder_serials, cylinder_serials must be id array'));}

    credential.serial = cylinderSerial;
    //credential.factory = parentRoot;

    try {
      let cylinders = [];
      if(actionType === 'CHANGE_DATE') {
        cylinders = await Cylinder.find(credential);
        const deliveringCylinders = _.filter(cylinders, o => {return o.current !== user.id;}); // Check những mã đang Vận chuyển
        if(deliveringCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}`));}
        return res.ok(cylinders);
      } else {
        cylinders = await Cylinder.find(credential).populate('histories');

        cylinders = await Promise.all(cylinders.map(async cylinder => {
          cylinder.histories = await Promise.all(cylinder.histories.map(async history => {
            return await History.findOne({id: history.id}).populate(['to', 'from', 'toArray']);
          }));
          return cylinder;
        }));
        // if (actionType === 'IMPORT') return res.ok(cylinders);
        return await getSuitableCylinders(res, user, actionType, cylinderSerial, cylinders);
      }
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },


  // lay thong tin cylinder tu file excel
  getInfomationExcel: async function (req, res) {
    if (req.body === {}) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const user = req.userInfo;
    const actionType = req.body.action_type;
    const parentRoot = req.body.parent_root;
    const cylinderSerial = req.body.cylinder_serials;
    let credential = {};

    if (!actionType) {
      return res.ok(Utils.jsonErr('Missing action_type'));
    }

    if (!parentRoot) {
      return res.ok(Utils.jsonErr('Missing parent_root'));
    }

    if(!cylinderSerial || cylinderSerial.length === 0  )  {return res.ok(Utils.jsonErr('Empty request cylinder_serials'));}

    credential.serial = []

    for (i=0; i<cylinderSerial.length; i++) {
      credential.serial.push(cylinderSerial[i].serial)
    }
    
    //credential.serial = cylinderSerial;
    //credential.factory = parentRoot;

    try {
      let cylinders = [];
      if(actionType === 'CHANGE_DATE') {
        cylinders = await Cylinder.find(credential);
        const deliveringCylinders = _.filter(cylinders, o => {return o.current !== user.id;}); // Check những mã đang Vận chuyển
        if(deliveringCylinders.length > 0) {
          return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}`));
          //return res.json({ success: false, message: `Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}` });
        }
        return res.ok(cylinders);
      } else {
        cylinders = await Cylinder.find(credential).populate('histories');

        cylinders = await Promise.all(cylinders.map(async cylinder => {
          cylinder.histories = await Promise.all(cylinder.histories.map(async history => {
            return await History.findOne({id: history.id}).populate(['to', 'from', 'toArray']);
          }));
          return cylinder;
        }));
        return await getSuitableCylinders(res, user, actionType, cylinderSerial, cylinders);
      }
    } catch (err) {
      return res.serverError(Utils.jsonErr(err));
    }
  },

  /**
	 * Action for /cylinder/updateVerifiedDates
	 * @param amount
	 * @param res
	 * @returns {*}
	 */
  updateVerifiedDates: async function (req, res) {
    const user = req.userInfo;
    const cylinderIds = req.body.cylinder_serials;
    const newDate = req.body.newDate;

    if (user.userType !== 'Factory' && user.userType !== 'Fixer' && user.userRole !== 'SuperAdmin') {
      return res.ok(Utils.jsonErr('Bạn không có đủ quyền'));
    }

    if (!cylinderIds) {
      return res.ok(Utils.jsonErr('cylinder_serials is required'));
    }

    if (!newDate) {
      return res.ok(Utils.jsonErr('newDate is required'));
    }

    let passedCylinderIds = [];
    let listErrorCylinder = [];
    // let passedCylinderIds = await Promise.all(cylinderIds.filter(async cylinderId => {
    //   const modelCylinder = await Cylinder.findOne({'id': cylinderId});
    //   if(modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {return cylinderId;}
    // }));
    for (let index = 0; index < cylinderIds.length; index++) {
      const modelCylinder = await Cylinder.findOne({'id': cylinderIds[index]});
      if(modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {
        passedCylinderIds.push(cylinderIds[index]);
      } else {
        listErrorCylinder.push(cylinderIds[index]);
      }
    }

    //Return error if non of cylinderid passed the check
    if(passedCylinderIds.length === 0) {return res.ok(Utils.jsonErr('Không update được vì không mã nào ở cở sở hiện tại'));}
    //Get all error serial
    //let listErrorCylinder = _.difference(cylinderIds, passedCylinderIds);

    let listError = '';
    if(listErrorCylinder.length > 0) {
      listError = listErrorCylinder.join('; ');
    }

    try {
      const patchedCylinders = await Cylinder.update({'_id': passedCylinderIds}).set({checkedDate: newDate});
      if(listErrorCylinder.length === 0) {
        return res.ok(patchedCylinders);
      } else {
        return res.ok(Utils.jsonErr(`Cập nhật thành công nhưng các mã dưới đây lỗi do không ở tại cơ sở hiện tại ${listError}`));
      }
    } catch (error) {
      return res.ok(Utils.jsonErr(error));
    }
  },

  //
  updateCylinderInformationExcel: async function (req, res) {
    const user = req.userInfo;
    
    if (!req.body) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }

    const {
      cylinder_serials,
      // checkedDate,
      // serial
    } = req.body

    const listCylinders = cylinder_serials

    if (user.userType !== 'Factory' && user.userType !== 'Fixer' && user.userRole !== 'SuperAdmin') {
      // return res.ok(Utils.jsonErr('Bạn không có đủ quyền'));
      return res.json({ success: false, message: "Bạn không có đủ quyền" });
    }

    if ( !Array.isArray(listCylinders) ) {
      // return res.ok(Utils.jsonErr('cylinder_serials is required'));
      return res.json({ success: false, message: "Update information is required" });
    }

    if (listCylinders.length === 0) {
      return res.json({ success: false, message: "Update information is required" });
    }

    // if (!newDate) {
    //   return res.ok(Utils.jsonErr('newDate is required'));
    // }

    let passedCylinderIds = [];
    let listErrorCylinder = [];
    // let passedCylinderIds = await Promise.all(cylinderIds.filter(async cylinderId => {
    //   const modelCylinder = await Cylinder.findOne({'id': cylinderId});
    //   if(modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {return cylinderId;}
    // }));

    await Promise.all(listCylinders.map(async(cylidner,index)=>{
      if (cylidner.hasOwnProperty('serial')) {
        const modelCylinder = await Cylinder.findOne({ 'serial': cylidner.serial });
        if (modelCylinder) {
          if (modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {
            passedCylinderIds.push(cylidner);
          } else {
            element = passedCylinderIds[index]
            listErrorCylinder.push(cylidner)
            passedCylinderIds.splice(index, 1)
          }
        }
        else {
          element = passedCylinderIds[index]
          listErrorCylinder.push(cylidner)
          passedCylinderIds.splice(index, 1)
        }
      }
      else {
        element = passedCylinderIds[index]
        listErrorCylinder.push(cylidner)
        passedCylinderIds.splice(index, 1)
      }  
    })) 


    // for (let index = 0; index < listCylinders.length; index++) {
     
    //   if (listCylinders[index].hasOwnProperty('serial')) {
    //     const modelCylinder = await Cylinder.findOne({ 'serial': listCylinders[index].serial });
    //     if (modelCylinder.current === user.id && (modelCylinder.placeStatus === 'IN_FACTORY' || modelCylinder.placeStatus === 'IN_REPAIR')) {
    //       passedCylinderIds.push(listCylinders[index]);
    //     } else {
    //       const element = passedCylinderIds[index]
    //       listErrorCylinder.push(listCylinders[index])
    //       passedCylinderIds.slice(index, 1)
    //     }
    //   }
    //   else {
    //     const element = passedCylinderIds[index]
    //     listErrorCylinder.push(listCylinders[index])
    //     passedCylinderIds.slice(index, 1)
    //   }      
    // }

    //Return error if non of cylinderid passed the check
    if(passedCylinderIds.length === 0) {
      // return res.ok(Utils.jsonErr('Không update được vì không mã nào ở cở sở hiện tại'));
      return res.json({ success: false, message: "Không update được vì không mã nào ở cở sở hiện tại" });
    }
    //Get all error serial
    //let listErrorCylinder = _.difference(cylinderIds, passedCylinderIds);

    let listError = '';
    if(listErrorCylinder.length > 0) {
      listError = listErrorCylinder.join('; ');
    }


    let dataUpdate = []
    let elmErr = []

    await Promise.all(passedCylinderIds.map(async (cylinder, index) => {
      // let elm
      if (cylinder.manufacture) {
        const manufacture = await Manufacture.findOne({ id: cylinder.manufacture })
        if (manufacture) {
          dataUpdate.push({
            checkedDate: cylinder.checkDate ? cylinder.checkDate : (new Date()).toISOString(),
            classification: cylinder.classification ? cylinder.classification : '',
            color: cylinder.color ? cylinder.color : '',
            manufacture: cylinder.manufacture ? cylinder.manufacture : '',
            valve: cylinder.valve ? cylinder.valve : '',
            weight: cylinder.weight ? cylinder.weight : 0,
          })
        }
        else {
          listErrorCylinder.push(passedCylinderIds[index])
          elmErr.push(passedCylinderIds[index])
        }
      }
      else {
        listErrorCylinder.push(passedCylinderIds[index])
        elmErr.push(passedCylinderIds[index])
      }
    }))

    if (elmErr.length > 0) {
      elmErr.forEach(element => {
        passedCylinderIds.splice(passedCylinderIds.indexOf(element), 1)
      });
    }


    
    // checkDate: "2023-02-13T12:00:00.000Z"
    // classification: "New"
    // color: "Xám"
    // manufacture: "5ec5fba3dc6b454dd46c035c"
    // serial: "DVSA513411"
    // valve: "POL"
    // weight: 13.7

    try {
      // const patchedCylinders = await Cylinder.update({'serial': passedCylinderIds}).set({checkedDate: newDate});
      let patchedCylinders = []
      await Promise.all(passedCylinderIds.map(async (cylinder, index) => {
        const updatedCylinder = await Cylinder.updateOne({ 'serial': cylinder.serial }).set(
          dataUpdate[index]
        )
        patchedCylinders.push(updatedCylinder)
      }))

      if(listErrorCylinder.length === 0 && patchedCylinders.length>0) {
        // return res.ok(patchedCylinders);
        return res.json({ success: true, data: patchedCylinders, message: "Cập nhật thông tin bình thành công" });
      } else {
        // return res.ok(Utils.jsonErr(`Cập nhật thành công nhưng các mã dưới đây lỗi do không ở tại cơ sở hiện tại ${listError}`));
        return res.json({
          success: false,
          data: [patchedCylinders, listErrorCylinder],
          message: "Cập nhật thông tin " + patchedCylinders.length + " bình thành công, " + listErrorCylinder.length + " bình thất bại"
        });
      }
    } catch (error) {
      // return res.ok(Utils.jsonErr(error));
      return res.json({
        success: false,
        message: "Gặp lỗi khi cập nhật thông tin bình"
      });
    }
  },

  /**
	 * Action for /cylinder/updateCylinder
	 * @param amount
	 * @param res
	 * @returns {*}
	 */
  updateCylinder: async function (req, res) {
    const user = req.userInfo;
    const cylinderId = req.body.cylinder_id;
    const newPrice = req.body.price;
    const newColor = req.body.color;
    const newWeight = req.body.weight;
    const newCheckedDate = req.body.checked_date;
    const newImageUrl = req.body.img_url;
    const idUser = req.body.idUser;
    const valve = req.body.valve;
    const classification = req.body.classification;

    if (!cylinderId) {
      return res.ok(Utils.jsonErr('cylinder_id is required'));
    }

    if (newPrice && typeof newPrice !== 'number') {
      return res.ok(Utils.jsonErr('price is not type number'));
    }

    if (newColor && typeof newColor !== 'string') {
      return res.ok(Utils.jsonErr('color is not type string'));
    }

    if (newWeight && typeof newWeight !== 'number') {
      return res.ok(Utils.jsonErr('weight is not type number'));
    }

    if (newCheckedDate && typeof newCheckedDate !== 'string') {
      return res.ok(Utils.jsonErr('check_date is not type string'));
    }

    if (newImageUrl && typeof newImageUrl !== 'string') {
      return res.ok(Utils.jsonErr('img_url is not type string'));
    }

    if (valve && typeof valve !== 'string') {
      return res.ok(Utils.jsonErr('valve is not type string'));
    }

    if (classification && typeof classification !== 'string') {
      return res.ok(Utils.jsonErr('classification is not type string'));
    }

    patch = {};
    if(newPrice) {patch.currentSalePrice = newPrice;}
    if(newColor) {patch.color = newColor;}
    if(newWeight) {patch.weight = newWeight;}
    if(newCheckedDate) {patch.checkedDate = newCheckedDate;}
    if(newImageUrl) {patch.img_url = newImageUrl;}
    if(valve) {patch.valve = valve;}
    if(classification) {patch.classification = classification;}
    patch.updateBy = idUser;

    try {
      const patchedCylinder = await Cylinder.updateOne({'_id': cylinderId}).set(patch);

      if(patchedCylinder) {
        if(newPrice) {
          await PriceHistory.create({
            cylinders: patchedCylinder.id,
            user: user.id,
            price: newPrice
          });
        }
        res.ok(patchedCylinder);
      } else {
        res.notFound('Cannot update un-exist cylinder');
      }
    } catch (error) {
      res.serverError(error);
    }

  },

  searchCylinder: async function (req, res) {
    const cylinderSerial = req.query.cylinder_serial;
    if(!cylinderSerial) {
      return res.ok('Missing cylinder_serial');
    }

    let page = parseInt(req.query.page);
    if(!page) {page = 1;}

    let limit =  parseInt(req.query.limit);
    if(!limit) {limit = 10;}

    const skip = limit * (page - 1);

    const user = req.userInfo;

    try {
      let manufactures = await Manufacture.find({owner: user.parentRoot});

      manufactures = manufactures.map(item => {
        return item.id;
      });

      const credential = {
        serial: {contains : cylinderSerial},
        manufacture: {in: manufactures}
      };

      const cylinders = await Cylinder.find({ where: credential, limit, skip })
        .populate('manufacture')
        .populate('current')
        .populate('category');
      const count = await Cylinder.count({where: credential});
      //const cylinders =  await Cylinder.find({where: {serial: {contains : cylinderSerial}}}).paginate(page, limit);


      //const totalItem = (page - 1) * limit + cylinders.length;
      //console.log('Maximum Item:', count);

      const response = {
        data: cylinders,
        totalItem: count
      };
      return res.ok(response);
    } catch (error) {
      return res.ok(Utils.jsonErr(error));
    }
  },

  searchCylinders: async  function (req, res) {
    
    if(!req.body) {
      return res.badRequest(Utils.jsonErr('Empty body'));
    }    

    const cylindersId = req.body.findCylinders;
    let cylindersInfor = []

    try {
      await Promise.all ( cylindersId.map( async (idCyl) => {
        let cylinderInfor = await Cylinder.findOne({ id: idCyl})
        if (cylinderInfor) {
           cylindersInfor.push(cylinderInfor)
        }
      })
      )

      
      if (cylindersInfor.length > 0) {
        return res.json({ success: true, data_cylindersInfor: cylindersInfor, message: "Lấy thông tin thành công" });
      }
      else {
        return res.json({ success: false, message: "Lấy thông tin không thành công" });
      }   
      
      
    } catch (error) {
      return res.json({ success: false, message: err.message });  
    }
  },

};


// =============== get Available Cylinders suitable by action ===================

async function getSuitableCylinders (res, user, actionType, requestSerials, cylinders) {
  /**
   *  enum for action type
   *  EXPORT: Hành động xuất bình đầy
   *  EXPORT_STATION: Hành động xuất từ factory --> Station (cho phép bình rỗng và đầy)
   *  IMPORT: Hành động nhập bình
   **/
  if(cylinders.length > 0) {
    // Check những mã request không trong hệ thống
    const cylinderSerials = getArrayOfSerials(cylinders);
    const serialNotInSystemTree = _.difference(requestSerials,  cylinderSerials);
    if(serialNotInSystemTree.length > 0) {res.ok(Utils.jsonErr(`Những mã này không nằm trong Hệ thống của bạn : ${serialNotInSystemTree.join(',')}`));}

    // Nếu action là EXPORT
    if(actionType === 'EXPORT') {
      const deliveringCylinders = _.filter(cylinders, o => {return (o.placeStatus === 'DELIVERING' || o.placeStatus === 'IN_CUSTOMER' || o.current !== user.id);}); // Check những mã đang Vận chuyển
      if(deliveringCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển, đã bán, bình rỗng, hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}`));}
    }

    // Nếu action là EXPORT_STATION
    // if(actionType === 'EXPORT_STATION') {
    //   const deliveringCylinders = _.filter(cylinders, o => {return (o.placeStatus === 'DELIVERING' || o.placeStatus === 'IN_CUSTOMER' || o.current !== user.id );}); // Check những mã đang Vận chuyển
    //   if(deliveringCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển, đã bán hoặc đang không ở doanh nghiệp sở tại nên không thể xuất : ${getArrayOfSerials(deliveringCylinders).join(',')}`));}
    // }

    // Nếu action là IMPORT
    if(actionType === 'IMPORT') {
      const notDeliveringCylinders = _.filter(cylinders, o => {return o.placeStatus !== 'DELIVERING';}); // Check những mã đang không vận chuyển
      if(notDeliveringCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này chưa xuất nên không thể nhập : ${getArrayOfSerials(notDeliveringCylinders).join(',')}`));}
      const notCorrectDestination = _.filter(cylinders, o => {
        if(o.histories.length > 0) {
          const lastHistory = o.histories[o.histories.length -1];
          if(lastHistory.toArray.length > 0) {
            return _.find(lastHistory.toArray, i => {return i.id === user.id; }) === undefined;
          } else {
            return lastHistory.to.id !== user.id;
          }
        }
      });
      if(notCorrectDestination.length > 0) {return res.ok(Utils.jsonErr(`Những mã không thể nhập vì không xuất cho doanh nghiệp sở tại : ${getArrayOfSerials(notCorrectDestination).join(',')}`));}
    }

    if(actionType === 'TURN_BACK' ) {
      const deliveringCylinders = _.filter(cylinders, o => {return (o.placeStatus === 'DELIVERING');}); // Check những mã đang Vận chuyển
      if(deliveringCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này đang vận chuyển nên không thể nhập : ${getArrayOfSerials(deliveringCylinders).join(',')}`));}
      const currentCylinders = _.filter(cylinders, o => {return (o.current === user.id);}); // Check những mã đang Vận chuyển
      if(currentCylinders.length > 0) {return res.ok(Utils.jsonErr(`Những mã này đã hồi lưu nên không thể hồi lưu tiếp : ${getArrayOfSerials(currentCylinders).join(',')}`));}
    }

    res.ok(cylinders);
  }
  return res.ok(Utils.jsonErr('Không tìm thấy bất kì mã nào'));
}

function getArrayOfSerials(cylinders) {
  return cylinders.map(cylinder => {return cylinder.serial;});
}

// *************** Function to get root Parent of user tree
async function getRootParent(parentId) {
  try {
    if (parentId === null || typeof parentId === 'undefined' || parentId === '') { return ''; }
    let parent = await User.findOne({ id: parentId });
    if (!parent) { return ''; }
    if (parent.userType === USER_TYPE.Factory && parent.userRole === USER_ROLE.SUPER_ADMIN) { return parent.id; }
    return await getRootParent(parent.isChildOf);
  }
  catch(error) {
    console.log(error.message)
  }
  
}

