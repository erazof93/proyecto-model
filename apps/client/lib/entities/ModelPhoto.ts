import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { Model } from "./Model";

/** Espeja `model_photos` (001 + 004_model_photos_updated_at.sql). */
@Entity("model_photos")
export class ModelPhoto {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  model_id!: string;

  @Column({ type: "varchar", length: 255 })
  cloudinary_id!: string;

  @Column({ type: "varchar", length: 500 })
  cloudinary_url!: string;

  @Column({ type: "boolean", default: false })
  is_verified!: boolean;

  @Column({ type: "boolean", default: false })
  is_primary!: boolean;

  @Column({ type: "int", default: 0 })
  order_index!: number;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Model, (model) => model.photos, { onDelete: "CASCADE" })
  @JoinColumn({ name: "model_id" })
  model!: Relation<Model>;
}
