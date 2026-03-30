
# Android Notes App (invented with MIT App Inventor) integrated with a RESTful backend.

A RESTful backend built with Bun and ExpressJS framework serve the notes application. It provides endpoints for user quick and secure authentication with Google, as well as backup and synchronization of notes stored in a MongoDB Atlas database.

## Main Tech Stack and 3rd service provider
- Bun and its dependencies (ExpresssJS, MongoDB driver for nodejs, jwt, zod, etc)
- Google OAuth 2.0: a secure and fast user identity and authentication service provider without user passwords
- MongoDB Atlas: a cloud database service for data storage
- Vercel : Cloud hosting platform


## Oauth2.0 Endpoints
- Prefix : /auth/google
### GET /make_request
- response example: 
##### 200 : 
```
{
    "auth_google_url":"https://accounts.google.com/o/oauth2/v2/...",
    "auth_req_id":"pSz3TaO..."
}
```

### GET /check_request?auth_req_id={auth_req_id}
- query param :
  + `auth_req_id`
- Response example :
##### 200 : 
```
{
    "id":"69ca785639227892bd9kmc4f",
    "auth_req_id": "pSz3TaO...",
    "auth_google_url": "https://accounts.google.com/o/oauth2/v2/...",
    "status":"PENDING" | "EXPIRED" | "SUCCESS" | "FAILED",
    "created_at":"2026-03-07T13:19:18.186Z" | ISO_DATETIME,
    "updated_at":"2026-03-07T13:19:18.186Z" | ISO_DATETIME,
    "message":"Waiting for callback" | string,
    "token":null | "jwt_token" // jwt for login token  
}
```

##### 404 :
```
{"message":"Invalid Auth Request"}

```




## User Endpoints
### GET /user/profile
- Required Headers for this group endpoints
  + `Authorization : Bearer <jwt_login_token>`

 
##### 200 :
```
{
    "id": "69b1e...",
    "essential": {
        "email": "...@gmail.com",
        "name": string,
        "picture": "https://lh3.googleusercontent.com/a/..."
    },
    "timestamps": {
        "created_at": 1773266011626,
        "updated_at": 1774877899397
    }
}

```

##### 401 :
```
{
    "message": "Invalid Token Format"
}
```

##### 403 :
```
{
    "message": "User not found or inactive"
}
```







## Notes Api Endpoints
- prefix : /api/notes
-  required Headers for this group endpoints :
  + `Authorization : Bearer <jwt_login_token>`
  
- 4xx general responses :
##### 401 :
```
{
    "message": "Invalid Token Format"
}
```
##### 403 :
```
{
    "message": "User not found or inactive"
}
```


### GET /pull
##### 200 : 
```
[
    {
          "string_uid": "8oj...",
          "is_deleted": boolean,
          "is_dirty": boolean,
          "string_content": "isi catatn",
          "string_title": "catatan 1",
          "time_created_at": 1773360592666,
          "time_updated_at": 1773367376681,
          "user_id": "69b..."
    },
   ...
]
```

### POST /push
- request body:
```
[
  {
        "string_uid": "Fj9s...",",
        "string_title": string,
        "string_content": "string",
        "time_created_at": 12901313,
        "time_updated_at": 1731831931,
        "is_deleted": boolean,
        "is_dirty" : boolean,
        "user_id": "69b..."
  },
  ...
]
```

##### 200 : 
```
{
    "message": "Sync completed",
    "matched": 0,
    "upserted": 2,
    "modified": 0
}
```









## General Internal Server Error Response
5xx : 
```
{
    "message": string,
    "error": any
}
```

















