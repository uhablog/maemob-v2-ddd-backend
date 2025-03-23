import { Router } from "express";
import { FindAllMatchesUseCase } from "../../../application/use-cases/match/findAllMatchesUseCase";
import pool from "../../../config/db";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { MatchController } from "../controllers/matchController";
import { ResisterMatchUseCase } from "../../../application/use-cases/match/resisterMatchUseCase";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresPlayerRepository";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { FindMatchByIdUseCase } from "../../../application/use-cases/match/findMatchByIdUseCase";

const matchRepository = new PostgresMatchRepository();
const playerRepository = new PostgresPlayerRepository();
const conventionRepository = new PostgresConventionRepository(pool);

const findAllMatchesUseCase = new FindAllMatchesUseCase(matchRepository, conventionRepository, pool);
const findMatchByIdUseCase = new FindMatchByIdUseCase(matchRepository, pool);
const resisterMatchUseCase = new ResisterMatchUseCase(matchRepository, playerRepository, conventionRepository, pool)

const matchController = new MatchController(findAllMatchesUseCase, findMatchByIdUseCase, resisterMatchUseCase);

const router = Router();

router.get('/conventions/:convention_id/matches', (req, res) => matchController.findAll(req, res));
router.post('/conventions/:convention_id/matches', (req, res) => matchController.resisterMatch(req, res));

router.get('/conventions/:convention_id/match/:match_id', (req, res) => matchController.findById(req, res));

export default router;