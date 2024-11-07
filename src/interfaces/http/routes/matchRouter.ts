import { Router } from "express";
import { FindAllMatchesUseCase } from "../../../application/use-cases/match/findAllMatchesUseCase";
import pool from "../../../config/db";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { MatchController } from "../controllers/matchController";
import { ResisterMatchUseCase } from "../../../application/use-cases/match/ResisterMatchUseCase";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresPlayerRepository";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";

const matchRepository = new PostgresMatchRepository(pool);
const playerRepository = new PostgresPlayerRepository(pool);
const conventionRepository = new PostgresConventionRepository(pool);
const findAllMatchesUseCase = new FindAllMatchesUseCase(matchRepository, conventionRepository);
const resisterMatchUseCase = new ResisterMatchUseCase(matchRepository, playerRepository, conventionRepository, pool)
const matchController = new MatchController(findAllMatchesUseCase, resisterMatchUseCase);

const router = Router();

router.get('/conventions/:convention_id/matches', (req, res) => matchController.findAll(req, res));
router.post('/conventions/:convention_id/matches', (req, res) => matchController.resisterMatch(req, res));

export default router;