import "dotenv/config";
import config from "./config/config.ts";
import type { Express, NextFunction, Request, Response } from "express"
import express from "express"

//Import files
import {  errorHandler } from "./middlewares/errorHandler.ts";
import { loggingMiddleware } from "./middlewares/logging.ts";
import { limiter } from "./utils/rate-limiting.ts";
import { customApiError } from "./utils/apiError.ts";
import countryRoutes from "./routes/countryRoute.ts";

const app: Express = express();
const PORT = config.PORT;

app.set('trust proxy', 1);

// Middlewares
app.use(express.json());
app.use(loggingMiddleware);
app.use(limiter);

// Routes
app.use("/", countryRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to the Currency and Exchange API");
});

app.use((req: Request, _res: Response, next: NextFunction) => {
  const url = req.originalUrl;
  const method = req.method;
  const timestamp = new Date().toISOString();
  const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
console.log(fullUrl)
  next(
    new customApiError(
      `Route ${url} Not Found for request type: ${method}`,
      404
    )
  );
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


