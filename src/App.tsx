import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

interface Vehicle {
  id: number;
  name: string;
  model: string;
  year: number;
  color: string;
  price: number;
  latitude: number;
  longitude: number;
}

interface SortConfig {
  key: keyof Vehicle;
  direction: "asc" | "desc";
}

const App: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  useEffect(() => {
    axios
      .get<Vehicle[]>("https://test.tspb.su/test-task/vehicles")
      .then((res) => {
        console.log(res.data);
        setVehicles(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const handleSort = (key: keyof Vehicle) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    if (sortConfig !== null) {
      const sortedData = [...vehicles].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
      setVehicles(sortedData);
    }
  }, [sortConfig]);

  const handleDelete = (id: number) => {
    axios
      .delete(`https://test.tspb.su/test-task/vehicles/${id}`)
      .then((res) => {
        const newData = vehicles.filter((item) => item.id !== id);
        setVehicles(newData);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleEdit = (
    id: number,
    name: string,
    model: string,
    price: number
  ) => {
    axios
      .put(`https://test.tspb.su/test-task/vehicles/${id}`, {
        name,
        model,
        price,
      })
      .then((res) => {
        const newData = vehicles.map((item) => {
          if (item.id === id) {
            return { ...item, name, model, price };
          } else {
            return item;
          }
        });
        setVehicles(newData);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const center = { lat: 59.9372, lng: 30.3418 };
  const zoom = 10;

  return (
    <>
      <div style={{ display: "flex" }}>
        <div style={{ display: "block" }}>
          <div>
            <button onClick={() => handleSort("year")}>Sort by Year</button>
            <button onClick={() => handleSort("price")}>Sort by Price</button>
          </div>
          <div>
            {vehicles.map((item) => (
              <div key={item.id}>
                <p>
                  {item.name} {item.model}
                </p>
                <p>Year: {item.year}</p>
                <p>Color: {item.color}</p>
                <p>Price: ${item.price}</p>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
                <button
                  onClick={() =>
                    handleEdit(item.id, item.name, item.model, item.price)
                  }
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "50vh", width: "50%", marginLeft: "50%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {vehicles.map((item) => (
            <Marker
              key={item.id}
              position={{ lat: item.latitude, lng: item.longitude }}
            ></Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
};

export default App;
