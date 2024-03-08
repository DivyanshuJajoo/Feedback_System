import express from "express";
import dotenv from "dotenv";
import swagger from "swagger-ui-express";
import userRoute from "./src/features/user/user.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

dotenv.config();
import apiDocs from "./swagger_ver3.0.json" assert { type: "json" };
import { ApplicationError } from "./src/errorHandle/error.js";
import { connectToMongoDB } from "./src/config/mongodb.js";
import loggerMiddleware from "./src/middleware/logger.middleware.js";
import jwtAuthProf from "./src/middleware/jwt.middleware.js";
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.json({ type: "application/*+json" }));
var urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(cookieParser());
const port = process.env.PORT || 3000;
var corsOptions = {
  origin: "http://127.0.0.1:80",
  allowedHeaders: "*",
};
app.use(cors(corsOptions));

app.use(express.json());
app.use((err, res, req, next) => {
  console.log(err);
  if (err instanceof ApplicationError) {
    res.status(err.code).send(err.message);
  }
  res.status(500).send("Something went wrong,please try later");
});
app.use(loggerMiddleware);
app.use("/api/user/", userRoute);
app.use("/api-docs", swagger.serve, swagger.setup(apiDocs));


app.get("/", (req, res) => {
  res.render('Login')
});
app.get("/login", (req, res) => {
  res.render('Login')
});
app.get("/signup", (req, res) => {
  res.render('signup')
});

const subjects = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
];

const faculties = [
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
  { id: 3, name: 'c' }
];

app.get('/feedback', (req, res) => {
  res.render('feedback', { subjects, faculties });
});

app.post('/feedback', (req, res) => {
  // Process the form submission here
  console.log(req.body);
  const { subject, faculty } = req.body;

    subjects = subjects.filter(s => s.id !== parseInt(subject));
    faculties = faculties.filter(f => f.id !== parseInt(faculty));
  res.redirect('/feedback');
});

app.use((req, res) => {
  res.status(404).send("API not found.");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
  connectToMongoDB();
});