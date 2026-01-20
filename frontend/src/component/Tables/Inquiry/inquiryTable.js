import React, { useState, useEffect,useMemo } from 'react';
import Styles from './inquiryTable.module.css'
import Add from '../../../Assets/Add.svg'
import Modal from '../../Layout/Modal/Modal';
import axios from 'axios';
import { toast } from 'react-toastify'
import Select from 'react-select'
import TextField from '@mui/material/TextField';
import InquiryEditForm from '../../Forms/InquiryEditForm';
import { dateformater,dateParser } from '../Utils/util';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MaterialReactTable from 'material-react-table';
import { ExportToCsv } from 'export-to-csv';

import {
  Box,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useSelector } from 'react-redux';
const InquiryTable = ({ modalHandler ,modalHandler2,refresh,isOpen}) => {

  const [inquiries, setInquiries] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [tabledata, setTableData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [salesman, setSalesman] = useState([]);
  let [selectedSalesman,setSelectedSalesman] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const fetchSalesmen = async () => {
    const { data } = await axios.get("/api/v1/salesman/getall");
    const salesmen = data.salesmans.map((salesman) => (
      {
        name: salesman.name,
        value: salesman.name,
        label: salesman.name

      }
    ))
    setSalesman(salesmen);
  }

  const handlesalesman = (selected) => {
    setSelectedSalesman(selected.value);
    fetchFilteredInquiries(selected.value);
  }

  const modifyData = (data) => {
    let datass1 = data.map((d) => {
      if (d.architectTag) {
        return {
          ...d,
          tag: d.architectName + '(A)'
        }
      }
      if (d.mistryTag) {
        return {
          ...d,
          tag: d.mistryName + '(M)'
        }
      }
      if (d.pmcTag) {
        return {
          ...d,
          tag: d.pmcName + '(P)'
        }
      }
      if (d.dealerTag) {
        return {
          ...d,
          tag: d.dealerName + '(D)'
        }
      }
      return d
    })
    return datass1
  }

  const delteHandler = async (id) => {
    if( window.confirm(id)){      
       const data1 = await axios.delete(`/api/v1/inquiry/delete/${id}`);
       // fetchInquiry();
       const { data } = await axios.get("/api/v1/inquiry/getall");
       setOriginalData(data.inquiries);
    }

  }

  const startDateHandler = (e) => {
    setStartDate(new Date(e.target.value));
  }

  const endDateHandler = (e) => {
    setEndDate(new Date(e.target.value));
  }

  const getInquiryData = (mobileno) => {
    let inquiry = originalData.filter((item) => item.mobileno === mobileno);
    setEditModalData(inquiry[0]);
    setEditModal(true);
  }

  const submitDateRangeHandler = () => {

    if(startDate && endDate){

      let data = originalData.filter((item) => {
        let date = (item.followupdate);
        date = new Date(date);
        
        if(date){
        if (date < endDate && date > startDate) {
          return true
        }
        else {
          return false
        }
      }
      else{
        return false
      }
      })
      // setInquiries()
      setTableData(getInquiry(data))

    }

  }


  function getInquiry(data){
    let inquires = data.map((item)=>{
      return {
        date:item.date,
        name:item.name,
        followupdate:item.followupdate,
        stage:item.stage,
        scale:item.scale || 'N/A',
        mobileno:item.mobileno,
        requirement:item.requirement.map((req)=>req.requirement).join('-'),
        salesmen:item.salesmen.map((req)=>req.name).join('-'),
        remarks:item.remarks,
        createdBy:item.createdBy?.email || 'N/A',
      }
    })

    return inquires;


  }
  
  const fetchInquiry = async () => {
    try {
      const { data } = await axios.get("/api/v1/inquiry/getall");
      setOriginalData(data.inquiries);
      let inquires = data.inquiries.map((item)=>{
        return {
          date:item.date,
          name:item.name,
          followupdate:item.followupdate,
          stage:item.stage,
          scale:item.scale || 'N/A',
          requirement:item.requirement.map((req)=>req.requirement).join('-'),
          salesmen:item.salesmen.map((req)=>req.name).join('-'),
          mobileno:item.mobileno,
          remarks:item.remarks,
          createdBy:item.createdBy?.email || 'N/A',
        }
      })
      const modifiedInquiries = modifyData(inquires);
      setInquiries(modifiedInquiries);
      setTableData(modifiedInquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    }
  }


  const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  };


  const fetchFilteredInquiries = async (salesman) => {

    let filteredData = originalData.filter((item)=>{
      let isSalesman = false;

      if(item.salesmen.length === 0 && salesman===null){
        isSalesman = true;
      }
      
      item.salesmen.forEach((salesmanObj)=>{
        if(Object.values(salesmanObj).includes(salesman) || salesman===null){
        isSalesman = true;
      }})

      if(isSalesman){
        return true
      }
    })
    let data = filteredData.map((item)=>{
        return {
          date:item.date,
          name:item.name,
          followupdate:item.followupdate,
          stage:item.stage,
          scale:item.scale || 'N/A',
          requirement:item.requirement.map((req)=>req.requirement).join('-'),
          salesmen:item.salesmen.map((req)=>req.name).join('-'),
          mobileno:item.mobileno,
          remarks:item.remarks,
          createdBy:item.createdBy?.email || 'N/A',
        }
      })
    setInquiries(modifyData(data));
    setTableData(modifyData(data));  
  }

  useEffect(() => {
    fetchInquiry();
    fetchFilteredInquiries(selectedSalesman)
    fetchSalesmen();
    
  }, [refresh]);

  useEffect(()=>{
    fetchFilteredInquiries(selectedSalesman);
    // submitDateRangeHandler();
  },[originalData])

  const handleCallbackCreate = async(childData) => {
    toast.success("Inquiry edited");
    const { data } = await axios.get("/api/v1/inquiry/getall");
    setOriginalData(data.inquiries);

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
const columns = useMemo(
  () => {
    const baseColumns = [
      { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, 
      Cell: ({cell})=>(dateformater(cell.getValue()))},
      { header: 'Name', accessorKey: 'name' },
      { header: 'Follow Update', accessorKey: 'followupdate', type: "date", dateSetting: { locale: "en-GB" }, Cell: ({cell})=>(dateformater(cell.getValue())) },
      {header: 'Stage', accessorKey:'stage'},
      {header: 'Scale', accessorKey:'scale'},
      {header: 'Requirement', accessorKey: 'requirement'},
      {header: 'Salesman', accessorKey:'salesmen'},
      { header: 'Mobile Number', accessorKey: 'mobileno' },
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
  { header: 'Follow Update', accessorKey: 'followupdate', type: "date", dateSetting: { locale: "en-GB" },Cell: ({cell})=>(dateformater(cell.getValue()))  },
  {header: 'Stage', accessorKey:'stage'},
  {header: 'Scale', accessorKey:'scale'},
  {header: 'Requirement', accessorKey: 'requirement'},
  {header: 'Salesman', accessorKey:'salesmen'},
  { header: 'Mobile Number', accessorKey: 'mobileno' },
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
const handleExportData = () => {

  csvExporter.generateCsv(tabledata);
};
const handleExportRows = (rows) => {
  csvExporter.generateCsv(rows.map((row) => row.original));
};
  return (
    <div className={Styles.container}>
      <div className={Styles.table}>
        <div className={Styles.header}>
          <h3>All Inquiries</h3>

          <div className={Styles.buttonContainer}>
            <button className={Styles.addButton} onClick={modalHandler}>
              <img className={Styles.addImg} src={Add} alt="add" />
              <span className={Styles.buttonText}>
                Add Inquiry
              </span>
            </button>
          </div>
        </div>
        {/* = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(); */}
        <div className={Styles.Yellow}>
          <div className={Styles.DateRangeContainer}>
            {/* <label>Branche</label> */}
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
        {(inquiries) &&
          <MaterialReactTable
            displayColumnDefOptions={{
              'mrt-row-actions': {
                muiTableHeadCellProps: {
                  align: 'center',
                },

                size: 120,
              },
            }}

            muiTopToolbarProps={{
              sx: { display: 'block' },
              zIndex: '0',
            }}

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
                    getInquiryData(row.original.mobileno)
                    // setEditModalData(row.original)
                    // setEditModal(true);
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
        editModal ? <Modal><InquiryEditForm modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null
      }

      <div className={Styles.filter}>

      </div>
    </div>

  )
}

export default InquiryTable