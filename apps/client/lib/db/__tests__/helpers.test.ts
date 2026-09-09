import { applyWeeklyRotation } from "../helpers";

const ids = (xs: { id: string }[]) => xs.map((x) => x.id);
const make = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `model-${i}` }));

describe("applyWeeklyRotation", () => {
  it("no añade ni pierde elementos", () => {
    const input = make(10);
    const out = applyWeeklyRotation(input);
    expect(out).toHaveLength(10);
    expect(new Set(ids(out))).toEqual(new Set(ids(input)));
  });

  it("no muta el array de entrada", () => {
    const input = make(5);
    const snapshot = ids(input);
    applyWeeklyRotation(input);
    expect(ids(input)).toEqual(snapshot);
  });

  it("es determinística dentro de la misma semana (mismo orden en llamadas repetidas)", () => {
    const input = make(20);
    const a = ids(applyWeeklyRotation(input));
    const b = ids(applyWeeklyRotation(input));
    expect(a).toEqual(b);
  });

  it("el orden depende de la semana (cambia al avanzar el reloj 1 semana)", () => {
    const input = make(30);
    const now = Date.now();
    const spy = jest.spyOn(Date, "now");

    spy.mockReturnValue(now);
    const semana1 = ids(applyWeeklyRotation(input));

    spy.mockReturnValue(now + 7 * 24 * 60 * 60 * 1000);
    const semana2 = ids(applyWeeklyRotation(input));

    expect(semana1).not.toEqual(semana2); // con 30 ids el reordenamiento es visible
    expect(new Set(semana1)).toEqual(new Set(semana2)); // mismos elementos
    spy.mockRestore();
  });
});
