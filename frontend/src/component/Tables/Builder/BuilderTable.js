import React, { useEffect, useMemo, useState } from 'react';
import Styles from './BuilderTable.module.css'
import axios from 'axios'
import Add from '../../../Assets/Add.svg'
import MaterialReactTable from 'material-react-table';
import Modal from '../../Layout/Modal/Modal';
import BuilderEditForm from '../../Forms/BuilderEditForm';
import { toast, ToastContainer } from 'react-toastify';
import { dateformater } from '../Utils/util';
import { Box, Button, IconButton, Tooltip, TextField } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Delete, Edit } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const BuilderTable = ({ modalHandler, refresh, isOpen }) => {
  const [builders, setBuilders] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [editModalData, setEditModalData] = useState({});
  const [tabledata, setTableData] = useState([]);
  const [orginalData, setOriginalData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2022-08-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [salesPersonFilter, setSalesPersonFilter] = useState("");
  const { user, isAuthenticated } = useSelector((state) => state.user);

  const startDateHandler = (e) => {
    setStartDate(new Date(e.target.value));
  }

  const endDateHandler = (e) => {
    setEndDate(new Date(e.target.value));
  }

  const submitDateRangeHandler = (e) => {
    let filteredData = orginalData.filter((item) => {
      let date = item.date;
      date = new Date(date);
      if (!date) return false;
      if (date < endDate && date > startDate) {
        return true;
      }
      return false;
    });

    let data = filteredData.map((item) => {
      let formateddate = item.date ? item.date : '01/01/1799';
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

    if (typeof salesPersonFilter === 'string' && salesPersonFilter.length > 0) {
      data = data.filter(item => item.salesPerson === salesPersonFilter);
    }
    setBuilders(data);
    setTableData(data);
  }

  const deleteHandler = async (id) => {
    if(window.confirm("Are you sure ?")){
      await axios.delete(`/api/v1/builder/delete/${id}`, { withCredentials: true });
      fetchBuilders();
    }
  }

  const fetchBuilders = async () => {
    const { data } = await axios.get("/api/v1/builder/getall", { withCredentials: true });
    const newbuilders = data.builders.map((item)=>{
      let formateddate = item.date ? (item.date) : new Date('01/01/1799');
      return {
        date:formateddate,
        name:item.name,
        address:item.address,
        area:item.area,
        mobileno:item.mobileno,
        grade:item.grade || '',
        salesPerson: item.salesPerson || (item.salesmen && item.salesmen.length > 0 ? item.salesmen[0].name : ''),
        remarks:item.remarks,
        _id: item._id
      }
    });
    setOriginalData(data.builders);
    setTableData(newbuilders);
    setBuilders(newbuilders);
  }

  const getBuilderData = (id) => {
    let b = orginalData.filter((item) => item._id === id);
    setEditModalData(b[0]);
    setEditModal(true);
  }

  useEffect(() => {
    fetchBuilders();
  }, [refresh]);

  const handleCallbackCreate = async(childData) => {

    toast.success("Builder edited");
    const { data } = await axios.get("/api/v1/builder/getall", { withCredentials: true });
    setOriginalData(data.builders);
    window.scrollTo(0, 0)
  }

  const columns = useMemo(
    () => [
      { header: 'Date', accessorKey: 'date', type: "date", Cell: ({cell})=>(dateformater(cell.getValue())) },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Address', accessorKey: 'address' },
      { header: 'Area', accessorKey: 'area' },
      { header: 'Mobile Number', accessorKey: 'mobileno' },
      { header: 'Grade', accessorKey: 'grade' },
      {
        header: 'Sales Person',
        accessorKey: 'salesPerson',
        filterFn: (row, id, filterValue) => {
          if (!filterValue) return true;
          return row.getValue(id) === filterValue;
        },
        filterVariant: 'text',
      },
      { header: 'Remarks', accessorKey: 'remarks' },
    ],
    [user],
  );

  const ops = [
    { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, Cell: ({cell})=>(dateformater(cell.getValue())) },
    { header: 'Name', accessorKey: 'name' },
    { header: 'Address', accessorKey: 'address' },
    { header: 'Area', accessorKey: 'area' },
    { header: 'Mobile Number', accessorKey: 'mobileno' },
    { header: 'Grade', accessorKey: 'grade' },
    {header: 'Sales Person', accessorKey:'salesPerson'},
    { header: 'Remarks', accessorKey: 'remarks' },
  ]

  const handleExportData = () => {
    const columnsToExport = ops;
    const csvRows = [];
    const headers = columnsToExport.map(col => '"' + col.header + '"').join(',');
    csvRows.push(headers);
    tabledata.forEach(row => {
      const values = columnsToExport.map(col => {
        let value = row[col.accessorKey];
        if (value === undefined || value === null) value = '';
        if (col.type === 'date' && value) {
          try { value = new Date(value).toLocaleDateString('en-GB'); } catch (e) {}
        }
        return '"' + value + '"';
      });
      csvRows.push(values.join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'builders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.table}>
        <div className={Styles.header}>
          <h3>All Builders</h3>

          <button className={Styles.buttonContainer} onClick={modalHandler}>
            <img className={Styles.addImg} src={Add} alt="add" />
            <span className={Styles.buttonText}>
              Add Builder
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
        {builders &&
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
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    getBuilderData(row.original._id)
                    setEditModal(true);
                  }}>
                    <Edit />

                  </IconButton>
                </Tooltip>
                <Tooltip arrow placement="right" title="Delete">
                  <IconButton color="error" onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    deleteHandler(row.original._id);
                  }}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            renderTopToolbarCustomActions={({ table }) => {
              const visibleRows = table.getFilteredRowModel().rows.map(row => row.original);
              return (
                <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                  <Button
                    onClick={() => handleExportData()}
                    startIcon={<FileDownloadIcon />}
                    variant="contained"
                    color="primary"
                    sx={{ backgroundColor: 'rgba(37,99,235,0.08)', color: '#1d4ed8', boxShadow: 'none' }}
                  >
                    Export Data
                  </Button>
                </Box>
              );
            }}
          />}

      </div>

      { editModal ? <Modal ><BuilderEditForm className={Styles.zi} modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null}

      <div className={Styles.filter}>

      </div>
    </div>
  )
}

export default BuilderTable
