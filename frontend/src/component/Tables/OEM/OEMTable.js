import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Styles from './OEMTable.module.css'
import axios from 'axios'
import Add from '../../../Assets/Add.svg'
import MaterialTable from 'material-table';
import { Paper } from '@material-ui/core';
import Modal from '../../Layout/Modal/Modal';
import OEMEditForm from '../../Forms/OEMEditForm';
import { toast, ToastContainer } from 'react-toastify';
import Select from 'react-select'
import { dateformater } from '../Utils/util';
import MaterialReactTable from 'material-react-table';
import { ExportToCsv } from 'export-to-csv';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useSelector } from 'react-redux';
const OEMTable = ({ modalHandler, refresh, isOpen }) => {
  const [oems, setOEMs] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [tabledata, setTableData] = useState([]);
  const [orginalData, setOriginalData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  let [selectedSalesman,setSelectedSalesman] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const startDateHandler = (e) => {
    setStartDate(new Date(e.target.value));
  }

  const endDateHandler = (e) => {
    setEndDate(new Date(e.target.value));
  }

  const submitDateRangeHandler = (e) => {
    console.log(startDate, endDate);
    console.log(oems)
    let data = oems.filter((item) => {
      let date = item.date;
      date = new Date(date);
      if(!date){
        return false;
      }
      if (date < endDate && date > startDate) {
        return true
      }
      else {
        return false
      }
    })
    setTableData(data)
  }

  const delteHandler = async (mobileno) => {

    if(window.confirm("Are you sure ?")){
      const data = await axios.delete(`/api/v1/oem/delete/${mobileno}`);
      fetchOEM();
    }
  }

  const fetchOEM = async () => {
    const { data } = await axios.get("/api/v1/oem/getall");
    console.log(data);
    const newoems = data.oems.map((item)=>{
      let formateddate = item.date ? (item.date) : new Date('01/01/1799');
      console.log(formateddate);
      return {
        date:formateddate,
        name:item.name,
        address:item.address,
        area:item.area,
        mobileno:item.mobileno,
        salesmen:item.salesmen.map((req)=>req.name).join('-'),
        remarks:item.remarks,
        createdBy:item.createdBy?.email || 'N/A',
      }
    });
    console.log(newoems, "<========================");
    setOriginalData(data.oems);
    setTableData(newoems);
    setOEMs(newoems);
  }

  const getOEMData = (mobileno) => {
    alert(mobileno);
    let oem = orginalData.filter((item) => item.mobileno === mobileno);
    console.log(oem);
    setEditModalData(oem[0]);
    setEditModal(true);
  }


  const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  };
  const [salesman, setSalesman] = useState([]);
  const fetchSalesmen = async () => {
    const { data } = await axios.get("/api/v1/salesman/getall");

    const salesmen = data.salesmans.map((branch) => (
      {
        name: branch.name,
        value: branch.name,
        label: branch.name

      }
    ))
    setSalesman(salesmen);
  }

  const handlesalesman = (selected) => {
    setSelectedSalesman(selected.value);
    fetchFilteredOEMs(selected.value);
  }

  
  const fetchFilteredOEMs =(salesman) => {

    let filteredData = orginalData.filter((item)=>{
      let isSalesman = false;
      if(item.salesmen.length === 0 && salesman===null){
        isSalesman = true;
      }
      item.salesmen.forEach((salesmanObj)=>{
        if(Object.values(salesmanObj).includes(salesman) || salesman===null || salesman===""){
          isSalesman = true;
        }})

      console.log(isSalesman)
      if(isSalesman){
        return true
      }
    })
    console.log(filteredData);
    let data = filteredData.map((item)=>{
      let formateddate = item.date ? item.date : '01/01/1799';
      return {
        date:formateddate,
        name:item.name,
        address:item.address,
        area:item.area,
        mobileno:item.mobileno,
        salesmen:item.salesmen.map((req)=>req.name).join('-'),
        remarks:item.remarks,
        createdBy:item.createdBy?.email || 'N/A',
        
      }
      })
    console.log(data.length, "<++++++++++THIS IS THE LENGTH");
    setOEMs(data);
    setTableData(data);  
  }


  useEffect(() => {
    fetchOEM();
    fetchSalesmen();
  }, [refresh]);

  const customStyles = {
    control: base => ({
      ...base,
      minHeight: 44,
      borderRadius: 999,
      borderColor: 'rgba(148,163,184,0.7)',
      boxShadow: '0 0 0 1px rgba(148,163,184,0.25)',
      '&:hover': {
        borderColor: '#2563eb'
      }
    }),
    dropdownIndicator: base => ({
      ...base,
      padding: 4
    }),
    clearIndicator: base => ({
      ...base,
      padding: 4
    }),
    multiValue: base => ({
      ...base,

    }),
    valueContainer: base => ({
      ...base,
      padding: '0px 6px'
    }),
    input: base => ({
      ...base,
      margin: 0,
      padding: 0
    })
  };
  const handleCallbackCreate = async(childData) => {

    toast.success("OEM edited");
    const { data } = await axios.get("/api/v1/oem/getall");
    setOriginalData(data.oems);
    window.scrollTo(0, 0)
  }

  useEffect(()=>{
    fetchFilteredOEMs(selectedSalesman)
    console.log(`SET FILTERED DATA AGAIN`)
  },[orginalData]);

  const columns = useMemo(
    () => {
      const baseColumns = [
        { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" },
        Cell: ({cell})=>(dateformater(cell.getValue())) },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Address', accessorKey: 'address' },
        { header: 'Area', accessorKey: 'area' },
        { header: 'Mobile Number', accessorKey: 'mobileno' },
        {header: 'Salesman', accessorKey:'salesmen'},
        { header: 'Remarks', accessorKey: 'remarks' },
      ];
      
      if (user?.role === 'admin') {
        baseColumns.push({ header: 'Created By', accessorKey: 'createdBy' });
      }
      
      return baseColumns;
    },
    [user],
  );
  const ops = [
    { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, Cell: ({cell})=>(dateformater(cell.getValue())) },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Address', accessorKey: 'address' },
    { header: 'Area', accessorKey: 'area' },
    { header: 'Mobile Number', accessorKey: 'mobileno' },
    {header: 'Salesman', accessorKey:'salesmen'},
    { header: 'Remarks', accessorKey: 'remarks' },
    { header: 'Created By', accessorKey: 'createdBy' },
  ]
  const csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    headers: ops.map((c) => c.header),
  };
  const csvExporter = new ExportToCsv(csvOptions);
  const handleExportAllData = () => {
    csvExporter.generateCsv(oems);
  };
  const handleExportFilteredData = () => {
    csvExporter.generateCsv(tabledata);
  };
  const handleExportRows = (rows) => {
    csvExporter.generateCsv(rows.map((row) => row.original));
  };
  return (
    <div className={Styles.container}>
      <div className={Styles.table}>
        <div className={Styles.header}>
          <h3>All OEMs</h3>

          <button className={Styles.buttonContainer} onClick={modalHandler}>
            <img className={Styles.addImg} src={Add} alt="add" />
            <span className={Styles.buttonText}>
              Add OEM
            </span>
          </button>
        </div>
        <div className={Styles.Yellow}>

          <div className={Styles.DateRangeContainer}>
            <label>Salesman Filter</label>
            <Select styles={customStyles} onChange={(e) => handlesalesman(e)} options={salesman} />
            <TextField
              className={Styles.InputDate}
              id="start-date"
              label="Start Date"
              type="date"
              onChange={(e) => startDateHandler(e)}
              variant="outlined"
              size="small"
              sx={{
                width: 180,
                margin: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 999,
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: 'rgba(148,163,184,0.7)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#2563eb',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    boxShadow: '0 0 0 1px rgba(37,99,235,0.18)',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  fontSize: 13,
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              className={Styles.InputDate}
              id="end-date"
              label="End Date"
              type="date"
              onChange={(e) => endDateHandler(e)}
              variant="outlined"
              size="small"
              sx={{
                width: 180,
                margin: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 999,
                  backgroundColor: '#ffffff',
                  '& fieldset': {
                    borderColor: 'rgba(148,163,184,0.7)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#2563eb',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                    boxShadow: '0 0 0 1px rgba(37,99,235,0.18)',
                  },
                },
                '& .MuiInputBase-input': {
                  padding: '10px 14px',
                },
                '& .MuiInputLabel-root': {
                  fontSize: 13,
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <button className={Styles.SubmitButton} onClick={(e) => submitDateRangeHandler(e)} type="submit"> Submit </button>
          </div>
        </div>
        {oems &&
          <MaterialReactTable
            displayColumnDefOptions={{
              'mrt-row-actions': {
                muiTableHeadCellProps: {
                  align: 'center',
                },

                size: 120,
              },
            }}

            muiTopToolbarProps={
              ({ }) => ({
                color: 'green',
                sx: { display: 'block' },
                zIndex: '0'
              })
            }
            columns={columns}
            data={tabledata}
            enableEditing
            enableRowNumbers
            rowNumberMode='original'
            enableTopToolbar={!editModal && !isOpen}

            muiTablePaginationProps={{
              rowsPerPageOptions: [5, 10],
              showFirstLastPageButtons: true,
            }}
            enableGlobalFilter={true}
            positionActionsColumn='last'
            renderRowActions={({ row, table }) => (
              <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip arrow placement="left" title="Edit">
                  <IconButton onClick={() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: "smooth"
                    });
                    getOEMData(row.original.mobileno)
                    setEditModal(true);
                  }}>
                    <Edit />

                  </IconButton>
                </Tooltip>
                <Tooltip arrow placement="right" title="Delete">
                  <IconButton color="error" onClick={() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: "smooth"
                    });
                    delteHandler(row.original.mobileno);
                    console.log(`delete `, row)
                  }}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            renderTopToolbarCustomActions={({ table }) => (
              <Box
                sx={{
                  display: 'flex',
                  gap: '1rem',
                  p: '0.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  width: '100%',
                }}
              >
                <Button
                  onClick={handleExportAllData}
                  startIcon={<FileDownloadIcon />}
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: 'rgba(37,99,235,0.08)',
                    color: '#1d4ed8',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(37,99,235,0.16)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Export All Data
                </Button>
                <Button
                  onClick={handleExportFilteredData}
                  startIcon={<FileDownloadIcon />}
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: 'rgba(34,197,94,0.08)',
                    color: '#15803d',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(34,197,94,0.16)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Export Filtered Data
                </Button>
              </Box>)}

          />}


      </div>

      {
        editModal ? <Modal ><OEMEditForm className={Styles.zi} modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null}

      <div className={Styles.filter}>

      </div>
    </div>
  )
}

export default OEMTable
