import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

const s3 = new S3Client({
  forcePathStyle: true,
});

async function main() {
  console.log("=== 1. TESTING NEON POSTGRES (PRISMA) ===");
  const [usersCount, peopleCount, orgsCount, articlesCount, journeysCount] = await Promise.all([
    prisma.user.count(),
    prisma.person.count(),
    prisma.organization.count(),
    prisma.article.count(),
    prisma.journey.count(),
  ]);
  console.log(`[PASS] Connected to Neon Postgres! Live counts:`);
  console.log(`  - Users: ${usersCount}`);
  console.log(`  - People: ${peopleCount}`);
  console.log(`  - Organizations: ${orgsCount}`);
  console.log(`  - Articles: ${articlesCount}`);
  console.log(`  - Journeys: ${journeysCount}`);

  console.log("\n=== 2. TESTING NEON OBJECT STORAGE (S3) ===");
  const bucket = process.env.NEON_OBJECT_STORAGE_BUCKET || "assets";
  const testKey = `test/verify-neon-${Date.now()}.txt`;
  const testContent = "Hello from Aneakajun Neon Object Storage verification!";
  
  console.log(`Uploading test object to bucket "${bucket}" at key "${testKey}"...`);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: "text/plain",
    }),
  );
  console.log(`[PASS] Uploaded successfully.`);

  console.log(`Downloading test object from Neon Object Storage...`);
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: testKey,
    }),
  );
  const downloadedBytes = await res.Body?.transformToByteArray();
  const downloadedText = downloadedBytes ? Buffer.from(downloadedBytes).toString("utf-8") : "";
  if (downloadedText !== testContent) {
    throw new Error(`Downloaded content mismatch! Got: "${downloadedText}"`);
  }
  console.log(`[PASS] Downloaded content matches: "${downloadedText}"`);

  console.log(`Deleting test object from bucket...`);
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: testKey,
    }),
  );
  console.log(`[PASS] Deleted object successfully.`);

  console.log("\n=== ALL NEON SERVICES VERIFIED END-TO-END! ===");
}

main()
  .catch((e) => {
    console.error("Verification failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
