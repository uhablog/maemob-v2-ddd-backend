import { Router } from "express";
import { ConventionController } from "../controllers/conventionController";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import pool from "../../../config/db";
import { ResisterConventionUseCase } from "../../../application/use-cases/convention/resisterConventionUseCase";
import { FindAllConventionsUseCase } from "../../../application/use-cases/convention/findAllConventionsUseCase";
import { FindConventionByIdUseCase } from "../../../application/use-cases/convention/findConventionByIdUseCase";

const conventionRepository = new PostgresConventionRepository(pool);
const findAllConventionsUseCase = new FindAllConventionsUseCase(conventionRepository);
const resisterConventionUseCase = new ResisterConventionUseCase(conventionRepository);
const findConventionByIdUseCase = new FindConventionByIdUseCase(conventionRepository);
const conventionController = new ConventionController(
  findAllConventionsUseCase,
  resisterConventionUseCase,
  findConventionByIdUseCase,
);

const router = Router();

router.get('/conventions', (req, res) => conventionController.findAll(req, res));
router.post('/conventions', (req, res) => conventionController.resisterConvention(req, res));

router.get('/convention/:convention_id', (req, res) => conventionController.findById(req, res));

export default router;