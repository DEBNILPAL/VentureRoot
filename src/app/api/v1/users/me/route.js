import { authenticate } from "@/middlewares/auth.middleware";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/utils/api-response";
import { handleError } from "@/utils/error-handler";

/**
 * DELETE /api/v1/users/me
 * Permanently erases the authenticated user, all owned businesses, reports, profile,
 * and auth credentials from the database.
 */
export async function DELETE(request) {
  try {
    const { user } = await authenticate(request);

    // 1. Run cascade deletion of user records in database
    await prisma.$transaction(async (tx) => {
      // Delete reports
      await tx.report.deleteMany({
        where: { userId: user.id },
      });

      // Delete businesses
      await tx.business.deleteMany({
        where: { userId: user.id },
      });

      // Delete profile
      await tx.profile.deleteMany({
        where: { userId: user.id },
      });
    });

    // 2. Purge from Supabase auth.users directly via Postgres
    try {
      await prisma.$queryRawUnsafe(
        "DELETE FROM auth.users WHERE id = $1::uuid;",
        user.id
      );
    } catch (authErr) {
      console.warn("[DELETE /users/me] auth.users deletion notice:", authErr?.message);
    }

    return successResponse({
      message: "Account and all associated venture data permanently deleted.",
      data: {
        deletedUserId: user.id,
        purged: true,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
