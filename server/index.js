import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import supabase from "./utils/supabase.js";

dotenv.config();
const app = express();
const port = 3000;

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(morgan("combined"));

app.get("/cron-health", (req, res) => {
  res.send("OK");
});

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
    const accessToken = jwt.sign(
      {
        userid: user.userid,
        email: user.email,
        name: profile.name,
        phoneno: profile.phoneno,
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {
        userid: user.userid,
      },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "3d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).send({
      message: "Logged in successfully",
      accessToken: accessToken,
      refreshToken:refreshToken
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send({ message: "Server error" });
  }
});
app.post("/refreshToken", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ message: "No refresh token found" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
    const { userid } = decoded;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", userid);
    if (error || !data || data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = data[0];
    const newAccessToken = jwt.sign(
      {
        userid: userid,
        email: user.email,
        name: user.name,
        phoneno: user.phoneno,
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
