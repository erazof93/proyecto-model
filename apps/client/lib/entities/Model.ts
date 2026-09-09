import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { FeaturedListing } from "./FeaturedListing";
import { ModelChecklist } from "./ModelChecklist";
import { ModelPhoto } from "./ModelPhoto";
import { Review } from "./Review";
import { User } from "./User";

/** Espeja `models` de 001_init_schema.sql. Los nombres de columna coinciden
 *  con el tipo `Model` de @proyecto-model/types para no renombrar en queries. */
@Entity("models")
export class Model {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "uuid" })
  user_id!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 100 })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  slug!: string;

  @Column({ type: "int" })
  age!: number;

  @Column({
    type: "enum",
    enum: ["WOMAN", "MAN", "TRANSGENDER"],
    enumName: "gender_enum",
  })
  gender!: "WOMAN" | "MAN" | "TRANSGENDER";

  @Column({ type: "text", nullable: true })
  bio!: string | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  avatar_url!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  city!: string | null;

  @Column({ type: "text", array: true, nullable: true })
  services!: string[] | null;

  @Column({ type: "int", nullable: true })
  height!: number | null;

  @Column({ type: "int", nullable: true })
  weight!: number | null;

  @Column({ type: "varchar", length: 10, nullable: true })
  clothing_size!: string | null;

  @Column({ type: "text", array: true, nullable: true })
  languages!: string[] | null;

  @Column({ type: "text", array: true, nullable: true })
  cities_travel!: string[] | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: "varchar", length: 20, nullable: true })
  whatsapp!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  instagram!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  tiktok!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  telegram!: string | null;

  @Column({ type: "boolean", default: false })
  is_verified!: boolean;

  @Column({
    type: "enum",
    enum: ["PENDING", "ACTIVE", "SUSPENDED", "ARCHIVED"],
    enumName: "model_status_enum",
    default: "PENDING",
  })
  status!: "PENDING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

  @Column({ type: "boolean", default: false })
  is_featured!: boolean;

  @Column({ type: "timestamptz", nullable: true })
  featured_expires_at!: Date | null;

  @Column({ type: "boolean", default: false })
  onboarding_completed!: boolean;

  @Column({ type: "int", default: 0 })
  onboarding_percentage!: number;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updated_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => User, (user) => user.models, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User>;

  @OneToMany(() => ModelPhoto, (photo) => photo.model)
  photos!: Relation<ModelPhoto>[];

  @OneToMany(() => Review, (review) => review.model)
  reviews!: Relation<Review>[];

  @OneToMany(() => FeaturedListing, (listing) => listing.model)
  featured_listings!: Relation<FeaturedListing>[];

  @OneToMany(() => ModelChecklist, (mc) => mc.model)
  model_checklists!: Relation<ModelChecklist>[];
}
