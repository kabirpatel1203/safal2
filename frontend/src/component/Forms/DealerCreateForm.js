import React, { useState, useEffect } from 'react'
import Styles from './ArchitectCreateForm.module.css'
import axios from "axios"
import { AiFillCloseCircle } from 'react-icons/ai'
import { toast, ToastContainer } from 'react-toastify'
import Select from 'react-select'
import { default as ReactSelect } from "react-select";
import Option from '../DropDown/Options'

const DealerCreateForm = ({ modalHandler, setIsOpen, parentCallback }) => {
    let initialState = {
        name: "",
        email: "",
        mobileno: "",
        address: "",
        area:"",
        grade: "",
        L: "",
        SS: [],
        companyName: "",
        birthdate: "",
        marriagedate: "",
        remarks: "",
        date: "",
        // salesMan: "",
    }

    useEffect(() => {
    }, []);
    const [formData, setFormData] = useState(initialState)
    const [isDisabled, setIsDisabled] = useState(false);
    const [selectedSS, setSelectedSS] = useState([]);
    const SSOptions = [
        { value: 'Display', label: 'Display' },
        { value: 'Photo', label: 'Photo' },
        { value: 'Sample', label: 'Sample' }
    ];
    const SSchangehandler = (selected) => {
        setSelectedSS(selected);
    };
    const formHandler = (e) => {
        e.preventDefault();
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

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
            L: formData.L ? Number(formData.L) : null,
            SS: selectedSS.map(item => item.value),
            companyName: formData.companyName,
            birthdate: formData.birthdate,
            marriagedate: formData.marriagedate,
            remarks: formData.remarks,
            date: formData.date,
            // salesMan: formData.salesMan,

        }
        try {
            const response = await axios.post("/api/v1/dealer/create", data, { headers: { "Content-Type": "application/json" } });

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
    return (
        <div className={Styles.container}>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <div className={Styles.closebutton} onClick={modalHandler}>
                <AiFillCloseCircle />
            </div>
            <h1 className={Styles.heading}>Dealer Details</h1>
            <div className={Styles.personalDetails}>

                <div className={Styles.personalDetails1}>

                    <label htmlFor='name'>Dealer name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.name} name="name" placeholder='Dealer Name' />

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

                    {/* Display Size removed for Dealer */}

                    <label htmlFor='L'>L</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.L} name="L" type="number" placeholder='L (numbers only)' />

                    <label htmlFor='SS'>Passing</label>
                    <ReactSelect className={Styles.inputTag}
                        options={SSOptions}
                        isMulti
                        closeMenuOnSelect={false}
                        hideSelectedOptions={false}
                        components={{
                            Option
                        }}
                        onChange={SSchangehandler}
                        allowSelectAll={true}
                        value={selectedSS}
                    />

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

                    <label htmlFor='companyName'>Contact Person</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.companyName} name="companyName" placeholder='Contact Person' />
                    {/* 
                    <label htmlFor='salesMan'>Sales Man </label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.salesMan} name="salesMan" placeholder='Company Name' /> */}
                </div>
            </div>

            {/* Bank details removed for Dealer */}

            <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={submitHandler} type="Submit">Submit</button>
        </div>
    )
}

export default DealerCreateForm