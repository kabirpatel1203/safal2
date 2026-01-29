import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import Styles from './ArchitectCreateForm.module.css'
import { AiFillCloseCircle } from 'react-icons/ai'
import axios from "axios"
import { ToastContainer, toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const ArchitectEditForm = ({ modalHandler, data, setIsOpen, parentCallback }) => {
    console.log(`data inside architect edit`, data);
    const { user, isAuthenticated } = useSelector((state) => state.user);
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
    }
    let id = data._id;
    const [formData, setFormData] = useState(initialState)
    const [isDisabled, setIsDisabled] = useState(false);
    const [salesPersons, setSalesPersons] = useState([]);
    const [selectedSalesPerson, setSelectedSalesPerson] = useState((data.createdBy && data.createdBy._id) ? data.createdBy._id : null);
    const salesPersonDisplayName = data.salesPerson || (data.createdBy && data.createdBy.name) || (data.salesmen && data.salesmen.length > 0 ? data.salesmen[0].name : '');
    // Fetch all users with 'user' role for dropdown
    useEffect(() => {
        if (user.role === "admin") {
            axios.get('/api/v1/salespersons', { withCredentials: true })
                .then(res => {
                    console.log('salespersons api res', res);
                    setSalesPersons(res.data.users.map(u => ({ value: u._id, label: u.name })));
                })
                .catch((err) => {
                    console.error('failed to load salespersons', err);
                    setSalesPersons([]);
                });
        }
    }, [user]);

    const formHandler = (e) => {
        e.preventDefault();
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const submitHandler = async (e) => {
        e.preventDefault();
        setIsDisabled(true);
        let dataToUpdate = {
            name: formData.name,
            email: formData.email,
            mobileno: formData.mobileno,
            address: formData.address,
            area: formData.area,
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
        };
        try {
            // If admin changed sales person, call special API
            if (user.role === "admin" && selectedSalesPerson && selectedSalesPerson !== (data.createdBy && data.createdBy._id ? data.createdBy._id : null)) {
                const resp = await axios.put('/api/v1/architect/change-salesperson', {
                    architectId: data._id,
                    newSalesPersonId: selectedSalesPerson
                }, { withCredentials: true });
                if (resp.data && resp.data.success) {
                    toast.success(`Reassigned to ${resp.data.newSalesPerson}`);
                }
            }
            // Always update architect details
            await axios.put(`/api/v1/architect/update/${id}`, dataToUpdate, { headers: { "Content-Type": "application/json" }, withCredentials: true });
            parentCallback();
            setIsOpen(false);
        } catch (e) {
            toast.error(e.response?.data?.message || 'Error updating architect');
            setIsDisabled(false);
        }
    }
    
    return (
        <div className={Styles.container}>
            {/* <ToastContainer
position="top-right"
autoClose={2000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
/> */}
            {/* Same as */}
            {/* <ToastContainer /> */}
            <div className={Styles.closebutton} onClick={modalHandler}>
                <AiFillCloseCircle />
            </div>
            <h1 className={Styles.heading}>Architect Details</h1>
            <div className={Styles.personalDetails}>

                <div className={Styles.personalDetails1}>

                    <label htmlFor='name'>Name</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.name} value={formData.name} name="name" placeholder='Architect Name' disabled={user.role !== "admin"} />

                    <label htmlFor='mobileno'>Mobile Number</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.mobileno} value={formData.mobileno} name="mobileno" placeholder='Mobile Number' disabled={user.role !== "admin"} />

                    <label htmlFor='email'>Email</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.email} value={FormData.email} name="email" placeholder='email' disabled={user.role !== "admin"} />

                    <label htmlFor='AddressLine1'>Address</label>
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.address} value={formData.address} name="address" placeholder='address Line 1' disabled={user.role !== "admin"} />

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
                    <input className={Styles.inputTag} onChange={(e) => { formHandler(e) }} defaultValue={formData.marriagedate} value={formData.marrieagedate} name="marriagedate" type="date" placeholder='Annivarsary' disabled={user.role !== "admin"} />

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
                            placeholder="Select Sales Person"
                        />
                    ) : (
                        <input className={Styles.inputTag} value={salesPersonDisplayName} disabled={true} />
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

export default ArchitectEditForm