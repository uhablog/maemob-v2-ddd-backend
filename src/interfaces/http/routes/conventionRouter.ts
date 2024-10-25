import { Router } from "express";
import { ConventionController } from "../controllers/conventionController";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import pool from "../../../config/db";
import { ResisterConventionUseCase } from "../../../application/use-cases/convention/resisterConventionUseCase";
import { FindAllConventionsUseCase } from "../../../application/use-cases/convention/findAllConventionsUseCase";

const conventionRepository = new PostgresConventionRepository(pool);
const findAllConventionsUseCase = new FindAllConventionsUseCase(conventionRepository);
const resisterConventionUseCase = new ResisterConventionUseCase(conventionRepository);
const conventionController = new ConventionController(
  findAllConventionsUseCase,
  resisterConventionUseCase
);

const router = Router();

router.get('/conventions', (req, res) => conventionController.findAll(req, res));
router.post('/conventions', (req, res) => conventionController.resisterConvention(req, res));

export default router;