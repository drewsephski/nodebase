import { createTRPCRouter } from "@/trpc/init";
import { protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import prisma from "@/lib/db";
import { PAGINATION } from "@/config/constants";
import { encrypt, decrypt, maskCredentialData } from "@/lib/encryption";
import { CredentialType } from "@/lib/generated/prisma/index";

export const credentialsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.nativeEnum(CredentialType),
        data: z.record(z.string(), z.unknown()),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, type, data, description } = input;

      try {
        // Encrypt the credential data
        const encryptedData = encrypt(JSON.stringify(data));

        const credential = await prisma.credential.create({
          data: {
            name,
            type,
            data: encryptedData,
            description,
            userId: ctx.auth.user.id,
          },
        });

        return {
          ...credential,
          data: maskCredentialData(data),
        };
      } catch (error) {
        console.error("Error creating credential:", error);
        throw new Error("Failed to create credential");
      }
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const [credentials, totalCount] = await Promise.all([
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          },
        }),
      ]);

      // Decrypt and mask data for each credential
      const processedCredentials = credentials.map((credential) => {
        try {
          const decryptedData = JSON.parse(decrypt(credential.data as string));
          return {
            ...credential,
            data: maskCredentialData(decryptedData),
          };
        } catch (error) {
          console.error("Error decrypting credential data:", error);
          return {
            ...credential,
            data: {},
          };
        }
      });

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items: processedCredentials,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const credential = await prisma.credential.findUniqueOrThrow({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      try {
        const decryptedData = JSON.parse(decrypt(credential.data as string));
        return {
          ...credential,
          data: decryptedData,
        };
      } catch (error) {
        console.error("Error decrypting credential data:", error);
        throw new Error("Failed to decrypt credential data");
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        data: z.record(z.string(), z.unknown()),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, data, description } = input;

      // Verify credential ownership
      const existingCredential = await prisma.credential.findUnique({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      if (!existingCredential) {
        throw new Error("Credential not found");
      }

      try {
        // Encrypt the updated credential data
        const encryptedData = encrypt(JSON.stringify(data));

        const credential = await prisma.credential.update({
          where: { id },
          data: {
            name,
            data: encryptedData,
            description,
          },
        });

        return {
          ...credential,
          data: maskCredentialData(data),
        };
      } catch (error) {
        console.error("Error updating credential:", error);
        throw new Error("Failed to update credential");
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      // Verify credential ownership
      const credential = await prisma.credential.findUnique({
        where: {
          id,
          userId: ctx.auth.user.id,
        },
      });

      if (!credential) {
        throw new Error("Credential not found");
      }

      await prisma.credential.delete({
        where: { id },
      });

      return { id };
    }),
});