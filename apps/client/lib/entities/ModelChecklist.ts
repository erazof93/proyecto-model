import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from "typeorm";
import { Checklist } from "./Checklist";
import { Model } from "./Model";

/** Espeja `model_checklists` de 001_init_schema.sql (tabla puente modelo <-> checklist). */
@Entity("model_checklists")
@Unique(["model_id", "checklist_id"])
export class ModelChecklist {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  model_id!: string;

  @Column({ type: "uuid" })
  checklist_id!: string;

  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => Model, (model) => model.model_checklists, { onDelete: "CASCADE" })
  @JoinColumn({ name: "model_id" })
  model!: Relation<Model>;

  @ManyToOne(() => Checklist, (checklist) => checklist.model_checklists, { onDelete: "CASCADE" })
  @JoinColumn({ name: "checklist_id" })
  checklist!: Relation<Checklist>;
}
