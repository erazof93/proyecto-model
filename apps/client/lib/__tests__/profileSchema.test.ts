import { profileSchema } from "@proyecto-model/utils";
import { Gender } from "@proyecto-model/types";

// profileSchema es la validación real usada por PUT /api/modelos/perfil
// (Fase 3) para que una modelo edite su propio perfil.
describe("profileSchema", () => {
  const valid = {
    name: "Sofía",
    age: 24,
    gender: Gender.WOMAN,
    bio: "Modelo profesional.",
  };

  it("accepts a valid profile update", () => {
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts the enum Gender values, not just matching strings", () => {
    // Antes de la Fase 3 este schema usaba z.enum(["WOMAN", ...]) en vez de
    // z.nativeEnum(Gender), lo que rompía el tipado contra Model.gender.
    const result = profileSchema.safeParse({ ...valid, gender: Gender.TRANSGENDER });
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(profileSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });

  it("rejects an age under 18", () => {
    expect(profileSchema.safeParse({ ...valid, age: 17 }).success).toBe(false);
  });

  it("rejects an age over 99", () => {
    expect(profileSchema.safeParse({ ...valid, age: 100 }).success).toBe(false);
  });

  it("rejects an invalid gender value", () => {
    const result = profileSchema.safeParse({ ...valid, gender: "ALIEN" });
    expect(result.success).toBe(false);
  });

  it("rejects a bio longer than 500 characters", () => {
    const result = profileSchema.safeParse({ ...valid, bio: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("treats bio as optional", () => {
    const { bio: _bio, ...withoutBio } = valid;
    expect(profileSchema.safeParse(withoutBio).success).toBe(true);
  });
});
