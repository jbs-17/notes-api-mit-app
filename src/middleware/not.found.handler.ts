import {  Handler} from "express";

export const notFoundHandler: Handler = async(req, res, next)=>{
       res.status(404).json({
              message : `Cannot ${req.method} ${req.originalUrl}`
       })
}