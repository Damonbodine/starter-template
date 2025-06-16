/**
 * API Documentation Endpoint
 * Serves Swagger/OpenAPI documentation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { swaggerSpec } from '../../src/lib/api-docs/swagger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(swaggerSpec);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}