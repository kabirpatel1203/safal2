import React, { useState, useEffect,useMemo } from 'react';
import Styles from './inquiryTable.module.css'
import Add from '../../../Assets/Add.svg'
import Modal from '../../Layout/Modal/Modal';
import axios from 'axios';
import { toast } from 'react-toastify'
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
  const { user, isAuthenticated } = useSelector((state) => state.user);

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

    // Apply date filter if dates are provided
    let filteredData;
    if(startDate && endDate){
      filteredData = originalData.filter((item) => {
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
    } else {
      filteredData = originalData;
    }
    
    setTableData(getInquiry(filteredData));
  }

  function getInquiry(data){
    let inquires = data.map((item)=>{
      // Compute salesPerson: prioritize salesPerson field, then legacy salesmen[0].name
      let salesPersonValue = item.salesPerson || '';
      if (!salesPersonValue && item.salesmen && item.salesmen.length > 0) {
        salesPersonValue = item.salesmen.map((req)=>req.name).join('-');
      }
      return {
        date:item.date,
        name:item.name,
        followupdate:item.followupdate,
        stage:item.stage,
        scale:item.scale || 'N/A',
        mobileno:item.mobileno,
        requirement:item.requirement.map((req)=>req.requirement).join('-'),
        salesPerson: salesPersonValue,
        remarks:item.remarks,
      }
    })

    return inquires;


  }
  
  const fetchInquiry = async () => {
    try {
      const { data } = await axios.get("/api/v1/inquiry/getall");
      setOriginalData(data.inquiries);
      let inquires = data.inquiries.map((item)=>{
        // Compute salesPerson: prioritize salesPerson field, then legacy salesmen[0].name
        let salesPersonValue = item.salesPerson || '';
        if (!salesPersonValue && item.salesmen && item.salesmen.length > 0) {
          salesPersonValue = item.salesmen.map((req)=>req.name).join('-');
        }
        return {
          date:item.date,
          name:item.name,
          followupdate:item.followupdate,
          stage:item.stage,
          scale:item.scale || 'N/A',
          requirement:item.requirement.map((req)=>req.requirement).join('-'),
          salesPerson: salesPersonValue,
          mobileno:item.mobileno,
          remarks:item.remarks,
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


  const fetchFilteredInquiries = async (salesPersonFilter) => {

    let filteredData = originalData.filter((item)=>{
      // Check salesPerson field first, then legacy salesmen array
      let salesPersonValue = item.salesPerson || '';
      if (!salesPersonValue && item.salesmen && item.salesmen.length > 0) {
        salesPersonValue = item.salesmen.map((s)=>s.name).join('-');
      }

      if(salesPersonFilter === null || salesPersonFilter === ''){
        return true;
      }
      
      return salesPersonValue.toLowerCase().includes(salesPersonFilter.toLowerCase());
    })
    let data = filteredData.map((item)=>{
        // Compute salesPerson: prioritize salesPerson field, then legacy salesmen[0].name
        let salesPersonValue = item.salesPerson || '';
        if (!salesPersonValue && item.salesmen && item.salesmen.length > 0) {
          salesPersonValue = item.salesmen.map((req)=>req.name).join('-');
        }
        return {
          date:item.date,
          name:item.name,
          followupdate:item.followupdate,
          stage:item.stage,
          scale:item.scale || 'N/A',
          requirement:item.requirement.map((req)=>req.requirement).join('-'),
          salesPerson: salesPersonValue,
          mobileno:item.mobileno,
          remarks:item.remarks,
        }
      })
    setInquiries(modifyData(data));
    setTableData(modifyData(data));  
  }

  useEffect(() => {
    fetchInquiry();
    
  }, [refresh]);

  const handleCallbackCreate = async(childData) => {
    toast.success("Inquiry edited");
    const { data } = await axios.get("/api/v1/inquiry/getall");
    setOriginalData(data.inquiries);

  }

const columns = useMemo(
  () => {
    const baseColumns = [
      { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, 
        Cell: ({cell})=>(dateformater(cell.getValue())) },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Follow Update', accessorKey: 'followupdate', type: "date", dateSetting: { locale: "en-GB" }, Cell: ({cell})=>(dateformater(cell.getValue())) },
      {
        header: 'Stage',
        accessorKey: 'stage',
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          // Exact, case-sensitive match only
          return row.getValue(id) === filterValue;
        },
        filterVariant: 'text',
      },
      { header: 'Scale', accessorKey: 'scale' },
      { header: 'Requirement', accessorKey: 'requirement' },
      { header: 'Sales Person', accessorKey: 'salesPerson' },
      { header: 'Mobile Number', accessorKey: 'mobileno' },
      { header: 'Remarks', accessorKey: 'remarks' },
    ];
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
  {header: 'Sales Person', accessorKey:'salesPerson'},
  { header: 'Mobile Number', accessorKey: 'mobileno' },
  { header: 'Remarks', accessorKey: 'remarks' },
]
const csvOptions = {
  fieldSeparator: ',',
  quoteStrings: '"',
  decimalSeparator: '.',
  showLabels: true,
  useBom: true,
  useKeysAsHeaders: false,
  headers: ops.map((c) => c.header),
  keys: ops.map((c) => c.accessorKey),
};
const csvExporter = new ExportToCsv(csvOptions);
const handleExportData = () => {
  const exportData = tabledata.map(row => {
    const exportRow = {};
    ops.forEach(col => {
      let value = row[col.accessorKey] || '';
      // Format dates to readable format
      if (col.type === 'date' && value) {
        try {
          value = new Date(value).toLocaleDateString('en-GB');
        } catch (e) {
          // Keep original value if date parsing fails
        }
      }
      exportRow[col.accessorKey] = value;
    });
    return exportRow;
  });
  csvExporter.generateCsv(exportData);
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
                  borderRadius: 8,
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
                  borderRadius: 8,
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
            renderTopToolbarCustomActions={({ table }) => {
              const visibleRows = table.getFilteredRowModel().rows.map(row => row.original);
              return (
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
                    onClick={() => {
                      const columnsToExport = ops;
                      const csvRows = [];
                      const headers = columnsToExport.map(col => '"' + col.header + '"').join(',');
                      csvRows.push(headers);
                      visibleRows.forEach(row => {
                        const values = columnsToExport.map(col => {
                          let value = row[col.accessorKey];
                          if (value === undefined || value === null) value = '';
                          if (col.type === 'date' && value) {
                            try {
                              value = new Date(value).toLocaleDateString('en-GB');
                            } catch (e) {}
                          }
                          return '"' + value + '"';
                        });
                        csvRows.push(values.join(','));
                      });
                      const csvContent = csvRows.join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.setAttribute('download', 'inquiries.csv');
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
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
                    Export Data
                  </Button>
                </Box>
              );
            }}

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