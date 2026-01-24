import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Styles from './DealerTable.module.css'
import axios from 'axios'
import Add from '../../../Assets/Add.svg'
import MaterialTable from 'material-table';
import { Paper } from '@material-ui/core';
import Modal from '../../Layout/Modal/Modal';
import DealerEditForm from '../../Forms/DealerEditForm';
import { toast, ToastContainer } from 'react-toastify'
import Select from 'react-select'
import TextField from '@mui/material/TextField';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
  // TextField,
  Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ReactSelect from 'react-select';
import { useSelector } from 'react-redux';

const DealerTable = ({ modalHandler, refresh, isOpen }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [dealers, setDealers] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [isLoading, setIsLoading] = useState(false)
  const [tabledata, setTableData] = useState([])
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [salesman, setSalesman] = useState([]);
  const [selectedSalesmanFilter, setSelectedSalesmanFilter] = useState(null);
  const [tempSalesmanFilter, setTempSalesmanFilter] = useState(null);
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
  const fetchDealersOfSalesman = async (salesmanName) => {
    setIsLoading(true);
    sleep(500);

    const response = await axios.post("/api/v1/salesman/dealer", { name: salesmanName }, { headers: { "Content-Type": "application/json" } });

    const newdealers = response.data.dealer.map((item)=>{
      return {
        ...item,
        grade:item.grade || '',
        salesmen:item.salesmen.map((req)=>req.name).join('-'),
        createdBy:item.createdBy?.email || 'N/A',
        SS: item.SS ? item.SS.join(', ') : '',
      }
    });

    return newdealers;
  }
  const handlesalesman = (selected) => {
    console.log(selected);
    if (selected) {
      setTempSalesmanFilter(selected.value);
    } else {
      setTempSalesmanFilter(null);
    }
  }

  const startDateHandler = (e) => {
    setStartDate(new Date(e.target.value));
  }

  const endDateHandler = (e) => {
    setEndDate(new Date(e.target.value));
  }

  const dateformater = (date) => {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + date.getMonth();
    let day = (date.getDay() + 1) > 9 ? date.getDay() + 1 : '0' + date.getDay();
    return `${year}-${month}-${day}`
  }

  const submitDateRangeHandler = async (e) => {
    console.log(startDate, endDate);
    setIsLoading(true);
    
    // Apply salesman filter first if selected
    let baseData;
    if (tempSalesmanFilter) {
      setSelectedSalesmanFilter(tempSalesmanFilter);
      baseData = await fetchDealersOfSalesman(tempSalesmanFilter);
    } else {
      setSelectedSalesmanFilter(null);
      baseData = dealers;
    }
    
    // Then apply date filter on the result
    let data = baseData.filter((item) => {
      let date = item.date;
      date = new Date(date);
      if (date < endDate && date > startDate) {
        return true
      }
      else {
        return false
      }
    })
    setTableData(data);
    setIsLoading(false);
  }

  const delteHandler = async (id) => {
    if (window.confirm("Are you sure ?")) {
      const data = await axios.delete(`/api/v1/dealer/delete/${id}`);
      fetchDealer();
    }
  }

  const fetchDealer = async () => {
    const { data } = await axios.get("/api/v1/dealer/getall");
    const newdealers = data.dealers.map((item)=>{
      return {
        ...item,
        grade:item.grade || '',
        salesmen:item.salesmen.map((req)=>req.name).join('-'),
        createdBy:item.createdBy?.email || 'N/A',
        SS: item.SS ? item.SS.join(', ') : '',
      }
    });
    setDealers(newdealers);
    setOriginalData(data.dealers);
    setTableData(newdealers);
  }

  const getDealerData = (mobileno) => {
    let dealer = originalData.filter((item) => item.mobileno === mobileno);
    setEditModalData(dealer[0]);
  }

  const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  };

  useEffect(() => {
    fetchSalesmen();
    fetchDealer();
  }, [refresh]);
  const handleCallbackCreate = (childData) => {
    // console.log("Parent Invoked!!")
    toast.success("Dealer edited");
    // fetchDealer();
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
  const columns = useMemo(
    () => {
      const baseColumns = [
        { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, Cell: ({cell})=>(cell.getValue() ? new Date(cell.getValue()).toLocaleDateString('en-GB') : '') },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Address', accessorKey: 'address' },
        { header: 'Area', accessorKey: 'area' },
        { header: 'Mobile Number', accessorKey: 'mobileno' },
        { header: 'Grade', accessorKey: 'grade' },
        { header: 'L', accessorKey: 'L', Cell: ({cell})=>(cell.getValue() !== null && cell.getValue() !== undefined ? cell.getValue() : '') },
        { header: 'SS', accessorKey: 'SS' },
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
    { header: 'Mobile Number', accessorKey: 'mobileno' },
    { header: 'Grade', accessorKey: 'grade' },
    { header: 'L', accessorKey: 'L' },
    { header: 'SS', accessorKey: 'SS' },
    { header: 'Email', accessorKey: 'email', },
    { header: 'Company_Name', accessorKey: 'companyName', },
    { header: 'Birth_Date', accessorKey: 'birthdate', },
    { header: 'Marriage_Date', accessorKey: 'marriagedate', },
    { header: 'Remarks', accessorKey: 'remarks', },
    { header: 'Bank_Name', accessorKey: 'bankname', },
    { header: 'IFS_Code', accessorKey: 'IFSCcode', },
    { header: 'Branch_Name', accessorKey: 'branchname', },
    { header: 'Adhar_Card', accessorKey: 'adharcard', },
    { header: 'Pan_Card', accessorKey: 'pancard', columnVisibility: 'false' },
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
          <h3>All Dealer</h3>

          <button className={Styles.buttonContainer} onClick={modalHandler}>
            <img className={Styles.addImg} src={Add} alt="add" />
            <span className={Styles.buttonText}>
              Add Dealer
            </span>
          </button>
        </div>

        <div className={Styles.Yellow}>
          <div className={Styles.DateRangeContainer}>
            {/* <label>Branch</label> */}
            <label>Salesman Filter</label>
            <Select styles={customStyles} onChange={(e) => handlesalesman(e)} options={salesman} isClearable={true} placeholder="Select Salesman..." />
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

        {dealers &&
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

                    getDealerData(row.original.mobileno)
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
                  Export Data
                </Button>
              </Box>)}

          />}



      </div>

      {
        editModal ? <Modal><DealerEditForm modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null}

      <div className={Styles.filter}>

      </div>
    </div>
  )
}

export default DealerTable