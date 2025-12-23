
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/db/db.js"; 
import app from "./app.js";



const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // Connect to the database
    
    app.on("error", (err) => { // Throw error if server fails to start
      console.log("ERROR!!!: ",err);
      throw err;
    })

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
};

startServer();