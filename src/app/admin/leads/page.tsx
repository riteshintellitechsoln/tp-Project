// import type { Prisma } from "@prisma/client";
// import { format } from "date-fns";
// import { db } from "@/lib/db";
// import { AdminSearchBox } from "@/components/admin/admin-search-box";
// import { AdminTable } from "@/components/admin/admin-table";
// import { Pagination } from "@/components/shared/pagination";

// interface AdminLeadsPageProps {
//   searchParams: Promise<{ q?: string; page?: string }>;
// }

// // This is the core sales asset of the whole platform — every business
// // contact captured through the Download Flow (Modules 13-14) lands here.
// export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
//   const sp = await searchParams;
//   const query = sp.q || undefined;
//   const page = Math.max(1, Number(sp.page) || 1);
//   const perPage = 20;

//   const where: Prisma.LeadWhereInput = query
//     ? {
//         OR: [
//           { fullName: { contains: query, mode: "insensitive" } },
//           { email: { contains: query, mode: "insensitive" } },
//           { companyName: { contains: query, mode: "insensitive" } },
//         ],
//       }
//     : {};

//   const [leads, totalCount] = await Promise.all([
//     db.lead.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//       skip: (page - 1) * perPage,
//       take: perPage,
//     }),
//     db.lead.count({ where }),
//   ]);

//   const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

//   function buildHref(targetPage: number) {
//     const params = new URLSearchParams();
//     if (query) params.set("q", query);
//     if (targetPage > 1) params.set("page", String(targetPage));
//     const qs = params.toString();
//     return `/admin/leads${qs ? `?${qs}` : ""}`;
//   }

//   return (
//     <div>
//       <h1 className="mb-6 font-display text-2xl font-bold">Leads ({totalCount})</h1>

//       <div className="mb-4">
//         <AdminSearchBox placeholder="Search by name, email, or company..." />
//       </div>

//       <AdminTable
//         rows={leads}
//         rowKey={(lead) => lead.id}
//         emptyMessage="No leads yet — they'll show up here as visitors complete the download flow."
//         columns={[
//           { header: "Name", cell: (l) => l.fullName },
//           { header: "Email", cell: (l) => l.email },
//           { header: "Company", cell: (l) => l.companyName },
//           { header: "Job Title", cell: (l) => l.jobTitle },
//           { header: "Industry", cell: (l) => l.industry },
//           { header: "Country", cell: (l) => l.country },
//           { header: "Captured", cell: (l) => format(l.createdAt, "MMM d, yyyy") },
//         ]}
//       />

//       <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
//     </div>
//   );
// }


 import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { getDateRange } from "@/lib/admin-filters";
import { AdminSearchBox } from "@/components/admin/admin-search-box";
import { AdminFilterBar, AdminFilterField } from "@/components/admin/admin-filter-bar";
import { AdminDateRangeFilter } from "@/components/admin/admin-date-range-filter";
import { AdminTable } from "@/components/admin/admin-table";
import { ExportExcelButton } from "@/components/admin/export-excel-button";
import { Pagination } from "@/components/shared/pagination";

interface AdminLeadsPageProps {
  searchParams: Promise<{ q?: string; page?: string; from?: string; to?: string }>;
}

export default async function AdminLeadsPage({ searchParams }: AdminLeadsPageProps) {
  const sp = await searchParams;
  const query = sp.q || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 20;
  const dateRange = getDateRange(sp.from, sp.to);

  const where: Prisma.LeadWhereInput = {
    ...(query
      ? {
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { companyName: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(dateRange ? { createdAt: dateRange } : {}),
  };

  const [leads, totalCount] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.lead.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  function buildHref(targetPage: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/admin/leads${qs ? `?${qs}` : ""}`;
  }

  const exportData = leads.map((l) => ({
    Name: l.fullName,
    Email: l.email,
    Company: l.companyName,
    Website: l.companyWebsite ?? "",
    "Job Title": l.jobTitle,
    Industry: l.industry,
    Country: l.country,
    Captured: format(l.createdAt, "yyyy-MM-dd HH:mm"),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Leads ({totalCount})</h1>
        <ExportExcelButton data={exportData} filename="leads-export" sheetName="Leads" />
      </div>

      <AdminFilterBar>
        <AdminFilterField label="Search">
          <AdminSearchBox placeholder="Search by name, email, or company..." />
        </AdminFilterField>
        <AdminFilterField label="Date range">
          <AdminDateRangeFilter />
        </AdminFilterField>
      </AdminFilterBar>

      <AdminTable
        rows={leads}
        rowKey={(lead) => lead.id}
        emptyMessage="No leads match your filters."
        columns={[
          { header: "Name", cell: (l) => l.fullName },
          { header: "Email", cell: (l) => l.email },
          { header: "Company", cell: (l) => l.companyName },
          {
            header: "Website",
            cell: (l) =>
              l.companyWebsite ? (
                <a
                  href={l.companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {l.companyWebsite.replace(/^https?:\/\//, "")}
                </a>
              ) : (
                "—"
              ),
          },
          { header: "Job Title", cell: (l) => l.jobTitle },
          { header: "Industry", cell: (l) => l.industry },
          { header: "Country", cell: (l) => l.country },
          { header: "Captured", cell: (l) => format(l.createdAt, "MMM d, yyyy") },
        ]}
      />

      <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}