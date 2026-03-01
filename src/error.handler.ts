import { NextFunction,Request, Response } from "express";

export async function errorHandler(req : Request, res : Response , next: NextFunction) {
       res.status(404).json({
              message : `Cannot ${req.method} ${req.url}`

       })
}