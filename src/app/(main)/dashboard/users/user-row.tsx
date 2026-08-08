"use client";

import { useTransition } from "react";
import { changeRole, toggleActive } from "@/app/actions/admin";
import { Badge, inputClass } from "@/components/ui";
import { ROLES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export interface UserRowData {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  isSelf: boolean;
}

export function UserRow({ user }: { user: UserRowData }) {
  const [pending, start] = useTransition();

  return (
    <tr className={pending ? "opacity-60" : ""}>
      <td className="p-3">
        <p className="font-medium">{user.name}{user.isSelf && <span className="ml-1 text-xs text-muted">(you)</span>}</p>
        <p className="text-xs text-muted">{user.email}</p>
      </td>
      <td className="p-3">
        <select
          value={user.role}
          disabled={user.isSelf}
          onChange={(e) => start(() => void changeRole(user.id, e.target.value))}
          className={`${inputClass} py-1 text-xs`}
        >
          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </td>
      <td className="p-3 text-xs text-muted">{formatDate(user.createdAt)}</td>
      <td className="p-3">
        {user.active ? <Badge tone="success">Active</Badge> : <Badge tone="danger">Inactive</Badge>}
      </td>
      <td className="p-3 text-right">
        {!user.isSelf && (
          <button
            onClick={() => start(() => void toggleActive(user.id))}
            className="text-xs font-medium text-muted hover:text-foreground"
          >
            {user.active ? "Deactivate" : "Reactivate"}
          </button>
        )}
      </td>
    </tr>
  );
}
