import { Router } from "express";
import { FindAllMatchesUseCase } from "../../../application/use-cases/match/findAllMatchesUseCase";
import pool from "../../../config/db";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { MatchController } from "../controllers/matchController";
import { ResisterMatchUseCase } from "../../../application/use-cases/match/ResisterMatchUseCase";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresUserRepository";

const matchRepository = new PostgresMatchRepository(pool);
const playerRepository = new PostgresPlayerRepository(pool);
const findAllMatchesUseCase = new FindAllMatchesUseCase(matchRepository);
const resisterMatchUseCase = new ResisterMatchUseCase(matchRepository, playerRepository, pool)
const matchController = new MatchController(findAllMatchesUseCase, resisterMatchUseCase);

const router = Router();

router.get('/matches', (req, res) => matchController.findAll(req, res));

router.post('/match', (req, res) => matchController.resisterMatch(req, res));

export default router;