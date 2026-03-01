import {MongoClient, Document} from "mongodb";
import { logger } from "./logger.js";


let client : null | InstanceType<typeof MongoClient> = null;

export async function getMongoClient(){
       if(client) return client;
       
       client = new MongoClient(process.env.MONGODB_URI);
       
       try {
              logger.info(`connecting to db...`);
              await client.connect();
              
              await client.db("test").command({ping:1});
              
              logger.info(`db connection ok!`);
              client.on('error', (error)=>{
                     client = null;
                     logger.info(error.message);

                     getMongoClient();
              });
              return client;
       } catch (error) {
              logger.fatal({error},`db connection error!`);
              throw error;
       }
}

export async function useDb(dbName : string) {
       return (await getMongoClient()).db(dbName); 
}


export async function getCollection<TDocument extends Document>(collectionName : string) {
       return (await useDb("notes_mit_app")).collection<TDocument>(collectionName);      
}