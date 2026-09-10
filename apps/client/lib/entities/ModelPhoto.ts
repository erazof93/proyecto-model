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

/** `photo` = foto de perfil 3:4 (600×800). `banner` = banner 16:9 (1200×675). */
export type PhotoType = "photo" | "banner";

/** Espeja `model_photos` (001 + 004_model_photos_updated_at.sql + 1788760000000-AddModelPhotoType). */
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

  @Column({ type: "varchar", length: 20, default: "photo" })
  type!: PhotoType;

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
