import { Router } from "express";
import { FindScorerByMatchIdUseCase } from "../../../application/use-cases/scorer/findScorerByMatchIdUseCase";
import { RegisterScorerUseCase } from "../../../application/use-cases/scorer/registerScorerUseCase";
import pool from "../../../config/db";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { PostgresScorerRepository } from "../../../infrastructure/repositories/PostgresScorerRepository";
import { ScorerContoroller } from "../controllers/scorerController";
import { FindScorerRankingByConventionIdUseCase } from "../../../application/use-cases/scorer/findScorerRankingByConventionId";
import { FindScorerRankingByPlayerIdUseCase } from "../../../application/use-cases/scorer/findScorerRankingByPlayerId";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresPlayerRepository";

const matchRepository = new PostgresMatchRepository();
const conventionRepository = new PostgresConventionRepository(pool);
const socrerRepository = new PostgresScorerRepository(pool);
const playerRepository = new PostgresPlayerRepository();

const findScorerByMatchIdUseCase = new FindScorerByMatchIdUseCase(socrerRepository, matchRepository, conventionRepository, pool);
const registerScorerUseCase = new RegisterScorerUseCase(socrerRepository, matchRepository, conventionRepository, pool);
const findScorerRankingByConventionIdUseCase = new FindScorerRankingByConventionIdUseCase(socrerRepository, conventionRepository);
const findScorerRankingByPlayerIdUseCase = new FindScorerRankingByPlayerIdUseCase(socrerRepository, playerRepository, pool);

const scorerController = new ScorerContoroller(
  findScorerByMatchIdUseCase,
  registerScorerUseCase,
  findScorerRankingByConventionIdUseCase,
  findScorerRankingByPlayerIdUseCase
);

const router = Router();

/**
 * 大会・試合に関するスコアの取得・追加
 */
router.get(`/conventions/:convention_id/matches/:match_id/scorers`, (req, res) => scorerController.findScorer(req, res));
router.post(`/conventions/:convention_id/matches/:match_id/scorers`, (req, res) => scorerController.registerScorer(req, res));

/**
 * 得点ランキングの取得
 */
router.get(`/scorers`, (req, res) => scorerController.findScorerRanking(req, res));

export default router;