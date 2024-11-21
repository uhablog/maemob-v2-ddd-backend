import { Router } from "express";
import pool from "../../../config/db";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { PostgresMatchRepository } from "../../../infrastructure/repositories/PostgresMatchRepository";
import { MomContoroller } from "../controllers/momController";
import { FindMomByMatchIdUseCase } from "../../../application/use-cases/mom/findMomByMatchIdUseCase";
import { ResisterMomUseCase } from "../../../application/use-cases/mom/resisterMomUseCase";
import { PostgresMomRepository } from "../../../infrastructure/repositories/PostgresMomRepository";

const matchRepository = new PostgresMatchRepository();
const conventionRepository = new PostgresConventionRepository(pool);
const momRepository = new PostgresMomRepository(pool);

const findMomByMatchIdUseCase = new FindMomByMatchIdUseCase(momRepository, matchRepository, conventionRepository, pool);
const resisterMomUseCase = new ResisterMomUseCase(momRepository, matchRepository, conventionRepository, pool);

const momController = new MomContoroller(
  findMomByMatchIdUseCase,
  resisterMomUseCase,
);

const router = Router();

/**
 * 大会・試合に関するMomの取得・登録
 */
router.get(`/conventions/:convention_id/matches/:match_id/mom`, (req, res) => momController.findMom(req, res));
router.post(`/conventions/:convention_id/matches/:match_id/mom`, (req, res) => momController.resisterMom(req, res));

export default router;