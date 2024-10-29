import { Router } from "express";
import pool from "../../../config/db";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { PostgresAssistRepository } from "../../../infrastructure/repositories/PostgresAssistRepository";
import { FindAssistByMatchIdUseCase } from "../../../application/use-cases/assist/findAssistByMatchIdUseCase";
import { ResisterAssistUseCase } from "../../../application/use-cases/assist/resisterAssistUseCase";
import { AssistContoroller } from "../controllers/assistController";

const matchRepository = new PostgresMatchRepository(pool);
const conventionRepository = new PostgresConventionRepository(pool);
const socrerRepository = new PostgresAssistRepository(pool);

const findAssistByMatchIdUseCase = new FindAssistByMatchIdUseCase(socrerRepository, matchRepository, conventionRepository);
const resisterAssistUseCase = new ResisterAssistUseCase(socrerRepository, matchRepository, conventionRepository);

const scorerController = new AssistContoroller(findAssistByMatchIdUseCase, resisterAssistUseCase);

const router = Router();

router.get(`/conventions/:convention_id/matches/:match_id/assists`, (req, res) => scorerController.findAssist(req, res));
router.post(`/conventions/:convention_id/matches/:match_id/assists`, (req, res) => scorerController.resisterAssist(req, res));

export default router;