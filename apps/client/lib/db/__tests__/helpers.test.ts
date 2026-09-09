import { applyWeeklyRotation, hourlySample, nextHourlyRefresh } from "../helpers";

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

describe("hourlySample", () => {
  it("devuelve como mucho `limit` elementos, todos del conjunto original", () => {
    const out = hourlySample(make(20), 8);
    expect(out).toHaveLength(8);
    const originales = new Set(ids(make(20)));
    expect(ids(out).every((id) => originales.has(id))).toBe(true);
  });

  it("si hay menos que `limit`, devuelve todos", () => {
    expect(hourlySample(make(3), 8)).toHaveLength(3);
  });

  it("es determinística dentro de la misma hora", () => {
    const input = make(20);
    expect(ids(hourlySample(input, 8))).toEqual(ids(hourlySample(input, 8)));
  });

  it("la selección cambia al pasar de hora", () => {
    const input = make(40);
    const spy = jest.spyOn(Date, "now");
    const base = Date.now();

    spy.mockReturnValue(base);
    const h1 = ids(hourlySample(input, 8));
    spy.mockReturnValue(base + 60 * 60 * 1000);
    const h2 = ids(hourlySample(input, 8));

    expect(h1).not.toEqual(h2);
    spy.mockRestore();
  });

  it("no muta la entrada", () => {
    const input = make(10);
    const snap = ids(input);
    hourlySample(input, 3);
    expect(ids(input)).toEqual(snap);
  });
});

describe("nextHourlyRefresh", () => {
  it("es un instante futuro alineado al inicio de la próxima hora", () => {
    const t = nextHourlyRefresh();
    expect(t).toBeGreaterThan(Date.now());
    expect(t % (60 * 60 * 1000)).toBe(0);
    expect(t - Date.now()).toBeLessThanOrEqual(60 * 60 * 1000);
  });
});
