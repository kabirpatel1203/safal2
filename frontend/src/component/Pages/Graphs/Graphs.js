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
  const [branches, setBranches] = useState([]);
  
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [selectedArchitect, setSelectedArchitect] = useState(null);
  const [selectedMistry, setSelectedMistry] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  const [salesmanBranches, setSalesmanBranches] = useState([]);
  const [architectBranches, setArchitectBranches] = useState([]);
  const [mistryBranches, setMistryBranches] = useState([]);

  const [salesmanStartDate, setSalesmanStartDate] = useState("");
  const [salesmanEndDate, setSalesmanEndDate] = useState("");
  const [architectStartDate, setArchitectStartDate] = useState("");
  const [architectEndDate, setArchitectEndDate] = useState("");
  const [mistryStartDate, setMistryStartDate] = useState("");
  const [mistryEndDate, setMistryEndDate] = useState("");
  const [branchStartDate, setBranchStartDate] = useState("");
  const [branchEndDate, setBranchEndDate] = useState("");

  const [salesmanData, setSalesmanData] = useState([]);
  const [architectData, setArchitectData] = useState([]);
  const [mistryData, setMistryData] = useState([]);
  const [branchData, setBranchData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const branchesRes = await axios.get("/api/v1/branch/getall");
      const branchOptions = branchesRes.data.branches.map((b) => ({
        value: b.branchname,
        label: b.branchname
      }));
      setBranches(branchOptions);

      // Fetch revenue data first to get all actual names
      const { data } = await axios.get("/api/v1/customer/getall");
      const customers = data.customers;

      // Get unique salesman names from customer data
      const allSalesmen = [];
      customers.forEach(customer => {
        if (customer.salesmen && customer.salesmen.length > 0) {
          customer.salesmen.forEach(s => {
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

      fetchRevenueData();
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const filterCustomersByDate = (customers, startDate, endDate) => {
    if (!startDate && !endDate) return customers;
    
    return customers.filter(customer => {
      if (!customer.date) return false;
      const customerDate = new Date(customer.date);
      if (startDate && customerDate < new Date(startDate)) return false;
      if (endDate && customerDate > new Date(endDate)) return false;
      return true;
    });
  };

  const fetchRevenueData = async () => {
    try {
      const { data } = await axios.get("/api/v1/customer/getall");
      const customers = data.customers;

      const salesmanRevenue = {};
      customers.forEach(customer => {
        if (customer.salesmen && customer.salesmen.length > 0) {
          customer.salesmen.forEach(s => {
            const name = s.name;
            if (!salesmanRevenue[name]) {
              salesmanRevenue[name] = 0;
            }
            salesmanRevenue[name] += customer.orderValue || 0;
          });
        }
      });

      const architectRevenue = {};
      customers.forEach(customer => {
        if (customer.architectName) {
          const name = customer.architectName;
          if (!architectRevenue[name]) {
            architectRevenue[name] = 0;
          }
          architectRevenue[name] += customer.orderValue || 0;
        }
      });

      const mistryRevenue = {};
      customers.forEach(customer => {
        if (customer.mistryName) {
          const name = customer.mistryName;
          if (!mistryRevenue[name]) {
            mistryRevenue[name] = 0;
          }
          mistryRevenue[name] += customer.orderValue || 0;
        }
      });

      const branchRevenue = {};
      customers.forEach(customer => {
        if (customer.branches && customer.branches.length > 0) {
          customer.branches.forEach(b => {
            const name = b.branchname;
            if (!branchRevenue[name]) {
              branchRevenue[name] = 0;
            }
            branchRevenue[name] += customer.orderValue || 0;
          });
        }
      });

      setSalesmanData(Object.entries(salesmanRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));
      setArchitectData(Object.entries(architectRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));
      setMistryData(Object.entries(mistryRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));
      setBranchData(Object.entries(branchRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));

    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

  const fetchSalesmanData = async () => {
    try {
      const { data } = await axios.get("/api/v1/customer/getall");
      let customers = filterCustomersByDate(data.customers, salesmanStartDate, salesmanEndDate);

      // Filter by selected branches if any
      if (salesmanBranches.length > 0) {
        customers = customers.filter(customer => {
          if (!customer.branches || customer.branches.length === 0) return false;
          return customer.branches.some(b => salesmanBranches.includes(b.branchname));
        });
      }

      const salesmanRevenue = {};
      customers.forEach(customer => {
        if (customer.salesmen && customer.salesmen.length > 0) {
          customer.salesmen.forEach(s => {
            const name = s.name;
            if (!salesmanRevenue[name]) {
              salesmanRevenue[name] = 0;
            }
            salesmanRevenue[name] += customer.orderValue || 0;
          });
        }
      });

      setSalesmanData(Object.entries(salesmanRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));
    } catch (error) {
      console.error("Error fetching salesman data:", error);
    }
  };

  const fetchArchitectData = async () => {
    try {
      const { data } = await axios.get("/api/v1/customer/getall");
      let customers = filterCustomersByDate(data.customers, architectStartDate, architectEndDate);

      // Filter by selected branches if any
      if (architectBranches.length > 0) {
        customers = customers.filter(customer => {
          if (!customer.branches || customer.branches.length === 0) return false;
          return customer.branches.some(b => architectBranches.includes(b.branchname));
        });
      }

      const architectRevenue = {};
      customers.forEach(customer => {
        if (customer.architectName) {
          const name = customer.architectName;
          if (!architectRevenue[name]) {
            architectRevenue[name] = 0;
          }
          architectRevenue[name] += customer.orderValue || 0;
        }
      });

      setArchitectData(Object.entries(architectRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));
    } catch (error) {
      console.error("Error fetching architect data:", error);
    }
  };

  const fetchMistryData = async () => {
    try {
      const { data } = await axios.get("/api/v1/customer/getall");
      let customers = filterCustomersByDate(data.customers, mistryStartDate, mistryEndDate);

      // Filter by selected branches if any
      if (mistryBranches.length > 0) {
        customers = customers.filter(customer => {
          if (!customer.branches || customer.branches.length === 0) return false;
          return customer.branches.some(b => mistryBranches.includes(b.branchname));
        });
      }

      const mistryRevenue = {};
      customers.forEach(customer => {
        if (customer.mistryName) {
          const name = customer.mistryName;
          if (!mistryRevenue[name]) {
            mistryRevenue[name] = 0;
          }
          mistryRevenue[name] += customer.orderValue || 0;
        }
      });

      setMistryData(Object.entries(mistryRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));
    } catch (error) {
      console.error("Error fetching mistry data:", error);
    }
  };

  const fetchBranchData = async () => {
    try {
      const { data } = await axios.get("/api/v1/customer/getall");
      const customers = filterCustomersByDate(data.customers, branchStartDate, branchEndDate);

      const branchRevenue = {};
      customers.forEach(customer => {
        if (customer.branches && customer.branches.length > 0) {
          customer.branches.forEach(b => {
            const name = b.branchname;
            if (!branchRevenue[name]) {
              branchRevenue[name] = 0;
            }
            branchRevenue[name] += customer.orderValue || 0;
          });
        }
      });

      setBranchData(Object.entries(branchRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue));
    } catch (error) {
      console.error("Error fetching branch data:", error);
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
      console.log('Selected filter:', selectedFilter);
      console.log('Filtered data:', filteredData);
    } else {
      // If no filter, show only top 15
      filteredData = data.slice(0, 15);
    }

    return {
      labels: filteredData.map(item => item.name),
      datasets: [
        {
          label: 'Revenue (₹)',
          data: filteredData.map(item => item.revenue / 1000),
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
            return '₹' + value + 'K';
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
          <StatBox name="Data Graphs" username={user.name} />
          
          <div className={Styles.contentContainer}>
            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>Revenue by Salesman</h2>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={salesmen}
                  onChange={(selected) => setSelectedSalesman(selected?.value)}
                  isClearable
                  placeholder="Select Salesman (All by default)"
                />
              </div>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={branches}
                  onChange={(selected) => setSalesmanBranches(selected ? selected.map(s => s.value) : [])}
                  isMulti
                  isClearable
                  placeholder="Select Branch(es) (All by default)"
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
                <h3 className={Styles.tableTitle}>Top 10 Revenue Generators</h3>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Salesman</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmanData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>₹{(item.revenue / 1000).toFixed(2)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>Revenue by Architect</h2>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={architects}
                  onChange={(selected) => setSelectedArchitect(selected?.value)}
                  isClearable
                  placeholder="Select Architect (All by default)"
                />
              </div>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={branches}
                  onChange={(selected) => setArchitectBranches(selected ? selected.map(s => s.value) : [])}
                  isMulti
                  isClearable
                  placeholder="Select Branch(es) (All by default)"
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
                <h3 className={Styles.tableTitle}>Top 10 Revenue Generators</h3>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Architect</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {architectData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>₹{(item.revenue / 1000).toFixed(2)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>Revenue by Mistry</h2>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={mistries}
                  onChange={(selected) => setSelectedMistry(selected?.value)}
                  isClearable
                  placeholder="Select Mistry (All by default)"
                />
              </div>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={branches}
                  onChange={(selected) => setMistryBranches(selected ? selected.map(s => s.value) : [])}
                  isMulti
                  isClearable
                  placeholder="Select Branch(es) (All by default)"
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
                <h3 className={Styles.tableTitle}>Top 10 Revenue Generators</h3>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Mistry</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mistryData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>₹{(item.revenue / 1000).toFixed(2)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={Styles.section}>
              <h2 className={Styles.sectionTitle}>Revenue by Branch</h2>
              <div className={Styles.filterContainer}>
                <Select
                  styles={customStyles}
                  options={branches}
                  onChange={(selected) => setSelectedBranch(selected?.value)}
                  isClearable
                  placeholder="Select Branch (All by default)"
                />
              </div>
              <div className={Styles.dateFilterContainer}>
                <div className={Styles.dateInputGroup}>
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={branchStartDate}
                    onChange={(e) => setBranchStartDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <div className={Styles.dateInputGroup}>
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={branchEndDate}
                    onChange={(e) => setBranchEndDate(e.target.value)}
                    className={Styles.dateInput}
                  />
                </div>
                <button onClick={fetchBranchData} className={Styles.filterButton}>Apply Filter</button>
              </div>
              <div className={Styles.chartContainer}>
                <Bar options={chartOptions} data={getChartData(branchData, selectedBranch)} />
              </div>
              <div className={Styles.tableContainer}>
                <h3 className={Styles.tableTitle}>Top 10 Revenue Generators</h3>
                <table className={Styles.table}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Branch</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchData.slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>₹{(item.revenue / 1000).toFixed(2)}K</td>
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
