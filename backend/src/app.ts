import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(helmet());
app.use(
    cors({
        origin: ""
    })
)