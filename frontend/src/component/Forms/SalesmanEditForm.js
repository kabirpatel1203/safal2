import React, { useState, useEffect } from 'react'
import Styles from './DealerCreateForm.module.css'
import { AiFillCloseCircle } from 'react-icons/ai'
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify'
import Option from '../DropDown/Options'
import Select from 'react-select'
import { default as ReactSelect } from "react-select";

const SalesmanEditForm = ({ modalHandler, data, setIsOpen, parentCallback }) => {
    console.log(data);
    const [defaultArchitect, setDefaultArchitect] = useState(() => data.architectTag ? { value: data.architectTag, label: `${data.architectName}-${data.architectNumber}` } : "");
    const [defaultMistry, setDefaultMistry] = useState(() => data.mistryTag ? { value: data.mistryTag, label: `${data.mistryName}-${data.mistryNumber}` } : "");
    const [defaultDealer, setDefaultDealer] = useState(() => data.dealerTag ? { value: data.dealerTag, label: `${data.dealerName}-${data.dealerNumber}` } : "");
    const [defaultPMC, setDefaultPMC] = useState(() => data.pmcTag ? { value: data.pmcTag, label: `${data.pmcName}-${data.pmcNumber}` } : "");
    const [defaultOEM, setDefaultOEM] = useState(() => data.oemTag ? { value: data.oemTag, label: `${data.oemName}-${data.oemNumber}` } : "");

    let initialState = {
        name: data.name,
        email: data.email,
        mobileno: data.mobileno,
        address: data.address,
        companyName: data.companyName,
        birthdate: data.birthdate,
        remarks: data.remarks,
        marriagedate: data.marriagedate,
        date: data.date ? data.date.substr(0, 10) : null,
        architectTag: data.architectTag,
        architectName: data.architectName,
        architectNumber: data.architectNumber,
        mistryTag: data.mistryTag,
        mistryName: data.mistryName,
        mistryNumber: data.mistryNumber,
        dealerTag: data.dealerTag,
        dealerName: data.dealerName,
        dealerNumber: data.dealerNumber,
        pmcTag: data.pmcTag,
        pmcName: data.pmcName,
        pmcNumber: data.pmcNumber,
        oemTag: data.oemTag,
        oemName: data.oemName,
        oemNumber: data.oemNumber
    }
    let id = data._id;
    const [formData, setFormData] = useState(initialState)
    const [isDisabled, setIsDisabled] = useState(false);
// console.log(formData);
    const formHandler = (e) => {
        e.preventDefault();
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    useEffect(() => {
        getAllArchitects();
        getAllMistry();
        getAllDealer();
        getAllPMC();
        getAllOEM();
        console.log(data);
    }, []);
    const submitHandler = async (e) => {
        e.preventDefault();
        setIsDisabled(true);
        let data = {
            name: formData.name,
            email: formData.email,
            mobileno: formData.mobileno,
            address: formData.address,
            date: formData.date,
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
        console.log(data)
        try {
            const response = await axios.put(`/api/v1/salesman/update/${id}`, data, { headers: { "Content-Type": "application/json" } });
            console.log(response);

            parentCallback();
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
    const Requirehandler = (e) => {
        setFormData({ ...formData, requirement: e.value })
    }
    const Stagehandler = (e) => {
        setFormData({ ...formData, stage: e.value })
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
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.name} name="name" placeholder='Dealer Name' />

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

                    {/* <label htmlFor='marrieagedate'>Marriage Date</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.marriagedate} name="marriagedate" type="date" placeholder='Annivarsary' /> */}

                    {/* <label htmlFor='companyName'>Company Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.companyName} name="companyName" placeholder='Company Name' /> */}
                    {/* <label htmlFor='salesMan'>Sales Man </label> */}}
                    {/* <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.salesMan} name="salesMan" placeholder='Company Name' /> */}
                </div>
            </div>

            <h1 className={Styles.heading}>Category Tags</h1>
            <div className={Styles.bankDetails}>
                <div className={Styles.bankDetails1}>
                    <label htmlFor='name'>Architect Tag</label>
                    <Select defaultValue={defaultArchitect} selectedValue={formData.architectTag} onChange={(e) => ArchitectFormHandler(e)} options={architects} />

                    <label htmlFor='name'>Mistry Tag</label>
                    <Select defaultValue={defaultMistry} selectedValue={formData.mistryTag} onChange={(e) => MistryFormHandler(e)} options={Mistries} />

                    <label htmlFor='name'>Dealer Tag</label>
                    <Select defaultValue={defaultDealer} selectedValue={formData.dealerTag} onChange={(e) => DealerFormHandler(e)} options={Dealers} />
                </div>

                <div className={Styles.bankDetails2}>
                    <label htmlFor='name'>PMC Tag</label>
                    <Select defaultValue={defaultPMC} selectedValue={formData.pmcTag} onChange={(e) => PMCFormHandler(e)} options={PMCs} />

                    <label htmlFor='name'>OEM Tag</label>
                    <Select defaultValue={defaultOEM} selectedValue={formData.oemTag} onChange={(e) => OEMFormHandler(e)} options={OEMs} />
                </div>
            </div>

            
            
            <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={submitHandler} type="Submit">Submit</button>
        </div>

    )
}

export default SalesmanEditForm