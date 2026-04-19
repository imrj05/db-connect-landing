import { getAdminOverviewData } from "@/lib/admin-server";
import { requireAdminRequestSession } from "@/lib/admin-auth";

export async function GET() {
    const { response } = await requireAdminRequestSession();

    if (response) {
        return response;
    }

    const data = await getAdminOverviewData();
    return Response.json(data);
}
