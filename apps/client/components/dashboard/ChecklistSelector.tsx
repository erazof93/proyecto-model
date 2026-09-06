import type { Checklist } from "@proyecto-model/types";
import { cn } from "@/lib/cn";

export function ChecklistSelector({
  checklists,
  selectedIds,
  onChange,
  disabled,
}: {
  checklists: Checklist[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
}) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id],
    );
  }

  return (
    <div className="space-y-2">
      {checklists.map((checklist) => {
        const checked = selectedIds.includes(checklist.id);
        return (
          <label
            key={checklist.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition",
              checked ? "border-primary bg-light_bg" : "border-border hover:bg-light_bg",
              disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
              checked={checked}
              disabled={disabled}
              onChange={() => toggle(checklist.id)}
            />
            <div>
              <p className="font-medium text-dark">{checklist.name}</p>
              {checklist.description && (
                <p className="text-sm text-dark/50">{checklist.description}</p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
