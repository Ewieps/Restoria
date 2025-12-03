import { createUploadthing, type FileRouter } from "uploadthing/next";
import { verifyToken } from "@/lib/autHelper";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({req}) => {
      const authHeader = req.headers.get("authorization");
      const auth = verifyToken(authHeader);
      if (!auth) {
        throw new UploadThingError("Unauthorized"); 
      }
      return {
        userId: auth.adminId,
        role: auth.role
      };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);

      return { fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;