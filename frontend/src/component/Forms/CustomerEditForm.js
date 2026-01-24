import React, { useState, useEffect } from 'react'
import { AiFillCloseCircle } from 'react-icons/ai'
import { toast, ToastContainer } from 'react-toastify'
import Styles from './CustomerCreateForm.module.css'
import axios from 'axios'
import Option from '../DropDown/Options'
import Select from 'react-select'
import { default as ReactSelect } from "react-select";
import { useSelector } from 'react-redux'
const CustomerEditForm = ({ modalHandler, data, setIsOpen, parentCallback }) => {
  const [architects, setArchitects] = useState([]);
  const [defalutArchitect, setDefaultArchitect] = useState(() => data.architectTag ? { value: data.architectTag, label: `${data.architectName}-${data.architectNumber}` } : "");
  const [defaultMistry, setDefaultMistry] = useState(() => data.mistryTag ? { value: data.mistryTag, label: `${data.mistryName}-${data.mistryNumber}` } : "");
  const [defaultDealer, setDefaultDealer] = useState(() => data.dealerTag ? { value: data.dealerTag, label: `${data.dealerName}-${data.dealerNumber}` } : "");
  const [deafultPMC, setDefaultPMC] = useState(() => data.pmcTag ? { value: data.pmcTag, label: `${data.pmcName}-${data.pmcNumber}` } : "");
  const [defaultOEM, setDefaultOEM] = useState(() => data.oemTag ? { value: data.oemTag, label: `${data.oemName}-${data.oemNumber}` } : "");
  const [Mistries, setMistries] = useState([]);
  const [Dealers, setDealers] = useState([]);
  const [PMCs, setPMCs] = useState([]);
  const [OEMs, setOEMs] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.user);
  let id = data._id
  let initialState = {
    name: data.name,
    email: data.email,
    mobileno: data.mobileno,
    address: data.address,
    area:data.area,
    remarks: data.remarks,
    rewardPoints: data.rewardPoints,
    scale: data.scale || "Medium",
    salesPerson: data.salesPerson,
    mistryTag: data.mistryTag,
    mistryName: data.mistryName,
    mistryNumber: data.mistryNumber,
    architectTag: data.architectTag,
    architectName: data.architectName,
    architectNumber: data.architectNumber,
    dealerTag: data.dealerTag,
    dealerName: data.dealerName,
    dealerNumber: data.dealerNumber,
    pmcTag: data.pmcTag,
    pmcName: data.pmcName,
    pmcNumber: data.pmcNumber,
    oemTag: data.oemTag,
    oemName: data.oemName,
    oemNumber: data.oemNumber,
    birthdate: data.birthdate ? data.birthdate.substr(0, 10) : null,
    marriagedate: data.marriagedate ? data.marriagedate.substr(0, 10) : null,
    date: data.date ? data.date.substr(0, 10) : null,
    followupdate: data.followupdate ? data.followupdate.substr(0, 10) : null,
    requirement: data.requirement ? data.requirement.map(r => typeof r === 'object' ? r.requirement : r) : [],


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


  const submitHandler = async (e) => {
    e.preventDefault();
    setIsDisabled(true);
    let data1 = {
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
      requirement: formData.requirement.map(r => ({ requirement: r })),
      rewardPoints: formData.rewardPoints,
      scale: formData.scale,
      salesPerson: formData.salesPerson,
      mistryTag: formData.mistryTag,
      mistryName: formData.mistryName,
      mistryNumber: formData.mistryNumber,
      architectTag: formData.architectTag,
      architectName: formData.architectName,
      architectNumber: formData.architectNumber,
      dealerTag: formData.dealerTag,
      dealerName: formData.dealerName,
      dealerNumber: formData.dealerNumber,
      pmcTag: formData.pmcTag,
      pmcName: formData.pmcName,
      pmcNumber: formData.pmcNumber,
      oemTag: formData.oemTag,
      oemName: formData.oemName,
      oemNumber: formData.oemNumber,


    }

    try {
      const response = await axios.put(`/api/v1/customer/update/${id}`, data1, { headers: { "Content-Type": "application/json" } });
      // toast.success("customer is edited");
      parentCallback();
      setIsOpen(false);
    }
    catch (e) {
      console.log("<++++++failed")
      console.log(e.response.data.message)
      setIsDisabled(false);
    }

  }

  const getAllArchitects = async () => {
    const { data } = await axios.get("/api/v1/architect/getall");
    const architects = data.architects.map((arch) => ({ value: arch._id, label: `${arch.name}-${arch.mobileno}` }))
    setArchitects(architects);
  }

  const getAllMistry = async () => {
    const { data } = await axios.get("/api/v1/mistry/getall");

    const mistries = data.mistries.map((mistry) => ({ value: mistry._id, label: `${mistry.name}-${mistry.mobileno}` }))
    console.log(mistries);
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
    console.log(`Default Architect: `, defalutArchitect);
    getAllArchitects();
    getAllDealer();
    getAllMistry();
    getAllPMC();
    getAllOEM();
  }, []);


  const ArchitectFormHandler = (e) => {
    setFormData({ ...formData, architectTag: e.value, architectName: e.label.split('-')[0], architectNumber: e.label.split('-')[1] })
  }

  const MistryFormHandler = (e) => {
    console.log(e.label, e.label.split('-'));
    setFormData({ ...formData, mistryTag: e.value, mistryName: e.label.split('-')[0], mistryNumber: e.label.split('-')[1] })
  }

  const DealerFormHandler = (e) => {
    setFormData({ ...formData, dealerTag: e.value, dealerName: e.label.split('-')[0], dealerNumber: e.label.split('-')[1] })
  }

  const PMCFormHandler = (e) => {
    setFormData({ ...formData, pmcTag: e.value, pmcName: e.label.split('-')[0], pmcNumber: e.label.split('-')[1] })
  }

  const OEMFormHandler = (e) => {
    setFormData({ ...formData, oemTag: e.value, oemName: e.label.split('-')[0], oemNumber: e.label.split('-')[1] })
  }

  const requirementHandler = (e) => {
    const value = e.target.value;
    const requirementArray = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setFormData({ ...formData, requirement: requirementArray });
  }
  return (
    <div className={Styles.container}>
      {/* <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover/> */}

      <div className={Styles.closebutton} onClick={modalHandler}>
        <AiFillCloseCircle />
      </div>

      <h1 className={Styles.heading}>Personal Details</h1>

      <div className={Styles.personalDetails}>

        <div className={Styles.personalDetails1}>

          <label htmlFor='name'>Customer Name</label>
          <input className={Styles.inputTag} name="name" value={formData.name} onChange={(e) => formHandler(e)} placeholder='Customer Name' disabled={user.role !== "admin"} />

          <label htmlFor='number'>Mobile Number</label>
          <input className={Styles.inputTag} name="mobileno" value={formData.mobileno} onChange={(e) => formHandler(e)} placeholder='Mobile Number' disabled={user.role !== "admin"} />

          <label htmlFor='number'>Email</label>
          <input className={Styles.inputTag} name="email" value={formData.email} onChange={(e) => formHandler(e)} placeholder='Email' disabled={user.role !== "admin"} />

          <label htmlFor='address'>Address</label>
          <input className={Styles.inputTag} name="address" value={formData.address} onChange={(e) => formHandler(e)} placeholder='Address' disabled={user.role !== "admin"} />

          <label htmlFor='area'>area</label>
          <input className={Styles.inputTag} name="area" value={formData.area} onChange={(e) => formHandler(e)} placeholder='area' disabled={user.role !== "admin"} />


          <label htmlFor='rewardpoints'>Reward Points</label>
          <input className={Styles.inputTag} name="rewardPoints" value={formData.rewardPoints} onChange={(e) => formHandler(e)} placeholder='Reward Points' disabled={user.role !== "admin"} />

          <label>Scale</label>
          <Select selectedValue={formData.scale} onChange={(e) => Scalehandler(e)} options={scale} defaultInputValue={initialState.scale} isDisabled={user.role !== "admin"} />

          <label htmlFor='name'>Remarks</label>
          <input className={Styles.inputTag} name="remarks" value={formData.remarks} onChange={(e) => formHandler(e)} placeholder='Remarks' />
        </div>

        <div className={Styles.personalDetails2}>

          <label htmlFor='name'>Created At</label>
          <input className={Styles.inputTag} type="date" name="date" value={formData.date} onChange={(e) => formHandler(e)} placeholder='Created At' disabled={user.role !== "admin"} />

          <label htmlFor='name'>Followup Date</label>
          <input className={Styles.inputTag} type="date" name="followupdate" value={formData.followupdate} onChange={(e) => formHandler(e)} placeholder='Followup Date' disabled={user.role !== "admin"} />

          <label htmlFor='requirement'>Requirement (comma separated)</label>
          <input className={Styles.inputTag} name="requirement" value={formData.requirement.join(', ')} onChange={(e) => requirementHandler(e)} placeholder='e.g. Tiles, Sanitary, Bath Fittings' disabled={user.role !== "admin"} />

          <label htmlFor='name'>Birth Date</label>
          <input className={Styles.inputTag} type="date" name="birthdate" value={formData.birthdate} onChange={(e) => formHandler(e)} placeholder='Birthdate' disabled={user.role !== "admin"} />

          <label htmlFor='name'>Annivarsary</label>
          <input className={Styles.inputTag} type="date" name="marriagedate" value={formData.marriagedate} onChange={(e) => formHandler(e)} placeholder='Annivarsary' disabled={user.role !== "admin"} />
        </div>
      </div>

      {user.role =="admin" && <div className={Styles.bankDetails}>
        <div className={Styles.bankDetails1}>

          <label htmlFor='name'>Mistry Tag</label>
          <Select defaultValue={defaultMistry} onChange={(e) => MistryFormHandler(e)} options={Mistries} />

          <label htmlFor='name'>Architect Tag</label>
          <Select defaultValue={defalutArchitect} onChange={(e) => ArchitectFormHandler(e)} options={architects} />

          <label htmlFor='name'>PMC Tag</label>
          <Select defaultValue={deafultPMC} onChange={(e) => PMCFormHandler(e)} options={PMCs} />
        </div>

        <div className={Styles.bankDetails2}>

          <label htmlFor='name'>Dealer Tag</label>
          <Select defaultValue={defaultDealer} onChange={(e) => DealerFormHandler(e)} options={Dealers} />

          <label htmlFor='name'>OEM Tag</label>
          <Select defaultValue={defaultOEM} onChange={(e) => OEMFormHandler(e)} options={OEMs} />
        </div>
      </div>}
      <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={(e) => submitHandler(e)} type="Submit">Submit</button>
    </div>
  )
}

export default CustomerEditForm