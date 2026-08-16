import configPromise from "@payload-config";
import { getPayload } from "payload";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  try {
    const payload = await getPayload({ config: configPromise });
    const products = await payload.find({
      collection: "products",
      draft: false,
      sort: "title",
      // overrideAccess: false,
      page,
      limit,
      select: {
        title: true,
        slug: true,
        gallery: true,
        inventory: true,
        categories: true,
        priceInVND: true,
      },
      depth: 2,
      // where: {
      //   _status: { equals: "published" },
      // },
    });

    return Response.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
