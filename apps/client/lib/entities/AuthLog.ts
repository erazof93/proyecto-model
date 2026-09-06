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
import { User } from "./User";

/** Espeja `auth_logs` de 003_auth_setup.sql. La columna real es `event_type`. */
@Entity("auth_logs")
export class AuthLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid", nullable: true })
  user_id!: string | null;

  @Column({ type: "varchar", length: 50 })
  event_type!: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ip_address!: string | null;

  @Column({ type: "text", nullable: true })
  user_agent!: string | null;

  @Index()
  @CreateDateColumn({ type: "timestamptz" })
  created_at!: Date;

  // --- Relaciones ---
  @ManyToOne(() => User, (user) => user.auth_logs, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user!: Relation<User> | null;
}
