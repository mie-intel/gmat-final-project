import "./App.css";
import "./index.css";
import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js/auto";
import LineChart from "./components/LineChart";
import "leaflet/dist/leaflet.css";
import gmatLogo from "./img/gmat_logo.jpg";
import { MapContainer, Popup, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { io } from "socket.io-client";

Chart.register(CategoryScale);

const markerIcon = new L.icon({
  iconUrl: require("./img/marks.png"),
  iconSize: [35, 45],
});

const parsePayload = (data) => {
  data = data.split(";")[0].split(",");
  const res = {
    TEAM_ID: data[0],
    CLOCK: data[1],
    YAW: data[2],
    PITCH: data[3],
    ROLL: data[4],
    GPS_LATITUDE: Number(data[5]),
    GPS_LONGITUDE: Number(data[6]),
    VOLTAGE: data[7],
    PRESSURE: data[8],
    ALTITUDE: data[9],
  };
  return res;
};

const SingleChart = ({ chartData, bgColor, title, dataKey, labelTitle }) => {
  let payloadData = {
    labels: chartData.map((data) => data.CLOCK),
    datasets: [
      {
        label: labelTitle,
        data: chartData.map((data) => data[dataKey]),
        backgroundColor: [bgColor],
        borderColor: [bgColor],
        borderWidth: 1,
        tension: 0.45,
      },
    ],
  };
  return (
    <>
      <div className="flex justifiy-center row">
        <div style={{ width: 600, height: 300 }}>
          <LineChart chartData={payloadData} title={title} />
        </div>
      </div>
    </>
  );
};

const MultiChart = ({ chartData, bgColor, title, dataKey, labelTitle }) => {
  let allChart = [];
  for (let i = 0; i < dataKey.length; ++i) {
    allChart.push({
      label: labelTitle[i],
      data: chartData.map((data) => data[dataKey[i]]),
      backgroundColor: [bgColor[i]],
      borderColor: [bgColor[i]],
      borderWidth: 1,
      tension: 0.45,
    });
  }
  let payloadData = {
    labels: chartData.map((data) => data.CLOCK),
    datasets: allChart,
  };
  return (
    <>
      <div className="flex justify-center row">
        <div style={{ width: 800, height: 400 }}>
          <LineChart chartData={payloadData} title={title.join(", ")} />
        </div>
      </div>
    </>
  );
};

const MapGPS = ({ coorX, coorY }) => {
  return (
    <>
      <MapContainer center={[coorX, coorY]} zoom={13}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[coorX, coorY]} icon={markerIcon}>
          <Popup>
            {coorX}, {coorY}
          </Popup>
        </Marker>
      </MapContainer>
    </>
  );
};

