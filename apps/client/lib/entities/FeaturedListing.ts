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
import { User } from "./User";

/** Espeja `featured_listings` de 001_init_schema.sql. */
@Entity("featured_listings")
export class FeaturedListing {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  model_id!: string;

  @Column({
    type: "enum",
    enum: ["TOP", "BANNER"],
    enumName: "featured_type_enum",
  })
  type!: "TOP" | "BANNER";

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: string;

  @Column({ type: "int" })
  duration_days!: number;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  start_date!: Date;

  @Index()
  @Column({ type: "timestamptz" })
  end_date!: Date;

  @Index()
  @Column({
    type: "enum",
    enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
    enumName: "featured_status_enum",
    default: "ACTIVE",
  })
  status!: "ACTIVE" | "EXPIRED" | "CANCELLED";

  @Column({ type: "boolean", default: false })
  is_pinned!: boolean;

  @Column({ type: "uuid", nullable: true })
  payment_id!: string | null;

  @Column({ type: "uuid", nullable: true })
  created_by_admin_id!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  approved_at!: Date | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Model, (model) => model.featured_listings, { onDelete: "CASCADE" })
  @JoinColumn({ name: "model_id" })
  model!: Relation<Model>;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "created_by_admin_id" })
  created_by_admin!: Relation<User> | null;
}
