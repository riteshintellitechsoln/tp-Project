// "use client";

// import { useState, useTransition } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Loader2 } from "lucide-react";




// import { leadFormSchema, type LeadFormInput } from "@/lib/validations/lead";
// import { initiateDownload } from "@/actions/download";
// import {
//   DEPARTMENTS,
//   INDUSTRIES,
//   COMPANY_SIZE_OPTIONS,
//   COUNTRIES,
// } from "@/lib/constants";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// // The real Lead Form — every field from the spec, replacing Module 13's
// // minimal (name + consent only) scaffold. Lives as its own component
// // (rather than inline in DownloadWizard) so it's reusable anywhere the app
// // needs to capture a lead outside the download flow, should that ever come
// // up — e.g. a "request a demo" form on a publisher's own page.
// //
// // Email is a prop, not a field — it was already captured and verified by
// // the Company Email Check step (Module 13) before this form ever renders.
// export function LeadForm({
//   email,
//   bookSlug,
//   onSuccess,
// }: {
//   email: string;
//   bookSlug: string;
//   onSuccess: (downloadId: string) => void;
// }) {
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [isPending, startTransition] = useTransition();

//   const form = useForm<LeadFormInput>({
//     resolver: zodResolver(leadFormSchema),
//     defaultValues: {
//       fullName: "",
//       phone: "",
//       companyName: "",
//       jobTitle: "",
//       country: "",
//       state: "",
//       city: "",
//       department: "",
//       industry: "",
//       companySize: undefined,
//       consentGiven: false,
//     },
//   });

//   function onSubmit(values: LeadFormInput) {
//     setServerError(null);
//     startTransition(async () => {
//       const result = await initiateDownload({ ...values, email, bookSlug });

//       if (!result.success) {
//         setServerError(result.error);
//         return;
//       }

//       onSuccess(result.downloadId);
//     });
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
//         <FormItem>
//           <FormLabel>Email</FormLabel>
//           <Input value={email} disabled />
//         </FormItem>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <FormField
//             control={form.control}
//             name="fullName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Full name</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Jane Smith" autoComplete="name" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="phone"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Phone</FormLabel>
//                 <FormControl>
//                   <Input
//                     type="tel"
//                     placeholder="+1 555 123 4567"
//                     autoComplete="tel"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <FormField
//             control={form.control}
//             name="companyName"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Company</FormLabel>
//                 <FormControl>
//                   <Input placeholder="Acme Corp" autoComplete="organization" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="jobTitle"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Job title</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder="IT Director"
//                     autoComplete="organization-title"
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <div className="grid gap-4 sm:grid-cols-2">
//           <FormField
//             control={form.control}
//             name="department"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Department</FormLabel>
//                 <Select onValueChange={field.onChange} value={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select department" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {DEPARTMENTS.map((dept) => (
//                       <SelectItem key={dept} value={dept}>
//                         {dept}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="industry"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Industry</FormLabel>
//                 <Select onValueChange={field.onChange} value={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select industry" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {INDUSTRIES.map((industry) => (
//                       <SelectItem key={industry} value={industry}>
//                         {industry}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <FormField
//           control={form.control}
//           name="companySize"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Company size</FormLabel>
//               <Select onValueChange={field.onChange} value={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select company size" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {COMPANY_SIZE_OPTIONS.map((opt) => (
//                     <SelectItem key={opt.value} value={opt.value}>
//                       {opt.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <div className="grid gap-4 sm:grid-cols-3">
//           <FormField
//             control={form.control}
//             name="country"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Country</FormLabel>
//                 <Select onValueChange={field.onChange} value={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select country" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {COUNTRIES.map((country) => (
//                       <SelectItem key={country} value={country}>
//                         {country}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="state"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>
//                   State / Province <span className="text-muted-foreground">(optional)</span>
//                 </FormLabel>
//                 <FormControl>
//                   <Input placeholder="California" autoComplete="address-level1" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="city"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>
//                   City <span className="text-muted-foreground">(optional)</span>
//                 </FormLabel>
//                 <FormControl>
//                   <Input placeholder="San Francisco" autoComplete="address-level2" {...field} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <FormField
//           control={form.control}
//           name="consentGiven"
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-start gap-2 space-y-0">
//               <FormControl>
//                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
//               </FormControl>
//               <div className="space-y-1 leading-none">
//                 <FormLabel className="font-normal">
//                   I agree to share my details with the publisher and TradeHub&apos;s{" "}
//                   <a href="/privacy" target="_blank" rel="noreferrer" className="underline">
//                     Privacy Policy
//                   </a>
//                   .
//                 </FormLabel>
//                 <FormMessage />
//               </div>
//             </FormItem>
//           )}
//         />

