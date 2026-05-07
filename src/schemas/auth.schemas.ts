import { z } from "zod";
//this file is used to validate the request body for the login route
//the reason why the folder is called schemas is because it is used to validate the request body for the login route
//and zod is a library that is used to validate the request body for the login route

export const loginBodySchema = z.object({
  username: z.string().trim().min(1).max(128),
  password: z.string().min(1).max(256),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
