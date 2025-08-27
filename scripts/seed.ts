import { prisma } from "../src/server/db";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: { email: "owner@example.com", name: "Owner" }
  });

  const dealer = await prisma.dealer.upsert({
    where: { id: "demo-dealer" },
    update: {},
    create: {
      id: "demo-dealer",
      name: "Demo Motors",
      ownerId: user.id,
      phone: "+15551234567",
      siteUrl: "https://example.com"
    }
  });

  const cars = [
    { make: "Honda",  model: "Civic",   year: 2021, price: 17999, mileage: 42000, description: "Clean, 1-owner, great on gas" },
    { make: "Toyota", model: "Corolla", year: 2020, price: 16950, mileage: 38000, description: "Reliable, Bluetooth, backup cam" },
    { make: "Mazda",  model: "3",       year: 2022, price: 21900, mileage: 12000, description: "Sport trim, heated seats" }
  ];

  for (const c of cars) {
    await prisma.vehicle.create({ data: { dealerId: dealer.id, ...c } });
  }
  console.log("Seeded demo. Dealer ID: demo-dealer");
}

main().catch((e) => { console.error(e); process.exit(1); });
