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
import { FeaturedListing } from "./FeaturedListing";
import { Model } from "./Model";

/** Espeja `transactions` de 001_init_schema.sql. Sin `updated_at` (no existe en la tabla). */
@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  model_id!: string;

  @Column({ type: "uuid", nullable: true })
  featured_listing_id!: string | null;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: "varchar", length: 3, default: "PEN" })
  currency!: string;

  @Column({
    type: "enum",
    enum: ["PENDING", "VERIFIED", "FAILED"],
    enumName: "payment_status_enum",
    default: "PENDING",
  })
  payment_status!: "PENDING" | "VERIFIED" | "FAILED";

  @Column({ type: "timestamptz", nullable: true })
  verified_at!: Date | null;

  @Column({ type: "text", nullable: true })
  admin_notes!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Model, { onDelete: "CASCADE" })
  @JoinColumn({ name: "model_id" })
  model!: Relation<Model>;

  @ManyToOne(() => FeaturedListing, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "featured_listing_id" })
  featured_listing!: Relation<FeaturedListing> | null;
}
