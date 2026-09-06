import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { serviceOptions } from "@/lib/mock-data";
import { mockModels } from "@/lib/mock-data";

export default function ServiciosPage() {
  const model = mockModels[0];

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-dark">Mis servicios</h1>
      <div className="max-w-md space-y-3">
        {serviceOptions.map((service) => (
          <Checkbox
            key={service}
            id={service}
            label={service}
            defaultChecked={model.services?.includes(service)}
          />
        ))}
        <Button className="mt-4">Guardar servicios</Button>
      </div>
    </div>
  );
}
