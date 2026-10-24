// Sample data. Every cafe, address and tasting note here is made up for the demo;
// none of it describes or reviews a real business. Coordinates sit in real Boston-area
// neighborhoods only so the map has something sensible to show.
//
// Running the seed REPLACES all cafes and tastings in the database.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedTasting = {
  drinkType: "matcha" | "coffee";
  drinkName: string;
  rating: number;
  notes: string;
  visitedOn: string;
};

type SeedCafe = {
  name: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  tags: string;
  servesMatcha?: boolean;
  servesCoffee?: boolean;
  tastings?: SeedTasting[];
};

const cafes: SeedCafe[] = [
  {
    name: "Moss & Stone Tea Bar",
    neighborhood: "Back Bay",
    address: "Near Copley Square (fictional)",
    lat: 42.3505,
    lng: -71.0763,
    description: "Tea bar that stone-grinds ceremonial matcha and whisks every cup to order.",
    tags: "ceremonial grade,whisked to order,oat milk",
    servesCoffee: false,
    tastings: [
      { drinkType: "matcha", drinkName: "Usucha", rating: 5, notes: "Grassy and umami, smooth with no bitterness.", visitedOn: "2026-09-06" },
      { drinkType: "matcha", drinkName: "Iced oat matcha latte", rating: 4, notes: "Creamy, matcha still comes through, slightly sweet.", visitedOn: "2026-10-04" },
    ],
  },
  {
    name: "Ember Roastworks",
    neighborhood: "South End",
    address: "Off Tremont Street (fictional)",
    lat: 42.3427,
    lng: -71.0716,
    description: "Roaster with a light roast, single origin pour over bar.",
    tags: "pour over,single origin,light roast",
    tastings: [
      { drinkType: "coffee", drinkName: "Ethiopian pour over", rating: 5, notes: "Bright and floral, blueberry notes, clean finish.", visitedOn: "2026-08-23" },
      { drinkType: "matcha", drinkName: "Matcha latte", rating: 2, notes: "Dull and a bit bitter, tasted like culinary grade powder.", visitedOn: "2026-08-23" },
    ],
  },
  {
    name: "Sugar Cloud Cafe",
    neighborhood: "Allston",
    address: "Harvard Avenue area (fictional)",
    lat: 42.3539,
    lng: -71.1337,
    description: "Dessert cafe with flavored lattes, syrups and whipped toppings.",
    tags: "flavored,dessert drinks",
    tastings: [
      { drinkType: "matcha", drinkName: "Strawberry matcha latte", rating: 2, notes: "Very sweet and syrupy, could not taste the matcha.", visitedOn: "2026-07-12" },
      { drinkType: "coffee", drinkName: "Vanilla latte", rating: 3, notes: "Fine, sweet.", visitedOn: "2026-07-12" },
    ],
  },
  {
    name: "North Pier Coffee",
    neighborhood: "North End",
    address: "Near Hanover Street (fictional)",
    lat: 42.3647,
    lng: -71.0542,
    description: "Italian-style espresso bar pulling dark roast shots.",
    tags: "espresso,dark roast",
    servesMatcha: false,
    tastings: [
      { drinkType: "coffee", drinkName: "Espresso", rating: 4, notes: "Chocolatey, rich crema, a little smoky.", visitedOn: "2026-09-20" },
      { drinkType: "coffee", drinkName: "Cortado", rating: 4, notes: "Balanced, nutty and smooth.", visitedOn: "2026-10-11" },
    ],
  },
  {
    name: "Kumo Matcha House",
    neighborhood: "Cambridge",
    address: "Central Square area (fictional)",
    lat: 42.3653,
    lng: -71.1037,
    description: "Matcha house serving koicha, usucha and hojicha from Uji.",
    tags: "ceremonial grade,hojicha,whisked to order",
    servesCoffee: false,
    tastings: [
      { drinkType: "matcha", drinkName: "Koicha", rating: 5, notes: "Thick and intensely umami with a sweet finish.", visitedOn: "2026-10-18" },
      { drinkType: "matcha", drinkName: "Hojicha latte", rating: 4, notes: "Roasty and nutty, cozy.", visitedOn: "2026-10-18" },
    ],
  },

  // Not tried yet: these are what the recommender ranks.
  {
    name: "Fern & Field",
    neighborhood: "Jamaica Plain",
    address: "Centre Street area (fictional)",
    lat: 42.3097,
    lng: -71.1151,
    description: "Small tea counter whisking ceremonial matcha to order; a grassy, umami usucha and a seasonal yuzu matcha tonic.",
    tags: "ceremonial grade,whisked to order,seasonal",
    servesCoffee: false,
  },
  {
    name: "Velvet Bean",
    neighborhood: "Somerville",
    address: "Davis Square area (fictional)",
    lat: 42.3967,
    lng: -71.1226,
    description: "Pour over bar rotating Ethiopian and Kenyan coffees; bright, floral, fruity cups.",
    tags: "pour over,single origin,light roast",
    servesMatcha: false,
  },
  {
    name: "Petal Pop Cafe",
    neighborhood: "Back Bay",
    address: "Newbury Street area (fictional)",
    lat: 42.3489,
    lng: -71.0826,
    description: "Sweet flavored matcha lattes with syrups, whipped cream and boba.",
    tags: "flavored,boba,dessert drinks",
  },
  {
    name: "Harbor Grind",
    neighborhood: "Seaport",
    address: "Near the waterfront (fictional)",
    lat: 42.3519,
    lng: -71.0446,
    description: "Busy espresso bar; dark roast, smoky chocolatey shots and nutty cortados. Matcha latte on the menu too.",
    tags: "espresso,dark roast",
  },
  {
    name: "Little Uji",
    neighborhood: "Chinatown",
    address: "Beach Street area (fictional)",
    lat: 42.3493,
    lng: -71.0621,
    description: "Japanese cafe with koicha and usucha flights, hojicha lattes and wagashi.",
    tags: "ceremonial grade,hojicha,oat milk",
    servesCoffee: false,
  },
  {
    name: "Common Ground Coffee Co.",
    neighborhood: "Cambridge",
    address: "Harvard Square area (fictional)",
    lat: 42.3736,
    lng: -71.119,
    description: "Neighborhood cafe with a house drip blend, an oat milk matcha latte and plenty of seating.",
    tags: "oat milk,study spot",
  },
];

async function main() {
  await prisma.tasting.deleteMany();
  await prisma.cafe.deleteMany();

  for (const { tastings = [], ...cafe } of cafes) {
    await prisma.cafe.create({
      data: {
        ...cafe,
        tastings: { create: tastings.map((t) => ({ ...t, visitedOn: new Date(t.visitedOn) })) },
      },
    });
  }

  const tastingCount = cafes.reduce((n, c) => n + (c.tastings?.length ?? 0), 0);
  console.log(`Seeded ${cafes.length} fictional cafes and ${tastingCount} tastings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
