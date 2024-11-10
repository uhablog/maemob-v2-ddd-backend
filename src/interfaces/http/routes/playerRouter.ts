import { Router } from "express";
import { FindAllPlayersUseCase } from "../../../application/use-cases/player/findAllPlayersUseCase";
import pool from "../../../config/db";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresPlayerRepository";
import { PlayerController } from "../controllers/playerController";
import { FindPlayerByIdUseCase } from "../../../application/use-cases/player/findPlayerByIdUseCase";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";
import { ResisterPlayerUseCase } from "../../../application/use-cases/player/registerPlayerUseCase";

const playerRepository = new PostgresPlayerRepository();
const conventionRepository = new PostgresConventionRepository(pool);

const resisterPlayerUseCase = new ResisterPlayerUseCase(playerRepository, conventionRepository, pool);
const findAllPlayerUseCase = new FindAllPlayersUseCase(playerRepository, conventionRepository, pool);
const findPlayerByIdUseCase = new FindPlayerByIdUseCase(playerRepository, conventionRepository, pool);

const playerController = new PlayerController(
  resisterPlayerUseCase,
  findAllPlayerUseCase,
  findPlayerByIdUseCase
);

const router = Router();

router.get('/conventions/:convention_id/players', (req, res) => playerController.findAll(req, res));
router.post('/conventions/:convention_id/players', (req, res) => playerController.resister(req, res));

router.get('/conventions/:convention_id/player/:id', (req, res) => playerController.findById(req, res));

export default router;
