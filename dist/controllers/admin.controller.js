import * as adminRepository from "../repositories/admin.repository.js";
export async function me(req, res, next) {
    try {
        const adminId = req.adminId;
        if (!adminId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const admin = await adminRepository.findAdminById(adminId);
        if (!admin) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        res.json({
            id: admin.id,
            username: admin.username,
            createdAt: admin.createdAt.toISOString(),
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=admin.controller.js.map