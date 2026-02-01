import React,{useState,useEffect} from 'react'
import BuilderCreateForm from '../../Forms/BuilderCreateForm'
import Modal from '../../Layout/Modal/Modal'
import Navigation from '../../Layout/Navigation'
import StatBox from '../../Layout/StatBox'
import BuilderTable from '../../Tables/Builder/BuilderTable'
import Styles from './Builder.module.css'
import {AnimatePresence, motion} from 'framer-motion'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'

const Builder = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  let navigate= useNavigate();
  const [refresh, doRefresh] = useState(true); 
  const handleCallbackCreate = (childData) => {
    toast.success("Builder is Created");
    doRefresh(!refresh);   
  }


  useEffect(()=>{
    if(!isAuthenticated){
      navigate('/signin')
    }
  },[isAuthenticated,navigate]);
  const modalHandler = () =>{

    setIsOpen(!isOpen);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }

  return (
    <>
    <div className={Styles.container}>
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
    <StatBox name="Builder" username={user.name}/>
    <BuilderTable modalHandler={modalHandler} refresh={refresh} isOpen={isOpen}/>
    {
      isOpen ? <Modal setIsOpen={setIsOpen}>
        <AnimatePresence>
          <motion.div
          initial={{ opacity: 0, scale:0 }}
          animate={{ opacity: 1, scale:1 }}
          exit={{ scale:0 }}>
            <BuilderCreateForm modalHandler={modalHandler} setIsOpen={setIsOpen} parentCallback={handleCallbackCreate} />
          </motion.div>
        </AnimatePresence>
        </Modal>: null
    }
    </div>
    </div>
    </>
  )
}

export default Builder
