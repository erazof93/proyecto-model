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
import { FeaturedListing } from "./FeaturedListing";
import { Model } from "./Model";
import { User } from "./User";

/** Espeja `banner_requests` de 1789000000001-CreateBannerRequests. */
@Entity("banner_requests")
export class BannerRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  model_id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Index()
  @Column({ type: "varchar", length: 20, default: "PENDING" })
  status!: "PENDING" | "APPROVED" | "REJECTED";

  @Column({ type: "text", nullable: true })
  admin_notes!: string | null;

  @Column({ type: "uuid", nullable: true })
  reviewed_by_admin_id!: string | null;

  @Column({ type: "timestamptz", nullable: true })
  reviewed_at!: Date | null;

  @Column({ type: "uuid", nullable: true })
  featured_listing_id!: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Model, { onDelete: "CASCADE" })
  @JoinColumn({ name: "model_id" })
  model!: Relation<Model>;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "reviewed_by_admin_id" })
  reviewed_by_admin!: Relation<User> | null;

  @ManyToOne(() => FeaturedListing, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "featured_listing_id" })
  featured_listing!: Relation<FeaturedListing> | null;
}
