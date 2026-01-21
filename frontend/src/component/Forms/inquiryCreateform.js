import React, { useState, useEffect } from 'react'
import { AiFillCloseCircle, AiFillCustomerService } from 'react-icons/ai'
import { toast, ToastContainer } from 'react-toastify'
import Styles from './CustomerCreateForm.module.css'
import axios from 'axios'
import Select from 'react-select'
import { default as ReactSelect } from "react-select";
import Option from '../DropDown/Options'
import { useSelector } from 'react-redux'
const InquiryCreateForm = ({ modalHandler, setIsOpen, parentCallback }) => {
  const [architects, setArchitects] = useState([]);
  const [Mistries, setMistries] = useState([]);
  const [Dealers, setDealers] = useState([]);
  const [PMCs, setPMCs] = useState([]);
  const [OEMs, setOEMs] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [Salesmen, setSalesmen] = useState([]);
  const [selectedSalesmen, setselectedSalesmen] = useState([]);
  let initialState = {
    name: "",
    email: "",
    mobileno: "",
    address: "",
    area: "",
    birthdate: "",
    marriagedate: "",
    rewardPoints: "",
    architectTag: null,
    architectName: "",
    architectNumber: "",
    requirement:"",
    stage:"",
    scale: "N/A",
    pmcTag: null,
    pmcName: "",
    pmcNumber: "",
    oemTag: null,
    oemName: "",
    oemNumber: "",
    date: "",
    followupdate: "",
    salesmen: [],
    remarks:""
  }
  // ["Plywood", "Laminate","Veneer","Other","Hardware"]
  const requirement = [
    {
      requirement:"Plywood",
      value: "Plywood",
      label:"Plywood"
    },
    {
      requirement:'Laminate',
      value: "Laminate",
      label:"Laminate"
    },
    {
      requirement:'Veneer',
      value: "Veneer",
      label:"Veneer"
    },
    {
      requirement:'Other',
      value: "Other",
      label:"Other"
    },
    {
      requirement:'Hardware',
      value: "Hardware",
      label:"Hardware"
    },
    {
        requirement:'P',
        value: "P",
        label:"P"
    },
    {
        requirement:'V',
        value: "V",
        label:"V"
    },
    {
        requirement:'L',
        value: "L",
        label:"L"
    },
    {
        requirement:'K',
        value: "K",
        label:"K"
    },
    {
        requirement:'W',
        value: "W",
        label:"W"
    },
    {
        requirement:'FD',
        value: "FD",
        label:"FD"
    },
    {
        requirement:'WP',
        value: "WP",
        label:"WP"
    },
    {
        requirement:'C',
        value: "C",
        label:"C"
    },
    {
        requirement:'HI',
        value: "HI",
        label:"HI"
    },

  ]
  const stage = [
    {
      value: "Process",
      label:"Process"
    },
    {
      value: "Qualified",
      label:"Qualified"
    },
    {
      value: "Unqualified",
      label:"Unqualified"
    },

  ]
  const scale = [
    {
      value: "N/A",
      label:"N/A"
    },
    {
      value: "High",
      label:"High"
    },
    {
      value: "Medium",
      label:"Medium"
    },
    {
      value: "Low",
      label:"Low"
    },
  ]
  const [formData, setFormData] = useState(initialState)
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const isAdmin = user?.role === "admin";
  const formHandler = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value })
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

  const checkDuplicateInquiry = async (mobileno) => {
    try {
      const { data } = await axios.get("/api/v1/inquiry/getall");
      const isDuplicate = data.inquiries.some((inquiry) => inquiry.mobileno === mobileno);
      return isDuplicate;
    } catch (error) {
      console.error("Error checking duplicate inquiry:", error);
      return false;
    }
  };

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

    // Check for duplicate mobile number
    if (formData.mobileno.trim() === "") {
      toast.error("Mobile number is required");
      setIsDisabled(false);
      return;
    }

    const isDuplicate = await checkDuplicateInquiry(formData.mobileno);
    if (isDuplicate) {
      toast.error("An inquiry with this mobile number already exists. You cannot create duplicate inquiries.");
      setIsDisabled(false);
      return;
    }
    let data = {
      name: formData.name,
      email: formData.email,
      mobileno: formData.mobileno,
      address: formData.address,
      area: formData.area,
      birthdate: formData.birthdate,
      marriagedate: formData.marriagedate,
      rewardPoints: isAdmin ? formData.rewardPoints : 0,
      date: formData.date,
      dealerTag:formData.dealerTag,
      dealerNumber:formData.dealerNumber,
      dealerName:formData.dealerName,
      mistryTag: formData.mistryTag,
      mistryName:formData.mistryName,
      mistryNumber:formData.mistryNumber,
      followupdate: formData.followupdate,
      architectTag: formData.architectTag,
      architectNumber: formData.architectNumber,
      architectName: formData.architectName,
      pmcTag: formData.pmcTag,
      pmcName: formData.pmcName,
      pmcNumber: formData.pmcNumber,
      oemTag: formData.oemTag,
      oemName: formData.oemName,
      oemNumber: formData.oemNumber,
      requirement: selectedRequirement,
      stage:formData.stage,
      scale:formData.scale,
      salesmen: selectedSalesmen,
      remarks:formData.remarks
    }
    console.log(data);
    try {
      const response = await axios.post("/api/v1/inquiry/create", data, { headers: { "Content-Type": "application/json" } });
      console.log(response);
      
      if (response.data.movedToCustomer) {
        toast.success("Qualified inquiry created as Customer!");
      } else {
        toast.success("Inquiry created successfully");
      }
      
      parentCallback(true);
      setIsOpen(false);
    }
    catch (e) {
      toast.error(e.response.data.message);
      setIsDisabled(false);
    }

  }






  const RequirementsChangeHandler = (selected) => {
    setSelectedRequirement(selected);
    setFormData({...formData, selectedRequirement})
  }
  const ArchitectFormHandler = (e) => {
    setFormData({ ...formData, architectTag: e.value, architectName: e.label.split('-')[0], architectNumber: e.label.split('-')[1] })
  }
  const Requirehandler = (e) => {
    setFormData({ ...formData, requirement: e.value })
  }
  const Stagehandler = (e) => {
    setFormData({ ...formData, stage: e.value })
  }
  const Scalehandler = (e) => {
    setFormData({ ...formData, scale: e.value })
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

          <label htmlFor='name'>Inquiry Name</label>
          <input className={Styles.inputTag} name="name" value={formData.name} onChange={(e) => formHandler(e)} placeholder='Inquiry Name' />

          <label htmlFor='number'>Mobile Number</label>
          <input className={Styles.inputTag} name="mobileno" value={formData.mobileno} onChange={(e) => formHandler(e)} placeholder='Mobile Number' />

          <label htmlFor='number'>Email</label>
          <input className={Styles.inputTag} name="email" value={formData.email} onChange={(e) => formHandler(e)} placeholder='Email' />

          <label htmlFor='address'>Address</label>
          <input className={Styles.inputTag} name="address" value={formData.address} onChange={(e) => formHandler(e)} placeholder='Address' />

          <label htmlFor='area'>Area</label>
          <input className={Styles.inputTag} name="area" value={formData.area} onChange={(e) => formHandler(e)} placeholder='Area' />

          <label htmlFor='rewardpoints'>Reward Points</label>
          <input className={Styles.inputTag} name="rewardPoints" value={formData.rewardPoints} onChange={(e) => formHandler(e)} placeholder='Reward Points' disabled={!isAdmin} />

          <label htmlFor='name'>Remarks</label>
          <input className={Styles.inputTag} name="remarks" value={formData.remarks} onChange={(e) => formHandler(e)} placeholder='Remarks' /> 
        </div>

        <div className={Styles.personalDetails2}>

          <label htmlFor='name'>Created At</label>
          <input className={Styles.inputTag} type="date" name="date" value={formData.date} onChange={(e) => formHandler(e)} placeholder='Created At' />

          <label htmlFor='name'>Follow up Date</label>
          <input className={Styles.inputTag} type="date" name="followupdate" value={formData.followupdate} onChange={(e) => formHandler(e)} placeholder='Follow up Date' />

          <label htmlFor='birthdate'>Birth Date</label>
          <input className={Styles.inputTag} type="date" name="birthdate" value={formData.birthdate} onChange={(e) => formHandler(e)} placeholder='Birth Date' />

          <label htmlFor='marriagedate'>Anniversary</label>
          <input className={Styles.inputTag} type="date" name="marriagedate" value={formData.marriagedate} onChange={(e) => formHandler(e)} placeholder='Anniversary' />
          <label>Requirements</label>
          {/* <Select selectedValue={formData.requirement} onChange={(e) => Requirehandler(e)} options={ requirement} /> */}
          <ReactSelect className={Styles.inputTag}
            options={requirement}
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false} 
            components={{
              Option
            }}
            onChange={RequirementsChangeHandler}
            allowSelectAll={true}
            value={selectedRequirement}
          />


          <label>Stage</label>
          <Select selectedValue={formData.stage} onChange={(e) => Stagehandler(e)} options={ stage} />
          <label>Scale</label>
          <Select selectedValue={formData.scale} onChange={(e) => Scalehandler(e)} options={ scale} />
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

      <div className={Styles.bankDetails}>
        <div className={Styles.bankDetails1}>

           <label htmlFor='name'>Mistry Tag</label>
          <Select selectedValue={formData.mistryTag} onChange={(e) => MistryFormHandler(e)} options={Mistries} /> 

          <label htmlFor='name'>Architect Tag</label>
          <Select selectedValue={formData.architectTag} onChange={(e) => ArchitectFormHandler(e)} options={architects} />

          <label htmlFor='name'>Dealer Tag</label>
          <Select selectedValue={formData.dealerTag} onChange={(e) => DealerFormHandler(e)} options={Dealers} />
        </div>

        <div className={Styles.bankDetails2}>

          <label htmlFor='name'>PMC Tag</label>
          <Select selectedValue={formData.pmcTag} onChange={(e) => PMCFormHandler(e)} options={PMCs} />

          <label htmlFor='name'>OEM Tag</label>
          <Select selectedValue={formData.oemTag} onChange={(e) => OEMFormHandler(e)} options={OEMs} />
        </div>
      </div>
      <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={(e) => submitHandler(e)} type="Submit">Submit</button>
    </div>
  )
}

export default InquiryCreateForm