import React, { useState, useEffect } from 'react'
import Navigation from '../../Layout/Navigation'
import StatBox from '../../Layout/StatBox'
import CustomerTable from '../../Tables/Customer/CustomerTable'
import Styles from './Customer.module.css'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'
const Customer = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    }

  }, [isAuthenticated]);

  const [isOpen, setIsOpen] = useState(false);

  const modalHandler = () => {
    // Direct customer creation is disabled; show guidance instead of opening form
    toast.info("Create an Inquiry first. Qualified inquiries will become customers.");
  }
  const [refresh, doRefresh] = useState(true);

  const handleCallbackCreate = (childData) => {
    // console.log("Parent Invoked!!")
    toast.success("customer is Created");
    doRefresh(!refresh);

  }
  return (
    <>
      <div className={Styles.container}>
        {/* <Navigation /> */}
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className={Styles.rightcontainer}>
          <StatBox name="Customer" username={user.name} />
          <CustomerTable modalHandler={modalHandler} refresh={refresh} isOpen={isOpen} />
        </div>
      </div>
    </>
  )
}

export default Customer