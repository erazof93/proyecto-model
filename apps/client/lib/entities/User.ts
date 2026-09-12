import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { AuthLog } from "./AuthLog";
import { Model } from "./Model";
import { Review } from "./Review";

/** Espeja `users` de 001_init_schema.sql (rol via `role_enum` nativo). */
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, nullable: true })
  email!: string | null;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  password_hash!: string;

  @Column({
    type: "enum",
    enum: ["admin", "model", "customer", "both"],
    enumName: "role_enum",
    default: "customer",
  })
  role!: "admin" | "model" | "customer" | "both";

  @Column({ type: "boolean", default: true })
  is_active!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  // --- Relaciones ---
  @OneToMany(() => Model, (model) => model.user)
  models!: Relation<Model>[];

  @OneToMany(() => Review, (review) => review.customer)
  reviews!: Relation<Review>[];

  @OneToMany(() => AuthLog, (log) => log.user)
  auth_logs!: Relation<AuthLog>[];
}
