import React, { useState, useEffect } from 'react'
import Styles from './ArchitectCreateForm.module.css'
import { AiFillCloseCircle } from 'react-icons/ai'
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify'
import Select from 'react-select'
import { default as ReactSelect } from "react-select";
import Option from '../DropDown/Options'

const ArchitectCreateForm = ({ modalHandler, setIsOpen, parentCallback }) => {
  let initialState = {
    name: "",
    email: "",
    mobileno: "",
    address: "",
    area:"",
    grade: "",
    companyName: "",
    birthdate: "",
    marriagedate: "",
    remarks: "",
    bankname: "",
    branchname: "",
    adharcard: "",
    pancard: "",
    date: "",
    // salesMan: "",
    salesmen: []

  }
  const [formData, setFormData] = useState(initialState)
  const [isDisabled, setIsDisabled] = useState(false);
  const [Salesmen, setSalesmen] = useState([]);
  const [selectedSalesmen, setselectedSalesmen] = useState([]);
  const getAllsalesmen = async () => {
    const { data } = await axios.get("/api/v1/salesman/getall");
    console.log(data.Salesmans);
    const salesmen = data.salesmans.map((salesman) => (
      {
        name: salesman.name,
        value: salesman.name,
        label: salesman.name
      }
    ))
    setSalesmen(salesmen);
  }
  const formHandler = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  useEffect(() => {
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
      grade: formData.grade || null,
      companyName: formData.companyName,
      birthdate: formData.birthdate,
      marriagedate: formData.marriagedate,
      remarks: formData.remarks,
      bankname: formData.bankname,
      branchname: formData.branchname,
      adharcard: formData.adharcard,
      pancard: formData.pancard,
      date: formData.date,
      IFSCcode: formData.IFSCcode,
      // salesMan: formData.salesMan,
      salesmen: selectedSalesmen

    }
    console.log(data)
    try {
      const response = await axios.post("/api/v1/architect/create", data, { headers: { "Content-Type": "application/json" } });
      console.log(response);

      parentCallback(true);
      setIsOpen(false);

    }
    catch (e) {
      toast.error(e.response.data.message);
      console.log(e.response.data.message)
      setIsDisabled(false);
    }

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
      <h1 className={Styles.heading}>Architect Details</h1>
      <div className={Styles.personalDetails}>

        <div className={Styles.personalDetails1}>

          <label htmlFor='name'>Name</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.name} name="name" placeholder='Architect Name' />

          <label htmlFor='mobileno'>Mobile Number</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.mobileno} name="mobileno" placeholder='Mobile Number' />

          <label htmlFor='email'>Email</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.email} name="email" placeholder='email' />

          <label htmlFor='AddressLine1'>Address</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.address} name="address" placeholder='address' />

          <label htmlFor='area'>Area</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.area} name="area" placeholder='area' />

          <label htmlFor='grade'>Grade</label>
          <select className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.grade} name="grade">
            <option value="">Select Grade</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>

          <label htmlFor='AddressLine1'>Remarks</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.remarks} name="remarks" placeholder='Remarks' />
        </div>

        <div className={Styles.personalDetails2}>

          <label htmlFor='date'>Date</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.date} name="date" type="date" placeholder='Created At' />

          <label htmlFor='birthdate'>Birth Date</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.birthdate} name="birthdate" type="date" placeholder='Birthdate' />

          <label htmlFor='marrieagedate'>Marriage Date</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.marrieagedate} name="marriagedate" type="date" placeholder='Annivarsary' />

          <label htmlFor='companyName'>Company Name</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.companyName} name="companyName" placeholder='Company Name' />
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

      <h1 className={Styles.heading}>Bank Details</h1>
      <div className={Styles.bankDetails}>

        <div className={Styles.bankDetails1}>
          <label htmlFor='bankname'>Bank Name</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.bankname} name="bankname" placeholder='Bank Name' />

          <label htmlFor='branchname'>Branch Name</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.branchname} name="branchname" placeholder='Branch Name' />

          <label htmlFor='IFSCCode'>IFSC Code</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.IFSCcode} name="IFSCcode" placeholder='IFSC Code' />
        </div>

        <div className={Styles.bankDetails2}>
          <label htmlFor='adharcard'>Adhar Card</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.adharcard} name="adharcard" placeholder='Adhar Card' />

          <label htmlFor='pancard'>Pan Card</label>
          <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.pancard} name="pancard" placeholder='Pan Card' />
        </div>
      </div>

      <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={submitHandler} type="Submit">Submit</button>
    </div>
  )
}

export default ArchitectCreateForm