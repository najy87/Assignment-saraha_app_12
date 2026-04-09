import { DBRepositoty } from "../../db.repository.js";
import { Token } from "./token.model.js";

class TokenRepository extends DBRepositoty {
  constructor() {
    super(Token);
  }
}

export const tokenRepository = new TokenRepository();
