import React, { useState, useEffect } from 'react';
import StatBox from '../../Layout/StatBox';
import Styles from './Graphs.module.css';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Select from 'react-select';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Graphs = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [salesmen, setSalesmen] = useState([]);
  const [architects, setArchitects] = useState([]);
  const [mistries, setMistries] = useState([]);
  
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [selectedArchitect, setSelectedArchitect] = useState(null);
  const [selectedMistry, setSelectedMistry] = useState(null);
  
  const [allCustomers, setAllCustomers] = useState([]);

  const [salesmanStartDate, setSalesmanStartDate] = useState("");
  const [salesmanEndDate, setSalesmanEndDate] = useState("");
  const [architectStartDate, setArchitectStartDate] = useState("");
  const [architectEndDate, setArchitectEndDate] = useState("");
  const [mistryStartDate, setMistryStartDate] = useState("");
  const [mistryEndDate, setMistryEndDate] = useState("");
  const [salesmanData, setSalesmanData] = useState([]);
  const [architectData, setArchitectData] = useState([]);
  const [mistryData, setMistryData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Normalize reward points to a number to avoid string concatenation issues in aggregations
  const getRewardPoints = (entry) => {
    const raw = entry?.rewardPoints ?? entry?.revenue ?? entry?.orderValue ?? entry?.ordervalue;
    if (raw === null || raw === undefined) {
      return 0;
    }
    if (typeof raw === 'number') {
      return raw;
    }
    if (typeof raw === 'string') {
      const sanitized = raw.replace(/[^0-9.-]/g, '');
      const parsed = Number(sanitized);
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Fetch customers to drive reward point aggregations
  const fetchCustomers = async () => {
    const { data } = await axios.get("/api/v1/customer/getall");
    return data?.customers || [];
  };

  const loadCustomers = async () => {
    const customers = await fetchCustomers();
    setAllCustomers(customers);
    return customers;
  };

  const ensureCustomers = async (forceRefresh = false) => {
    if (forceRefresh || allCustomers.length === 0) {
      return await loadCustomers();
    }
    return allCustomers;
  };

  const buildSalesmanTotals = (customers) => {
    const totals = {};
    customers.forEach(customer => {
      if (Array.isArray(customer.salesmen) && customer.salesmen.length > 0) {
        customer.salesmen.forEach(s => {
          const name = s?.name;
          if (!name) return;
          totals[name] = (totals[name] || 0) + getRewardPoints(customer);
        });
      }
    });
    return Object.entries(totals)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const buildArchitectTotals = (customers) => {
    const totals = {};
    customers.forEach(customer => {
      const name = customer?.architectName;
      if (!name) return;
      totals[name] = (totals[name] || 0) + getRewardPoints(customer);
    });
    return Object.entries(totals)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const buildMistryTotals = (customers) => {
    const totals = {};
    customers.forEach(customer => {
      const name = customer?.mistryName;
      if (!name) return;
      totals[name] = (totals[name] || 0) + getRewardPoints(customer);
    });
    return Object.entries(totals)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const initializeAggregations = (customers) => {
    setSalesmanData(buildSalesmanTotals(customers));
    setArchitectData(buildArchitectTotals(customers));
    setMistryData(buildMistryTotals(customers));
  };

  const fetchAllData = async () => {
    try {
      // Fetch reward points data first to get all actual names
      const customers = await loadCustomers();

      // Get unique salesman names from customer data
      const allSalesmen = [];
      customers.forEach(entry => {
        if (entry.salesmen && entry.salesmen.length > 0) {
          entry.salesmen.forEach(s => {
            if (s.name) allSalesmen.push(s.name);
          });
        }
      });
      const uniqueSalesmen = [...new Set(allSalesmen)];
      const salesmenOptions = uniqueSalesmen.map((name) => ({
        value: name,
        label: name
      }));
      setSalesmen(salesmenOptions);

      // Get unique architect names from customer data
      const uniqueArchitects = [...new Set(customers.map(c => c.architectName).filter(Boolean))];
      const architectOptions = uniqueArchitects.map((name) => ({
        value: name,
        label: name
      }));
      setArchitects(architectOptions);

      // Get unique mistry names from customer data
      const uniqueMistries = [...new Set(customers.map(c => c.mistryName).filter(Boolean))];
      const mistryOptions = uniqueMistries.map((name) => ({
        value: name,
        label: name
      }));
      setMistries(mistryOptions);

      initializeAggregations(customers);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const filterCustomersByDate = (customers, startDate, endDate) => {
    if (!startDate && !endDate) return customers;
    
    return customers.filter(customer => {
      const sourceDate = customer.date || customer.createdAt;
      if (!sourceDate) return false;
      const customerDate = new Date(sourceDate);
      if (startDate && customerDate < new Date(startDate)) return false;
      if (endDate && customerDate > new Date(endDate)) return false;
      return true;
    });
  };

  const fetchSalesmanData = async () => {
    try {
      const customers = filterCustomersByDate(await ensureCustomers(true), salesmanStartDate, salesmanEndDate);
      setSalesmanData(buildSalesmanTotals(customers));
    } catch (error) {
      console.error("Error fetching salesman data:", error);
    }
  };

  const fetchArchitectData = async () => {
    try {
      const customers = filterCustomersByDate(await ensureCustomers(true), architectStartDate, architectEndDate);
      setArchitectData(buildArchitectTotals(customers));
    } catch (error) {
      console.error("Error fetching architect data:", error);
    }
  };

  const fetchMistryData = async () => {
    try {
      const customers = filterCustomersByDate(await ensureCustomers(true), mistryStartDate, mistryEndDate);
      setMistryData(buildMistryTotals(customers));
    } catch (error) {
      console.error("Error fetching mistry data:", error);
    }
  };

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
  };

  const getChartData = (data, selectedFilter) => {
    let filteredData = data;
    if (selectedFilter) {
      // If a specific person is selected, show only that person
      filteredData = data.filter(item => {
        // Exact match with the name
        return item.name === selectedFilter;
      });
    } else {
      // If no filter, show only top 15
      filteredData = data.slice(0, 15);
    }

    return {
      labels: filteredData.map(item => item.name),
      datasets: [
        {
          label: 'Reward Points',
          data: filteredData.map(item => item.revenue),
          backgroundColor: 'rgba(37, 99, 235, 0.7)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + ' pts';
          }
        }
      }
    }
  };

  return (
    <React.Fragment>
      <div className={Styles.container}>
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <div className={Styles.rightcontainer}>
          <StatBox username={user.name} />
          
          <div className={Styles.contentContainer}>
            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>Reward Points by Salesman</h2>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={salesmen}
                  onChange={(selected) => setSelectedSalesman(selected?.value)}
                  isClearable
                  placeholder="Select Salesman (All by default)"
                />
              </div>
              <div className={Styles.dateFilterContainer}>
                <div className={Styles.dateInputGroup}>
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={salesmanStartDate}
                    onChange={(e) => setSalesmanStartDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <div className={Styles.dateInputGroup}>
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={salesmanEndDate}
                    onChange={(e) => setSalesmanEndDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <button onClick={fetchSalesmanData} className={Styles.filterButton}>Apply Filter</button>
              </div>
              <div className={Styles.chartContainer}>
                <Bar options={chartOptions} data={getChartData(salesmanData, selectedSalesman)} />
              </div>
              <div className={Styles.tableContainer}>
                <h3 className={Styles.tableTitle}>Top 10 Reward Point Earners</h3>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Salesman</th>
                      <th>Reward Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmanData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>Reward Points by Architect</h2>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={architects}
                  onChange={(selected) => setSelectedArchitect(selected?.value)}
                  isClearable
                  placeholder="Select Architect (All by default)"
                />
              </div>
              <div className={Styles.dateFilterContainer}>
                <div className={Styles.dateInputGroup}>
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={architectStartDate}
                    onChange={(e) => setArchitectStartDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <div className={Styles.dateInputGroup}>
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={architectEndDate}
                    onChange={(e) => setArchitectEndDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <button onClick={fetchArchitectData} className={Styles.filterButton}>Apply Filter</button>
              </div>
              <div className={Styles.chartContainer}>
                <Bar options={chartOptions} data={getChartData(architectData, selectedArchitect)} />
              </div>
              <div className={Styles.tableContainer}>
                <h3 className={Styles.tableTitle}>Top 10 Reward Point Earners</h3>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Architect</th>
                      <th>Reward Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {architectData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>Reward Points by Mistry</h2>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={mistries}
                  onChange={(selected) => setSelectedMistry(selected?.value)}
                  isClearable
                  placeholder="Select Mistry (All by default)"
                />
              </div>
              <div className={Styles.dateFilterContainer}>
                <div className={Styles.dateInputGroup}>
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={mistryStartDate}
                    onChange={(e) => setMistryStartDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <div className={Styles.dateInputGroup}>
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={mistryEndDate}
                    onChange={(e) => setMistryEndDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <button onClick={fetchMistryData} className={Styles.filterButton}>Apply Filter</button>
              </div>
              <div className={Styles.chartContainer}>
                <Bar options={chartOptions} data={getChartData(mistryData, selectedMistry)} />
              </div>
              <div className={Styles.tableContainer}>
                <h3 className={Styles.tableTitle}>Top 10 Reward Point Earners</h3>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Mistry</th>
                      <th>Reward Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mistryData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Graphs;
