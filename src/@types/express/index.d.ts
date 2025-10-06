/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import type * as express from 'express';
import type { User } from "@prisma/client";

declare global {
    namespace Express {
        export interface Request {
            user?: User;
        }
    }
}