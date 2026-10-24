import {
  createUserSchema,
  editUserSchema,
  userIdSchema,
  userStateSchema,
} from './users.validation.js';

/**
 * Traduce HTTP validado a operaciones de usuarios y devuelve exclusivamente el DTO permitido.
 * @param {object} service Negocio de usuarios persistentes.
 * @returns {object} Controllers CRUD/audit; errores delegados al middleware común.
 */
export function createUsersController(service) {
  return {
    async summary(_req, res) {
      res.json({ data: await service.summary() });
    },
    async state(req, res) {
      const { isActive } = userStateSchema.parse(req.body);
      const user = await service.state(req.auth.id, userIdSchema.parse(req.params.id), isActive);
      res.json({ data: { user } });
    },
    async list(req, res) {
      res.json({ data: await service.list(req.query) });
    },
    async audit(req, res) {
      res.json({ data: await service.audit(req.query) });
    },
    async delete(req, res) {
      const user = await service.delete(req.auth.id, userIdSchema.parse(req.params.id));
      res.json({ data: { user } });
    },
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
