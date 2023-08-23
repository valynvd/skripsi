import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import "./loadEnvironment.mjs";
import pertanyaanumums from "./routes/pertanyaanumum.mjs";
import timelineakademiks from "./routes/timelineakademik.mjs"
import periodepembayaran from "./routes/periodepembayaran.mjs"
import seputarsaps from "./routes/seputarsap.mjs"
import seputarlms from "./routes/seputarlms.mjs"

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/pertanyaanumum", pertanyaanumums);
app.use("/timelineakademik", timelineakademiks);
app.use("/periodepembayaran", periodepembayaran);
app.use("/seputarsap", seputarsaps);
app.use("/seputarlms", seputarlms);

// start the Express server
app.listen(PORT, () => {
});