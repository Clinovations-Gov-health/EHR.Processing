import React, {Component} from 'react';
import axios from 'axios';
import 'regenerator-runtime/runtime'
export default class PatientView extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            selectedOption: '',
            location: '',
            age: '',
            gender: '',
            mStatus: '',
            nChildren: '',
            nAmbulatoryVisits: '',
            nSpecialistVisits: '',
            chronicConditions: '',
            pDrugs: '',
            formErrors: {},
            planDetails:[]
        }
        this.onDropdownAgeSelected = this.onDropdownAgeSelected.bind(this);
        this.onChangeTobaccoValue = this.onChangeTobaccoValue.bind(this);
        this.onDropDownPDrugsSelected = this.onDropDownPDrugsSelected.bind(this);
        this.onDropdownGenderSelected = this.onDropdownGenderSelected.bind(this);
        this.onDropdownLocationSelected = this.onDropdownLocationSelected.bind(this);
        this.onDropdownMStatusSelected = this.onDropdownMStatusSelected.bind(this);
        this.onDropdownNAmbulatorySelected = this.onDropdownNAmbulatorySelected.bind(this);
        this.onDropdownNChildrenSelected = this.onDropdownNChildrenSelected.bind(this);
        this.onDropdownNSVisitSelected = this.onDropdownNSVisitSelected.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onDropdownCConditionsSelected =this.onDropdownCConditionsSelected.bind(this);
    }    
   onDropdownAgeSelected(e) {
       this.setState({age: e.target.value});
   }
   onDropdownLocationSelected(e) {
       this.setState({location: e.target.value});
   }
   onDropdownGenderSelected(e) {
       this.setState({gender: e.target.value});
   }
   onDropdownMStatusSelected(e) {
       this.setState({mStatus: e.target.value});
   }
   onDropdownNChildrenSelected(e) {
    this.setState({nChildren: e.target.value});
}
onDropdownNAmbulatorySelected(e) {
    this.setState({nAmbulatoryVisits: e.target.value});
}
onDropdownNSVisitSelected(e) {
    this.setState({nSpecialistVisits: e.target.value});
}
onChangeTobaccoValue(e) {
    this.setState({selectedOption: e.target.value});
}
onDropDownPDrugsSelected(e) {
    this.setState({pDrugs: e.target.value});
}
onDropdownCConditionsSelected(e) {
    this.setState({chronicConditions: e.target.value});
}
componentDidMount() {
    try
    {
      var _plansData = document.getElementById("plansDiv");      
        _plansData.style.visibility = 'hidden';      
    }
    catch(e)
    {
        alert(e);
    }
}
async onSubmit(e) {
    e.preventDefault();   
        if (this.handleFormValidation()) {           
           const response =
           await axios.get("http://18.222.33.97:8081/api/premiums",
               { params: {stateCode: this.state.location,maritalStatus: this.state.mStatus,childCount:this.state.nChildren,age:this.state.age}}
           )           
         this.setState({planDetails: []});
         this.setState({planDetails: response.data});
         var _plansData = document.getElementById("plansDiv");      
           _plansData.style.visibility = 'visible';
      
        }           
    
}
handleFormValidation() {
    const { location, age, gender, mStatus, nChildren, nAmbulatoryVisits, nSpecialistVisits, chronicConditions, selectedOption, pDrugs } = this.state;    
    let formErrors = {};    
    let formIsValid = true;    

    //Patient location
    if (location === '' || location === "select") {    
        formIsValid = false;    
        formErrors["locationErr"] = "Select location";    
    }        

    //Gender    
    // if (gender === '' || gender === "select") {    
    //     formIsValid = false;    
    //     formErrors["genderErr"] = "Select gender.";    
    // }
    
    //Age    
    if (age === '' || age === "select") {    
        formIsValid = false;    
        formErrors["ageErr"] = "Enter age.";    
    }

    //Material Status    
    if (mStatus === '' || mStatus === "select") {    
        formIsValid = false;    
        formErrors["mStatusErr"] = "Select Material status.";    
    }

    //No of children    
    if (nChildren === '' || nChildren === "select") {    
        formIsValid = false;    
        formErrors["nChildrenErr"] = "Enter No.of children's.";    
    }

    //Ambulatory visits    
    // if (nAmbulatoryVisits === '' || nAmbulatoryVisits === "select") {    
    //     formIsValid = false;    
    //     formErrors["nAmbulatoryVisitErr"] = "Select Ambulatory visits.";    
    // }

    //Specialist visits    
    // if (nSpecialistVisits === '' || nSpecialistVisits === "select") {    
    //     formIsValid = false;    
    //     formErrors["nSpecialistVisitErr"] = "Select Specialist Visits.";    
    // }

    //Chronic conditions    
    // if (chronicConditions === '' || chronicConditions === "select") {    
    //     formIsValid = false;    
    //     formErrors["chronicConditionsErr"] = "Select Chronic condition.";    
    // }

    //Tobacco
    // if (selectedOption === '' || selectedOption === "select") {    
    //     formIsValid = false;    
    //     formErrors["selectOptionErr"] = "Select Tobacco";    
    // }

    //PDrugs   
    // if (pDrugs === '' || pDrugs === "select") {    
    //     formIsValid = false;    
    //     formErrors["pDrugsErr"] = "Select Prescription drugs.";    
    // }

    this.setState({ formErrors: formErrors });    
    return formIsValid;    
}    
    render() {
        const { locationErr, ageErr,nChildrenErr, nAmbulatoryVisitErr,mStatusErr, genderErr, pDrugsErr,nSpecialistVisitErr, selectOptionErr, chronicConditionsErr } = this.state.formErrors;
        return (                   
            
    <div className="page-content">

    <div className="content-wrapper">
        
        <div className="content">
            
            <h2 className="text-white my-2">Health Insurance Calculator</h2>
            
            <div className="my-1 px-3 bg-white rounded shadow-sm py-0">
                <div className="row">
                    <div id="patientDiv" className="col-md-4 order-md-1 mb-4 py-3 pl-3">
                        <h4 className="mb-3">Fill the Details</h4>
                        <form noValidate className="fill-form" onSubmit={this.onSubmit}>
                            <div className="mb-3">
                                <label>Location:</label>
                                <select className="form-control" id="ddllocation" onChange={this.onDropdownLocationSelected}>
                                <option value="select">Select State</option>
                             <option name="region" value="AK">Alaska</option>
                             <option name="region" value="AL">Alabama</option>
                             <option name="region" value="AR">Arkansas</option>
                             <option name="region" value="AZ">Arizona</option>
                             <option name="region" value="CA">California</option>
                             <option name="region" value="CO">Colorado</option>
                             <option name="region" value="CT">Connecticut</option>
                             <option name="region" value="District Of Columbia">District Of Columbia</option>
                             <option name="region" value="DE">Delaware</option>
                             <option name="region" value="FL">Florida</option>
                             <option name="region" value="GA">Georgia</option>
                             <option name="region" value="HI">Hawaii</option>
                             <option name="region" value="IA">Iowa</option>
                             <option name="region" value="ID">Idaho</option>
                             <option name="region" value="IL">Illinois</option>
                             <option name="region" value="IN">Indiana</option>
                             <option name="region" value="KS">Kansas</option>
                             <option name="region" value="KY">Kentucky</option>
                             <option name="region" value="LA">Louisiana</option>
                             <option name="region" value="MA">Massachusetts</option>
                             <option name="region" value="MD">Maryland</option>
                             <option name="region" value="ME">Maine</option>
                             <option name="region" value="MI">Michigan</option>
                             <option name="region" value="MN">Minnesota</option>
                             <option name="region" value="MO">Missouri</option>
                             <option name="region" value="MS">Mississippi</option>
                             <option name="region" value="MT">Montana</option>
                             <option name="region" value="NC">North Carolina</option>
                             <option name="region" value="ND">North Dakota</option>
                             <option name="region" value="NE">Nebraska</option>
                             <option name="region" value="NH">New Hampshire</option>
                             <option name="region" value="NJ">New Jersey</option>
                             <option name="region" value="NM">New Mexico</option>
                             <option name="region" value="NV">Nevada</option>
                             <option name="region" value="NY">New York</option>
                             <option name="region" value="OH">Ohio</option>
                             <option name="region" value="OK">Oklahoma</option>
                             <option name="region" value="OR">Oregon</option>
                             <option name="region" value="PA">Pennsylvania</option>
                             <option name="region" value="RI">Rhode Island</option>
                             <option name="region" value="SC">South Carolina</option>
                             <option name="region" value="SD">South Dakota</option>
                             <option name="region" value="TN">Tennessee</option>
                             <option name="region" value="TX">Texas</option>
                             <option name="region" value="UT">Utah</option>
                             <option name="region" value="VA">Virginia</option>
                             <option name="region" value="VT">Vermont</option>
                             <option name="region" value="WA">Washington</option>
                             <option name="region" value="WI">Wisconsin</option>
                             <option name="region" value="WV">West Virginia</option>
                             <option name="region" value="WY">Wyoming</option>
                                </select>
                                {locationErr &&    
                                  <div style={{ color: "red", paddingBottom: 10 }}>{locationErr}</div>    
                                }
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>Age:</label>
                                    <input type="text" className="form-control" id="ddlAge" onChange={this.onDropdownAgeSelected}  />
                                    {ageErr &&    
                                      <div style={{ color: "red", paddingBottom: 10 }}>{ageErr}</div>    
                                    }
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="d-block">Gender:</label>
                                    {/* <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                            <input type="radio" className="form-input-styled" name="gender" />
                                            Male                                    
                                        </label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                            <input type="radio" className="form-input-styled" name="gender" />
                                            Female                                    
                                        </label>
                                    </div> */}
                                    <select className="form-control" id="ddlGender" onChange={this.onDropdownGenderSelected}>
                                        <option value="select">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">FeMale</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>Marital Status:</label>
                                    <select className="form-control" id="ddlMStatus" onChange={this.onDropdownMStatusSelected}>
                                        <option value="">Choose...</option>
                                        <option>Single</option>
                                        <option>Married</option>
                                        <option>Divorced</option>
                                    </select>
                                    {mStatusErr &&    
                                      <div style={{ color: "red", paddingBottom: 10 }}>{mStatusErr}</div>    
                                    }
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label>No. of Children:</label>
                                    <input type="text" className="form-control" id="ddlChildren" onChange={this.onDropdownNChildrenSelected} />
                                    {nChildrenErr &&    
                                      <div style={{ color: "red", paddingBottom: 10 }}>{nChildrenErr}</div>    
                                    }
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label>No. of Ambulatory visits:</label>
                                    <input type="text" className="form-control" id="ddlNAmbulatory" onChange={this.onDropdownNAmbulatorySelected} />
                                    {/* {nAmbulatoryVisitErr &&    
                                         <div style={{ color: "red", paddingBottom: 10 }}>{nAmbulatoryVisitErr}</div>    
                                    } */}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label>No. of Specialist visits:</label>
                                    <input type="text" className="form-control" id="ddlNSVisit" onChange={this.onDropdownNSVisitSelected} />
                                    {/* {nSpecialistVisitErr &&    
                                     <div style={{ color: "red", paddingBottom: 10 }}>{nSpecialistVisitErr}</div>    
                                    } */}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label>Chronic conditions:</label>
                                <select data-placeholder="Select..." className="form-control" id="ddlCConditions" onChange={this.onDropdownCConditionsSelected}>
                                    <option value="select">Select</option>
                                    <option>Asthma</option>
                                    <option>Arthritis</option>
                                    <option>Cancer</option>
                                    <option>COPD</option>
                                    <option>CHF</option>
                                    <option>Hypertension</option>
                                    <option>Diabetes</option>
                                    <option>Obesity</option>
                                    <option>Thyroid</option>
                                </select>
                                {/* {nSpecialistVisitErr &&    
                                 <div style={{ color: "red", paddingBottom: 10 }}>{nSpecialistVisitErr}</div>    
                                } */}
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="d-block">Tobacco:</label>
                                    <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                        <input
                                        className="form-input-styled"
                                        type="radio"
                                        value="Yes"
                                        checked={this.state.selectedOption === "Yes"}
                                        onChange={this.onChangeTobaccoValue}
                                        />
                                            Yes
                                    
                                        </label>
                                    </div>

                                    <div className="form-check form-check-inline">
                                        <label className="form-check-label">
                                        <input
                                        className="form-input-styled"
                                        type="radio"
                                        value="No"
                                        checked={this.state.selectedOption === "No"}
                                        onChange={this.onChangeTobaccoValue}
                                        />
                                            No
                                    
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label>Prescription drugs:</label>
                                    <select className="form-control select" id="ddlPDrugs" onChange={this.onDropDownPDrugsSelected} >
                                        <option value="">Choose...</option>
                                        <option>Brand</option>
                                        <option>Generic</option>
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-primary btn-lg" type="submit" value="submit">Submit</button>
                        </form>
                    </div>
                    <div id="plansDiv" className="col-md-8 order-md-2 py-3 pl-3">                    
                    {this.state.planDetails.length > 0 && this.state.planDetails.map(item => { 
                        return(                       
                        <div>
                        <h4 className="mb-2">Estimated Premium Details</h4>
                        <form className="needs-validation" noValidate>
                            <div className="mb-2">
                                <div className="d-sm-flex align-items-sm-center justify-content-sm-between flex-sm-wrap border-bottom border-gray mb-2">
                                    <div className="d-flex align-items-center mb-3 mb-sm-0">                                
                                        <div>
                                            <h5 className="font-weight-semibold mb-0">
                                                <a href="#">{item.planName}</a> 
                                            </h5>
                                              <span>Plan ID:</span> <span><strong>{item.planId}</strong></span>
                                        </div>
                                    </div>
                                    <div>
                                        <span>Monthly Premium</span>
                                        <h2 className="font-weight-semibold">${item.premium}</h2>
                                    </div>
                                </div>
                                
                                <div className="d-sm-flex align-items-sm-center justify-content-sm-between flex-sm-wrap border-bottom border-primary pb-2">
                                {/* <div>
                                    <button type="submit" className="btn btn-primary btn-outline-primary mr-1">Add your<br />medical providers</button>
                                    <button type="submit" className="btn btn-primary btn-outline-primary">Add your<br />prescription drugs</button>
                                </div> */}
                                <div>
                                    <button type="submit" className="btn btn-success mr-1">Enroll</button>
                                    <button type="submit" className="btn btn-primary">Plan details</button>
                                </div>
                            </div>
                            </div>
                        </form> 
                     </div>)
                })}
                </div>
                </div>
            </div>
         </div>        
    </div>
    

</div>

        )
    }
}