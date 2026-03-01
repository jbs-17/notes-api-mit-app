import { NextFunction,Request, Response } from "express";
import { AppError } from "../error.js";

export async function errorHandler(err: unknown, req : Request, res : Response , next: NextFunction) {

       if(err instanceof AppError){
              res.status(err.statusCode).json({
                     message : err.message
              })

              return
       }

       res.status(500).json({
              message : `Internal Server Error : ${err}`,
              error : err
       })
}