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
import http from 'http';
import { expressjwt } from 'express-jwt';
import JwksRsa from 'jwks-rsa';
import { unless } from 'express-unless';

const app = express();
app.use(express.json());

// CORSの設定
app.use(cors({
  origin: '*',  // 必要に応じて特定のオリジンに制限することも可能
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // 必要なHTTPメソッドを指定
  allowedHeaders: ['Content-Type', 'Authorization']  // 必要なヘッダーを指定
}));

// Swagger UIをセットアップ
if (process.env.NODE_ENV !== 'production') {
  console.log('Swagger UI Setup');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// 認可用のコードを追加
const authConfig = {
  domain: process.env.AUTH0_DOMAIN!,
  audience: process.env.AUTH0_AUDIENCE!,
};

const checkJwt = expressjwt({
  secret: JwksRsa.expressJwtSecret({
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
  }),
  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ['RS256'],
});

checkJwt.unless = unless;

// テスト時外は認証をする
if (process.env.NODE_ENV !== 'test') {

  // Swagger UIからのリクエストの場合は認可をしない
  app.use(checkJwt.unless({
    path: [
      '/api-docs/',
      '/api-docs/*',
    ],
    custom: (req) => {
      const referer = req.headers.referer || '';
      return referer.includes('/api-docs');
    }
  }));
}


app.use('/api', [
  playerRouter,
  matchRouter,
  conventionRouter,
  scorerRouter,
  assistRouter,
  momRouter
]);

const PORT = process.env.PORT || 8888;

let server: http.Server | undefined;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

// export default app;
export { app, server };