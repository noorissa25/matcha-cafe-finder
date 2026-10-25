// Sample data: real Boston-area cafés. Names, addresses and map pins come from
// OpenStreetMap; the drinks named in each description were taken from the café's
// menu listings, checked in October 2026. Menus and hours change, so check with
// the café before you go.
//
// There are no sample tastings. Ratings and tasting notes are personal, so the
// list starts with every café as "to try" and you add your own.
//
// Used by the database seed (prisma/seed.ts) and by the static demo build.

export type SampleTasting = {
  drinkType: "matcha" | "coffee";
  drinkName: string;
  rating: number;
  notes: string;
  visitedOn: string;
};

export type SampleCafe = {
  name: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
  tags: string;
  servesMatcha?: boolean;
  servesCoffee?: boolean;
  tastings?: SampleTasting[];
};

export const sampleCafes: SampleCafe[] = [
  {
    name: "Jaho Coffee & Tea",
    neighborhood: "Chinatown",
    address: "665 Washington St, Boston, MA",
    lat: 42.35187,
    lng: -71.06286,
    description:
      "Coffee roaster and tea bar. Uji matcha lattes (plain, black sugar, strawberry), matcha soft serve and espresso drinks.",
    tags: "uji matcha,soft serve,coffee roaster",
  },
  {
    name: "Gracenote Coffee",
    neighborhood: "Leather District",
    address: "108 Lincoln St, Boston, MA",
    lat: 42.35153,
    lng: -71.05813,
    description: "Small espresso bar from a local roaster: house blend and single-origin espresso, batch brew and cold brew.",
    tags: "espresso,single origin,cold brew",
    servesMatcha: false,
  },
  {
    name: "George Howell Coffee",
    neighborhood: "Downtown Crossing",
    address: "505 Washington St, Boston, MA",
    lat: 42.35477,
    lng: -71.06144,
    description: "Specialty roaster's café in the Godfrey Hotel. Alchemy blend espresso, single-origin pour-overs and coffee flights.",
    tags: "pour over,single origin,espresso",
    servesMatcha: false,
  },
  {
    name: "Ogawa Coffee",
    neighborhood: "Downtown Crossing",
    address: "10 Milk St, Boston, MA",
    lat: 42.35684,
    lng: -71.05808,
    description: "Kyoto coffee company's Boston café. Matcha and hojicha lattes, pour-overs, espresso and a smoked maple latte.",
    tags: "kyoto,hojicha,pour over",
  },
  {
    name: "Blue Bottle Coffee",
    neighborhood: "Back Bay",
    address: "163 Newbury St, Boston, MA",
    lat: 42.35081,
    lng: -71.07878,
    description: "Coffee chain café on Newbury Street. Iced matcha, a Sweet Blossom matcha latte and New Orleans-style chicory iced coffee.",
    tags: "iced coffee,flavored matcha,espresso",
  },
  {
    name: "Mizu Matcha",
    neighborhood: "Back Bay",
    address: "217 Newbury St, Boston, MA",
    lat: 42.35012,
    lng: -71.08136,
    description: "Matcha dessert shop. Matcha gelato in five intensity levels, matcha soft serve, matcha lattes and hojicha and black sesame drinks.",
    tags: "gelato,soft serve,hojicha,dessert drinks",
    servesCoffee: false,
  },
  {
    name: "Kyo Matcha",
    neighborhood: "Brookline",
    address: "1010 Beacon St, Brookline, MA",
    lat: 42.34628,
    lng: -71.10738,
    description: "Matcha café. Matcha lattes, teas, boba drinks, matcha ice cream and towel cakes.",
    tags: "boba,dessert drinks,ice cream",
    servesCoffee: false,
  },
  {
    name: "Tatte Bakery & Cafe",
    neighborhood: "Cambridge",
    address: "1288 Massachusetts Ave, Cambridge, MA (Harvard Square)",
    lat: 42.37267,
    lng: -71.11686,
    description: "Bakery café with pastries and full meals. Hot and iced matcha lattes, plus espresso drinks.",
    tags: "bakery,study spot,espresso",
  },
  {
    name: "Broadsheet Coffee Roasters",
    neighborhood: "Cambridge",
    address: "100 Kirkland St, Cambridge, MA",
    lat: 42.37798,
    lng: -71.10733,
    description: "Café that roasts its coffee on site. Single-origin coffees, espresso drinks and an espresso tonic.",
    tags: "roasted in house,single origin,espresso",
    servesMatcha: false,
  },
  {
    name: "Diesel Cafe",
    neighborhood: "Somerville",
    address: "257 Elm St, Somerville, MA (Davis Square)",
    lat: 42.39571,
    lng: -71.12196,
    description: "Davis Square café. Stone-ground matcha latte steamed with soy milk, a strawberry matcha and espresso drinks.",
    tags: "soy milk,flavored matcha,study spot",
  },
];
