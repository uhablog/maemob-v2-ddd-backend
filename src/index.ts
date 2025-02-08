import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './openapi.json';

import playerRouter from './interfaces/http/routes/playerRouter';
import matchRouter from './interfaces/http/routes/matchRouter';
import conventionRouter from './interfaces/http/routes/conventionRouter';
import scorerRouter from './interfaces/http/routes/scorerRouter';
import assistRouter from './interfaces/http/routes/assistRouter';
import momRouter from './interfaces/http/routes/momRouter';

const app = express();
app.use(express.json());

// CORSの設定
app.use(cors({
  origin: '*',  // 必要に応じて特定のオリジンに制限することも可能
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // 必要なHTTPメソッドを指定
  allowedHeaders: ['Content-Type', 'Authorization']  // 必要なヘッダーを指定
}));

// Swagger UIをセットアップ
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', [
  playerRouter,
  matchRouter,
  conventionRouter,
  scorerRouter,
  assistRouter,
  momRouter
]);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;