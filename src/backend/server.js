import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "./supabase.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ERP Backend is running"
  });
});

app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase
    .from("test")
    .select("*")
    .limit(1);

  if (error) {
    return res.status(500).json({
      connected: false,
      error: error.message
    });
  }

  res.json({
    connected: true,
    message: "Supabase connection successful",
    data
  });
});

app.listen(5000, () => {
  console.log("ERP Backend running on http://localhost:5000");
});