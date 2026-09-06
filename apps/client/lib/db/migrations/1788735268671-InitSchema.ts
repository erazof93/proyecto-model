import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1788735268671 implements MigrationInterface {
    name = 'InitSchema1788735268671'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."featured_type_enum" AS ENUM('TOP', 'BANNER')`);
        await queryRunner.query(`CREATE TYPE "public"."featured_status_enum" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "featured_listings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model_id" uuid NOT NULL, "type" "public"."featured_type_enum" NOT NULL, "price" numeric(10,2) NOT NULL, "duration_days" integer NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."featured_status_enum" NOT NULL DEFAULT 'ACTIVE', "is_pinned" boolean NOT NULL DEFAULT false, "payment_id" uuid, "created_by_admin_id" uuid, "approved_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c2afa040fe2ebc6c43e574a309c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae9e2dc28bedca811e6a83b070" ON "featured_listings"  ("model_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_62dade56291c5b48ea9e31462a" ON "featured_listings"  ("end_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_510c1d5e29ec7bd0617d3cdc0e" ON "featured_listings"  ("status") `);
        await queryRunner.query(`CREATE TABLE "checklists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_336ade2047f3d713e1afa20d2c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_630a115407c3a6c217e33d4585" ON "checklists"  ("name") `);
        await queryRunner.query(`CREATE TABLE "model_checklists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model_id" uuid NOT NULL, "checklist_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_57e131ff4e8bf2b4b2aa56224a8" UNIQUE ("model_id", "checklist_id"), CONSTRAINT "PK_06895d725abb63c338598fb6a86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cd02d67dc46728b2ae25c67cd2" ON "model_checklists"  ("model_id") `);
        await queryRunner.query(`CREATE TABLE "model_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model_id" uuid NOT NULL, "cloudinary_id" character varying(255) NOT NULL, "cloudinary_url" character varying(500) NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, "is_primary" boolean NOT NULL DEFAULT false, "order_index" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_bb78960e6c9ba4b8e44cb112ff6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_040a8900a9d4d6cde652a88d59" ON "model_photos"  ("model_id") `);
        await queryRunner.query(`CREATE TABLE "reviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "rating" integer NOT NULL, "comment" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_231ae565c273ee700b283f15c1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b787dc096ff8915b078dc353c5" ON "reviews"  ("model_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4dd42f48aa60ad8c0d5d5c4ea5" ON "reviews"  ("customer_id") `);
        await queryRunner.query(`CREATE TYPE "public"."gender_enum" AS ENUM('WOMAN', 'MAN', 'TRANSGENDER')`);
        await queryRunner.query(`CREATE TYPE "public"."model_status_enum" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TABLE "models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "username" character varying(100) NOT NULL, "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "age" integer NOT NULL, "gender" "public"."gender_enum" NOT NULL, "bio" text, "avatar_url" character varying(500), "city" character varying(100), "services" text array, "height" integer, "weight" integer, "clothing_size" character varying(10), "languages" text array, "cities_travel" text array, "phone" character varying(20), "whatsapp" character varying(20), "instagram" character varying(100), "tiktok" character varying(100), "telegram" character varying(100), "is_verified" boolean NOT NULL DEFAULT false, "status" "public"."model_status_enum" NOT NULL DEFAULT 'PENDING', "is_featured" boolean NOT NULL DEFAULT false, "featured_expires_at" TIMESTAMP WITH TIME ZONE, "onboarding_completed" boolean NOT NULL DEFAULT false, "onboarding_percentage" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ef9ed7160ea69013636466bf2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3d769505b3996edfba330529b3" ON "models"  ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3fee46f15eb78a186612fd2252" ON "models"  ("username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b578c51704f87d4517e55a4099" ON "models"  ("slug") `);
        await queryRunner.query(`CREATE TYPE "public"."role_enum" AS ENUM('admin', 'model', 'customer')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255), "username" character varying(100) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."role_enum" NOT NULL DEFAULT 'customer', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users"  ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users"  ("username") `);
        await queryRunner.query(`CREATE TABLE "auth_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "event_type" character varying(50) NOT NULL, "ip_address" character varying(45), "user_agent" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f4ee581a4a56f10b64ffbfc1779" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_99bd49e6f66a26e4bf6bc7c17b" ON "auth_logs"  ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3e94fcce3204311cc27fcc1d8f" ON "auth_logs"  ("created_at") `);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'VERIFIED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model_id" uuid NOT NULL, "featured_listing_id" uuid, "amount" numeric(10,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'PEN', "payment_status" "public"."payment_status_enum" NOT NULL DEFAULT 'PENDING', "verified_at" TIMESTAMP WITH TIME ZONE, "admin_notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_912a7f52e8a4dde3b213154ac5" ON "transactions"  ("model_id") `);
        await queryRunner.query(`ALTER TABLE "featured_listings" ADD CONSTRAINT "FK_ae9e2dc28bedca811e6a83b0707" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "featured_listings" ADD CONSTRAINT "FK_86bc8ab140a293c53e3d32be69e" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "model_checklists" ADD CONSTRAINT "FK_cd02d67dc46728b2ae25c67cd27" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "model_checklists" ADD CONSTRAINT "FK_7f2abf857d63e309573998137a8" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "model_photos" ADD CONSTRAINT "FK_040a8900a9d4d6cde652a88d599" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_b787dc096ff8915b078dc353c58" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_4dd42f48aa60ad8c0d5d5c4ea5b" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "models" ADD CONSTRAINT "FK_3d769505b3996edfba330529b39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth_logs" ADD CONSTRAINT "FK_99bd49e6f66a26e4bf6bc7c17ba" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_912a7f52e8a4dde3b213154ac5f" FOREIGN KEY ("model_id") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_a5b22d85ebab35a9d68774e28bc" FOREIGN KEY ("featured_listing_id") REFERENCES "featured_listings"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_a5b22d85ebab35a9d68774e28bc"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_912a7f52e8a4dde3b213154ac5f"`);
        await queryRunner.query(`ALTER TABLE "auth_logs" DROP CONSTRAINT "FK_99bd49e6f66a26e4bf6bc7c17ba"`);
        await queryRunner.query(`ALTER TABLE "models" DROP CONSTRAINT "FK_3d769505b3996edfba330529b39"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_4dd42f48aa60ad8c0d5d5c4ea5b"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_b787dc096ff8915b078dc353c58"`);
        await queryRunner.query(`ALTER TABLE "model_photos" DROP CONSTRAINT "FK_040a8900a9d4d6cde652a88d599"`);
        await queryRunner.query(`ALTER TABLE "model_checklists" DROP CONSTRAINT "FK_7f2abf857d63e309573998137a8"`);
        await queryRunner.query(`ALTER TABLE "model_checklists" DROP CONSTRAINT "FK_cd02d67dc46728b2ae25c67cd27"`);
        await queryRunner.query(`ALTER TABLE "featured_listings" DROP CONSTRAINT "FK_86bc8ab140a293c53e3d32be69e"`);
        await queryRunner.query(`ALTER TABLE "featured_listings" DROP CONSTRAINT "FK_ae9e2dc28bedca811e6a83b0707"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_912a7f52e8a4dde3b213154ac5"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e94fcce3204311cc27fcc1d8f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99bd49e6f66a26e4bf6bc7c17b"`);
        await queryRunner.query(`DROP TABLE "auth_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b578c51704f87d4517e55a4099"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3fee46f15eb78a186612fd2252"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d769505b3996edfba330529b3"`);
        await queryRunner.query(`DROP TABLE "models"`);
        await queryRunner.query(`DROP TYPE "public"."model_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."gender_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4dd42f48aa60ad8c0d5d5c4ea5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b787dc096ff8915b078dc353c5"`);
        await queryRunner.query(`DROP TABLE "reviews"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_040a8900a9d4d6cde652a88d59"`);
        await queryRunner.query(`DROP TABLE "model_photos"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd02d67dc46728b2ae25c67cd2"`);
        await queryRunner.query(`DROP TABLE "model_checklists"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_630a115407c3a6c217e33d4585"`);
        await queryRunner.query(`DROP TABLE "checklists"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_510c1d5e29ec7bd0617d3cdc0e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62dade56291c5b48ea9e31462a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ae9e2dc28bedca811e6a83b070"`);
        await queryRunner.query(`DROP TABLE "featured_listings"`);
        await queryRunner.query(`DROP TYPE "public"."featured_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."featured_type_enum"`);
    }

}
