export type WorkerAPIResponse = {
  data: {
    jobId: string;
  } | null;
  error: string | null;
};
