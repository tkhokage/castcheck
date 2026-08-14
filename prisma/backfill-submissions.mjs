import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

// Real agencies: add their public "submit / get seen" links.
await db.agency.updateMany({ where: { name: "Kim Dawson Agency" }, data: { submissionUrl: "https://www.kimdawsonagency.com/join" } });
await db.agency.updateMany({ where: { name: "Houghton Talent" }, data: { submissionUrl: "https://houghtontalent.com/contact/" } });

// Demo listing that was missing a contact email.
const opp = await db.opportunity.updateMany({
  where: { contactName: "Central Casting Atlanta", contactEmail: null },
  data: { contactEmail: "extras@centralcastingatl.example" },
});

console.log("agencies updated with submissionUrl; opps backfilled:", opp.count);
await db.$disconnect();
