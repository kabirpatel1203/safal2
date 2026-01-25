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
        let filteredData = originalData.filter((item) => {
            if (item.date) {
                let date = item.date;
                date = new Date(date);
                return (date <= endDate && date >= startDate);
            }
            return false;
        });
        let data = filteredData.map((item) => {
            let formateddate = item.date ? item.date : ' ';
            let agentName = '';
            if (item.architectTag) agentName = 'Architect - ' + item.architectTag.name + ' - ' + item.architectTag.mobileno;
            else if (item.mistryTag) agentName = 'Mistry - ' + item.mistryTag.name + ' - ' + item.mistryTag.mobileno;
            else if (item.pmcTag) agentName = 'PMC - ' + item.pmcTag.name + ' - ' + item.pmcTag.mobileno;
            else if (item.dealerTag) agentName = 'Dealer - ' + item.dealerTag.name + ' - ' + item.dealerTag.mobileno;
            else if (item.oemTag) agentName = 'OEM - ' + item.oemTag.name + ' - ' + item.oemTag.mobileno;
            return {
                date: formateddate,
                tag: item.tag,
                remarks: item.remarks,
                salesPerson: item.salesPerson || (item.salesmanId?.name || ""),
                _id: item._id,
                agentName: agentName,
            }
        });
        setCustomers(modifyData(data));
        setTableData(modifyData(data));
    }

    const fetchCustomers = async () => {
        const { data } = await axios.get("/api/v1/task/totaltasks");
        let modifiedData = modifyData(data.tasks);
        // Migrate old salesmanId.name to salesPerson if salesPerson is empty
        modifiedData = modifiedData.map(item => ({
            ...item,
            salesPerson: item.salesPerson && item.salesPerson !== "" ? item.salesPerson : (item.salesmanId?.name || "")
        }));
        const newCustomers = modifiedData.map((item) => {
            let formateddate = item.date ? item.date : ' ';
            let agentName = '';
            if (item.architectTag) agentName = 'Architect - ' + item.architectTag.name + ' - ' + item.architectTag.mobileno;
            else if (item.mistryTag) agentName = 'Mistry - ' + item.mistryTag.name + ' - ' + item.mistryTag.mobileno;
            else if (item.pmcTag) agentName = 'PMC - ' + item.pmcTag.name + ' - ' + item.pmcTag.mobileno;
            else if (item.dealerTag) agentName = 'Dealer - ' + item.dealerTag.name + ' - ' + item.dealerTag.mobileno;
            else if (item.oemTag) agentName = 'OEM - ' + item.oemTag.name + ' - ' + item.oemTag.mobileno;
            return {
                date: formateddate,
                tag: item.tag,
                remarks: item.remarks,
                salesPerson: item.salesPerson,
                _id: item._id,
                agentName: agentName,
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

    // Removed fetchFilteredCustomers

    // Removed salesman filter state and logic


    useEffect(() => {
        fetchCustomers();
    }, [refresh]);

    const handleCallbackCreate = async () => {
        const { data } = await axios.get("/api/v1/task/totaltasks");
        let modifiedData = modifyData(data.tasks);
        const newCustomers = modifiedData.map((item) => {
            let formateddate = item.date ? item.date : ' ';
            let agentName = '';
            if (item.architectTag) agentName = 'Architect - ' + item.architectTag.name + ' - ' + item.architectTag.mobileno;
            else if (item.mistryTag) agentName = 'Mistry - ' + item.mistryTag.name + ' - ' + item.mistryTag.mobileno;
            else if (item.pmcTag) agentName = 'PMC - ' + item.pmcTag.name + ' - ' + item.pmcTag.mobileno;
            else if (item.dealerTag) agentName = 'Dealer - ' + item.dealerTag.name + ' - ' + item.dealerTag.mobileno;
            else if (item.oemTag) agentName = 'OEM - ' + item.oemTag.name + ' - ' + item.oemTag.mobileno;
            return {
                date: formateddate,
                tag: item.tag,
                remarks: item.remarks,
                salesman: item.salesmanId.name,
                _id: item._id,
                agentName: agentName,
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
    const columns = useMemo(
        () => [
            {
                header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" },
                Cell: ({ cell }) => (dateformater(cell.getValue()))
            },
            { header: 'Remarks', accessorKey: 'remarks', },
            { header: 'Sales Person', accessorKey: 'salesPerson' },
            { header: 'Agent Name', accessorKey: 'agentName' },
        ],
        [],
    );
    // --- Export logic (copying pattern from other categories) ---
    const ops = [
        { header: 'Date', accessorKey: 'date', type: "date", dateSetting: { locale: "en-GB" } },
        { header: 'Remarks', accessorKey: 'remarks' },
        { header: 'Sales Person', accessorKey: 'salesPerson' },
        { header: 'Agent Name', accessorKey: 'agentName' },
    ];
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
                if (col.type === 'date' && value) {
                    try {
                        value = new Date(value).toLocaleDateString('en-GB');
                    } catch (e) {}
                }
                exportRow[col.accessorKey] = value;
            });
            return exportRow;
        });
        csvExporter.generateCsv(exportData);
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
                            </Box>
                        )}
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
