import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "./utils/supabase.js";

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(morgan("combined"));

app.post("/registerUser", async (req, res) => {
  try {
    const { email, password, name, phoneno } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { data: authData, error: authError } = await supabase
      .from("auth")
      .insert([{ email, password: hash }])
      .select();
    if (authError || !authData || authData.length === 0) {
      throw new Error(authError?.message || "Failed to insert into auth table");
    }
    const userid = authData[0].userid;
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([{ userid, name, phoneno }])
      .select();
    if (userError) {
      throw new Error(userError.message);
    }
    res
      .status(200)
      .json({ message: "User registered successfully", user: userData[0] });
  } catch (error) {
    console.log(`error message: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: auth, error: authError } = await supabase
      .from("auth")
      .select("*")
      .eq("email", email);
    if (authError || !auth || auth.length === 0) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
    const user = auth[0];
    const hash = user.password;
    const result = await bcrypt.compare(password, hash);
    if (!result) {
      return res.status(400).send({ message: "Invalid email or password" });
    }
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("userid", user.userid);
    if (userError || !userData || userData.length === 0) {
      return res.status(500).send({ message: "User data not found" });
    }
    const profile = userData[0];
    const token = jwt.sign(
      {
        userid: user.userid,
        email: user.email,
        name: profile.name,
        phoneno: profile.phoneno,
      },
      process.env.JWT_TOKEN,
      { expiresIn: "2h" }
    );
    res.status(200).send({
      message: "Logged in successfully",
      token: token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
