import { Router } from "express";
import { FindAllPlayersUseCase } from "../../../application/use-cases/player/findAllPlayersUseCase";
import { ResisterPlayerUseCase } from "../../../application/use-cases/player/RegisterPlayerUseCase";
import pool from "../../../config/db";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresPlayerRepository";
import { PlayerController } from "../controllers/playerController";
import { FindPlayerByIdUseCase } from "../../../application/use-cases/player/findPlayerByIdUseCase";
import { PostgresConventionRepository } from "../../../infrastructure/repositories/PostgresConventionRepository";

const playerRepository = new PostgresPlayerRepository(pool);
const conventionRepository = new PostgresConventionRepository(pool);
const resisterPlayerUseCase = new ResisterPlayerUseCase(playerRepository, conventionRepository);
const findAllPlayerUseCase = new FindAllPlayersUseCase(playerRepository, conventionRepository);
const findPlayerByIdUseCase = new FindPlayerByIdUseCase(playerRepository, conventionRepository);
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
