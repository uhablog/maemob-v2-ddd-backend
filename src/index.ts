import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from './openapi.json';
import playerRouter from './interfaces/http/routes/playerRouter';

const app = express();
app.use(express.json());

// Swagger UIをセットアップ
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', playerRouter);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;