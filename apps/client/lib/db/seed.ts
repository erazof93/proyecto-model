/**
 * Seed de desarrollo sobre TypeORM. Equivalente a apps/supabase/migrations/
 * 002_seed_data.sql pero ejecutable con `pnpm seed` (necesita DATABASE_URL en
 * el entorno).
 *
 * Idempotente y ADITIVO: cada entidad se crea sólo si no existe (admin y
 * customer por username, checklists por nombre, modelos por username), así que
 * re-ejecutarlo tras ampliar MODEL_NAMES añade únicamente las modelos nuevas.
 *
 *   DATABASE_URL=postgres://... pnpm --filter @proyecto-model/client seed
 */
import { hashPassword } from "../auth/password";
import { Checklist } from "../entities/Checklist";
import { Model } from "../entities/Model";
import { ModelChecklist } from "../entities/ModelChecklist";
import { Review } from "../entities/Review";
import { User } from "../entities/User";
import { generateSlug } from "@proyecto-model/utils";
import { initializeDataSource } from "./data-source";

const MODEL_NAMES = [
  "Sofía",
  "Valentina",
  "Camila",
  "Alejandra",
  "Daniela",
  "Isabella",
  "María",
  "Carolina",
  "Antonia",
  "Rosario",
  "Bárbara",
  "Francisca",
  "Gabriela",
  "Herminia",
  "Irene",
  "Jacqueline",
  "Karina",
  "Luisa",
  "Mariana",
  "Natalia",
  "Olga",
  "Patricia",
  "Quintina",
  "Ramona",
  "Susana",
  "Teresa",
  "Úrsula",
  "Verónica",
];

const CHECKLIST_NAMES = [
  "24 horas disponible",
  "Masaje",
  "Conversación",
  "Compañía",
  "Fotos privadas",
];

export async function seedDatabase() {
  const ds = await initializeDataSource();
  const users = ds.getRepository(User);
  const models = ds.getRepository(Model);
  const checklists = ds.getRepository(Checklist);
  const modelChecklists = ds.getRepository(ModelChecklist);
  const reviews = ds.getRepository(Review);

  // --- Admin (idempotente por username) ---
  if (!(await users.existsBy({ username: "admin" }))) {
    await users.save(
      users.create({
        email: "admin@modelosmkt.com",
        username: "admin",
        password_hash: await hashPassword("admin123"),
        role: "admin",
        is_active: true,
      }),
    );
  }

  // --- Checklists (idempotente por nombre) ---
  const checklistRows: Checklist[] = [];
  for (const name of CHECKLIST_NAMES) {
    let row = await checklists.findOne({ where: { name } });
    row ??= await checklists.save(
      checklists.create({ name, description: `Servicio: ${name}`, is_active: true }),
    );
    checklistRows.push(row);
  }

  // --- Modelos (idempotente por username) ---
  let createdModels = 0;
  const modelsByName = new Map<string, Model>();
  for (let i = 0; i < MODEL_NAMES.length; i++) {
    const name = MODEL_NAMES[i];
    const username = `${generateSlug(name)}_lima`;

    const existing = await models.findOne({ where: { username } });
    if (existing) {
      modelsByName.set(name, existing);
      continue;
    }

    const user = await users.save(
      users.create({
        username,
        password_hash: await hashPassword("password123"),
        role: "model",
        is_active: true,
      }),
    );

    const model = await models.save(
      models.create({
        user_id: user.id,
        name,
        username,
        slug: `${generateSlug(name)}-lima`,
        gender: "WOMAN",
        age: 23 + (i % 10),
        city: "Lima",
        is_verified: i % 4 !== 0,
        status: "ACTIVE",
      }),
    );
    modelsByName.set(name, model);
    createdModels++;

    const assigned = checklistRows.slice(0, 2 + (i % 3));
    await modelChecklists.save(
      assigned.map((c) => modelChecklists.create({ model_id: model.id, checklist_id: c.id })),
    );
    await models.update(
      { id: model.id },
      { services: assigned.map((c) => c.name) } as Partial<Model>,
    );
  }

  // --- Customer de ejemplo (idempotente por username) ---
  let customer = await users.findOne({ where: { username: "customer1" } });
  customer ??= await users.save(
    users.create({
      username: "customer1",
      password_hash: await hashPassword("password123"),
      role: "customer",
      is_active: true,
    }),
  );

  // --- Reviews de ejemplo sobre la primera modelo (idempotente) ---
  const firstModel = modelsByName.get(MODEL_NAMES[0]);
  if (firstModel && !(await reviews.existsBy({ model_id: firstModel.id }))) {
    await reviews.save([
      reviews.create({
        model_id: firstModel.id,
        customer_id: customer.id,
        rating: 5,
        comment: "Excelente servicio, muy profesional",
      }),
      reviews.create({
        model_id: firstModel.id,
        customer_id: customer.id,
        rating: 4,
        comment: "Muy buena experiencia",
      }),
    ]);
  }

  const totalModels = await models.count();
  console.log(
    `✅ Seed OK: 1 admin, +${createdModels} modelos nuevas (${totalModels} en total), ` +
      `${checklistRows.length} checklists.`,
  );
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Error en el seed:", err);
      process.exit(1);
    });
}
