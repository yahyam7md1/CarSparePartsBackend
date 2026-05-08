//the reason why we are importing nextfunction, request and response from express is because we are using express framework to create a server
//so we are going to use them to handle the request and response
import type { NextFunction, Request, Response } from "express";
//Zod error is used to handle the validation errors
import { ZodError } from "zod";
//AuthEnv is used to get the authentication environment variables

import type { AuthEnv } from "../config/env.js";
//Here we are importing the auth service to handle the authentication logic
import * as authService from "../services/auth.service.js";
//We are importing the loginbodyschema from the schema folder to filter grabege
import { loginBodySchema } from "../schemas/auth.schemas.js";
//We are importing the unauthorized error to handle the unauthorized errors
import { UnauthorizedError } from "../utils/errors.js";


//This function is used to create the auth controller and we are passing the auth environment variables to it
export function createAuthController(authEnv: AuthEnv) {
  return {
    //The world "Async" is used to tell the function to return a promise, a promise is a value that is not yet known but will be in the future
    
    async login(req: Request, res: Response, next: NextFunction) {
      try {
        const body = loginBodySchema.parse(req.body);
        const token = await authService.login(
          body.username,
          body.password,
          authEnv,
        );
        res.json({ token });
      } catch (err) {
        if (err instanceof ZodError) {
          res.status(400).json({
            error: "Invalid request",
            details: err.flatten(),
          });
          return;
        }
        if (err instanceof UnauthorizedError) {
          res.status(401).json({ error: err.message });
          return;
        }
        next(err);
      }
    },

    async logout(_req: Request, res: Response, next: NextFunction) {
      try {
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}
