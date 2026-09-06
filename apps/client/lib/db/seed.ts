/**
 * Seed de desarrollo sobre TypeORM. Equivalente a apps/supabase/migrations/
 * 002_seed_data.sql pero ejecutable con `pnpm seed` (necesita DATABASE_URL en
 * el entorno). Idempotente: si ya existe el admin, no hace nada.
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

  if (await users.existsBy({ username: "admin" })) {
    console.log("ℹ️  Ya sembrado (existe el usuario admin). Nada que hacer.");
    return;
  }

  await users.save(
    users.create({
      email: "admin@modelosmkt.com",
      username: "admin",
      password_hash: await hashPassword("admin123"),
      role: "admin",
    }),
  );

  const checklistRows = await checklists.save(
    CHECKLIST_NAMES.map((name) =>
      checklists.create({ name, description: `Servicio: ${name}`, is_active: true }),
    ),
  );

  const createdModels: Model[] = [];
  for (let i = 0; i < MODEL_NAMES.length; i++) {
    const name = MODEL_NAMES[i];
    const username = `${generateSlug(name)}_lima`;

    const user = await users.save(
      users.create({
        username,
        password_hash: await hashPassword("password123"),
        role: "model",
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
    createdModels.push(model);

    const assigned = checklistRows.slice(0, 2 + (i % 3));
    await modelChecklists.save(
      assigned.map((c) => modelChecklists.create({ model_id: model.id, checklist_id: c.id })),
    );
    await models.update(
      { id: model.id },
      { services: assigned.map((c) => c.name) } as Partial<Model>,
    );
  }

  const customer = await users.save(
    users.create({
      username: "customer1",
      password_hash: await hashPassword("password123"),
      role: "customer",
    }),
  );

  await reviews.save([
    reviews.create({
      model_id: createdModels[0].id,
      customer_id: customer.id,
      rating: 5,
      comment: "Excelente servicio, muy profesional",
    }),
    reviews.create({
      model_id: createdModels[0].id,
      customer_id: customer.id,
      rating: 4,
      comment: "Muy buena experiencia",
    }),
  ]);

  console.log(`✅ Seed OK: 1 admin, ${createdModels.length} modelos, ${checklistRows.length} checklists.`);
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Error en el seed:", err);
      process.exit(1);
    });
}
