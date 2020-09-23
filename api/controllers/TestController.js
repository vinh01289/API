module.exports = {
    getAllHistoryOfCylinder : async function(req, res){
        const {
            serialCylinder
        } = req.body

        let data = await Cylinder.find({ 
          where: { serial: serialCylinder },
          select: ['serial', 'checkedDate']
        }).populate('histories');
        console.log(data);
        // if(data != undefined || data != null || data != ""){
          return res.json({ data: data });
        // }else{
        //   return res.json({err: true, message: "loi lay chu ky tai xe"});
        // }
      },

      getHistoryByID : async function(req, res){
        const {
            idHistory
        } = req.body

        let data = await History.find({ id : idHistory }).populate('toArray');
        console.log(data);
        // if(data != undefined || data != null || data != ""){
          return res.json({ data: data });
        // }else{
        //   return res.json({err: true, message: "loi lay chu ky tai xe"});
        // }
      },
}
