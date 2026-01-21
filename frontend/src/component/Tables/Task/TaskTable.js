import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Styles from './TaskTable.module.css'
import Add from '../../../Assets/Add.svg'
import MaterialTable from 'material-table';
import Modal from '../../Layout/Modal/Modal';
import { Paper } from '@material-ui/core';
import axios from 'axios';
import DummyEditForm from '../../Forms/DummyEditForm';
import { toast, ToastContainer } from 'react-toastify'
import Select from 'react-select'
import TextField from '@mui/material/TextField';
import { dateformater } from '../Utils/util';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MaterialReactTable from 'material-react-table';
import { ExportToCsv } from 'export-to-csv';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, Tooltip, } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import TaskEditForm from '../../Forms/TaskEditForm';
import { useSelector } from 'react-redux';
const TaskTable = ({ modalHandler, refresh, isOpen, doRefresh }) => {

    const [customers, setCustomers] = useState([]);
    const [tabledata, setTableData] = useState([])
    const [originalData, setOriginalData] = useState([]);
    const [allFormattedData, setAllFormattedData] = useState([]);
    const [editModal, setEditModal] = useState(false);
    const [editModalData, setEditModalData] = useState({});
    const [startDate, setStartDate] = useState(new Date('2020-08-01'));
    const [endDate, setEndDate] = useState(new Date('2025-01-01'));
    const [isLoading, setIsLoading] = useState(false);
    let [selectedSalesman, setSelectedSalesman] = useState(null);
    const [edited, setEdited] = useState(false)
    const { user, isAuthenticated } = useSelector((state) => state.user);

    const modifyData = (data) => {
        let datass1 = data.map((d) => {
            if (d.architectTag) {
                return {
                    ...d,
                    tag: d.architectTag.name + '(A)'
                }
            }
            if (d.mistryTag) {
                return {
                    ...d,
                    tag: d.mistryTag.name + '(M)'
                }
            }
            if (d.pmcTag) {
                return {
                    ...d,
                    tag: d.pmcTag.name + '(P)'
                }
            }
            if (d.dealerTag) {
                return {
                    ...d,
                    tag: d.dealerTag.name + '(D)'
                }
            }
            return d
        })
        // console.log(datass1)
        return datass1
    }

    const delteHandler = async (id) => {
        if (window.confirm("Are you sure ?")) {
            const data = await axios.delete(`/api/v1/task/delete/${id}`);
            fetchCustomers();
            doRefresh(!refresh)
        }
    }

    const startDateHandler = (e) => {
        setStartDate(new Date(e.target.value));
    }

    const endDateHandler = (e) => {
        setEndDate(new Date(e.target.value));
    }

    const submitDateRangeHandler = (e) => {
        // console.log("OK");
        // console.log(originalData);
        let filteredData = originalData.filter((item) => {
            if (item.date) {
                let date = item.date;
                date = new Date(date);
                if (date <= endDate && date >= startDate) {
                    if (selectedSalesman !== null) {
                        if (item.salesmanId.name === selectedSalesman.name) return true
                    }
                    else {
                        return true
                    }
                }
                else {
                    return false
                }
            }
            else {
                return false
            }
        })

        let data = filteredData.map((item) => {
            let formateddate = item.date ? item.date : ' ';
            return {
                date: formateddate,
                tag: item.tag,
                remarks: item.remarks,
                salesman: item.salesmanId?.name,
                _id: item._id,
                architect: item.architectTag ? item.architectTag.name + ' - ' + item.architectTag.mobileno : '',
                mistry: item.mistryTag ? item.mistryTag.name + ' - ' + item.mistryTag.mobileno : '',
                pmc: item.pmcTag ? item.pmcTag.name + ' - ' + item.pmcTag.mobileno : '',
                dealer: item.dealerTag ? item.dealerTag.name + ' - ' + item.dealerTag.mobileno : '',
                oem: item.oemTag ? item.oemTag.name + ' - ' + item.oemTag.mobileno : '',
            }
        })

        setCustomers(modifyData(data));
        setTableData(modifyData(data));
    }

    const fetchCustomers = async () => {
        const { data } = await axios.get("/api/v1/task/totaltasks");
        let modifiedData = modifyData(data.tasks);
        const newCustomers = modifiedData.map((item) => {
            let formateddate = item.date ? item.date : ' ';
            return {
                date: formateddate,
                tag: item.tag,
                remarks: item.remarks,
                salesman: item.salesmanId?.name,
                _id: item._id,
                architect: item.architectTag ? item.architectTag.name + ' - ' + item.architectTag.mobileno : '',
                mistry: item.mistryTag ? item.mistryTag.name + ' - ' + item.mistryTag.mobileno : '',
                pmc: item.pmcTag ? item.pmcTag.name + ' - ' + item.pmcTag.mobileno : '',
                dealer: item.dealerTag ? item.dealerTag.name + ' - ' + item.dealerTag.mobileno : '',
                oem: item.oemTag ? item.oemTag.name + ' - ' + item.oemTag.mobileno : '',
            }
        });
        setOriginalData(modifiedData);
        setCustomers(newCustomers);
        setTableData(newCustomers);
        setAllFormattedData(newCustomers);
    }

    const sleep = time => {
        return new Promise(resolve => setTimeout(resolve, time));
    };

    const fetchFilteredCustomers = (salesman) => {
        let filteredData = originalData.filter((item) => item?.salesmanId?.name === salesman)
        let data = filteredData.map((item) => {
            let formateddate = item.date ? item.date : ' ';
            return {
                date: formateddate,
                tag: item.tag,
                remarks: item.remarks,
                salesman: item.salesmanId.name,
                _id: item._id,
                architect: item.architectTag ? item.architectTag.name + ' - ' + item.architectTag.mobileno : '',
                mistry: item.mistryTag ? item.mistryTag.name + ' - ' + item.mistryTag.mobileno : '',
                pmc: item.pmcTag ? item.pmcTag.name + ' - ' + item.pmcTag.mobileno : '',
                dealer: item.dealerTag ? item.dealerTag.name + ' - ' + item.dealerTag.mobileno : '',
                oem: item.oemTag ? item.oemTag.name + ' - ' + item.oemTag.mobileno : '',
            }
        })

        setCustomers(modifyData(data));
        setTableData(modifyData(data));
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
    const handlesalesman = (selected) => {
        setSelectedSalesman(selected);
        // selectedSalesman = selected;
        fetchFilteredCustomers(selected.value);
    }


    useEffect(() => {
        fetchCustomers();
        fetchFilteredCustomers(selectedSalesman);
        fetchSalesmen();
    }, [refresh]);

    useEffect(() => {
        fetchFilteredCustomers(selectedSalesman)
    }, [originalData]);

    const handleCallbackCreate = async () => {
        const { data } = await axios.get("/api/v1/task/totaltasks");
        let modifiedData = modifyData(data.tasks);
        const newCustomers = modifiedData.map((item) => {
            let formateddate = item.date ? item.date : ' ';
            return {
                date: formateddate,
                tag: item.tag,
                remarks: item.remarks,
                salesman: item.salesmanId.name,
                _id: item._id,
                architect: item.architectTag ? item.architectTag.name + ' - ' + item.architectTag.mobileno : '',
                mistry: item.mistryTag ? item.mistryTag.name + ' - ' + item.mistryTag.mobileno : '',
                pmc: item.pmcTag ? item.pmcTag.name + ' - ' + item.pmcTag.mobileno : '',
                dealer: item.dealerTag ? item.dealerTag.name + ' - ' + item.dealerTag.mobileno : '',
                oem: item.oemTag ? item.oemTag.name + ' - ' + item.oemTag.mobileno : '',
            }
        });
        setOriginalData(modifiedData);
        setCustomers(newCustomers);
        setTableData(newCustomers);

        toast.success("Task edited");
        setEdited(!edited);
    }

    useEffect(() => {
        submitDateRangeHandler()
    }, [edited])


    const getCustomerData = (id) => {
        // console.log(originalData);
        let customer = originalData.filter((item) => item._id === id);
        // console.log(customer);
        setEditModalData(customer[0]);
        setEditModal(true);
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
        () => [
            {
                header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" },
                Cell: ({ cell }) => (dateformater(cell.getValue()))
            },
            { header: 'Remarks', accessorKey: 'remarks', },
            // { header: 'Tag', accessorKey: 'tag' },
            { header: 'Salesman', accessorKey: 'salesman' },
            { header: 'Architect', accessorKey: 'architect' },
            { header: 'Mistry', accessorKey: 'mistry' },
            { header: 'PMC', accessorKey: 'pmc' },
            { header: 'Dealer', accessorKey: 'dealer' },
            { header: 'OEM', accessorKey: 'oem' }
        ],
        [],
    );
    const ops = [
        { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" }, },
        { header: 'Remarks', accessorKey: 'remarks', },
        // { header: 'Tag', accessorKey: 'tag' },
        { header: 'Salesman', accessorKey: 'salesman' },
        { header: 'Architect', accessorKey: 'architect' },
        { header: 'Mistry', accessorKey: 'mistry' },
        { header: 'PMC', accessorKey: 'pmc' },
        { header: 'Dealer', accessorKey: 'dealer' },
        { header: 'OEM', accessorKey: 'oem' }
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
                exportRow[col.accessorKey] = row[col.accessorKey] || '';
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
                    <h3>All Tasks</h3>

                    <button className={Styles.buttonContainer} onClick={modalHandler}>
                        <img className={Styles.addImg} src={Add} alt="add" />
                        <span className={Styles.buttonText}>
                            Add Task
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
                                        getCustomerData(row.original._id);
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
                                        // console.log(`delete `, row)
                                    }}>
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        ) : undefined}
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

                    />
                }

            </div>

            {
                editModal ? <Modal><TaskEditForm modalHandler={() => { setEditModal(false) }} data={editModalData} setIsOpen={setEditModal} parentCallback={handleCallbackCreate} /></Modal> : null
            }

            <div className={Styles.filter}></div>
        </div>

    )
}

export default TaskTable
