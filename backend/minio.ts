import {Client} from "minio";
import dotenv from "dotenv";
dotenv.config();

export const BUCKET_NAME = 'acolhemais';

const minioClient = new Client({
    endPoint: process.env.MINIO_HOST || "localhost",
    port: process.env.MINIO_PORT || 9002,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

minioClient.bucketExists(BUCKET_NAME, (err) => {
    if (err) {
        minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
    }
});


export {minioClient,};

