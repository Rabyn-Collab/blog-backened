import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import dns from "dns";
import userRoutes from "./routes/userRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dns.setServers(['8.8.8.8', '1.1.1.1']);
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
mongoose.connect(
  "mongodb+srv://rabyn900:pass900@cluster0.ikwdezp.mongodb.net/Blog_DB").then(() => {
    app.listen(5000, () => {
      console.log("Server started on port 5000");
    });
  }).catch((err) => {
    console.log(err);
  });




app.use(morgan("dev"));
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

app.use(express.static('uploads'));




app.use("/api/users", userRoutes);
app.use("/api/blogs", blogRoutes);