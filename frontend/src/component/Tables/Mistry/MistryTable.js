import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Styles from './MistryTable.module.css'
import axios from 'axios'
import Add from '../../../Assets/Add.svg'
import MaterialTable from 'material-table';
import { Paper } from '@material-ui/core';
import Modal from '../../Layout/Modal/Modal';
import ArchitectEditForm from '../../Forms/ArchitectEditForm';
import MistryEditForm from '../../Forms/MistryEditForm';
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
const MistryTable = ({ modalHandler, refresh, isOpen }) => {
  const [mistry, setMistry] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [tabledata, setTableData] = useState([])
  const [originalData, setOriginalData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());

  const { user, isAuthenticated } = useSelector((state) => state.user);

  const [isLoading, setIsLoading] = useState(false);
  const startDateHandler = (e) => {
    setStartDate(new Date(e.target.value));
  }

  const endDateHandler = (e) => {
    setEndDate(new Date(e.target.value));
  }

  const columns = useMemo(
    () => {
      const baseColumns = [
        { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" },  Cell: ({cell})=>(dateformater(cell.getValue())) },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Address', accessorKey: 'address' },
        { header: 'Area', accessorKey: 'area' },
        { header: 'Mobile Number', accessorKey: 'mobileno' },
        { header: 'Grade', accessorKey: 'grade' },
        {header: 'Sales Person', accessorKey:'salesPerson'},
        { header: 'Remarks', accessorKey: 'remarks' },
      ];
      
      return baseColumns;
    },
    [user],
  );
  const ops = [
    { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Address', accessorKey: 'address' },
    { header: 'Area', accessorKey: 'area' },
    { header: 'Mobile Number', accessorKey: 'mobileno' },
    { header: 'Grade', accessorKey: 'grade' },
    {header: 'Sales Person', accessorKey:'salesPerson'},
      { header: 'Remarks', accessorKey: 'remarks' },
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
    keys: ops.map((c) => c.accessorKey),
  };
  const csvExporter = new ExportToCsv(csvOptions);
  const handleExportData = () => {
    // Only export the currently displayed (filtered) data
    const columnsToExport = ops;
    const csvRows = [];
    const headers = columnsToExport.map(col => '"' + col.header + '"').join(',');
    csvRows.push(headers);
    tabledata.forEach(row => {
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
    link.setAttribute('download', 'mistries.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleExportRows = (rows) => {
    csvExporter.generateCsv(rows.map((row) => row.original));
  };
  const submitDateRangeHandler = (e) => {
    setIsLoading(true);
    
    // Filter from original data
    let filteredData = originalData.filter((item) => {
      // Apply date filter
      let date = item.date;
      date = new Date(date);
      if (date < endDate && date > startDate) {
        return true;
      }
      return false;
    });
    
    // Format the filtered data
    let data = filteredData.map((item) => {
      let formateddate = item.date ? dateformater(item.date) : '01/01/1799';
      return {
        date: formateddate,
        name: item.name,
        address: item.address,
        area: item.area,
        mobileno: item.mobileno,
        grade: item.grade || '',
        salesPerson: item.salesPerson || (item.salesmen && item.salesmen.length > 0 ? item.salesmen[0].name : ''),
        remarks: item.remarks,
      };
    });
    
    setTableData(data);
    setIsLoading(false);
  }

  const delteHandler = async (mobileno) => {
    // eslint-disable-next-line no-restricted-globals
    if(window.confirm("Are you sure ?")){
      const data = await axios.delete(`/api/v1/mistry/delete/${mobileno}`);
      fetchMistry();
    }
  }

  const fetchMistry = async () => {
    const { data } = await axios.get("/api/v1/mistry/getall");
    const newMistries = data.mistries.map((item)=>{
      let formateddate = item.date ? dateformater(item.date) : '01/01/1799';
      return {
        date:formateddate,
        name:item.name,
        address:item.address,
        area:item.area,
        mobileno:item.mobileno,
        grade:item.grade || '',
        salesPerson: item.salesPerson || (item.salesmen && item.salesmen.length > 0 ? item.salesmen[0].name : ''),
        remarks:item.remarks,
      }
    });
    setOriginalData(data.mistries);
    setTableData(newMistries);
    setMistry(data.mistries);
  }
  const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  };

  useEffect(() => {
    fetchMistry();

  }, [refresh]);

  // Removed auto-apply useEffect - filters now only apply on Submit button click
  
  const handleCallbackCreate = async(childData) => {
    // console.log("Parent Invoked!!")
    toast.success("Mistry edited");
    const { data } = await axios.get("/api/v1/mistry/getall");
    setOriginalData(data.mistries);
    // fetchMistry();
  }

  const getMistryData = (mobileno) => {
    alert(mobileno);
    let mistry = originalData.filter((item) => item.mobileno === mobileno);
    console.log(mistry);
    setEditModalData(mistry[0]);
    setEditModal(true);
  }

  const customStyles = {
    control: base => ({
      ...base,
      minHeight: 44,
      borderRadius: 8,
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
          <h3>All Mistry</h3>
          <button className={Styles.buttonContainer} onClick={modalHandler}>
            <img className={Styles.addImg} src={Add} alt="add" />
            <span className={Styles.buttonText}>
              Add Mistry
            </span>
          </button>
        </div>

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
        {mistry &&
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
                    getMistryData(row.original.mobileno);
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
                      link.setAttribute('download', 'mistries.csv');
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
        editModal ? <Modal><MistryEditForm modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null}

      <div className={Styles.filter}>

      </div>
    </div>
  )
}

export default MistryTable