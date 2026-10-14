import { Resolver } from "dns/promises";

// dns.promises.resolveMx uses c-ares, which sends its own DNS queries directly
// to whatever nameservers Node reads from the OS network config — it does NOT
// go through the same path as `nslookup` (the Windows DNS Client / OS stub
// resolver). On Windows in particular (VPNs, corporate DNS, flaky adapters),
// c-ares can fail with ESERVFAIL/ETIMEOUT/ECONNREFUSED for a domain that's
// genuinely non-existent, instead of the expected ENOTFOUND/ENODATA. Falling
// back to a known-reachable public resolver when the system one is
// inconclusive avoids that false negative.
const FALLBACK_DNS_SERVERS = ["1.1.1.1", "8.8.8.8"];

type LookupResult = boolean | "inconclusive";

function isDefinitiveNoRecord(code: string | undefined): boolean {
  return code === "ENOTFOUND" || code === "ENODATA";
}

async function hasMxRecord(resolver: Resolver, domain: string): Promise<LookupResult> {
  try {
    const records = await resolver.resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (isDefinitiveNoRecord(code)) return false;
    console.warn(`[mx-check] resolveMx inconclusive for ${domain}: ${code ?? error}`);
    return "inconclusive";
  }
}

async function hasAddressRecord(resolver: Resolver, domain: string): Promise<LookupResult> {
  const [v4, v6] = await Promise.allSettled([
    resolver.resolve4(domain),
    resolver.resolve6(domain),
  ]);

  if (v4.status === "fulfilled" && v4.value.length > 0) return true;
  if (v6.status === "fulfilled" && v6.value.length > 0) return true;

  const v4Code = v4.status === "rejected" ? (v4.reason as NodeJS.ErrnoException)?.code : undefined;
  const v6Code = v6.status === "rejected" ? (v6.reason as NodeJS.ErrnoException)?.code : undefined;

  if (isDefinitiveNoRecord(v4Code) && isDefinitiveNoRecord(v6Code)) {
    return false;
  }

  console.warn(`[mx-check] A/AAAA inconclusive for ${domain}: v4=${v4Code ?? "ok?"} v6=${v6Code ?? "ok?"}`);
  return "inconclusive";
}

async function checkWithResolver(resolver: Resolver, domain: string): Promise<LookupResult> {
  const mx = await hasMxRecord(resolver, domain);
  if (mx !== false) return mx; // true or "inconclusive"

  // No MX — a domain can still receive mail via its A/AAAA record per
  // RFC 5321 §5.1's implicit-MX fallback, so don't block on MX absence alone.
  return hasAddressRecord(resolver, domain);
}

export async function domainCanReceiveEmail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return false;

  const systemResolver = new Resolver();
  const systemResult = await checkWithResolver(systemResolver, domain);
  if (systemResult !== "inconclusive") {
    console.log(`[mx-check] ${domain}: ${systemResult} (system resolver)`);
    return systemResult;
  }

  const fallbackResolver = new Resolver();
  fallbackResolver.setServers(FALLBACK_DNS_SERVERS);
  const fallbackResult = await checkWithResolver(fallbackResolver, domain);
  if (fallbackResult !== "inconclusive") {
    console.log(`[mx-check] ${domain}: ${fallbackResult} (fallback resolver)`);
    return fallbackResult;
  }

  // Both the system and a known-reachable public resolver failed to give a
  // definitive answer — a transient network issue, not evidence the domain
  // is fake. Fail open rather than block a real signup.
  console.warn(`[mx-check] ${domain}: inconclusive on both resolvers — allowing`);
  return true;
}
