import { Router } from "express";
import pool from "../../../config/db";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { PostgresAssistRepository } from "../../../infrastructure/repositories/PostgresAssistRepository";
import { FindAssistByMatchIdUseCase } from "../../../application/use-cases/assist/findAssistByMatchIdUseCase";
import { RegisterAssistUseCase } from "../../../application/use-cases/assist/registerAssistUseCase";
import { AssistContoroller } from "../controllers/assistController";
import { FindAssistRankingByConventionIdUseCase } from "../../../application/use-cases/assist/findAssistRankingByConventionId";
import { FindAssistRankingByPlayerIdUseCase } from "../../../application/use-cases/assist/findAssistRankingByPlayerId";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresPlayerRepository";

const matchRepository = new PostgresMatchRepository();
const conventionRepository = new PostgresConventionRepository(pool);
const assistRepository = new PostgresAssistRepository(pool);
const playerRepository = new PostgresPlayerRepository();

const findAssistByMatchIdUseCase = new FindAssistByMatchIdUseCase(assistRepository, matchRepository, conventionRepository, pool);
const resisterAssistUseCase = new RegisterAssistUseCase(assistRepository, matchRepository, conventionRepository, pool);
const findAssistRankingByConventionIdUseCase = new FindAssistRankingByConventionIdUseCase(assistRepository, conventionRepository);
const findAssistRankingByPlayerIdUseCase = new FindAssistRankingByPlayerIdUseCase(assistRepository, playerRepository, pool);

const assistController = new AssistContoroller(
  findAssistByMatchIdUseCase,
  resisterAssistUseCase,
  findAssistRankingByConventionIdUseCase,
  findAssistRankingByPlayerIdUseCase
);

const router = Router();

/**
 * 大会・試合に関するアシストの取得・登録
 */
router.get(`/conventions/:convention_id/matches/:match_id/assists`, (req, res) => assistController.findAssist(req, res));
router.post(`/conventions/:convention_id/matches/:match_id/assists`, (req, res) => assistController.registerAssist(req, res));

router.get('/assists', (req, res) => assistController.findAssistsRanking(req, res));

export default router;