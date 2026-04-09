import { DBRepositoty } from "../../db.repository.js";
import { User } from "./user.model.js";

class UserRepository extends DBRepositoty {
  constructor() {
    super(User);
  }
}

export const userRepository = new UserRepository();
