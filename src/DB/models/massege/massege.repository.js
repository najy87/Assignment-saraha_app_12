import { Massege } from "./massage.model.js";
import { DBRepositoty } from "../../db.repository.js";

class MassegeRepository extends DBRepositoty {
  constructor() {
    super(Massege);
  }
}

export const massageRepository = new MassegeRepository();
