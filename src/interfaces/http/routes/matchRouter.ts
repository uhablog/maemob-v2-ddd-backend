import { Router } from "express";
import { FindAllMatchesUseCase } from "../../../application/use-cases/match/findAllMatchesUseCase";
import pool from "../../../config/db";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { MatchController } from "../controllers/matchController";

const matchRepository = new PostgresMatchRepository(pool);
const findAllMatchesUseCase = new FindAllMatchesUseCase(matchRepository);
const matchController = new MatchController(findAllMatchesUseCase);

const router = Router();

router.get('/matches', (req, res) => matchController.findAll(req, res));

export default router;