
const db = require('../db/mongodb.connect.js');
const { request, response } = require('express');
const collection = "InsurancePlan";
const { InsurancePlanModel } = require('../model/insurance.data.model.js');
exports.getPremiums = (req, res) => {

  var requestObj = {
    stateCode: req.query.stateCode,
    maritalStatus : req.query.maritalStatus,
    age : req.query.age,
    nChildren : req.query.childCount
  }

  db.getDB().collection(collection).find({ "stateCode": requestObj.stateCode }).toArray((err, documents) => {
    if (err)
      console.log(err)
    else {
      var data = mapDataToModel(documents, requestObj);
      console.log(documents);
      res.json(data);
    }
  })




};


mapDataToModel = (docs, obj) => {
  var returnData = [];
  docs.forEach(data => {
    InsurancePlanModel.planId = data.planID;
    InsurancePlanModel.planName = data.planMarketingName;
    InsurancePlanModel.summaryURL = data.summaryBenefitsURL;
    InsurancePlanModel.networkURL = data.networkURL;
    if (obj.maritalStatus != "Single") {
      InsurancePlanModel.premium = data.premiumScenarios[GetPremiumData(obj.age, obj.maritalStatus)][obj.nChildren];
    }
    else {
      InsurancePlanModel.premium = data.premiumScenarios[GetPremiumData(obj.age, obj.maritalStatus)]
    }
    returnData.push(InsurancePlanModel);
  });

  return returnData;
}

GetPremiumData = (age, maritalStatus) => {
  var type = "individual";
  if (maritalStatus == "Married")
    type = "couple"
  else if (maritalStatus == "Single" || maritalStatus == "Divorced")
    type = "individual"
  if (maritalStatus != "Single") {
    if (age <= 21)
      type += "21"
    else if (age > 21 && age <= 30)
      type += "30"
    else if (age > 30 && age <= 40)
      type += "40"
    else if (age > 40 && age <= 50)
      type += "50"
  }
  else {
    if (age <= 14)
      type += "14"
    else if (age > 14 && age <= 18)
      type += "18"
    else if (age > 18 && age <= 27)
      type += "27"
    else if (age > 27 && age <= 60)
      type += "60"

  }

  return type;
}


