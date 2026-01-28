import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Styles from '../Dealer/DealerTable.module.css'
import axios from 'axios'
import Add from '../../../Assets/Add.svg'
import MaterialTable from 'material-table';
import { Paper } from '@material-ui/core';
import Modal from '../../Layout/Modal/Modal';
import DealerEditForm from '../../Forms/DealerEditForm';
import { toast, ToastContainer } from 'react-toastify'
import Select from 'react-select'
import TextField from '@mui/material/TextField';
import SalesmanEditForm from '../../Forms/SalesmanEditForm';
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
const SalesmanTable = ({ modalHandler, refresh, isOpen }) => {
  const { user } = useSelector((state) => state.user);
  const [Salesman, setSalesman] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [isLoading, setIsLoading] = useState(false)
  const [tabledata, setTableData] = useState([])
  const [originalData, setOriginalData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());

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

  const submitDateRangeHandler = (e) => {
    console.log(startDate, endDate);
    let data = Salesman.filter((item) => {
      let date = item.date;
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

  const delteHandler = async (mobileno) => {
    // eslint-disable-next-line no-restricted-globals
    if (window.confirm("Are you sure ?")) {
      const data = await axios.delete(`/api/v1/salesman/delete/${mobileno}`);
      fetchSalesman();
    }
  }

  const fetchSalesman = async () => {
    const { data } = await axios.get("/api/v1/salesman/getall");
    console.log(data);
    setSalesman(data.salesmans);
    setOriginalData(data.salesmans);
    let data1 = data.salesmans.map((item) => {
      return {
        _id: item._id,
        date: item.date,
        name: item.name,
        address: item.address,
        mobileno: item.mobileno
      }
    })

    setTableData(data1);
  }
  const sleep = time => {
    return new Promise(resolve => setTimeout(resolve, time));
  };

  useEffect(() => {
    fetchSalesman();
  }, [refresh]);
  const handleCallbackCreate = (childData) => {
    // console.log("Parent Invoked!!")
    toast.success("Salesman edited");
    fetchSalesman();
  }


  const getSalesManData = (mobileno) => {
    alert(mobileno);
    let salesman = originalData.filter((item) => item.mobileno === mobileno);
    console.log(salesman);
    setEditModalData(salesman[0]);
    setEditModal(true);
  }

  const customStyles = {
    control: base => ({
      ...base,
      minHeight: 55
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
    () => [
      { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Address', accessorKey: 'address' },
      { header: 'Mobile Number', accessorKey: 'mobileno' },
    ],
    [],
  );
  const ops = [
    { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Address', accessorKey: 'address' },
    { header: 'Mobile Number', accessorKey: 'mobileno' },
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
    link.setAttribute('download', 'salesmen.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleExportRows = (rows) => {
    csvExporter.generateCsv(rows.map((row) => row.original));
  };
  return (
    <div className={Styles.container}>
      <div className={Styles.table}>
        <div className={Styles.header}>
          <h3>All Salesman</h3>

          {user?.role === "admin" && (
            <button className={Styles.buttonContainer} onClick={modalHandler}>
              <img className={Styles.addImg} src={Add} alt="add" />
              <span className={Styles.buttonText}>
                Add SalesMan
              </span>
            </button>
          )}
        </div>



        {Salesman &&
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
            enableEditing={user?.role === "admin"}
            enableRowNumbers
            rowNumberMode='original'
            enableTopToolbar={!editModal && !isOpen}

            muiTablePaginationProps={{
              rowsPerPageOptions: [5, 10],
              showFirstLastPageButtons: true,
            }}
            enableGlobalFilter={true}
            positionActionsColumn='last'
            enableRowActions={user?.role === "admin"}
            renderRowActions={user?.role === "admin" ? ({ row, table }) => (
              <Box sx={{ display: 'flex', gap: '1rem' }}>
                <Tooltip arrow placement="left" title="Edit">
                  <IconButton onClick={() => {
                    window.scrollTo({
                      top: 0,
                      left: 0,
                      behavior: "smooth"
                    });

                    getSalesManData(row.original.mobileno)
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
            ) : undefined}
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
                      const columnsToExport = columns;
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
                      link.setAttribute('download', 'salesmen.csv');
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
        editModal ? <Modal><SalesmanEditForm modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null}

      <div className={Styles.filter}>

      </div>
    </div>
  )
}

export default SalesmanTable