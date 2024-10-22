import { Router } from "express";
import { FindAllPlayersUseCase } from "../../../application/use-cases/player/findAllPlayersUseCase";
import { ResisterPlayerUseCase } from "../../../application/use-cases/player/RegisterPlayerUseCase";
import pool from "../../../config/db";
import { PostgresPlayerRepository } from "../../../infrastructure/repositories/PostgresUserRepository";
import { PlayerController } from "../controllers/playerController";
import { FindPlayerByIdUseCase } from "../../../application/use-cases/player/findPlayerByIdUseCase";

const playerRepository = new PostgresPlayerRepository(pool);
const resisterPlayerUseCase = new ResisterPlayerUseCase(playerRepository);
const findAllPlayerUseCase = new FindAllPlayersUseCase(playerRepository);
const findPlayerByIdUseCase = new FindPlayerByIdUseCase(playerRepository);
const playerController = new PlayerController(
  resisterPlayerUseCase,
  findAllPlayerUseCase,
  findPlayerByIdUseCase
);

const router = Router();

router.get('/players', (req, res) => playerController.findAll(req, res));

router.get('/player/:id', (req, res) => playerController.findById(req, res));
router.post('/player', (req, res) => playerController.resister(req, res))

export default router;
