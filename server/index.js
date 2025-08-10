import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import supabase from "./utils/supabase.js";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import validator from "validator";

dotenv.config();

function authenticateAccessToken(req, res, next) {
  const token = req.cookies.accessToken;
  if (!token) {
    console.warn("Missing access token on request to", req.originalUrl);
    return res.status(401).json({ message: "Access token missing" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    req.user = decoded;
    next();
  } catch (err) {
    console.warn("Invalid token:", err.message);
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
}

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://my-chat-wine-eta.vercel.app"
        : "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("send_message", async (messageData) => {
    const { senderid, chatid, message, mediatype, mediaurl } = messageData;
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          chatid,
          senderid,
          message,
          mediatype: mediatype || null,
          mediaurl: mediaurl || null,
        },
      ])
      .select();
    if (!error && data?.length > 0) {
      io.emit("receive_message", {
        ...data[0],
        created_at: new Date().toISOString(),
      });
    } else if (error) {
      console.error("Supabase insert error:", error);
    } else {
      console.warn("No data returned from insert.");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://my-chat-wine-eta.vercel.app"
        : "http://localhost:5173",
    credentials: true,
  })
);
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
        profilephoto: profile.profilephoto,
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      {
        userid: user.userid,
        email: user.email,
      },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "7d" }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).send({
      message: "Logged in successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/refreshToken", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ message: "No refresh token found" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);
    const { userid, email } = decoded;
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
        email: email,
        name: user.name,
        phoneno: user.phoneno,
        profilephoto: user.profilephoto,
      },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "15m" }
    );
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

app.get("/profile", authenticateAccessToken, async (req, res) => {
  try {
    const { userid } = req.user;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userid", userid);
    if (error || !data || data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = data[0];
    res.status(200).json({
      email: req.user.email,
      name: user.name,
      phoneno: user.phoneno,
      userid: userid,
      profilephoto: user.profilephoto,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve profile" });
  }
});

app.get("/chattedUsers/:userid", authenticateAccessToken, async (req, res) => {
  const { userid } = req.params;
  const { data: chatMemberships, error } = await supabase
    .from("chatmembers")
    .select("chatid")
    .eq("userid", userid);
  if (error) return res.status(500).json({ error: error.message });
  const chatIds = chatMemberships.map((i) => i.chatid);
  if (chatIds.length === 0) return res.json([]);
  const { data: users, error: userError } = await supabase
    .from("chatmembers")
    .select("chatid, userid, users(name,profilephoto)")
    .in("chatid", chatIds)
    .neq("userid", userid);
  if (userError) return res.status(500).json({ error: userError.message });
  const uniqueUsers = Array.from(
    new Map(
      users.map((i) => [
        i.userid,
        {
          userid: i.userid,
          name: i.users.name,
          profilephoto: i.users.profilephoto,
          chatid: i.chatid,
        },
      ])
    ).values()
  );
  res.json(uniqueUsers);
});

app.get("/searchUsers", authenticateAccessToken, async (req, res) => {
  const { q, userid } = req.query;
  const { data, error } = await supabase
    .from("users")
    .select("userid, name,profilephoto")
    .ilike("name", `%${q}%`)
    .neq("userid", userid)
    .limit(10);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/startChat", authenticateAccessToken, async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    const { data: user1Memberships, error: user1Error } = await supabase
      .from("chatmembers")
      .select("chatid")
      .eq("userid", user1);
    if (user1Error) throw user1Error;
    const user1ChatIds = (user1Memberships || []).map((m) => m.chatid);
    const { data: user2Memberships, error: user2Error } = await supabase
      .from("chatmembers")
      .select("chatid")
      .eq("userid", user2);
    if (user2Error) throw user2Error;
    const user2ChatIds = (user2Memberships || []).map((m) => m.chatid);
    const commonChatId = user1ChatIds.find((id) => user2ChatIds.includes(id));
    if (commonChatId) {
      return res.json({ chatid: commonChatId });
    }
    const { data: newChat, error: chatInsertError } = await supabase
      .from("chats")
      .insert([{ isgroup: false, created_by: user1 }])
      .select()
      .single();
    if (chatInsertError) throw chatInsertError;
    const chatid = newChat.chatid;
    const { error: memberInsertError } = await supabase
      .from("chatmembers")
      .insert([
        { chatid, userid: user1 },
        { chatid, userid: user2 },
      ]);
    if (memberInsertError) throw memberInsertError;
    const { data: otherUser, error: userFetchError } = await supabase
      .from("users")
      .select("name,profilephoto")
      .eq("userid", user2)
      .single();
    if (userFetchError) throw userFetchError;
    return res.json({ chatid, otherUser });
  } catch (err) {
    console.error("Error in /startChat:", err.message || err);
    res.status(500).json({ error: "Something went wrong while starting chat" });
  }
});

app.get("/getUser/:id", authenticateAccessToken, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("users")
    .select("userid, name, email")
    .eq("userid", id)
    .single();
  if (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
  res.json(data);
});

app.get("/messages/:chatid", authenticateAccessToken, async (req, res) => {
  const { chatid } = req.params;
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(
        "messageid, chatid, senderid, message, timestamp,mediatype,mediaurl"
      )
      .eq("chatid", chatid)
      .order("timestamp", { ascending: true });
    if (error) {
      console.error("Error fetching messages:", error.message);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
    const formattedMessages = data.map((msg) => ({
      messageid: msg.messageid,
      chatid: msg.chatid,
      senderid: msg.senderid,
      message: msg.message,
      timestamp: msg.timestamp,
      mediatype: msg.mediatype,
      mediaurl: msg.mediaurl,
    }));
    res.status(200).json(formattedMessages);
  } catch (err) {
    console.error("Unexpected error:", err.message);
    res.status(500).json({ error: "Server error while fetching messages" });
  }
});

app.post("/messages", authenticateAccessToken, async (req, res) => {
  const { chatid, senderid, message } = req.body;
  if (!chatid || !senderid || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ chatid, senderid, message }])
      .select()
      .single();
    if (error) {
      console.error("Error inserting message:", error.message);
      return res.status(500).json({ error: "Failed to send message" });
    }
    res.status(201).json({
      messageid: data.messageid,
      chatid: data.chatid,
      senderid: data.senderid,
      message: data.message,
      timestamp: data.timestamp,
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);
    res.status(500).json({ error: "Server error while sending message" });
  }
});

