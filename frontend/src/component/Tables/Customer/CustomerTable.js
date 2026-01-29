import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Styles from './CustomerTable.module.css'
import Add from '../../../Assets/Add.svg'
import MaterialTable from 'material-table';
import Modal from '../../Layout/Modal/Modal';
import { Paper } from '@material-ui/core';
import axios from 'axios';
import CustomerEditForm from '../../Forms/CustomerEditForm';
import DummyEditForm from '../../Forms/DummyEditForm';
import { toast, ToastContainer } from 'react-toastify'
import TextField from '@mui/material/TextField';
import { dateformater } from '../Utils/util';
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
import { useSelector } from 'react-redux';
const CustomerTable = ({ modalHandler, refresh, isOpen }) => {

  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [customers, setCustomers] = useState([]);
  const [tabledata, setTableData] = useState([])
  const [originalData, setOriginalData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const modifyData = (data) => {
    let datass1 = data.map((d) => {
      if (d.architectTag) {
        return {
          ...d,
          tag: d.architectName + '(A)' + d.architectNumber
        }
      }
      if (d.mistryTag) {
        return {
          ...d,
          tag: d.mistryName + '(M)' + d.mistryNumber
        }
      }
      if (d.pmcTag) {
        return {
          ...d,
          tag: d.pmcName + '(P)' + d.pmcNumber
        }
      }
      if (d.dealerTag) {
        return {
          ...d,
          tag: d.dealerName + '(D)' + d.dealerNumber
        }
      }
      return d
    })
    console.log(datass1)
    return datass1

  }

  const delteHandler = async (mobileno) => {

    if (window.confirm("Are you sure ?")) {
      const data = await axios.delete(`/api/v1/customer/delete/${mobileno}`);
      fetchCustomers();
    }
  }

  const startDateHandler = (e) => {
    setStartDate(new Date(e.target.value));
  }

  const endDateHandler = (e) => {
    setEndDate(new Date(e.target.value));
  }

  const submitDateRangeHandler = (e) => {
    // Filter from original data - only apply date filter
    let filteredData = originalData.filter((item) => {
      // Apply date filter
      if (item.date) {
        let date = new Date(item.date);
        if (date < endDate && date > startDate) {
          return true;
        }
      }
      return false;
    });
    
    let data = filteredData.map((item) => {
      let formateddate = item.date ? item.date : ' ';
      // Compute salesPerson: prioritize salesPerson field, then legacy salesmen[0].name
      let salesPersonValue = item.salesPerson || '';
      if (!salesPersonValue && item.salesmen && item.salesmen.length > 0) {
        salesPersonValue = item.salesmen.map((req) => req.name).join('-');
      }
      return {
        date: formateddate,
        followupdate: item.followupdate || '',
        name: item.name,
        address: item.address,
        area: item.area,
        mobileno: item.mobileno,
        scale: item.scale || 'N/A',
        requirement: item.requirement ? item.requirement.map((req) => req.requirement).join('-') : '',
        rewardPoints: item.rewardPoints || '',
        mistry: item.mistryName && item.mistryNumber ? item.mistryName + ' - ' + item.mistryNumber : '',
        architect: item.architectName && item.architectNumber ? item.architectName + ' - ' + item.architectNumber : '',
        pmc: item.pmcName && item.pmcNumber ? item.pmcName + ' - ' + item.pmcNumber : '',
        dealer: item.dealerName && item.dealerNumber ? item.dealerName + ' - ' + item.dealerNumber : '',
        oem: item.oemName && item.oemNumber ? item.oemName + ' - ' + item.oemNumber : '',
        salesPerson: salesPersonValue,
        remarks: item.remarks,
      };
    });
    // Removed broken salesPersonFilter logic (handled by filterFn in column definition)
    setCustomers(modifyData(data));
    setTableData(modifyData(data));
  }

  const fetchCustomers = async () => {
    const { data } = await axios.get("/api/v1/customer/getall");
    console.log(data);
    let modifiedData = modifyData(data.customers);
    const newCustomers = modifiedData.map((item) => {
      let formateddate = item.date ? item.date : ' ';
      // Compute salesPerson: prioritize salesPerson field, then legacy salesmen[0].name
      let salesPersonValue = item.salesPerson || '';
      if (!salesPersonValue && item.salesmen && item.salesmen.length > 0) {
        salesPersonValue = item.salesmen.map((req)=>req.name).join('-');
      }

      return {
        date: formateddate,
        followupdate: item.followupdate || '',
        name: item.name,
        address: item.address,
        area:item.area,
        mobileno: item.mobileno,
        scale: item.scale || 'N/A',
        requirement: item.requirement ? item.requirement.map((req)=>req.requirement).join('-') : '',
        rewardPoints: item.rewardPoints || '',
        // tag:item.tag,
        mistry: item.mistryName && item.mistryNumber ? item.mistryName + ' - ' + item.mistryNumber : '',
        architect: item.architectName && item.architectNumber ? item.architectName + ' - ' + item.architectNumber : '',
        pmc: item.pmcName && item.pmcNumber ? item.pmcName + ' - ' + item.pmcNumber : '',
        dealer: item.dealerName && item.dealerNumber ? item.dealerName + ' - ' + item.dealerNumber : '',
        oem: item.oemName && item.oemNumber ? item.oemName + ' - ' + item.oemNumber : '',
        salesPerson: salesPersonValue,
        remarks:item.remarks,
      }
    });
    setOriginalData(modifiedData);
    setCustomers(newCustomers);
    setTableData(newCustomers);
  }

  const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  };

  useEffect(() => {
    fetchCustomers();
  }, [refresh]);

  // Refresh customers when an inquiry is moved into customers elsewhere in the app
  useEffect(() => {
    const handler = async (e) => {
      try {
        // Prefer fetching fresh list so filtering/normalization stays consistent
        await fetchCustomers();
      } catch (err) {
        console.error('Error refreshing customers after move:', err);
      }
    };
    window.addEventListener('customerMoved', handler);
    return () => window.removeEventListener('customerMoved', handler);
  }, []);

  // Removed auto-apply useEffect - filters now only apply on Submit button click

  const handleCallbackCreate = async (childData) => {
    toast.success("Customer edited");
    // fetchCustomers();
    const { data } = await axios.get("/api/v1/customer/getall");
    setOriginalData(modifyData(data.customers));
    console.log(`FETCH ALL THE CUSTOMERS`)
  }

  const getCustomerData = (mobileno) => {
    alert(mobileno);
    let customer = originalData.filter((item) => item.mobileno === mobileno);
    console.log(customer);
    setEditModalData(customer[0]);
    setEditModal(true);
  }

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" },
          Cell: ({ cell }) => (dateformater(cell.getValue()))
        },
        { header: 'Name', accessorKey: 'name' },
        { header: 'Address', accessorKey: 'address' },
        { header: 'Area', accessorKey: 'area' },
        { header: 'Mobile Number', accessorKey: 'mobileno' },
        { header: 'Reward Points', accessorKey: 'rewardPoints' },
        // { header: 'Tag', accessorKey:'tag'},
        { header: 'Mistry Name', accessorKey: 'mistry' },
        { header: 'Architect Name', accessorKey: 'architect' },
        { header: 'PMC Name', accessorKey: 'pmc' },
        { header: 'Dealer Name', accessorKey: 'dealer' },
        { header: 'OEM Name', accessorKey: 'oem' },
        {
          header: 'Sales Person',
          accessorKey: 'salesPerson',
          filterFn: (row, id, filterValue) => {
            if (!filterValue) return true;
            // Exact, case-sensitive match only
            return row.getValue(id) === filterValue;
          },
          filterVariant: 'text',
        },
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
    { header: 'Scale', accessorKey: 'scale' },
    { header: 'Reward Points', accessorKey: 'rewardPoints' },
    // { header: 'Tag', accessorKey:'tag'},
    { header: 'Mistry Name', accessorKey: 'mistry' },
    { header: 'Architect Name', accessorKey: 'architect' },
    { header: 'Sales Person', accessorKey: 'salesPerson' },
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
          <h3>All Customers</h3>

          <button className={Styles.buttonContainer} onClick={modalHandler}>
            <img className={Styles.addImg} src={Add} alt="add" />
            <span className={Styles.buttonText}>
              Add Customer
            </span>
          </button>
        </div>
        {/* = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate(); */}
        <div className={Styles.Yellow}>
          <div className={Styles.DateRangeContainer}>
            {/* <label>Branche</label> */}
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
        {customers &&
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
                    getCustomerData(row.original.mobileno);
                    // setEditModalData(row.original)
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
            renderTopToolbarCustomActions={({ table }) => {
              // Get only the rows currently displayed (filtered, paginated)
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
                      link.setAttribute('download', 'customers.csv');
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



        {/* {customers && <MaterialTable
          isLoading={isLoading}
          className={Styles.Table}
          columns={[
            { title: 'Date', field: 'date', type: "date", dateSetting: { locale: "en-GB" }, },
            { title: 'Name', field: 'name' },
            { title: 'Email', field: 'Email', hidden: 'true' },
            { title: 'Address', field: 'address' },
            { title: 'Birth Date', field: 'birthdate', hidden: 'true' },
            { title: 'Marriage Date', field: 'marriagedate', hidden: 'true' },
            { title: 'Remarks', field: 'remarks', hidden: 'true' },
            { title: 'Reward Points', field: 'rewardPoints', hidden: 'true' },
            { title: 'Sales Person', field: 'salesPerson', hidden: 'true' },
            { title: 'Tag', field: 'tag' },


          ]}
          data={tabledata}
          options={{
            sorting: true,
            headerStyle: {
              zIndex: 0
            },
            showTitle: false,
            actionsColumnIndex: -1,
            filtering: true,
            exportButton: true,
            exportCsv: (columns, data) => {
              // Only export the currently displayed (filtered) data
              const csvRows = [];
              const headers = columns.map(col => '"' + col.title + '"').join(',');
              csvRows.push(headers);
              data.forEach(row => {
                const values = columns.map(col => {
                  let value = row[col.field];
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
              link.setAttribute('download', 'customers.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
          components={{
            Container: props => <Paper {...props}
              elevation={0}
              style={{
                padding: 20,
                width: "100%",
              }} />
          }}


          actions={[
            {
              icon: 'edit',
              tooltip: 'Edit',
              onClick: (event, rowData) => {
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth"
                });
                setEditModalData(rowData);
                setEditModal(!editModal);
                console.log(`Edit `, rowData)
              }
            },
            {
              icon: 'delete',
              tooltip: 'Delete',
              onClick: (event, rowData) => {
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth"
                });
                // Do save operation
                delteHandler(rowData._id);
                console.log(`delete `, rowData)
              }
            }
          ]}

        />} */}
      </div>

      {
        editModal ? <Modal><CustomerEditForm modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null
      }

      <div className={Styles.filter}>

      </div>
    </div>

  )
}

export default CustomerTable