//         {serverError && (
//           <p role="alert" className="text-sm font-medium text-destructive">
//             {serverError}
//           </p>
//         )}

//         <Button type="submit" className="w-full" disabled={isPending}>
//           {isPending && <Loader2 className="animate-spin" />}
//           Get my download
//         </Button>
//       </form>
//     </Form>
//   );
// }



"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { leadFormSchema, type LeadFormInput } from "@/lib/validations/lead";
import { initiateDownload } from "@/actions/download";
import {
  DEPARTMENTS,
  INDUSTRIES,
  COMPANY_SIZE_OPTIONS,
  COUNTRIES,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Shape returned by getLeadDetailsForPrefill() in actions/download.ts —
// used to pre-fill this form when a returning visitor clicks "Fill in
// the form instead" on the Quick Download screen, so it opens with their
// existing details rather than blank.
interface ExistingLeadDefaults {
  fullName: string;
  phone: string;
  companyName: string;
  jobTitle: string;
  country: string;
  state: string | null;
  city: string | null;
  department: string;
  industry: string;
  companySize: string;
}

// The real Lead Form — every field from the spec, replacing Module 13's
// minimal (name + consent only) scaffold.
//
// Name is split into First/Last name INPUTS for the person, but the
// underlying react-hook-form field and the data sent to initiateDownload
// are still a single "fullName" string — this keeps the Zod schema, the
// server action, and everywhere else that reads a Lead's fullName
// completely unchanged. The two visible inputs just stay in sync with
// that one combined field via local state.
//
// Email is a prop, not a field — it was already captured and verified by
// the Company Email Check step before this form ever renders.
export function LeadForm({
  email,
  bookSlug,
  defaultValues,
  onSuccess,
}: {
  email: string;
  bookSlug: string;
  defaultValues?: ExistingLeadDefaults | null;
  onSuccess: (downloadId: string) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [initialFirst, initialLast] = splitFullName(defaultValues?.fullName ?? "");
  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);

  const form = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? "",
      phone: defaultValues?.phone ?? "",
      companyName: defaultValues?.companyName ?? "",
      jobTitle: defaultValues?.jobTitle ?? "",
      country: defaultValues?.country ?? "",
      state: defaultValues?.state ?? "",
      city: defaultValues?.city ?? "",
      department: defaultValues?.department ?? "",
      industry: defaultValues?.industry ?? "",
      // companySize: (defaultValues?.companySize as LeadFormInput["companySize"]) ?? undefined,
            companySize: defaultValues?.companySize
        ? (defaultValues.companySize as LeadFormInput["companySize"])
        : ("" as LeadFormInput["companySize"]),
      consentGiven: false,
    },
  });

  // Keeps the RHF-managed "fullName" field (the one actually validated
  // and submitted) combined from whatever the person types into the two
  // visible First/Last name boxes.
  useEffect(() => {
    form.setValue("fullName", `${firstName} ${lastName}`.trim(), { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName]);

  function onSubmit(values: LeadFormInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await initiateDownload({ ...values, email, bookSlug });

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      onSuccess(result.downloadId);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <Input value={email} disabled />
        </FormItem>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormItem>
            <FormLabel>First name</FormLabel>
            <FormControl>
              <Input
                placeholder="Jane"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormControl>
            {form.formState.errors.fullName && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </FormItem>
          <FormItem>
            <FormLabel>Last name</FormLabel>
            <FormControl>
              <Input
                placeholder="Smith"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormControl>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 555 123 4567"
                  autoComplete="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" autoComplete="organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="IT Director"
                    autoComplete="organization-title"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="companySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company size</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMPANY_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  State / Province <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="California" autoComplete="address-level1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  City <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco" autoComplete="address-level2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="consentGiven"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">
                  I agree to share my details with the publisher and TradeHub&apos;s{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="underline">
                    Privacy Policy
                  </a>
                  .
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {serverError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Get my download
        </Button>
      </form>
    </Form>
  );
}

 function splitFullName(fullName: string): [string, string] {
  const trimmed = fullName.trim();
  if (!trimmed) return ["", ""];
  const [first, ...rest] = trimmed.split(/\s+/);
  return [first ?? "", rest.join(" ")];
}