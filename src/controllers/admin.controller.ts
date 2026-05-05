//This file is used to handle the request and response for the admin routes
//the difference between admin controller and auth controller is that admin controller is used to handle the request and response for the admin routes
//and auth controller is used to handle the request and response for the auth routes

import type { NextFunction, Request, Response } from "express";
import * as adminRepository from "../repositories/admin.repository.js";
//This function is used to handle the request and response for the admin routes
//we are passing the request, response and next function to the function
//nextFunction is used to handle the errors, errors such as validation errors, unauthorized errors, etc.
export async function me(req: Request, res: Response, next: NextFunction) {
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
  } catch (err) {
    next(err);
  }
}
