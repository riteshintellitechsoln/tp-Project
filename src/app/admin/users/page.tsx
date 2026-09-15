// import { format } from "date-fns";
// import { db } from "@/lib/db";
// import { AdminTable } from "@/components/admin/admin-table";
// import { ExportExcelButton } from "@/components/admin/export-excel-button";

// export default async function AdminUsersPage() {
//   const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });

//   const exportData = users.map((u) => ({
//     Name: u.name ?? "",
//     Email: u.email,
//     Joined: format(u.createdAt, "yyyy-MM-dd HH:mm"),
//   }));

//   return (
//     <div>
//       <div className="mb-6 flex items-center justify-between">
//         <h1 className="font-display text-2xl font-bold">Users ({users.length})</h1>
//         <ExportExcelButton data={exportData} filename="users-export" sheetName="Users" />
//       </div>
//       <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
//         Registered &quot;My Library&quot; accounts. Most visitors download as a guest lead
//         without ever creating one — see{" "}
//         <a href="/admin/leads" className="text-primary hover:underline">
//           Leads
//         </a>{" "}
//         for the full contact list.
//       </p>

//       <AdminTable
//         rows={users}
//         rowKey={(u) => u.id}
//         emptyMessage="No registered users yet — that's expected, since downloading never requires an account."
//         columns={[
//           { header: "Name", cell: (u) => u.name ?? "—" },
//           { header: "Email", cell: (u) => u.email },
//           { header: "Joined", cell: (u) => format(u.createdAt, "MMM d, yyyy") },
//         ]}
//       />
//     </div>
//   );
// }


import { format } from "date-fns";
import { db } from "@/lib/db";
import { AdminTable } from "@/components/admin/admin-table";
import { ExportExcelButton } from "@/components/admin/export-excel-button";

export default async function AdminUsersPage() {
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });

  const exportData = users.map((u) => ({
    Name: u.name ?? "",
    Email: u.email,
    Phone: u.phone ?? "",
    Company: u.companyName ?? "",
    Designation: u.jobTitle ?? "",
    Website: u.companyWebsite ?? "",
    Joined: format(u.createdAt, "yyyy-MM-dd HH:mm"),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Users ({users.length})</h1>
        <ExportExcelButton data={exportData} filename="users-export" sheetName="Users" />
      </div>
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Registered &quot;My Library&quot; accounts. Most visitors download as a guest lead
        without ever creating one — see{" "}
        <a href="/admin/leads" className="text-primary hover:underline">
          Leads
        </a>{" "}
        for the full contact list.
      </p>

      <AdminTable
        rows={users}
        rowKey={(u) => u.id}
        emptyMessage="No registered users yet — that's expected, since downloading never requires an account."
        columns={[
          { header: "Name", cell: (u) => u.name ?? "—" },
          { header: "Email", cell: (u) => u.email },
          { header: "Company", cell: (u) => u.companyName ?? "—" },
          { header: "Designation", cell: (u) => u.jobTitle ?? "—" },
          {
            header: "Website",
            cell: (u) =>
              u.companyWebsite ? (
                <a
                  href={u.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {u.companyWebsite.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "—"
              ),
          },
          { header: "Joined", cell: (u) => format(u.createdAt, "MMM d, yyyy") },
        ]}
      />
    </div>
  );
}