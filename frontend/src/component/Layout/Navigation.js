import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Styles from './Navigation.module.css'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { logout } from '../../actions/userAction'
import LogoutIcon from '@mui/icons-material/Logout';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import Man4Icon from '@mui/icons-material/Man4'; //customer
import ArchitectureIcon from '@mui/icons-material/Architecture'; //architect
import EngineeringIcon from '@mui/icons-material/Engineering'; //mistry
import MultipleStopIcon from '@mui/icons-material/MultipleStop'; //dealer
import ApartmentIcon from '@mui/icons-material/Apartment'; //PMC
import PsychologyIcon from '@mui/icons-material/Psychology'; //Inquiry
import ReceiptIcon from '@mui/icons-material/Receipt'; //salesman
import TaskIcon from '@mui/icons-material/Task';
import BarChartIcon from '@mui/icons-material/BarChart';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing'; //OEM

const Navigation = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.user);
    
    function handleclick() {
        dispatch(logout());
    }
    const location = useLocation();

    const [homepath, setHomepath] = useState(true);
    const [architectpath, setArchitectpath] = useState(false);
    const [mistrypath, setMistrypath] = useState(false);
    const [dealerpath, setDealerpath] = useState(false);
    const [pmcpath, setPMCpath] = useState(false);
    const [inquirypath, setInquirypath] = useState(false);
    const [salesmanpath, setSalesmanpath] = useState(false);
    const [taskpath, setTaskpath] = useState(false);
    const [graphspath, setGraphspath] = useState(false);
    const [oempath, setOEMpath] = useState(false);

    useEffect(() => {
        if (location.pathname === "/") {
            setHomepath(true)
        }
        else if (location.pathname === "/architect") {
            setHomepath(false);
            setArchitectpath(true);
        }
        else if (location.pathname === "/mistry") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(true);
        }
        else if (location.pathname === "/dealer") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(true);
        }
        else if (location.pathname === "/pmc") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(false);
            setPMCpath(true)
        }
        else if (location.pathname === "/inquiry") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(false);
            setPMCpath(false);
            setInquirypath(true);
        }
        else if (location.pathname === "/inquiry") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(false);
            setPMCpath(false);
            setInquirypath(false);
            setSalesmanpath(true)
        }
        else if (location.pathname === "/task") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(false);
            setPMCpath(false);
            setInquirypath(false);
            setTaskpath(true)
        }
        else if (location.pathname === "/graphs") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(false);
            setPMCpath(false);
            setInquirypath(false);
            setTaskpath(false);
            setGraphspath(true)
        }
        else if (location.pathname === "/oem") {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(false);
            setPMCpath(false);
            setInquirypath(false);
            setTaskpath(false);
            setGraphspath(false);
            setOEMpath(true)
        }
        else {
            setHomepath(false);
            setArchitectpath(false);
            setMistrypath(false);
            setDealerpath(false);
            setPMCpath(false)
        }
    }, [location.pathname]);

    return (
        <div className={Styles.container}>
            {/* <Logo/> */}

            <ul className={Styles.itemContainer}>
                <Link to="/" className={homepath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={homepath ? customerSelected : customer} alt="customer"/> */}
                    <Man4Icon />
                    <p>Customer</p>

                </Link>

                <Link to="/architect" className={architectpath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={architectpath ? architectSelected : architect} alt="customer"/> */}
                    <ArchitectureIcon />
                    <p>Architect</p>
                </Link>

                <Link to="/mistry" className={mistrypath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={mistrypath ? pmcSelected : pmc} alt="customer"/> */}
                    <EngineeringIcon />
                    <p>Mistry</p>
                </Link>

                <Link to="/pmc" className={pmcpath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={pmcpath ? pmcSelected : pmc} alt="customer"/> */}
                    <ApartmentIcon />
                    <p>PMC</p>
                </Link>

                <Link to="/dealer" className={dealerpath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={dealerpath ? dealerSelected : dealer} alt="customer"/> */}
                    <MultipleStopIcon />
                    <p>Dealer</p>
                </Link>

                <Link to="/oem" className={oempath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    <PrecisionManufacturingIcon />
                    <p>OEM</p>
                </Link>

                <Link to="/inquiry" className={inquirypath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={dealerpath ? dealerSelected : dealer} alt="customer"/> */}
                    <PsychologyIcon />
                    <p>Inquiry</p>
                </Link>
                <Link to="/salesman" className={salesmanpath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={dealerpath ? dealerSelected : dealer} alt="customer"/> */}
                    <ReceiptIcon />
                    <p>Salesman</p>
                </Link>

                <Link to="/task" className={taskpath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    {/* <img src={dealerpath ? dealerSelected : dealer} alt="customer"/> */}
                    <TaskIcon />
                    <p>Task</p>
                </Link>

                {user.role === "admin" && <Link to="/graphs" className={graphspath ? ` ${Styles.item} ${Styles.selected}` : ` ${Styles.item}`}>
                    <BarChartIcon />
                    <p>Data Graphs</p>
                </Link>}

                <button className={Styles.button} onClick={handleclick}  >
                    <LogoutIcon />
                    <p>Logout</p>
                </button>


            </ul>

        </div>
    )
}

export default Navigation