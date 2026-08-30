import { AuthorizationRepository } from "./authorization.repository.js";
import { AuthorizationService } from "./authorization.service.js";

const authorizationRepository = new AuthorizationRepository();
const authorizationService = new AuthorizationService(authorizationRepository);

export { authorizationService };