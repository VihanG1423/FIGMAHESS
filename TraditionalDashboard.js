import { Box } from "@mui/material";  // ✅ Add this import
import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Button, Grid, Card, CardContent, TextField, Stepper, Step, StepLabel, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from "recharts";
import { fetchBatteryData, fetchEnergyUsage, fetchAnomalies, fetchPeakUsageDay } from "../api/fetchBatteryData";
import { Questions } from "../components/TraditionalDashboard/AnalyzeDataQuestions";
import { useNavigate } from "react-router-dom";


const TraditionalDashboardPage = () => {

  const navigate = useNavigate();

  const [batteryData, setBatteryData] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [selectedMetric, setSelectedMetric] = useState("P_in_W");
  const [selectedDay, setSelectedDay] = useState("Day 1");
  const [timeRange, setTimeRange] = useState("24H");
  const [activeStep, setActiveStep] = useState(0);
  const [userResponse, setUserResponse] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState([]);
  const [energyUsage, setEnergyUsage] = useState([]);
  const [anomalies, setAnomalies] = useState({});
  const [peakUsage, setPeakUsage] = useState({});
  const [usagePeriod, setUsagePeriod] = useState("daily");
  const [timer, setTimer] = useState(null);
  const [stopInterval, setStopInterval] = useState(null);
  const [allTasksCompleted, setAllTasksCompleted] = useState([]);

  useEffect(() => {
    fetchEnergyUsage(usagePeriod).then(setEnergyUsage);
    fetchAnomalies().then(setAnomalies);
    fetchPeakUsageDay().then(setPeakUsage);
  }, [usagePeriod]);

  useEffect(() => {
    fetchBatteryData(timeRange)
      .then((data) => {
        if (!data) return;
        setBatteryData(data.sensor_data);
        setForecastData(data.forecast);
        setSummaryData(data.summary);
      })
      .catch((error) => console.error("❌ Error processing battery data:", error));
  }, [timeRange]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [activeStep]);

  // Handle Task Submission
  const handleSubmitTask = () => {
    if (!userResponse.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }

    const endTime = Date.now();
    const durationSec = ((endTime - startTime) / 1000).toFixed(2);

    const currentTaskData = {
      step: activeStep + 1,
      response: userResponse,
      timeTaken: durationSec,
      timestamp: new Date().toISOString(),
    };

    setAllTasksCompleted(pre => [...pre, currentTaskData]);

    localStorage.setItem(`traditional-task-${activeStep + 1}`, JSON.stringify(currentTaskData));
    setTimeTaken([...timeTaken, currentTaskData]);

    setUserResponse("");
    if (activeStep < tasks.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      clearInterval(stopInterval);
      setTimer(null);

      navigate("/survey", {
        state: {
          from: "traditional",
        }
      });
      // alert("All tasks completed! Thank you.");
    }
  };

  console.log("All tasks completed:", allTasksCompleted);

  // Task Steps
  const tasks = [
    { title: "Task 1: Identify Highest Usage Day", instruction: "Look at the Energy Usage chart and determine the day with the highest usage." },
    { title: "Task 2: Find Largest Anomaly", instruction: "Check the Battery Performance bar chart and identify the largest anomaly." },
    { title: "Task 3: Analyze Data Table", instruction: "Review the table below and note any key insights or anomalies." },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center">Battery Analytics Dashboard (Traditional)</Typography>

      {/* Time Range Filter */}
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
        {["1H", "6H", "24H", "7D", "30D"].map((range) => (
          <Grid item key={range}>
            <Button
              variant={timeRange === range ? "contained" : "outlined"}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Avg. Power Output</Typography>
              <Typography variant="h5">{summaryData.Avg_Power} kW</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Battery Efficiency</Typography>
              <Typography variant="h5">{summaryData.Battery_Efficiency}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Charge Cycle Count</Typography>
              <Typography variant="h5">{summaryData.Charge_Cycle_Count}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sensor Graphs */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Sensor Readings Over Time</Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[
            { key: "P_in_W", label: "Power", color: "#1976d2" },
            { key: "I_in_A", label: "Current", color: "#ff9800" },
            { key: "V_in_V", label: "Voltage", color: "#4caf50" }
          ].map(({ key, label, color }) => (
            <Grid item key={key}>
              <Button
                variant={selectedMetric === key ? "contained" : "outlined"}
                onClick={() => setSelectedMetric(key)}
                sx={{ color: selectedMetric === key ? "#fff" : color, borderColor: color }}
              >
                {label}
              </Button>
            </Grid>
          ))}
        </Grid>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={batteryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={selectedMetric} stroke={selectedMetric === "P_in_W" ? "#1976d2" : selectedMetric === "I_in_A" ? "#ff9800" : "#4caf50"} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Energy Usage Graph */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Energy Usage Trend</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={energyUsage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Energy_Usage_kWh" stroke="#1976d2" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Anomaly Detection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Anomalies Detected</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={Object.entries(anomalies).map(([key, value]) => ({ name: key, count: value }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Peak Usage Day */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">Peak Usage Day</Typography>
        <Card>
          <CardContent>
            <Typography variant="h5" color="primary">
              {peakUsage.peak_usage_day || "Loading..."}
            </Typography>
            <Typography>Energy Used: {peakUsage.energy_used || "N/A"} kWh</Typography>
          </CardContent>
        </Card>
      </Paper>


      {/* Task System */}
      <Questions
        tasks={tasks}
        activeStep={activeStep}
        userResponse={userResponse}
        setUserResponse={setUserResponse}
        handleSubmitTask={handleSubmitTask}
        timer={timer}
        setTimer={setTimer}
        setStopInterval={setStopInterval}
      />
    </Container>
  );

};

export default TraditionalDashboardPage;
