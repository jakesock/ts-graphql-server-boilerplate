declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_HOST: string;
      DB_PORT: string;
      DEV_DB: string;
      TEST_DB: string;
      PROD_DB: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      EMAIL_USER: string;
      EMAIL_PASSWORD: string;
      EMAIL_HOST: string;
      EMAIL_PORT: string;
      SESSION_SECRET: string;
      FRONTEND_URL: string;
    }
  }
}

export {};
