// The complete OpenAPI 3.0 spec for every real endpoint under src/app/api/.
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TradeHub API",
    version: "1.0.0",
    description:
      "Public and Admin-protected REST endpoints behind TradeHub. Admin-protected endpoints require an active NextAuth session cookie with an Admin role — there is no separate API key. Sign in at /login as an Admin in the same browser, then requests from that browser to protected endpoints will authenticate automatically via the cookie.",
  },
  servers: [{ url: "/api", description: "Relative to this deployment" }],
  tags: [
    { name: "Health", description: "Uptime / readiness check" },
    { name: "Books", description: "Public catalog reads + Admin CRUD" },
    { name: "Categories", description: "Public catalog reads + Admin CRUD" },
    { name: "Download", description: "The core lead-capture + download pipeline" },
    { name: "Leads", description: "Alias for the download pipeline — see the Download tag" },
    { name: "Email", description: "Admin-only resend of a download's email" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check server + database health",
        responses: {
          "200": {
            description: "Healthy",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthOk" } } },
          },
          "503": {
            description: "Database unreachable",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HealthError" } } },
          },
        },
      },
    },
    "/books": {
      get: {
        tags: ["Books"],
        summary: "List / search published books",
        description: "Same query function the public /search page uses internally, so results here and in the browser can never drift apart.",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" }, description: "Full-text search on title/description" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Category slug" },
          {
            name: "format",
            in: "query",
            schema: { type: "string", enum: ["EBOOK", "WHITEPAPER", "REPORT", "CASE_STUDY", "GUIDE", "DATASHEET", "WEBINAR"] },
          },
          { name: "company", in: "query", schema: { type: "string" }, description: "Publisher (Company) id" },
          { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "popular", "title"], default: "newest" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "perPage", in: "query", schema: { type: "integer", default: 12, maximum: 50 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of books",
            content: { "application/json": { schema: { $ref: "#/components/schemas/BookListResponse" } } },
          },
        },
      },
      post: {
        tags: ["Books"],
        summary: "Create a book (Admin only)",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BookInput" } } },
        },
        responses: {
          "201": {
            description: "Created",
            content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } } } } },
          },
          "400": { description: "Validation error (e.g. duplicate slug)" },
          "401": { description: "Not signed in as an Admin" },
        },
      },
    },
    "/books/{id}": {
      put: {
        tags: ["Books"],
        summary: "Update a book (Admin only)",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/BookInput" } } },
        },
        responses: {
          "200": { description: "Updated" },
          "400": { description: "Validation error" },
          "401": { description: "Not signed in as an Admin" },
        },
      },
      delete: {
        tags: ["Books"],
        summary: "Archive a book (Admin only)",
        description: "This ARCHIVES the book (status: ARCHIVED) rather than hard-deleting it — see the schema's design note on why a real delete would be destructive to Download/Lead history.",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Archived" },
          "401": { description: "Not signed in as an Admin" },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List active categories",
        responses: {
          "200": {
            description: "List of active categories, in display order",
            content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryListResponse" } } },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category (Admin only)",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } },
        },
        responses: {
          "201": { description: "Created" },
          "400": { description: "Validation error (e.g. duplicate name/slug)" },
          "401": { description: "Not signed in as an Admin" },
        },
      },
    },
    "/categories/{id}": {
      put: {
        tags: ["Categories"],
        summary: "Update a category (Admin only)",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CategoryInput" } } },
        },
        responses: { "200": { description: "Updated" }, "401": { description: "Not signed in as an Admin" } },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category (Admin only)",
        description: "A real delete — this only removes the category's tag from books (BookCategory rows), never the books themselves.",
        security: [{ sessionCookie: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Deleted" }, "401": { description: "Not signed in as an Admin" } },
      },
    },
    "/download": {
      get: {
        tags: ["Download"],
        summary: "Redeem a secure download token",
        description: "The link that actually goes in the emailed message. Verifies the token against the stored hash, checks expiry, marks the Download DOWNLOADED, and redirects to a signed file URL.",
        parameters: [{ name: "token", in: "query", required: true, schema: { type: "string" } }],
        responses: {
          "307": { description: "Redirect to the signed file URL, or back to /download with an ?error= code (missing-token | invalid-or-expired | expired | storage-not-configured)" },
        },
      },
      post: {
        tags: ["Download"],
        summary: "Submit the Company Email Check + Lead Form and trigger the download email",
        description: "The spec's literal Download Flow endpoint — validates the company email, upserts the Lead, generates a secure token, and sends the email. Enforces two extra rules: one email can download one specific book only once (repeats of an already-delivered download are refused, not resent), and a global monthly cap across every book combined.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LeadFormInput" } } },
        },
        responses: {
          "201": {
            description: "Lead saved, email sent",
            content: { "application/json": { schema: { type: "object", properties: { downloadId: { type: "string" } } } } },
          },
          "400": {
            description: "Validation error, free-email-provider rejected, already downloaded this exact book, or the monthly limit was reached",
            content: { "application/json": { schema: { type: "object", properties: { error: { type: "string" } } } } },
          },
        },
      },
    },
    "/leads": {
      post: {
        tags: ["Leads"],
        summary: "Alias for POST /download",
        description: "Identical validation and pipeline — in this platform's design, capturing a lead never happens independent of a download request, so this route delegates to the exact same logic rather than maintaining a second implementation.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LeadFormInput" } } },
        },
        responses: {
          "201": { description: "Lead saved, email sent" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/send-email": {
      post: {
        tags: ["Email"],
        summary: "Resend a download's email with a fresh token (Admin only)",
        security: [{ sessionCookie: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["downloadId"],
                properties: { downloadId: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Resent" },
          "400": { description: "Download not found, or the resend attempt failed" },
          "401": { description: "Not signed in as an Admin" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionCookie: {
        type: "apiKey",
        in: "cookie",
        name: "authjs.session-token",
        description:
          "Set automatically after signing in at /login as an Admin — these endpoints are protected exactly the way the Admin panel pages are, no separate API key exists.",
      },
    },
    schemas: {
      HealthOk: {
        type: "object",
        properties: { status: { type: "string", example: "ok" }, timestamp: { type: "string", format: "date-time" } },
      },
      HealthError: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          error: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      BookListResponse: {
        type: "object",
        properties: {
          books: { type: "array", items: { $ref: "#/components/schemas/BookCard" } },
          totalCount: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      BookCard: {
        type: "object",
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
          title: { type: "string" },
          shortDescription: { type: "string", nullable: true },
          coverImageUrl: { type: "string" },
          isFeatured: { type: "boolean" },
          isTrending: { type: "boolean" },
          publishedAt: { type: "string", format: "date-time", nullable: true },
          company: {
            type: "object",
            properties: { name: { type: "string" }, logoUrl: { type: "string", nullable: true } },
          },
        },
      },
      BookInput: {
        type: "object",
        required: ["title", "slug", "description", "coverImageUrl", "pdfFileKey", "format", "status", "companyId", "categoryIds"],
        properties: {
          title: { type: "string" },
          slug: { type: "string", pattern: "^[a-z0-9]+(-[a-z0-9]+)*$" },
          description: { type: "string", minLength: 20 },
          shortDescription: { type: "string", maxLength: 200 },
          coverImageUrl: { type: "string", format: "uri" },
          pdfFileKey: { type: "string" },
          pages: { type: "integer" },
          language: { type: "string", default: "English" },
          format: { type: "string", enum: ["EBOOK", "WHITEPAPER", "REPORT", "CASE_STUDY", "GUIDE", "DATASHEET", "WEBINAR"] },
          status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
          isFeatured: { type: "boolean", default: false },
          isTrending: { type: "boolean", default: false },
          tags: { type: "string", description: "Comma-separated" },
          companyId: { type: "string" },
          categoryIds: { type: "array", items: { type: "string" }, minItems: 1 },
        },
      },
      CategoryListResponse: {
        type: "object",
        properties: { categories: { type: "array", items: { $ref: "#/components/schemas/Category" } } },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          icon: { type: "string", nullable: true },
        },
      },
      CategoryInput: {
        type: "object",
        required: ["name", "slug"],
        properties: {
          name: { type: "string", minLength: 2 },
          slug: { type: "string", pattern: "^[a-z0-9]+(-[a-z0-9]+)*$" },
          description: { type: "string" },
          icon: { type: "string" },
          order: { type: "integer", default: 0 },
          isActive: { type: "boolean", default: true },
        },
      },
      LeadFormInput: {
        type: "object",
        required: [
          "salutation", "fullName", "email", "phone", "companyName", "jobTitle", "country",
          "department", "industry", "companySize", "consentGiven", "bookSlug",
        ],
        properties: {
          salutation: { type: "string", enum: ["Mr", "Ms", "Mrs", "Dr"] },
          fullName: { type: "string", minLength: 2 },
          email: {
            type: "string",
            format: "email",
            description: "Must be a business domain — gmail.com, yahoo.com, hotmail.com, outlook.com, icloud.com etc. are rejected.",
          },
          phone: { type: "string", minLength: 6 },
          companyName: { type: "string", minLength: 2 },
          jobTitle: { type: "string", minLength: 2 },
          country: { type: "string" },
          state: { type: "string", description: "Optional free text" },
          city: { type: "string", description: "Optional free text" },
          department: { type: "string" },
          industry: { type: "string" },
          companySize: {
            type: "string",
            enum: [
              "SIZE_1_10", "SIZE_11_50", "SIZE_51_200", "SIZE_201_500",
              "SIZE_501_1000", "SIZE_1001_5000", "SIZE_5001_10000", "SIZE_10000_PLUS",
            ],
          },
          consentGiven: { type: "boolean", description: "Must be true" },
          bookSlug: { type: "string" },
        },
      },
    },
  },
} as const;