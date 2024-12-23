import express from 'express';
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