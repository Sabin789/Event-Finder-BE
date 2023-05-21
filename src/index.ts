import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import { httpServer, expressServer } from "./server";



const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_DEV as string); 

mongoose.connection.on("connected", () => {
  httpServer.listen(port, () => {
    console.log("Succesfully connected to mongo");
  });
});