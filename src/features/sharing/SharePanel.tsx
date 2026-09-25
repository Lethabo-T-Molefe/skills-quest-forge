import { useState } from "react";
import { toast } from "sonner";
import { QuietButton, SearchField, SignalButton } from "@/components";

export function SharePanel({
  resourceName,
  defaultVisibility = "Private",
}: {
  resourceName: string;
  defaultVisibility?: "Private" | "Team" | "Organisation";
}) {
  const [visibility, setVisibility] = useState(defaultVisibility);
  const [people, setPeople] = useState("");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Sharing never overrides the viewer's own permissions. Private data they cannot see stays hidden.
      </p>
      <div className="flex flex-wrap gap-2">
        {(["Private", "Team", "Organisation"] as const).map((option) => (
          <QuietButton key={option} active={visibility === option} onClick={() => setVisibility(option)}>
            {option}
          </QuietButton>
        ))}
      </div>
      {visibility === "Team" ? (
        <SearchField
          className="max-w-none"
          value={people}
          onChange={setPeople}
          placeholder="Add members by name or email"
        />
      ) : null}
      <SignalButton
        onClick={() => {
          toast.success(`Share settings saved for ${resourceName}`);
        }}
      >
        Save sharing
      </SignalButton>
    </div>
  );
}