function App() {
  const [random, setRandom] = useState(true);
  const [payload, setPayload] = useState([]);
  const [cnt, setCnt] = useState(0);
  const [teamID, setTeamID] = useState("undefined");
  const [gpsX, setGpsX] = useState(-7.7952777777778);
  const [gpsY, setGpsY] = useState(110.36722222222);

  useEffect(() => {
    if (!random) {
      const socket = io("https://gmat.haikalhilmi.my.id/");
      socket.on("message", (tmp) => {
        let newPayload = parsePayload(tmp);
        setPayload((payload) => [...payload, newPayload]);
        setTeamID(newPayload.TEAM_ID);
        setCnt(cnt + 1);
        setGpsX(
          gpsX + Math.abs(newPayload.GPS_LATITUDE) / newPayload.GPS_LATITUDE
        );
        setGpsY(
          gpsY + Math.abs(newPayload.GPS_LONGITUDE) / newPayload.GPS_LONGITUDE
        );
      });
      return () => socket.emit("end");
    } else {
      setTimeout(() => {
        let data = "";
        for (let i = 1; i <= 10; ++i) {
          if (i === 1) {
            data += String(1234);
          } else if (i === 2) {
            setCnt(cnt + 1);
            data += String(cnt);
          } else {
            data += String((Math.floor(Math.random() * 100) % 1000) + 1);
          }
          if (i < 10) data += ",";
          else data += ";";
        }
        let newPayload = parsePayload(data);
        setPayload((payload) => {
          if (payload.length < 10) return [...payload, newPayload];
          else {
            let tmp = [];
            for (let i = 1; i < payload.length; ++i) tmp.push(payload[i]);
            tmp.push(newPayload);
            return tmp;
          }
        });
        setTeamID(newPayload.TEAM_ID);
        setCnt(cnt + 1);
        let addX = Math.abs(newPayload.GPS_LATITUDE) / newPayload.GPS_LATITUDE;
        let addY =
          Math.abs(newPayload.GPS_LONGITUDE) / newPayload.GPS_LONGITUDE;
        let neg = Math.floor(Math.random() * 10) % 2;
        if (neg === 1) addX *= -1;
        neg = Math.floor(Math.random() * 10) % 2;
        if (neg === 1) addY *= -1;
        setGpsX(gpsX + addX);
        setGpsY(gpsY + addY);
      }, 1000);
    }
  }, [payload]);
  console.log("TEAM", teamID);
  return (
    <>
      <div
        id="head"
        className="space-x-2 p-3 font-face-sigb"
        style={{
          backgroundColor: "#05022D",
          display: "flex",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          width: "100%",
          paddingLeft: 30,
          paddingRight: 30,
        }}
      >
        <div
          className="flex flex-row"
          style={{
            justifyContent: "space-evenly",
            alignItems: "center",
            fontSize: 30,
          }}
        >
          <img
            src={gmatLogo}
            alt="GMAT"
            style={{
              width: 75,
              height: 75,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
          <div
            className="p-4"
            style={{
              justifyContent: "space-evenly",
              gap: 100,
              alignItems: "center",
              fontSize: 30,
              color: "#EEE2DC",
            }}
          >
            Gadjah Mada Aerospace Team
          </div>
        </div>
        <div>
          <h1
            style={{
              justifyContent: "space-between",
              alignItems: "left",
              fontSize: 25,
              color: "#EEE2DC",
            }}
            className="flex row font-face-sigb"
          >
            <div>ID:&nbsp;</div>{" "}
            <div className="color-yellow">
              {teamID !== "undefined" ? teamID : ""}
            </div>
          </h1>
          <h1
            style={{
              justifyContent: "space-between",
              alignItems: "left",
              fontSize: 25,
              color: "#EEE2DC",
            }}
            className="flex row font-face-sigb"
          >
            <div>Time:&nbsp;</div>
            <div>
              {payload.length > 0 ? payload[payload.length - 1].CLOCK : 0}
            </div>
          </h1>
        </div>
      </div>
      <div id="body" className="bg-creamy flex flex-col flex-wrap">
        <div
          className="flex flex-row flex-wrap"
          style={{ justifyContent: "space-evenly" }}
        >
          <div
            className="mx-2"
            style={{
              display: "flex",
              background: "#EEE2DC",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div className="flex flex-col">
              <div
                className="flex flex-row"
                style={{
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontStyle: "italic",
                    fontSize: 20,
                    color: "#676767",
                  }}
                >
                  GPS
                </div>
                <div>
                  Latitude: {gpsX}
                  <br></br>
                  Longitude: {gpsY}
                </div>
              </div>
              <div
                className="border-4"
                style={{
                  borderStyle: "solid",
                  borderColor: "black",
                }}
              >
                <MapGPS coorX={gpsX} coorY={gpsY} />
              </div>
            </div>
          </div>
          <MultiChart
            chartData={payload}
            bgColor={["purple", "green"]}
            title={["latitude", "longitude"]}
            dataKey={["GPS_LATITUDE", "GPS_LONGITUDE"]}
            labelTitle={["latitude", "longitude"]}
          />
        </div>
        <div
          className="flex flex-row flex-wrap p-8"
          style={{ justifyContent: "space-evenly" }}
        >
          <div>
            {" "}
            <SingleChart
              chartData={payload}
              bgColor={"redmaroon"}
              title={"voltage"}
              dataKey={"VOLTAGE"}
              labelTitle={"voltage"}
            />
          </div>
          <div>
            <SingleChart
              chartData={payload}
              bgColor={"purple"}
              title={"pressure"}
              dataKey={"PRESSURE"}
              labelTitle={"pressure"}
            />
          </div>
          <div>
            <SingleChart
              chartData={payload}
              bgColor={"green"}
              title={"altitude"}
              dataKey={"ALTITUDE"}
              labelTitle={"altitude"}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MultiChart
            chartData={payload}
            bgColor={["#123C69", "#AC3B69", "green"]}
            title={["yaw", "pitch", "roll"]}
            dataKey={["YAW", "PITCH", "ROLL"]}
            labelTitle={["yaw", "pitch", "roll"]}
          />
        </div>
      </div>
      <div
        id="head"
        className="bg-darkcreamy space-x-4 p-6 font-face-sigb"
        style={{
          display: "flex",
          justifyContent: "center",
          position: "sticky",
          bottom: 0,
          width: "100%",
          fontSize: 20,
          color: "black",
        }}
      >
        Made with ❤️ by Polikarpus Arya
      </div>
    </>
  );
}

export default App;
