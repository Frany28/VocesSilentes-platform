import { Router } from 'express';

/**
 * Define la comprobación de vida del proceso; no certifica PostgreSQL ni modelos.
 * @returns {import('express').Router} Router de salud.
 */
export function createHealthRouter() {
  const router = Router();
  router.get('/', (_request, response) => {
    response.json({ data: { status: 'ok', service: 'vocessilentes-api' } });
  });
  return router;
}
