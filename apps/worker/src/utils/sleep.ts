// 1. Define an asynchronous sleep function
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
