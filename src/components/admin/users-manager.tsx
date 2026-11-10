"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createUser, updateUser } from "@/server/actions/users";
import { Checkbox, FormAlert, SelectInput, TextInput, type Option } from "./controls";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  isSelf: boolean;
};

export function UsersManager({ users, roles }: { users: UserRow[]; roles: (Option & { description: string })[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [create, setCreate] = useState({
    email: "",
    name: "",
    roleId: roles.find((r) => r.label === "Editor")?.value ?? "",
    password: "",
  });
  const [edit, setEdit] = useState<{
    id: string;
    name: string;
    roleId: string;
    isActive: boolean;
    newPassword: string;
  } | null>(null);

  const done = (ok: boolean, text: string, errs?: Record<string, string>) => {
    setMessage({ kind: ok ? "success" : "error", text });
    setErrors(errs ?? {});
    if (ok) router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {message && <FormAlert kind={message.kind}>{message.text}</FormAlert>}
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-canvas text-left text-xs text-muted">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  User
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Role
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
                  Last sign-in
                </th>
                <th scope="col" className="px-4 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5">
                    <span className="font-medium">{u.name}</span>
                    {u.isSelf && <span className="ml-1.5 text-xs text-muted">(you)</span>}
                    <span className="block text-xs text-muted">{u.email}</span>
                  </td>
                  <td className="px-4 py-2.5">{u.roleName}</td>
                  <td className="px-4 py-2.5">
                    {u.isActive ? (
                      <span className="text-success">Active</span>
                    ) : (
                      <span className="text-muted">Deactivated</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-2.5 text-muted sm:table-cell">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-GB") : "Never"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      className="text-brand hover:underline"
                      onClick={() => {
                        setErrors({});
                        setEdit({ id: u.id, name: u.name, roleId: u.roleId, isActive: u.isActive, newPassword: "" });
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="card p-5">
          <h2 className="font-semibold">Roles</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {roles.map((r) => (
              <div key={r.value}>
                <dt className="font-medium">{r.label}</dt>
                <dd className="text-muted">{r.description}</dd>
              </div>
            ))}
            <div>
              <dt className="font-medium">Visitor</dt>
              <dd className="text-muted">
                Anyone browsing the public website. No account needed; public registration is disabled.
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="space-y-4 self-start lg:sticky lg:top-20">
        {edit && (
          <form
            noValidate
            className="card space-y-4 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              start(async () => {
                const res = await updateUser(edit);
                done(res.ok, res.ok ? (res.message ?? "Saved.") : res.message, res.ok ? undefined : res.errors);
                if (res.ok) setEdit(null);
              });
            }}
          >
            <h2 className="font-semibold">Edit user</h2>
            <TextInput
              label="Name"
              required
              value={edit.name}
              onChange={(name) => setEdit({ ...edit, name })}
              error={errors.name}
            />
            <SelectInput
              label="Role"
              value={edit.roleId}
              onChange={(roleId) => setEdit({ ...edit, roleId })}
              options={roles}
              emptyLabel={null}
              error={errors.roleId}
            />
            <Checkbox
              label="Active"
              hint="Deactivated users cannot sign in."
              checked={edit.isActive}
              onChange={(isActive) => setEdit({ ...edit, isActive })}
            />
            <TextInput
              label="New password"
              type="password"
              value={edit.newPassword}
              onChange={(newPassword) => setEdit({ ...edit, newPassword })}
              error={errors.newPassword}
              hint="Leave empty to keep the current password."
            />
            <div className="flex gap-2">
              <button className="btn-primary" disabled={pending}>
                Save
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEdit(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}
        <form
          noValidate
          className="card space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await createUser(create);
              done(res.ok, res.ok ? (res.message ?? "Created.") : res.message, res.ok ? undefined : res.errors);
              if (res.ok) setCreate({ ...create, email: "", name: "", password: "" });
            });
          }}
        >
          <h2 className="font-semibold">Add user</h2>
          <TextInput
            label="Name"
            required
            value={create.name}
            onChange={(name) => setCreate({ ...create, name })}
            error={!edit ? errors.name : undefined}
          />
          <TextInput
            label="Email"
            type="email"
            required
            value={create.email}
            onChange={(email) => setCreate({ ...create, email })}
            error={!edit ? errors.email : undefined}
          />
          <SelectInput
            label="Role"
            value={create.roleId}
            onChange={(roleId) => setCreate({ ...create, roleId })}
            options={roles}
            emptyLabel={null}
            error={!edit ? errors.roleId : undefined}
          />
          <TextInput
            label="Temporary password"
            type="password"
            required
            value={create.password}
            onChange={(password) => setCreate({ ...create, password })}
            error={!edit ? errors.password : undefined}
            hint="At least 10 characters, letters and numbers."
          />
          <button className="btn-primary" disabled={pending}>
            Create user
          </button>
        </form>
      </div>
    </div>
  );
}
