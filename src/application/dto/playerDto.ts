import { PlayerName } from "../../domain/value-objects/playerName"
import { Points } from "../../domain/value-objects/points"

export interface PlayerDTO {
  id: number
  name: string
  points: number
}