import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { Model } from "./Model";
import { User } from "./User";

/** Espeja `reviews` de 001_init_schema.sql. Sin `updated_at` (no existe en la tabla). */
@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  model_id!: string;

  @Index()
  @Column({ type: "uuid" })
  customer_id!: string;

  @Column({ type: "int" })
  rating!: number;

  @Column({ type: "text", nullable: true })
  comment!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Model, (model) => model.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "model_id" })
  model!: Relation<Model>;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "customer_id" })
  customer!: Relation<User>;
}
