import React, { useState, useEffect } from 'react'
import Styles from './ArchitectCreateForm.module.css'
import axios from "axios"
import { AiFillCloseCircle } from 'react-icons/ai'
import { toast, ToastContainer } from 'react-toastify'
import Select from 'react-select'
import { default as ReactSelect } from "react-select";
import Option from '../DropDown/Options'

const SalesmanCreateForm = ({ modalHandler, setIsOpen, parentCallback }) => {
    let initialState = {
        name: "",
        email: "",
        mobileno: "",
        address: "",
        companyName: "",
        birthdate: "",
        marriagedate: "",
        remarks: "",
        bankname: "",
        branchname: "",
        IFSCcode: "",
        adharcard: "",
        pancard: "",
        date: "",
        architectTag: null,
        architectName: "",
        architectNumber: "",
        mistryTag: null,
        mistryName: "",
        mistryNumber: "",
        dealerTag: null,
        dealerName: "",
        dealerNumber: "",
        pmcTag: null,
        pmcName: "",
        pmcNumber: "",
        oemTag: null,
        oemName: "",
        oemNumber: ""
    }

    useEffect(() => {
        getAllArchitects();
        getAllMistry();
        getAllDealer();
        getAllPMC();
        getAllOEM();
    }, []);
    const [formData, setFormData] = useState(initialState)
    const [isDisabled, setIsDisabled] = useState(false);
    const [architects, setArchitects] = useState([]);
    const [Mistries, setMistries] = useState([]);
    const [Dealers, setDealers] = useState([]);
    const [PMCs, setPMCs] = useState([]);
    const [OEMs, setOEMs] = useState([]);
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
            architectTag: formData.architectTag,
            architectName: formData.architectName,
            architectNumber: formData.architectNumber,
            mistryTag: formData.mistryTag,
            mistryName: formData.mistryName,
            mistryNumber: formData.mistryNumber,
            dealerTag: formData.dealerTag,
            dealerName: formData.dealerName,
            dealerNumber: formData.dealerNumber,
            pmcTag: formData.pmcTag,
            pmcName: formData.pmcName,
            pmcNumber: formData.pmcNumber,
            oemTag: formData.oemTag,
            oemName: formData.oemName,
            oemNumber: formData.oemNumber
        }
        try {
            const response = await axios.post("/api/v1/salesman/create", data, { headers: { "Content-Type": "application/json" } });

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

    const ArchitectFormHandler = (e) => {
        setFormData({ ...formData, architectTag: e.value, architectName: e.label.split('-')[0], architectNumber: e.label.split('-')[1] })
    }

    const MistryFormHandler = (e) => {
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

    // const Salesmenchangehandler = (selecteds) => {

    //     setselectedSalesmen(selecteds);
    //     console.log(selecteds);
    //     setFormData({ ...formData, selectedSalesmen })
    // };
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
            <h1 className={Styles.heading}>SalesMan Details</h1>
            <div className={Styles.personalDetails}>

                <div className={Styles.personalDetails1}>

                    <label htmlFor='name'>Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.name} name="name" placeholder='Salesman Name' />

                    <label htmlFor='mobileno'>Mobile Number</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.mobileno} name="mobileno" placeholder='Mobile Number' />

                    <label htmlFor='email'>Email</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.email} name="email" placeholder='email' />

                    <label htmlFor='AddressLine1'>Address</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.address} name="address" placeholder='address' />

                    <label htmlFor='AddressLine1'>Remarks</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.remarks} name="remarks" placeholder='Remarks' />
                </div>

                <div className={Styles.personalDetails2}>

                    <label htmlFor='date'>Date</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.date} name="date" type="date" placeholder='Created At' />

                    <label htmlFor='birthdate'>Birth Date</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.birthdate} name="birthdate" type="date" placeholder='Birthdate' />

                    <label htmlFor='marrieagedate'>Marriage Date</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.marriagedate} name="marriagedate" type="date" placeholder='Annivarsary' />

                    {/* <label htmlFor='companyName'>Company Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.companyName} name="companyName" placeholder='Company Name' />
                    */}
                    {/* <label htmlFor='salesMan'>Sales Man </label> */}}
                    {/* <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.salesMan} name="salesMan" placeholder='Company Name' /> */}
                </div>
            </div>

            <h1 className={Styles.heading}>Category Tags</h1>
            <div className={Styles.bankDetails}>
                <div className={Styles.bankDetails1}>
                    <label htmlFor='name'>Architect Tag</label>
                    <Select selectedValue={formData.architectTag} onChange={(e) => ArchitectFormHandler(e)} options={architects} />

                    <label htmlFor='name'>Mistry Tag</label>
                    <Select selectedValue={formData.mistryTag} onChange={(e) => MistryFormHandler(e)} options={Mistries} />

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

            
            <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={submitHandler} type="Submit">Submit</button>
        </div>
    )
}

export default SalesmanCreateForm