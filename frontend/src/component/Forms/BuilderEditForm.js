import React, { useState, useEffect } from 'react'
import Styles from './OEMCreateForm.module.css'
import { AiFillCloseCircle } from 'react-icons/ai'
import axios from "axios"
import { toast } from 'react-toastify'
import Select from 'react-select';
import { useSelector } from 'react-redux'

const BuilderEditForm = ({ modalHandler, data, setIsOpen, parentCallback }) => {
    const { user } = useSelector((state) => state.user);
    let initialState = {
        name: data.name,
        email: data.email,
        mobileno: data.mobileno,
        address: data.address,
        area:data.area,
        grade: data.grade || '',
        companyName: data.companyName,
        birthdate: data.birthdate ? data.birthdate.substr(0, 10) : null,
        marriagedate: data.marriagedate ? data.marriagedate.substr(0, 10) : null,
        remarks: data.remarks,
        bankname: data.bankname,
        branchname: data.branchname,
        IFSCcode: data.IFSCcode,
        adharcard: data.adharcard,
        pancard: data.pancard,
        date: data.date ? (data.date.substr ? data.date.substr(0,10) : data.date) : null
    }
    let id = data._id;
    const [formData, setFormData] = useState(initialState)
    const [isDisabled, setIsDisabled] = useState(false);
    const [salesPersons, setSalesPersons] = useState([]);
    const [selectedSalesPerson, setSelectedSalesPerson] = useState((data.createdBy && data.createdBy._id) ? data.createdBy._id : null);

    useEffect(() => {
        if (user.role === "admin") {
            axios.get('/api/v1/salespersons', { withCredentials: true })
                .then(res => setSalesPersons(res.data.users.map(u => ({ value: u._id, label: u.name }))))
                .catch(() => setSalesPersons([]));
        }
    }, [user]);

    const formHandler = (e) => {
        e.preventDefault();
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        setIsDisabled(true);
        let payload = {
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
            IFSCcode: formData.IFSCcode
        }
        try {
            if (user.role === "admin" && selectedSalesPerson && selectedSalesPerson !== (data.createdBy && data.createdBy._id ? data.createdBy._id : null)) {
                await axios.put('/api/v1/builder/change-salesperson', { builderId: id, newSalesPersonId: selectedSalesPerson }, { withCredentials: true });
            }
            const response = await axios.put(`/api/v1/builder/update/${id}`, payload, { headers: { "Content-Type": "application/json" }, withCredentials: true });
            parentCallback();
            setIsOpen(false);

        }
        catch (e) {
            toast.error(e.response?.data?.message || 'Error');
            setIsDisabled(false);
        }

    }

    return (
        <div className={Styles.container}>
            <div className={Styles.closebutton} onClick={modalHandler}>
                <AiFillCloseCircle />
            </div>
            <h1 className={Styles.heading}>Builder Details</h1>
            <div className={Styles.personalDetails}>

                <div className={Styles.personalDetails1}>

                    <label htmlFor='name'>Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.name} value={formData.name} name="name" placeholder='Builder Name' disabled={user.role !== "admin"} />

                    <label htmlFor='mobileno'>Mobile Number</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.mobileno} value={formData.mobileno} name="mobileno" placeholder='Mobile Number' disabled={user.role !== "admin"} />

                    <label htmlFor='email'>Email</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.email} value={formData.email} name="email" placeholder='email' disabled={user.role !== "admin"} />

                    <label htmlFor='AddressLine1'>Address</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.address} value={formData.address} name="address" placeholder='address' disabled={user.role !== "admin"} />

                    <label htmlFor='area'>Area</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.area} value={formData.area} name="area" placeholder='area' disabled={user.role !== "admin"} />

                    <label htmlFor='grade'>Grade</label>
                    <select className={Styles.inputTag} onChange={(e) => { formHandler(e) }} value={formData.grade} name="grade">
                        <option value="">Select Grade</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                    </select>


                    <label htmlFor='AddressLine1'>Remarks</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.remarks} value={formData.remarks} name="remarks" placeholder='Remarks' />
                </div>

                <div className={Styles.personalDetails2}>

                    <label htmlFor='date'>Date</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.date} type="date" value={formData.date} name="date" placeholder='Created At' disabled={user.role !== "admin"} />

                    <label htmlFor='birthdate'>Birth Date</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.birthdate} value={formData.birthdate} name="birthdate" type="date" placeholder='Birthdate' disabled={user.role !== "admin"} />

                    <label htmlFor='marrieagedate'>Marriage Date</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.marriagedate} value={formData.marriagedate} name="marriagedate" type="date" placeholder='Annivarsary' disabled={user.role !== "admin"} />

                    <label htmlFor='companyName'>Company Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.companyName} name="companyName" placeholder='Company Name' disabled={user.role !== "admin"} />

                    <label>Sales Person</label>
                    {user.role === "admin" ? (
                        <Select
                            className={Styles.inputTag}
                            value={salesPersons.find(opt => opt.value === selectedSalesPerson) || null}
                            onChange={opt => setSelectedSalesPerson(opt.value)}
                            options={salesPersons}
                            isClearable={false}
                        />
                    ) : (
                        <input className={Styles.inputTag} value={data.salesPerson || (data.salesmen && data.salesmen.length > 0 ? data.salesmen[0].name : '')} disabled={true} />
                    )}
                </div>
            </div>

            <h1 className={Styles.heading}>Bank Details</h1>
            <div className={Styles.bankDetails}>

                <div className={Styles.bankDetails1}>
                    <label htmlFor='bankname'>Bank Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.bankname} value={formData.bankname} name="bankname" placeholder='Bank Name' disabled={user.role !== "admin"} />

                    <label htmlFor='branchname'>Branch Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.branchname} value={formData.branchname} name="branchname" placeholder='Branch Name' disabled={user.role !== "admin"} />

                    <label htmlFor='IFSCCode'>IFSC Code</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.IFSCcode} value={formData.IFSCcode} name="IFSCcode" placeholder='IFSC Code' disabled={user.role !== "admin"} />
                </div>

                <div className={Styles.bankDetails2}>
                    <label htmlFor='adharcard'>Adhar Card</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.adharcard} value={formData.adharcard} name="adharcard" placeholder='Adhar Card' disabled={user.role !== "admin"} />

                    <label htmlFor='pancard'>Pan Card</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.pancard} value={formData.pancard} name="pancard" placeholder='Pan Card' disabled={user.role !== "admin"} />
                </div>
            </div>

            <button disabled={isDisabled} className={isDisabled ? Styles.disable : Styles.submitButton} onClick={submitHandler} type="Submit">Submit</button>
        </div>
    )
}

export default BuilderEditForm
