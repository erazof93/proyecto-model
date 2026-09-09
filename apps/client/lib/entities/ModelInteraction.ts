import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export type InteractionType = "WHATSAPP_CLICK" | "INSTAGRAM_CLICK" | "PROFILE_VIEW";

/** Espeja `model_interactions` de 1788750000000-AddModelInteractions.ts. */
@Entity("model_interactions")
@Index(["model_id", "created_at"])
export class ModelInteraction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  model_id!: string;

  @Column({ type: "varchar", length: 50 })
  interaction_type!: InteractionType;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;
}
