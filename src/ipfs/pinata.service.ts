import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import type { Express } from 'express';

interface PinataUploadResult {
  cid: string;
  uri: string;
}

interface PinataUploadOptions {
  file: Express.Multer.File;
  metadata?: Record<string, string>;
}

@Injectable()
export class PinataService {
  private readonly logger = new Logger(PinataService.name);
  private readonly pinataJwt?: string;

  constructor(private readonly configService: ConfigService) {
    this.pinataJwt = this.configService.get<string>('PINATA_JWT');
  }

  async uploadFile({ file, metadata }: PinataUploadOptions): Promise<PinataUploadResult> {
    if (!this.pinataJwt) {
      this.logger.error('PINATA_JWT missing from configuration');
      throw new BadRequestException('Pinata credentials missing');
    }
    if (!file?.buffer?.length) {
      throw new BadRequestException('Company logo file missing or empty');
    }

    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname || 'logo.bin',
      contentType: file.mimetype || 'application/octet-stream',
    });

    form.append(
      'pinataMetadata',
      JSON.stringify({
        name: metadata?.name ?? file.originalname ?? 'trusty-dust-job-logo',
        keyvalues: metadata ?? {},
      }),
    );
    form.append(
      'pinataOptions',
      JSON.stringify({
        cidVersion: 1,
      }),
    );

    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', form, {
        headers: {
          Authorization: `Bearer ${this.pinataJwt}`,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
      });
      const cid = response.data?.IpfsHash as string;
      if (!cid) {
        throw new Error('Pinata response missing IpfsHash');
      }
      return { cid, uri: `ipfs://${cid}` };
    } catch (error) {
      this.logger.error(`Pinata upload failed: ${error instanceof Error ? error.message : error}`);
      throw new BadRequestException('Failed to upload company logo to IPFS');
    }
  }
}

