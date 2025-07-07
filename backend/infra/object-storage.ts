import * as Minio from 'minio';
import { Readable } from 'stream';

export interface ObjectStorageConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

/**
 * Класс для работы с объектным хранилищем (MinIO/S3)
 */
export class ObjectStorage {
  private client: Minio.Client;
  private bucket: string;

  constructor(config: ObjectStorageConfig) {
    this.client = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey
    });
    this.bucket = config.bucket;
  }

  /**
   * Загрузка файла в хранилище
   */
  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    try {
      // Проверяем существование bucket
      const bucketExists = await this.client.bucketExists(this.bucket);
      if (!bucketExists) {
        await this.client.makeBucket(this.bucket);
      }

      // Создаем поток из буфера
      const stream = new Readable();
      stream.push(fileBuffer);
      stream.push(null);

      // Загружаем файл
      await this.client.putObject(
        this.bucket,
        fileName,
        stream,
        fileBuffer.length,
        {
          'Content-Type': contentType
        }
      );

      // Возвращаем URL файла
      return `/image/${fileName}`;
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      throw new Error('Не удалось загрузить файл');
    }
  }

  /**
   * Получение URL для скачивания файла
   */
  async getFileUrl(fileName: string, expiry: number = 24 * 60 * 60): Promise<string> {
    try {
      return await this.client.presignedGetObject(this.bucket, fileName, expiry);
    } catch (error) {
      console.error('Ошибка при получении URL файла:', error);
      throw new Error('Не удалось получить URL файла');
    }
  }

  /**
   * Удаление файла из хранилища
   */
  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, fileName);
    } catch (error) {
      console.error('Ошибка при удалении файла:', error);
      throw new Error('Не удалось удалить файл');
    }
  }

  /**
   * Получение файла как буфера
   */
  async getFile(fileName: string): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(this.bucket, fileName);
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Ошибка при получении файла:', error);
      throw new Error('Не удалось получить файл');
    }
  }
}
