import express, { type Request, type Response } from 'express';
import { verifyWorkerKey } from './middleware/auth';

const app = express();
app.use(express.json());
app.use(verifyWorkerKey);

const PORT = process.env.PORT || 3001;

app.post('/jobs', (req: Request, res: Response) => {
  const jobData = req.body;
  // Process the jobData here
  res.status(200).json({ message: 'Job received', data: jobData });
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
