import React, { useEffect, useState } from 'react'
import Styles from './StatBox.module.css'
import ArchitectStat from '../../Assets/Stats/ArchitectStat.svg'
import MistryStat from '../../Assets/Stats/MistryStats.svg'
import CustomerStat from '../../Assets/Stats/CustomerStats1.svg'
import HealthStat from '../../Assets/Stats/HealthStats.svg'
import axios from 'axios'
import Navigation from './Navigation'
import { IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import Box from "@mui/material/Box";
// import IconButton from "@mui/material/IconButton"
import Drawer from "@mui/material/Drawer";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const StatBox = ({ name, username, refresh }) => {
  //drawer
  const [open, setState] = useState(false);
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    //changes the function state according to the value of open
    setState(open);
    console.log(open);
  };
  const [totalarchitect, setTotalArchitect] = useState(0);
  const [totalmistry, setTotalMistry] = useState(0);
  const [totaldealer, setTotalDealer] = useState(0);
  const [totalcustomers, setTotalCustomer] = useState(0);
  const [totalPMC, setTotalPMC] = useState(0);
  const [totalHealth, setTotalHealth] = useState(0);
  const [totaltasks, setTotalTask] = useState(0);
  const [totaloem, setTotalOEM] = useState(0);

  const getStats = async () => {
    {
      let { data } = await axios.get("/api/v1/architect/totalarchitects");
      let { archlength } = data
      setTotalArchitect(archlength);
    }

    {
      let { data } = await axios.get("/api/v1/customer/totalCustomers");
      let { custlength } = data
      setTotalCustomer(custlength);
    }

    {
      let { data } = await axios.get("/api/v1/dealer/totalDealer");
      let { dealerlength } = data
      setTotalDealer(dealerlength);
    }

    {
      let { data } = await axios.get("/api/v1/mistry/totalMistry");
      let { mistrylength } = data
      setTotalMistry(mistrylength);
    }

    {
      let { data } = await axios.get("/api/v1/pmc/totalPMC");
      let { pmclength } = data
      setTotalPMC(pmclength);
    }

    {
      let { data } = await axios.get("/api/v1/task/totaltasks");
      let { taskslength } = data
      setTotalTask(taskslength);
    }

    {
      let { data } = await axios.get("/api/v1/oem/totaloems");
      let { oemlength } = data
      setTotalOEM(oemlength);
    }

    let { data } = await axios.get("/api/v1/customer/totalReward");
    let { rewardPoints } = data
    setTotalHealth(rewardPoints);
  }
  useEffect(() => {
    getStats();
  }, [refresh]);
  return (
    <>
      <nav className={Styles.nav}>
        <IconButton className={Styles.IconButton} onClick={toggleDrawer(true)}>
          <MenuIcon className={Styles.toggle} fontSize='medium' />
        </IconButton>
        {/* {name}</h1> */}
        <h4 className={Styles.LogoText}>Safal Marketing</h4>
        <div className={Styles.user}>
          <AccountCircleIcon fontSize='medium' className={Styles.userIcon} />
          {username && <span className={Styles.userName}>{username}</span>}
        </div>
      </nav>
      <div className={Styles.container}>
        <Drawer
          anchor="left"
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
        >
          <Box sx={{
            p: 2,
            height: 1,
            backgroundColor: "#F0F0F0B7",

          }}>
            <IconButton sx={{ mb: 2 }}>
              <CloseIcon onClick={toggleDrawer(false)} />
            </IconButton>
            <Navigation />
          </Box>
        </Drawer>

        <div className={Styles.BoxContainers}>
          {name && (
            <div className={Styles.heading} >
              <h1>{name}</h1>
            </div>
          )}
          {name == "Architect" && <div className={Styles.Box}>
            <div className={Styles.subBox}>
              <p>Total Architect</p>
              <h1>{totalarchitect}</h1>
            </div>

            <div className={Styles.imgContainer}>
              <img src={ArchitectStat} alt="Architect" />
            </div>
          </div>}


          {name == "Mistry" && <div className={Styles.Box}>
            <div className={Styles.subBox}>
              <p>Total Mistry</p>
              <h1 className={Styles.numbers}>{totalmistry}</h1>
            </div>

            <div className={Styles.imgContainer}>
              <img src={MistryStat} alt="Architect" />
            </div>
          </div>}


          {name == "Customer" && <div className={Styles.Box}>
            <div className={Styles.subBox}>
              <p>Total Customers</p>
              <h1>{totalcustomers}</h1>
            </div>

            <div className={Styles.imgContainer}>
              <img src={CustomerStat} alt="Architect" />
            </div>
          </div>}

          {name === "Task" && <div className={Styles.Box}>
            <div className={Styles.subBox}>
              <p>Total Tasks</p>
              <h1>{totaltasks}</h1>
            </div>

            <div className={Styles.imgContainer}>
              <img src={CustomerStat} alt="Architect" />
            </div>
          </div>}

          {name === "OEM" && <div className={Styles.Box}>
            <div className={Styles.subBox}>
              <p>Total OEMs</p>
              <h1>{totaloem}</h1>
            </div>

            <div className={Styles.imgContainer}>
              <img src={MistryStat} alt="OEM" />
            </div>
          </div>}

        </div>
      </div></>
  )
}

export default StatBox