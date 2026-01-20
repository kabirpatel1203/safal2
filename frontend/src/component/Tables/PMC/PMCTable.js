import React, { useEffect, useState ,useMemo} from 'react';
import { Link } from 'react-router-dom';
import Styles from './PMCTable.module.css'
import axios from 'axios'
import Add from '../../../Assets/Add.svg'
import MaterialTable from 'material-table';
import { Paper } from '@material-ui/core';
import Modal from '../../Layout/Modal/Modal';
import ArchitectEditForm from '../../Forms/ArchitectEditForm';
import PMCEditForm from '../../Forms/PMCEditForm'
import { toast, ToastContainer } from 'react-toastify'
import Select from 'react-select'
import TextField from '@mui/material/TextField';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MaterialReactTable from 'material-react-table';
import { ExportToCsv } from 'export-to-csv';
import { dateformater } from '../Utils/util';
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
  // TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useSelector } from 'react-redux';
const PMCTable = ({ modalHandler, refresh,isOpen }) => {
  const [PMC, setPMC] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [tabledata, setTableData] = useState([])
  const [originalData, setOriginalData] = useState([])
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());
  let [selectedSalesman,setSelectedSalesman] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false)
  const startDateHandler = (e) => {
    setStartDate(new Date(e.target.value));
  }

  const endDateHandler = (e) => {
    setEndDate(new Date(e.target.value));
  }


  const submitDateRangeHandler = (e) => {
    console.log(startDate, endDate);
    let data = PMC.filter((item) => {
      let date = item.date ? item.date : '01/01/1799';
      date = new Date(date);
      if (date < endDate && date > startDate) {
        return true
      }
      else {
        return false
      }
    })
    setTableData(data)
  }

  const columns = useMemo(
    () => {
      const baseColumns = [
        { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" },  Cell: ({cell})=>(dateformater(cell.getValue())) },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Address', accessorKey: 'address' },
        { header: 'area', accessorKey: 'area' },
        { header: 'Mobile Number', accessorKey: 'mobileno' },
        { header: 'Salesman', accessorKey: 'salesmen' },
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
    { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Address', accessorKey: 'address' },
    { header: 'area', accessorKey: 'area' },
    { header: 'Mobile Number', accessorKey: 'mobileno' },
    { header: 'Remarks', accessorKey: 'remarks' },
    { header: 'Created By', accessorKey: 'createdBy' },
    // { header: 'Email', accessorKey: 'Email', },
    // { header: 'Company_Name', accessorKey: 'companyName', },
    // { header: 'Birth_Date', accessorKey: 'birthdate', },
    // { header: 'Marriage_Date', accessorKey: 'marriagedate', },
    // { header: 'Remarks', accessorKey: 'remarks', },
    // { header: 'Bank_Name', accessorKey: 'bankname', },
    // { header: 'IFS_Code', accessorKey: 'IFSCcode', },
    // { header: 'Branch_Name', accessorKey: 'branchname', },
    // { header: 'Adhar_Card', accessorKey: 'adharcard', },
    // { header: 'Pan_Card', accessorKey: 'pancard', columnVisibility: 'false' },
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
  const handleExportData = () => {

    csvExporter.generateCsv(tabledata);
  };
  const handleExportRows = (rows) => {
    csvExporter.generateCsv(rows.map((row) => row.original));
  };
  const delteHandler = async (id) => {
    // eslint-disable-next-line no-restricted-globals
    if(window.confirm("Are you sure ?")){
      const data = await axios.delete(`/api/v1/pmc/delete/${id}`);
      fetchPMC();
    }
  }

  const fetchPMC = async () => {
    const { data } = await axios.get("/api/v1/pmc/getall");
    const formattedData = data.pmcs.map((item) => {
      let formateddate = item.date ? item.date : '01/01/1799';
      return {
        _id: item._id,
        date: formateddate,
        name: item.name,
        address: item.address,
        area: item.area,
        mobileno: item.mobileno,
        salesmen: item.salesmen.map((req) => req.name).join('-'),
        remarks: item.remarks,
        createdBy: item.createdBy?.email || 'N/A',
      }
    });
    setPMC(formattedData);
    setOriginalData(data.pmcs);
    setTableData(formattedData);
  }

  const getPMCData = (mobileno) => {
    let pmc = originalData.filter((item) => item.mobileno === mobileno);
    setEditModalData(pmc[0]);
  }


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
  
  const fetchFilteredPMC =(salesman) => {

    let filteredData = originalData.filter((item)=>{
      let isSalesman = false;
      
      item.salesmen.forEach((salesmanObj)=>{
        if(Object.values(salesmanObj).includes(salesman) || salesman===null){
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
        _id: item._id,
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

    setPMC(data);
    setTableData(data);  
  }
  
  const handlesalesman = (selected) => {
    setSelectedSalesman(selected.value);
    fetchFilteredPMC(selected.value);
  }

  useEffect(() => {
    fetchPMC();
    fetchSalesmen();
  }, [refresh]);
  const handleCallbackCreate = (childData) => {
    // console.log("Parent Invoked!!")
    toast.success("PMC edited");
    // fetchPMC();
  }
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
      // backgroundColor: variables.colorPrimaryLighter
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
  return (
    <div className={Styles.container}>
      <div className={Styles.table}>
        <div className={Styles.header}>
          <h3>All PMCs</h3>

          <button className={Styles.buttonContainer} onClick={modalHandler}>
            <img className={Styles.addImg} src={Add} alt="add" />
            <span className={Styles.buttonText}>
              Add PMC
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

        {PMC &&
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

                    getPMCData(row.original.mobileno)
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
                    delteHandler(row.original._id);
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
                  onClick={handleExportData}
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
              </Box>)}

          />}




      </div>

      {
        editModal ? <Modal><PMCEditForm modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null}

      <div className={Styles.filter}>

      </div>
    </div>
  )
}

export default PMCTable