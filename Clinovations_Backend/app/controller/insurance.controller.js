
const db = require('../db/mongodb.connect.js');
const { request, response } = require('express');
const collection = "InsurancePlan";
const { InsurancePlanModel } = require('../model/insurance.data.model.js');
exports.getPremiums = (req, res) => {
  let stateCode = req.query.stateCode;
 // let countyName = req.body.countyName;
  let maritalStatus = req.query.maritalStatus;
  let age = req.query.age;
  var couple = false;
  let noOfChildren = req.query.childCount;
  if (maritalStatus == "Married")
    couple = true;


  db.getDB().collection(collection).find({"stateCode":stateCode}).toArray((err, documents) => {
    if (err)
      console.log(err)
    else {
      debugger;
      var data = mapDataToModel(documents, age, couple , noOfChildren);
      console.log(documents);
      res.json(data);
    }
  })




};


mapDataToModel = (docs, age, couple, noOfChild) => {
  var returnData = [];
  docs.forEach(data => {
    InsurancePlanModel.planId = data.planID;
    InsurancePlanModel.planName = data.planMarketingName;
    InsurancePlanModel.summaryURL = data.summaryBenefitsURL;
    InsurancePlanModel.networkURL = data.networkURL;
    InsurancePlanModel.premium = data.premiumScenarios[GetPremiumData(age,couple)][noOfChild];
    returnData.push(InsurancePlanModel);
  });

  return returnData;
}

GetPremiumData = (age, couple) =>
{
  var type = "individual";
  if (couple)
    type = "couple"
    
  if (age < 21)
    type += "21"
  else if (age >= 21 && age < 30)
    type += "30"
  else if (age >= 30 && age < 40)
    type += "40"
  else if (age >= 40 && age < 50)
    type += "50"
  
   return type;
}


