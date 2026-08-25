import { db } from "@/lib/db";
import { StoreProvider } from "@/components/store/store-provider";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";

async function getChromeContent() {
  try {
    const settings = await db.siteSetting.findMany({
      where: { key: { in: ["announcement", "contact"] } },
    });
    const map: Record<string, unknown> = {};
    for (const s of settings) map[s.key] = JSON.parse(s.valueJson);
    return {
      announcement: (map.announcement as string) ?? "",
      contact: map.contact as { email: string; phone: string; address: string } | undefined,
    };
  } catch {
    return { announcement: "", contact: undefined };
  }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const { announcement, contact } = await getChromeContent();
  return (
    <StoreProvider>
      <Header announcement={announcement} />
      <CartDrawer />
      <main id="main">{children}</main>
      <Footer contact={contact} />
    </StoreProvider>
  );
}
