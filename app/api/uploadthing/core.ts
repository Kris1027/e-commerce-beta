import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";

const f = createUploadthing();

export const ourFileRouter = {
  // Product image uploader - Admin only
  productImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      // Check if user is authenticated
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("Unauthorized: You must be logged in to upload images");
      }

      // Check if user is admin
      if (session.user.role !== UserRole.admin) {
        throw new UploadThingError("Unauthorized: Only administrators can upload product images");
      }

      // Pass userId to onUploadComplete
      return { userId: session.user.id, userRole: session.user.role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return file info to be accessible on the client
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        fileName: file.name,
        fileKey: file.key,
      };
    }),

  // User avatar uploader - Authenticated users only
  avatarUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("Unauthorized: You must be logged in to upload an avatar");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Here you could update the user's avatar in the database
      // await prisma.user.update({
      //   where: { id: metadata.userId },
      //   data: { image: file.url }
      // });

      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
      };
    }),

  // Category image uploader - Admin only
  categoryImageUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("Unauthorized: You must be logged in");
      }

      if (session.user.role !== UserRole.admin) {
        throw new UploadThingError("Unauthorized: Only administrators can upload category images");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
      };
    }),

  // Banner uploader - Admin only
  bannerUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("Unauthorized: You must be logged in");
      }

      if (session.user.role !== UserRole.admin) {
        throw new UploadThingError("Unauthorized: Only administrators can upload banners");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        fileUrl: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;