const otpStore = new Map();
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/sendOtp", async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const expiry = Date.now() + 5 * 60 * 1000;
  otpStore.set(email, { otp, expiry });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code for ChatMates!!",
      text: `Your OTP is ${otp}`,
    });
    res.json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("OTP send failed:", error.message);
    res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
});

app.post("/verifyOtp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record)
    return res.status(400).json({ success: false, error: "OTP not found" });
  if (Date.now() > record.expiry) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, error: "OTP expired" });
  }
  if (otp !== record.otp)
    return res.status(400).json({ success: false, error: "Invalid OTP" });
  otpStore.delete(email);
  return res.json({ success: true, message: "OTP verified" });
});

const upload = multer({ storage: multer.memoryStorage() });
app.post(
  "/uploadFile",
  authenticateAccessToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      const { chatid } = req.body;
      const { userid } = req.user;
      if (!file || !chatid) {
        return res.status(400).json({ error: "File and chatid are required" });
      }
      const fileName = `${userid}/${Date.now()}-${file.originalname}`;
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });
      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);
      if (publicUrlError) {
        return res.status(500).json({ error: publicUrlError.message });
      }
      const publicURL = publicUrlData.publicUrl;
      const { data: insertedMessages, error: insertError } = await supabase
        .from("messages")
        .insert([
          {
            chatid,
            message: file.originalname,
            mediatype: file.mimetype,
            mediaurl: publicURL,
            senderid: userid,
          },
        ])
        .select();
      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }
      if (insertedMessages && insertedMessages.length > 0) {
        io.emit("receive_message", insertedMessages[0]);
      }
      res.status(200).json({
        message: "File uploaded and message created successfully",
        publicUrl: publicURL,
      });
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(500).json({ error: "Server error during file upload" });
    }
  }
);

app.post(
  "/uploadProfilePhoto",
  authenticateAccessToken,
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      const userid = req.user.userid; // ✅ Only from token

      if (!file) {
        return res.status(400).json({ error: "File is required" });
      }

      if (!file.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ error: "Invalid file type. Only images are allowed" });
      }

      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "File size exceeds 5MB" });
      }

      const extension = path.extname(file.originalname);
      const fileName = `profile/${userid}-${Date.now()}${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile")
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }

      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("profile")
        .getPublicUrl(fileName);

      if (publicUrlError) {
        return res.status(500).json({ error: publicUrlError.message });
      }

      res.status(200).json({ url: publicUrlData.publicUrl });
    } catch (err) {
      console.error("Error uploading profile photo:", err);
      res
        .status(500)
        .json({ error: "Server error during profile photo upload" });
    }
  }
);

// app.put("/updateUser", authenticateAccessToken, async (req, res) => {
//   try {
//     const { userid, name, phoneno, profilephoto } = req.body;
//     if (!userid || userid !== req.user.userid) {
//       return res.status(403).json({ error: "Unauthorized user ID" });
//     }
//     if (name && name.trim() === "") {
//       return res.status(400).json({ error: "Name cannot be empty" });
//     }
//     if (profilephoto && !validator.isURL(profilephoto)) {
//       return res.status(400).json({ error: "Invalid profile photo URL" });
//     }
//     const updates = {};
//     if (name) updates.name = name;
//     if (phoneno) updates.phoneno = phoneno;
//     if (profilephoto) updates.profilephoto = profilephoto;
//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({ error: "No fields to update" });
//     }
//     const { data, error } = await supabase
//       .from("users")
//       .update(updates)
//       .eq("userid", userid)
//       .select()
//       .single();
//     if (error) {
//       console.error("Error updating user:", error.message);
//       return res.status(500).json({ error: "Failed to update user" });
//     }
//     if (!data) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     res.status(200).json({ message: "User updated successfully" });
//   } catch (err) {
//     console.error("Error updating user:", err.message);
//     res.status(500).json({ error: "Server error while updating user" });
//   }
// });

app.put("/updateUser", authenticateAccessToken, async (req, res) => {
  try {
    const userid = req.user.userid; // ✅ Only from token
    const { name, phoneno, profilephoto } = req.body;

    if (name && name.trim() === "") {
      return res.status(400).json({ error: "Name cannot be empty" });
    }
    if (profilephoto && !validator.isURL(profilephoto)) {
      return res.status(400).json({ error: "Invalid profile photo URL" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phoneno) updates.phoneno = phoneno;
    if (profilephoto) updates.profilephoto = profilephoto;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("userid", userid)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error.message);
      return res.status(500).json({ error: "Failed to update user" });
    }
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({ error: "Server error while updating user" });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}.`);
});
