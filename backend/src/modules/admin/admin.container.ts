import { AdminReposiotry } from "./admin.repository.js";
import { AdminService } from "./admin.service.js";

const adminRepository = new AdminReposiotry();
const adminService = new AdminService(adminRepository);

export { adminService };