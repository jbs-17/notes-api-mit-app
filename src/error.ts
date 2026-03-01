export class AppError extends Error{
       statusCode : number;
       constructor(message : string, statusCode : number = 400){
              super(message);
              this.statusCode = statusCode ;
       }
}


export class authGoogleReqIdRequiredError extends AppError {
       constructor(){
              super("auth_req_id required!");
       }
}



export class authGoogleCallbackStateInvalidError extends AppError {
       constructor() {
              super("state invalid!");
       }
}

export class authGoogleCallbackReqExpiredError extends AppError {
       constructor() {
              super("state invalid!");
       }
}