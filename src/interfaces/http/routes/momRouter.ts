import { Router } from "express";
import pool from "../../../config/db";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { MomContoroller } from "../controllers/momController";
import { FindMomByMatchIdUseCase } from "../../../application/use-cases/mom/findMomByMatchIdUseCase";
import { ResisterMomUseCase } from "../../../application/use-cases/mom/resisterMomUseCase";
import { PostgresMomRepository } from "../../../infrastructure/repositories/PostgresMomRepository";
import { FindMomRankingByPlayerIdUseCase } from "../../../application/use-cases/mom/findMomRankingByPlayerId";
import { FindMomRankingByConventionIdUseCase } from "../../../application/use-cases/mom/findMomRankingByConventionId";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresPlayerRepository";

const matchRepository = new PostgresMatchRepository();
const conventionRepository = new PostgresConventionRepository(pool);
const momRepository = new PostgresMomRepository(pool);
const playerRepository = new PostgresPlayerRepository();

const findMomByMatchIdUseCase = new FindMomByMatchIdUseCase(momRepository, matchRepository, conventionRepository, pool);
const resisterMomUseCase = new ResisterMomUseCase(momRepository, matchRepository, conventionRepository, pool);
const findMomRankingByConventionIdUseCase = new FindMomRankingByConventionIdUseCase(momRepository, conventionRepository);
const findMomRankingByPlayerIdUseCase = new FindMomRankingByPlayerIdUseCase(momRepository, playerRepository, pool);

const momController = new MomContoroller(
  findMomByMatchIdUseCase,
  resisterMomUseCase,
  findMomRankingByConventionIdUseCase,
  findMomRankingByPlayerIdUseCase
);

const router = Router();

/**
 * 大会・試合に関するMomの取得・登録
 */
router.get(`/conventions/:convention_id/matches/:match_id/mom`, (req, res) => momController.findMom(req, res));
router.post(`/conventions/:convention_id/matches/:match_id/mom`, (req, res) => momController.resisterMom(req, res));

router.get('/mom', (req, res) => momController.findMomRanking(req, res));

export default router;