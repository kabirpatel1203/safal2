import React, { useState, useEffect } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { toast, ToastContainer } from 'react-toastify'
import Styles from './CustomerCreateForm.module.css'
import axios from 'axios'
import Select from 'react-select'
import { default as ReactSelect } from "react-select";
import Option from '../DropDown/Options'
import { useSelector } from 'react-redux'
const CustomerCreateForm = ({ modalHandler, setIsOpen, parentCallback }) => {
  const [architects, setArchitects] = useState([]);
  const [Mistries, setMistries] = useState([]);
  const [Dealers, setDealers] = useState([]);
  const [PMCs, setPMCs] = useState([]);
  const [OEMs, setOEMs] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [Salesmen, setSalesmen] = useState([]);
  const [selectedSalesmen, setselectedSalesmen] = useState([]);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  let initialState = {
    name: "",
    email: "",
    mobileno: "",
    address: "",
    area:"",
    companyName: "",
    birthdate: "",
    marriagedate: "",
    remarks: "",
    rewardPoints: "",
    scale: "Medium",
    salesPerson: "",
    mistryTag: null,
    mistryName: "",
    mistryNumber: "",
    architectTag: null,
    architectName: "",
    architectNumber: "",
    dealerTag: null,
    dealerName: "",
    dealerNumber: "",
    pmcTag: null,
    pmcName: "",
    pmcNumber: "",
    oemTag: null,
    oemName: "",
    oemNumber: "",
    date: "",
    followupdate: "",
    requirement: [],
    salesmen:[]
  }
  const scale = [
    {
      value: "High",
      label: "High"
    },
    {
      value: "Medium",
      label: "Medium"
    },
    {
      value: "Low",
      label: "Low"
    },
  ]
  const [formData, setFormData] = useState(initialState)

  const formHandler = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  const Scalehandler = (e) => {
    setFormData({ ...formData, scale: e.value })
  }

  const getAllsalesmen = async () => {
    const { data } = await axios.get("/api/v1/salesman/getall");
    console.log(data.salesmans);
    const salesmen = data.salesmans.map((salesman) => (
      {
        name: salesman.name,
        value: salesman.name,
        label: salesman.name
      }
    ))
    setSalesmen(salesmen);
  }
  const getAllArchitects = async () => {

    const { data } = await axios.get("/api/v1/architect/getall");

    const architects = data.architects.map((arch) => ({ value: arch._id, label: `${arch.name}-${arch.mobileno}` }))

    setArchitects(architects);

  }

  const getAllMistry = async () => {

    const { data } = await axios.get("/api/v1/mistry/getall");
    const mistries = data.mistries.map((mistry) => ({ value: mistry._id, label: `${mistry.name}-${mistry.mobileno}` }))
    setMistries(mistries);
  }

  const getAllDealer = async () => {
    const { data } = await axios.get("/api/v1/dealer/getall");

    const dealers = data.dealers.map((dealer) => ({ value: dealer._id, label: `${dealer.name}-${dealer.mobileno}` }))
    setDealers(dealers);
  }

  const getAllPMC = async () => {

    const { data } = await axios.get("/api/v1/pmc/getall");

    const pmcs = data.pmcs.map((pmc) => ({ value: pmc._id, label: `${pmc.name}-${pmc.mobileno}` }))
    setPMCs(pmcs);


  }

  const getAllOEM = async () => {
    const { data } = await axios.get("/api/v1/oem/getall");
    const oems = data.oems.map((oem) => ({ value: oem._id, label: `${oem.name}-${oem.mobileno}` }))
    setOEMs(oems);
  }

  useEffect(() => {
    getAllArchitects();
    getAllDealer();
    getAllMistry();
    getAllPMC();
    getAllOEM();
    getAllsalesmen();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
    let data = {
      name: formData.name,
      email: formData.email,
      mobileno: formData.mobileno,
      address: formData.address,
      area:formData.area,
      companyName: formData.companyName,
      birthdate: formData.birthdate,
      marriagedate: formData.marriagedate,
      remarks: formData.remarks,
      date: formData.date,
      followupdate: formData.followupdate,
      requirement: formData.requirement,
      rewardPoints: formData.rewardPoints,
      scale: formData.scale,
      salesPerson: formData.salesPerson,
      mistryTag: formData.mistryTag,
      mistryName: formData.mistryName,
      mistryNumber: formData.mistryNumber,
      architectTag: formData.architectTag,
      architectNumber: formData.architectNumber,
      architectName: formData.architectName,
      dealerTag: formData.dealerTag,
      dealerNumber: formData.dealerNumber,
      dealerName: formData.dealerName,
      pmcTag: formData.pmcTag,
      pmcName: formData.pmcName,
      pmcNumber: formData.pmcNumber,
      oemTag: formData.oemTag,
      oemName: formData.oemName,
      oemNumber: formData.oemNumber,
      salesmen:selectedSalesmen
    }
    try {
      const response = await axios.post("/api/v1/customer/create", data, { headers: { "Content-Type": "application/json" } });
      console.log(response);
      parentCallback(true);
      setIsOpen(false);
    }
    catch (e) {
      toast.error(e.response.data.message);
      setIsDisabled(false);
    }

  }
  
  
  
  
  const ArchitectFormHandler = (e) => {
    setFormData({ ...formData, architectTag: e.value, architectName: e.label.split('-')[0], architectNumber: e.label.split('-')[1] })
  }

  const MistryFormHandler = (e) => {
    console.log(e.value);
    setFormData({ ...formData, mistryTag: e.value, mistryName: e.label.split('-')[0], mistryNumber: e.label.split('-')[1] })
  }

  const DealerFormHandler = (e) => {
    console.log(e.value);
    setFormData({ ...formData, dealerTag: e.value, dealerName: e.label.split('-')[0], dealerNumber: e.label.split('-')[1] })
  }

  const PMCFormHandler = (e) => {
    console.log(e.value);
    setFormData({ ...formData, pmcTag: e.value, pmcName: e.label.split('-')[0], pmcNumber: e.label.split('-')[1] })
  }

  const OEMFormHandler = (e) => {
    console.log(e.value);
    setFormData({ ...formData, oemTag: e.value, oemName: e.label.split('-')[0], oemNumber: e.label.split('-')[1] })
  }

  const requirementHandler = (e) => {
    const value = e.target.value;
    const requirementArray = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setFormData({ ...formData, requirement: requirementArray });
  }

  const Salesmenchangehandler = (selecteds) => {

    setselectedSalesmen(selecteds);
    console.log(selecteds);
    setFormData({ ...formData, selectedSalesmen })
  };

  return (
    <div className={Styles.container}>
      
      <div className={Styles.closebutton} onClick={modalHandler}>
        <AiFillCloseCircle />
      </div>

      <h1 className={Styles.heading}>Personal Details</h1>

      <div className={Styles.personalDetails}>

        <div className={Styles.personalDetails1}>

          <label htmlFor='name'>Customer Name</label>
          <input className={Styles.inputTag} name="name" value={formData.name} onChange={(e) => formHandler(e)} placeholder='Customer Name' />

          <label htmlFor='number'>Mobile Number</label>
          <input className={Styles.inputTag} name="mobileno" value={formData.mobileno} onChange={(e) => formHandler(e)} placeholder='Mobile Number' />

          <label htmlFor='number'>Email</label>
          <input className={Styles.inputTag} name="email" value={formData.email} onChange={(e) => formHandler(e)} placeholder='Email' />

          <label htmlFor='address'>Address</label>
          <input className={Styles.inputTag} name="address" value={formData.address} onChange={(e) => formHandler(e)} placeholder='Address' />

          <label htmlFor='area'>Area</label>
          <input className={Styles.inputTag} name="area" value={formData.area} onChange={(e) => formHandler(e)} placeholder='area' />

          <label htmlFor='rewardpoints'>Reward Points</label>
          <input className={Styles.inputTag} name="rewardPoints" value={formData.rewardPoints} onChange={(e) => formHandler(e)} placeholder='Reward Points' />

          <label>Scale</label>
          <Select selectedValue={formData.scale} onChange={(e) => Scalehandler(e)} options={scale} />

          <label htmlFor='name'>Remarks</label>
          <input className={Styles.inputTag} name="remarks" value={formData.remarks} onChange={(e) => formHandler(e)} placeholder='Remarks' />
        </div>

        <div className={Styles.personalDetails2}>

          <label htmlFor='name'>Created At</label>
          <input className={Styles.inputTag} type="date" name="date" value={formData.date} onChange={(e) => formHandler(e)} placeholder='Created At' />

          <label htmlFor='name'>Followup Date</label>
          <input className={Styles.inputTag} type="date" name="followupdate" value={formData.followupdate} onChange={(e) => formHandler(e)} placeholder='Followup Date' />

          <label htmlFor='requirement'>Requirement (comma separated)</label>
          <input className={Styles.inputTag} name="requirement" value={formData.requirement.join(', ')} onChange={(e) => requirementHandler(e)} placeholder='e.g. Tiles, Sanitary, Bath Fittings' />

          <label htmlFor='name'>Birth Date</label>
          <input className={Styles.inputTag} type="date" name="birthdate" value={formData.birthdate} onChange={(e) => formHandler(e)} placeholder='Birthdate' />

          <label htmlFor='name'>Annivarsary</label>
          <input className={Styles.inputTag} type="date" name="marriagedate" value={formData.marriagedate} onChange={(e) => formHandler(e)} placeholder='Annivarsary' />

          {/* <label htmlFor='name'>Sales Person</label>
          <input className={Styles.inputTag} name="salesPerson" value={formData.salesPerson} onChange={(e) => formHandler(e)} placeholder='Sales Person' /> */}
        </div>
        
        <div className={Styles.personalDetails3}>
          <label>Salesmen</label>
          <ReactSelect className={Styles.inputTag}
            options={Salesmen}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            components={{
              Option
            }}
            onChange={Salesmenchangehandler}
            allowSelectAll={true}
            value={selectedSalesmen}
          />
        </div>
      </div>

      {user.role == "admin" &&   <div className={Styles.bankDetails}>
        <div className={Styles.bankDetails1}>

          <label htmlFor='name'>Mistry Tag</label>
          <Select selectedValue={formData.mistryTag} onChange={(e) => MistryFormHandler(e)} options={Mistries} />

          <label htmlFor='name'>Architect Tag</label>
          <Select selectedValue={formData.architectTag} onChange={(e) => ArchitectFormHandler(e)} options={architects} />

          <label htmlFor='name'>PMC Tag</label>
          <Select selectedValue={formData.pmcTag} onChange={(e) => PMCFormHandler(e)} options={PMCs} />
        </div>

        <div className={Styles.bankDetails2}>

          <label htmlFor='name'>Dealer Tag</label>
          <Select selectedValue={formData.dealerTag} onChange={(e) => DealerFormHandler(e)} options={Dealers} />

          <label htmlFor='name'>OEM Tag</label>
          <Select selectedValue={formData.oemTag} onChange={(e) => OEMFormHandler(e)} options={OEMs} />
        </div>
      </div>}
      <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={(e) => submitHandler(e)} type="submit">Submit</button>
     
    </div>
  )
}

export default CustomerCreateForm