import { Router } from "express";
import { FindScorerByMatchIdUseCase } from "../../../application/use-cases/scorer/findScorerByMatchIdUseCase";
import { ResisterScorerUseCase } from "../../../application/use-cases/scorer/resisterScorerUseCase";
import pool from "../../../config/db";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { PostgresScorerRepository } from "../../../infrastructure/repositories/PostgresScorerRepository";
import { ScorerContoroller } from "../controllers/scorerController";

const matchRepository = new PostgresMatchRepository(pool);
const conventionRepository = new PostgresConventionRepository(pool);
const socrerRepository = new PostgresScorerRepository(pool);

const findScorerByMatchIdUseCase = new FindScorerByMatchIdUseCase(socrerRepository, matchRepository, conventionRepository);
const resisterScorerUseCase = new ResisterScorerUseCase(socrerRepository, matchRepository, conventionRepository);

const scorerController = new ScorerContoroller(findScorerByMatchIdUseCase, resisterScorerUseCase);

const router = Router();

router.get(`/conventions/:convention_id/matches/:match_id/scorers`, (req, res) => scorerController.findScorer(req, res));
router.post(`/conventions/:convention_id/matches/:match_id/scorers`, (req, res) => scorerController.resisterScorer(req, res));

export default router;