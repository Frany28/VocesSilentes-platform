import { createUserSchema, editUserSchema, userIdSchema } from './users.validation.js';

/**
 * Traduce HTTP validado a operaciones de usuarios y devuelve exclusivamente el DTO permitido.
 * @param {object} service Negocio de usuarios persistentes.
 * @returns {object} Controllers get/create/edit; errores delegados al middleware común.
 */
export function createUsersController(service) {
  return {
    async get(req, res) {
      res.json({ data: { user: await service.get(userIdSchema.parse(req.params.id)) } });
    },
    async create(req, res) {
      const user = await service.create(req.auth.id, createUserSchema.parse(req.body));
      res.status(201).json({ data: { user } });
    },
    async edit(req, res) {
      const user = await service.edit(
        req.auth.id,
        userIdSchema.parse(req.params.id),
        editUserSchema.parse(req.body),
      );
      res.json({ data: { user } });
    },
  };
}
