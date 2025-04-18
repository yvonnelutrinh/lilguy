import React, { useEffect } from "react";
import "./index.css";

export function LilGuyAnalytics() {
  const [siteData, setSiteData] = React.useState({});
  const [categoryData, setCategoryData] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 5000); // poll every 5 seconds
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const loadData = async () => {
    try {
      // TODO USE API_URL
      const response = await fetch("http://localhost:3000/api/sitevisits", {
        headers: {
          "x-user-id": "test-user", // TODO: Replace with actual user ID
        },
      });
      const result = await response.json();

      if (result.success) {
        // Transform the data into the expected format
        const transformedData = result.data.reduce((acc, site) => {
          acc[site.hostname] = {
            visits: site.visits,
            sessions: site.sessions,
            totalDuration: site.totalDuration,
          };
          return acc;
        }, {});
        setSiteData(transformedData);
      }

      chrome.storage.local.get(["categoryData"], (result) => {
        setCategoryData(result.categoryData || {});
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching site data:", error);
      setIsLoading(false);
    }
  };

  const clearData = () => {
    if (confirm("Are you sure you want to clear all analytics data?")) {
      chrome.storage.local.set({ siteData: {}, categoryData: {} });
      // TODO: make it call DELETE ${process.env.LILGUY}/api/sitevisits
    }
  };

  function formatSecondsToTime(seconds) {
    const totalMinutes = Math.ceil(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);

    return parts.join(" ");
  }

  const renderData = () => {
    if (isLoading) {
      return <div className="loading">Loading data...</div>;
    }

    const sites = Object.keys(siteData);

    if (sites.length === 0) {
      return <div className="no-data">No analytics data recorded yet</div>;
    }

    return (
      <div className="data-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Website</th>
              <th>Visits</th>
              <th>Sessions</th>
              <th>Total Time</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site}>
                <td className={categoryData[site] ?? ""}>{site}</td>
                <td>{siteData[site].visits}</td>
                <td>{siteData[site].sessions}</td>
                <td>{formatSecondsToTime(siteData[site].totalDuration)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="app-container">
      <h2>lilguy has been watching</h2>
      {renderData()}
      <button className="clear-data" onClick={clearData}>
        Clear Data
      </button>
    </div>
  );
}
