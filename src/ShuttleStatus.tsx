import { useEffect, useState } from "react";

const ShuttleStatus = () => {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    fetch(' https://p4nuoxoppyoj4oiinisjbumwvy0vrxlx.lambda-url.ap-south-1.on.aws/ShutttleHelloWorld')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => {
        console.error("Error fetching message:", error);
        setMessage("Error fetching data 🚨");
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Shuttle Management System 🚍
      </h1>
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default ShuttleStatus;
