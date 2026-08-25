import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const U = (id: string) => `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

// Curated Unsplash photo ids used across products.
const P = {
  croissant: U("photo-1555507036-ab1f4038808a"),
  pastry: U("photo-1509440159596-0249088772ff"),
  bread: U("photo-1568254183919-78a4f43a2877"),
  sourdough: U("photo-1608198093002-ad4e005484ec"),
  cakeChoc: U("photo-1578985545062-69928b1d9587"),
  cakeBerry: U("photo-1565958011703-44f9829ba187"),
  cakeCelebrate: U("photo-1464349095431-e9a21285b5f3"),
  cookies: U("photo-1499636136210-6f4ee915583e"),
  dessertCup: U("photo-1551024506-0bccd828d307"),
  tartFruit: U("photo-1486427944299-d1955d23e34d"),
  dough: U("photo-1517686469429-8bdb88b9f907"),
  kitchen: U("photo-1556910103-1c02745aae4d"),
  cafe: U("photo-1523294587484-bae6cc870010"),
  shopfront: U("photo-1534620808146-d33bb39128b2"),
};

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  compareAtCents?: number;
  ingredients: string;
  allergens: string;
  nutrition: Record<string, string>;
  tags?: string[];
  featured?: boolean;
  quantity: number;
  lowStockAt?: number;
  bakedTodayHoursAgo?: number;
  images: string[];
};

const categories = [
  { slug: "viennoiserie", name: "Viennoiserie", description: "Laminated classics folded by hand with cultured French butter.", sortOrder: 1 },
  { slug: "cakes", name: "Cakes", description: "Celebration cakes and patisserie desserts, finished to order.", sortOrder: 2 },
  { slug: "tarts", name: "Tarts", description: "Crisp shells, seasonal fruit and silky custards.", sortOrder: 3 },
  { slug: "bread", name: "Bread", description: "Naturally leavened loaves baked on stone every morning.", sortOrder: 4 },
  { slug: "cookies", name: "Cookies", description: "Small-batch biscuits with single-origin chocolate.", sortOrder: 5 },
  { slug: "seasonal", name: "Seasonal", description: "Limited editions built around what is at its peak right now.", sortOrder: 6 },
  { slug: "gift-boxes", name: "Gift Boxes", description: "Curated assortments wrapped for gifting.", sortOrder: 7 },
];

const products: SeedProduct[] = [
  {
    slug: "butter-croissant",
    name: "Butter Croissant",
    category: "viennoiserie",
    shortDescription: "72-hour laminated dough, cultured Normandy butter, shatteringly crisp.",
    description:
      "Our signature croissant takes three days from mixing to oven. The dough is laminated by hand with 82% fat cultured butter from Normandy, proofed slowly overnight and baked at dawn until deeply caramelised. The interior should be honeycombed, elastic and barely sweet — the crust audibly crisp.",
    priceCents: 380,
    ingredients: "Wheat flour, cultured butter (milk), water, sea salt, cane sugar, natural levain, fresh yeast.",
    allergens: "Contains gluten, milk. Made in a bakery that handles nuts, eggs and sesame.",
    nutrition: { energy: "231 kcal", fat: "12g", carbs: "26g", protein: "4.5g" },
    tags: ["bestseller", "baked-daily"],
    featured: true,
    quantity: 40,
    bakedTodayHoursAgo: 2,
    images: [P.croissant, P.pastry],
  },
  {
    slug: "pain-au-chocolat",
    name: "Pain au Chocolat",
    category: "viennoiserie",
    shortDescription: "Two batons of 70% dark chocolate wrapped in croissant dough.",
    description:
      "The same slow-laminated dough as our croissant, rolled around two generous batons of 70% Ecuadorian dark chocolate. We rest the shaped dough a full night so the layers relax, giving a tender crumb and deep, buttery flavour that carries the chocolate rather than competing with it.",
    priceCents: 420,
    ingredients: "Wheat flour, cultured butter (milk), 70% dark chocolate (cocoa mass, cocoa butter, sugar, emulsifier: soya lecithin), water, sea salt, cane sugar, natural levain.",
    allergens: "Contains gluten, milk, soya. May contain traces of nuts.",
    nutrition: { energy: "288 kcal", fat: "16g", carbs: "31g", protein: "5g" },
    tags: ["bestseller"],
    featured: true,
    quantity: 36,
    bakedTodayHoursAgo: 2,
    images: [P.pastry, P.croissant],
  },
  {
    slug: "almond-croissant",
    name: "Almond Croissant",
    category: "viennoiserie",
    shortDescription: "Day-old croissants reborn with rum frangipane and toasted almonds.",
    description:
      "A classic of French boulangerie frugality: yesterday's croissants are filled with dark-rum frangipane, topped with flaked Marcona almonds and icing sugar, then returned to the oven until the almond cream sets and the edges caramelise. Rich, nutty and unapologetically indulgent.",
    priceCents: 450,
    ingredients: "Wheat flour, cultured butter (milk), almonds, free-range egg, cane sugar, dark rum, sea salt.",
    allergens: "Contains gluten, milk, egg, nuts.",
    nutrition: { energy: "342 kcal", fat: "21g", carbs: "33g", protein: "6.5g" },
    tags: ["baked-daily"],
    quantity: 24,
    bakedTodayHoursAgo: 3,
    images: [P.croissant],
  },
  {
    slug: "pistachio-raspberry-danish",
    name: "Pistachio Raspberry Danish",
    category: "viennoiserie",
    shortDescription: "Sicilian pistachio cream, raspberry compote, fresh raspberries.",
    description:
      "A square of laminated Danish dough filled with Sicilian pistachio cream, dotted with sharp raspberry compote and finished after baking with fresh fruit and a whisper of icing sugar. The bitter-sweet pistachio against bright raspberry has become our most requested weekend pastry.",
    priceCents: 520,
    ingredients: "Wheat flour, cultured butter (milk), pistachios, raspberries, free-range egg, cane sugar, lemon.",
    allergens: "Contains gluten, milk, egg, nuts.",
    nutrition: { energy: "315 kcal", fat: "18g", carbs: "34g", protein: "6g" },
    tags: ["weekend", "signature"],
    featured: true,
    quantity: 18,
    lowStockAt: 6,
    bakedTodayHoursAgo: 4,
    images: [P.dessertCup],
  },
  {
    slug: "burnt-basque-cheesecake",
    name: "Burnt Basque Cheesecake",
    category: "cakes",
    shortDescription: "Crustless, caramelised top, molten centre. Served at room temperature.",
    description:
      "Adapted from the La Viña style of San Sebastián: an unctuous cream-cheese batter baked hot until the top scorches to a deep mahogany while the centre stays just set. We hold it at room temperature and slice generously. Best eaten on the day, ideally with nothing else on the plate.",
    priceCents: 3400,
    ingredients: "Cream cheese (milk), free-range egg, double cream, cane sugar, cornflour, vanilla bean, sea salt.",
    allergens: "Contains milk, egg.",
    nutrition: { energy: "356 kcal", fat: "25g", carbs: "25g", protein: "7g" },
    tags: ["signature", "whole-cake"],
    featured: true,
    quantity: 10,
    lowStockAt: 3,
    images: [P.cakeChoc, P.cakeBerry],
  },
  {
    slug: "dark-chocolate-hazelnut-tart",
    name: "Chocolate Hazelnut Tart",
    category: "tarts",
    shortDescription: "Piedmont hazelnut praline under a ganache of 64% single-origin chocolate.",
    description:
      "A press-in hazelnut shell holds a layer of house-made praline, poured over with a glossy ganache of 64% single-origin Ecuadorian chocolate. Finished with candied hazelnuts and flaky salt. Deeply chocolatey without being heavy — cut thin slices and let it come to room temperature.",
    priceCents: 2900,
    ingredients: "Hazelnuts, 64% dark chocolate (cocoa mass, cocoa butter, sugar, emulsifier: soya lecithin), wheat flour, cultured butter (milk), free-range egg, double cream, cane sugar, sea salt.",
    allergens: "Contains gluten, milk, egg, nuts, soya.",
    nutrition: { energy: "410 kcal", fat: "29g", carbs: "32g", protein: "6g" },
    tags: ["signature"],
    featured: false,
    quantity: 12,
    images: [P.cakeChoc],
  },
  {
    slug: "sourdough-country-loaf",
    name: "Sourdough Country Loaf",
    category: "bread",
    shortDescription: "Stone-milled British wheat, 24-hour cold ferment, blistered crust.",
    description:
      "Our everyday loaf: stone-milled British wheat with a touch of rye, fermented on its natural levain for 24 hours including a long cold retard. Baked in a cast-iron pot for a thick, blistered crust and a moist, open crumb with a gentle lactic tang. Keeps well for four days and freezes beautifully.",
    priceCents: 650,
    ingredients: "Stone-milled wheat flour, wholegrain rye flour, water, sea salt, natural levain.",
    allergens: "Contains gluten.",
    nutrition: { energy: "245 kcal", fat: "1.2g", carbs: "48g", protein: "8.5g" },
    tags: ["bestseller", "baked-daily"],
    featured: true,
    quantity: 30,
    bakedTodayHoursAgo: 5,
    images: [P.sourdough, P.bread],
  },
  {
    slug: "seeded-rye-boule",
    name: "Seeded Rye Boule",
    category: "bread",
    shortDescription: "Dense Nordic-style rye with sunflower, flax and toasted sesame.",
    description:
      "A dense, aromatic loaf in the Nordic tradition — 60% rye soaked overnight with sunflower, flax and sesame seeds, then baked long and slow in a tin. Almost no rise, deeply savoury, excellent toasted and thinly sliced with salted butter or smoked fish. Stays good for a week.",
    priceCents: 720,
    ingredients: "Rye flour, wheat flour, sunflower seeds, flax seeds, sesame seeds, water, sea salt, natural levain, molasses.",
    allergens: "Contains gluten, sesame. Made in a bakery that handles nuts.",
    nutrition: { energy: "232 kcal", fat: "8g", carbs: "31g", protein: "7g" },
    quantity: 16,
    bakedTodayHoursAgo: 6,
    images: [P.bread],
  },
  {
    slug: "olive-rosemary-fougasse",
    name: "Olive & Rosemary Fougasse",
    category: "bread",
    shortDescription: "Provençal flatbread studded with Niçoise olives and garden rosemary.",
    description:
      "A wet, olive-oil enriched dough stretched into the classic leaf shape, studded with pitted Niçoise olives and rosemary picked from our roof planters. Baked directly on stone until the exterior crackles. Tear, dip in good olive oil, eat warm. Available from Thursday to Sunday.",
    priceCents: 560,
    ingredients: "Wheat flour, Niçoise olives, extra virgin olive oil, rosemary, water, sea salt, fresh yeast.",
    allergens: "Contains gluten.",
    nutrition: { energy: "268 kcal", fat: "9g", carbs: "39g", protein: "6.5g" },
    tags: ["thursday-to-sunday"],
    quantity: 0,
    images: [P.bread],
  },
  {
    slug: "strawberry-mille-feuille",
    name: "Strawberry Mille-Feuille",
    category: "seasonal",
    shortDescription: "Caramelised puff, Tahitian vanilla crème légère, Kentish strawberries.",
    description:
      "The centrepiece of our strawberry season collection. Sheets of inverted puff pastry caramelised under weights, layered with Tahitian vanilla crème légère and British strawberries macerated lightly in elderflower. Assembled to order — the pastry must still speak when you bite it.",
    priceCents: 850,
    ingredients: "Wheat flour, cultured butter (milk), strawberries, double cream, free-range egg, cane sugar, Tahitian vanilla, elderflower, lemon.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "298 kcal", fat: "19g", carbs: "26g", protein: "4.5g" },
    tags: ["seasonal", "signature"],
    featured: true,
    quantity: 14,
    lowStockAt: 4,
    images: [P.cakeBerry, P.tartFruit],
  },
  {
    slug: "seasonal-fruit-tart",
    name: "Seasonal Fruit Tart",
    category: "tarts",
    shortDescription: "Vanilla crème pâtissière and the best fruit of the week.",
    description:
      "Our daily tart: a blind-baked sweet shell filled with Madagascar vanilla crème pâtissière and dressed with whatever the market gave us that morning — currently Mirabelle plums and figs, glossed with a light apricot glaze. The fruit changes weekly; the standard never does.",
    priceCents: 3200,
    ingredients: "Wheat flour, cultured butter (milk), seasonal fruit, free-range egg, milk, cane sugar, cornflour, Madagascan vanilla, apricot.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "264 kcal", fat: "12g", carbs: "35g", protein: "4g" },
    tags: ["changes-weekly"],
    featured: true,
    quantity: 8,
    lowStockAt: 3,
    images: [P.tartFruit, P.cakeBerry],
  },
  {
    slug: "lemon-meringue-tartlet",
    name: "Lemon Meringue Tartlet",
    category: "tarts",
    shortDescription: "Amalfi-style lemon curd, swirled Italian meringue, torched to order.",
    description:
      "A sharp, intensely citrus curd made with Amalfi-style lemons in a crisp shell, crowned with Italian meringue torched to a bronze blush. Sweetness lives entirely in the meringue so the curd can stay properly sour. Best within a few hours of purchase.",
    priceCents: 480,
    ingredients: "Wheat flour, cultured butter (milk), lemons, free-range egg, cane sugar.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "276 kcal", fat: "13g", carbs: "35g", protein: "4.5g" },
    quantity: 20,
    images: [P.tartFruit],
  },
  {
    slug: "chocolate-chunk-cookies",
    name: "Sea Salt Chocolate Chunk Cookies",
    category: "cookies",
    shortDescription: "Brown butter, 55% chunks, Maldon salt. Four per box.",
    description:
      "Brown-butter cookie dough rested overnight for deeper flavour, studded with hand-cut chunks of 55% milk-adjacent chocolate and finished with Maldon salt before baking. Crisp edges, molten middle, four to a box. They reheat magnificently for 90 seconds in a low oven.",
    priceCents: 1250,
    ingredients: "Wheat flour, cultured butter (milk), 55% chocolate (cocoa mass, sugar, cocoa butter, emulsifier: soya lecithin), free-range egg, cane sugar, light brown sugar, Maldon sea salt, raising agent (bicarbonate of soda).",
    allergens: "Contains gluten, milk, egg, soya.",
    nutrition: { energy: "224 kcal /cookie", fat: "11g", carbs: "28g", protein: "3g" },
    tags: ["bestseller"],
    featured: false,
    quantity: 45,
    images: [P.cookies],
  },
  {
    slug: "buckwheat-cacao-nib-cookies",
    name: "Buckwheat & Cacao Nib Cookies",
    category: "cookies",
    shortDescription: "Nutty buckwheat flour, crunchy cacao nibs, barely sweet.",
    description:
      "For people who think they don't like sweet things: buckwheat flour brings a toasty, almost savoury depth, raw cacao nibs add bitterness and crunch, and we keep the sugar deliberately restrained. Four per box. Excellent alongside black coffee or a glass of cold milk.",
    priceCents: 1350,
    ingredients: "Buckwheat flour, wheat flour, cultured butter (milk), cacao nibs, cane sugar, free-range egg, honey, sea salt.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "212 kcal /cookie", fat: "12g", carbs: "22g", protein: "3.5g" },
    quantity: 28,
    images: [P.cookies],
  },
  {
    slug: "pistachio-rose-cake",
    name: "Pistachio & Rose Layer Cake",
    category: "cakes",
    shortDescription: "Three sponge layers, rosewater chantilly, crushed pistachio rim.",
    description:
      "A celebration cake built on soft olive-oil pistachio sponges, layered with delicately rosewater-scented Chantilly and finished with crushed Sicilian pistachios around the base and dried rose petals on top. Fragrant rather than perfumed — serves eight generously.",
    priceCents: 4800,
    ingredients: "Pistachios, wheat flour, olive oil, double cream, free-range egg, cane sugar, rosewater, baking powder.",
    allergens: "Contains gluten, milk, egg, nuts.",
    nutrition: { energy: "388 kcal /slice", fat: "22g", carbs: "41g", protein: "7g" },
    tags: ["celebration", "whole-cake"],
    quantity: 6,
    lowStockAt: 2,
    images: [P.cakeCelebrate],
  },
  {
    slug: "honey-madeleines",
    name: "Honey Madeleines",
    category: "cookies",
    shortDescription: "Shell-shaped, orange-blossom honey, baked to order in batches.",
    description:
      "The batter rests overnight so the classic hump rises proudly in the oven. We bake them in small batches through the morning and brush each one warm with orange-blossom honey from a rooftop apiary in Hackney. Eat within hours, ideally still faintly warm.",
    priceCents: 850,
    ingredients: "Free-range egg, wheat flour, cultured butter (milk), orange-blossom honey, cane sugar, lemon zest.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "198 kcal /3", fat: "9g", carbs: "25g", protein: "3.5g" },
    quantity: 32,
    images: [P.cookies, P.pastry],
  },
  {
    slug: "praline-paris-brest",
    name: "Praline Paris-Brest",
    category: "cakes",
    shortDescription: "Choux ring, hazelnut praline mousseline, toasted nibbed almonds.",
    description:
      "Created for the Paris–Brest–Paris bicycle race and perfected ever since. A ring of choux pastry, halved and filled with a hazelnut praline mousseline so light it shouldn't legally be called cream. We make the praline in-house and fold it through twice for texture.",
    priceCents: 680,
    ingredients: "Hazelnuts, wheat flour, cultured butter (milk), free-range egg, double cream, cane sugar, almonds.",
    allergens: "Contains gluten, milk, egg, nuts.",
    nutrition: { energy: "365 kcal", fat: "25g", carbs: "27g", protein: "6g" },
    tags: ["signature"],
    quantity: 15,
    images: [P.dessertCup],
  },
  {
    slug: "canelé-de-bordeaux",
    name: "Canelé de Bordeaux",
    category: "viennoiserie",
    shortDescription: "Rum-and-vanilla custard in a caramelised copper-baked crust.",
    description:
      "The most technically demanding item we bake: a rum-scented custard rested two days, baked in beeswaxed copper moulds until the outside becomes a thin, glassy caramel shell around a custardy heart. Sold in fours. Worth every minute of the wait.",
    priceCents: 1450,
    ingredients: "Milk, free-range egg, wheat flour, cane sugar, dark rum, Tahitian vanilla, cultured butter (milk).",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "142 kcal /each", fat: "4g", carbs: "21g", protein: "3g" },
    quantity: 22,
    images: [P.dessertCup, P.pastry],
  },
  {
    slug: "morning-bun",
    name: "Orange Morning Bun",
    category: "viennoiserie",
    shortDescription: "Croissant dough rolled with candied orange and cinnamon sugar.",
    description:
      "A San Francisco interpretation of the kouign-amann family: croissant dough rolled around candied orange zest and cinnamon sugar, baked in a muffin tin until the sugar caramelises against the pan, then tossed in more sugar while hot. Sticky fingers guaranteed and intended.",
    priceCents: 440,
    ingredients: "Wheat flour, cultured butter (milk), candied orange, cane sugar, cinnamon, free-range egg.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "302 kcal", fat: "16g", carbs: "36g", protein: "4.5g" },
    quantity: 20,
    bakedTodayHoursAgo: 3,
    images: [P.pastry, P.croissant],
  },
  {
    slug: "fig-walnut-loaf",
    name: "Fig & Walnut Loaf",
    category: "bread",
    shortDescription: "Gently spiced levain loaf with black figs and walnut halves.",
    description:
      "An autumn-leaning loaf we bake year-round because customers refused to let it go: a mild levain dough loaded with dried black figs and toasted walnut halves, lightly spiced with star anise. Superb with a hard sheep's cheese or simply salted butter.",
    priceCents: 780,
    ingredients: "Wheat flour, dried figs, walnuts, water, natural levain, sea salt, star anise.",
    allergens: "Contains gluten, nuts.",
    nutrition: { energy: "258 kcal", fat: "7g", carbs: "40g", protein: "7.5g" },
    quantity: 14,
    images: [P.bread],
  },
  {
    slug: "valrhona-brownie",
    name: "Valrhona Brownie",
    category: "cakes",
    shortDescription: "Fudgy centre, crackled top, 70% Guanaja chocolate. Square slices.",
    description:
      "Underbaked by design: a dense fudge centre beneath a delicate crackled top, made with Valrhona Guanaja 70% and a pinch of espresso to deepen the chocolate. Cut into generous squares. Serve slightly warm with crème fraîche if you want to ruin all other brownies for yourself.",
    priceCents: 520,
    ingredients: "70% dark chocolate (cocoa mass, sugar, cocoa butter, emulsifier: soya lecithin), cultured butter (milk), free-range egg, cane sugar, wheat flour, coffee, sea salt.",
    allergens: "Contains gluten, milk, egg, soya.",
    nutrition: { energy: "372 kcal", fat: "24g", carbs: "33g", protein: "5g" },
    quantity: 26,
    images: [P.cakeChoc],
  },
  {
    slug: "vanilla-bean-eclair",
    name: "Vanilla Bean Éclair",
    category: "viennoiserie",
    shortDescription: "Crisp choux, Madagascan vanilla crème pâtissière, fondant glaze.",
    description:
      "Choux piped straight, baked dry and hollow, filled with crème pâtissière heavily flecked with Madagascan vanilla and glazed with a pale fondant. The shell should resist slightly, then give. Filled throughout the day, never in advance.",
    priceCents: 460,
    ingredients: "Milk, free-range egg, wheat flour, cultured butter (milk), cane sugar, Madagascan vanilla, fondant.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "265 kcal", fat: "13g", carbs: "31g", protein: "5g" },
    quantity: 24,
    bakedTodayHoursAgo: 4,
    images: [P.dessertCup],
  },
  {
    slug: "plum-frangipane-galette",
    name: "Plum Frangipane Galette",
    category: "seasonal",
    shortDescription: "Rustic open tart, Victoria plums, almond frangipane, demerara edge.",
    description:
      "Late-summer Victoria plums nested in almond frangipane inside a free-form rough-puff border, brushed with egg and scattered with demerara for a caramelised edge. Rustic on purpose — every one comes out a little different. Serves four to six depending on honesty.",
    priceCents: 2400,
    ingredients: "Victoria plums, almonds, wheat flour, cultured butter (milk), free-range egg, cane sugar, demerara sugar, lemon.",
    allergens: "Contains gluten, milk, egg, nuts.",
    nutrition: { energy: "296 kcal /slice", fat: "17g", carbs: "31g", protein: "5g" },
    tags: ["seasonal"],
    quantity: 9,
    lowStockAt: 3,
    images: [P.tartFruit, P.cakeBerry],
  },
  {
    slug: "gift-box-the-classic",
    name: "Gift Box — The Classic Dozen",
    category: "gift-boxes",
    shortDescription: "Four butter croissants, four pains au chocolat, four almond croissants.",
    description:
      "Our viennoiserie greatest hits, boxed for gifting (or for very good weekends): four butter croissants, four pains au chocolat and four almond croissants, packed in our navy keepsake box with tissue and a handwritten card if you leave a note at checkout. Choose your pickup day so they leave the oven straight into your hands.",
    priceCents: 4200,
    compareAtCents: 4600,
    ingredients: "See individual pastries. Contains wheat flour, cultured butter (milk), almonds, free-range egg, dark chocolate (soya).",
    allergens: "Contains gluten, milk, egg, nuts, soya.",
    nutrition: { energy: "varies by item" },
    tags: ["gift", "bestseller"],
    featured: true,
    quantity: 12,
    lowStockAt: 3,
    images: [P.croissant, P.shopfront],
  },
  {
    slug: "gift-box-the-patisserie",
    name: "Gift Box — The Patisserie Eight",
    category: "gift-boxes",
    shortDescription: "Two éclairs, two canelés, two tartlets, two Paris-Brest.",
    description:
      "For the person who deserves better than flowers: two vanilla bean éclairs, two canelés de Bordeaux, two lemon meringue tartlets and two praline Paris-Brest, arranged in our navy keepsake box. A genuinely impressive thing to arrive somewhere holding.",
    priceCents: 5600,
    ingredients: "See individual pastries. Contains nuts, egg, milk, gluten.",
    allergens: "Contains gluten, milk, egg, nuts.",
    nutrition: { energy: "varies by item" },
    tags: ["gift"],
    quantity: 8,
    lowStockAt: 2,
    images: [P.dessertCup, P.tartFruit],
  },
  {
    slug: "baguette-tradition",
    name: "Baguette Tradition",
    category: "bread",
    shortDescription: "Poolish-fermented tradition baguette, crackling crust, open crumb.",
    description:
      "Made with T65 tradition flour and a slow poolish preferment, shaped by hand and scored seven times before sliding onto the stone. The law of tradition: only flour, water, salt and yeast. Best within five hours of baking — we will happily sell you a half-dozen for dinner tonight.",
    priceCents: 280,
    ingredients: "T65 wheat flour, water, sea salt, fresh yeast.",
    allergens: "Contains gluten.",
    nutrition: { energy: "255 kcal", fat: "0.8g", carbs: "52g", protein: "8g" },
    tags: ["baked-daily"],
    quantity: 50,
    bakedTodayHoursAgo: 1,
    images: [P.sourdough],
  },
  {
    slug: "cardamom-knot",
    name: "Cardamom Knot",
    category: "viennoiserie",
    shortDescription: "Scandinavian brioche knot, green cardamom sugar, pearl sugar top.",
    description:
      "A nod to the Swedish kanelbulle but built on rich brioche and freshly ground green cardamom — nothing pre-ground, we crush the pods weekly. Twisted into a knot, baked until golden and showered with pearl sugar. The smell alone sells half of them.",
    priceCents: 440,
    ingredients: "Wheat flour, cultured butter (milk), green cardamom, cane sugar, free-range egg, pearl sugar, fresh yeast, milk.",
    allergens: "Contains gluten, milk, egg.",
    nutrition: { energy: "289 kcal", fat: "14g", carbs: "36g", protein: "5g" },
    tags: ["baked-daily"],
    quantity: 0,
    images: [P.pastry],
  },
];

const promotions = [
  {
    code: "WELCOME10",
    title: "Welcome offer — 10% off your first order",
    description: "New customers receive 10% off their first order over £15.",
    type: "PERCENT",
    value: 10,
    minSubtotalCents: 1500,
  },
  {
    code: "STRAWBERRYSEASON",
    title: "Strawberry Season — £5 off boxes over £30",
    description: "Celebrate strawberry season with £5 off orders over £30.",
    type: "FIXED",
    value: 500,
    minSubtotalCents: 3000,
  },
];

async function main() {
  console.log("Seeding Maison Douce…");
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@maisondouce.test").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "MaisonAdmin!2026";

  await db.orderItem.deleteMany();
  await db.payment.deleteMany();
  await db.order.deleteMany();
  await db.wishlistItem.deleteMany();
  await db.wishlist.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.address.deleteMany();
  await db.productImage.deleteMany();
  await db.inventory.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();
  await db.promotion.deleteMany();
  await db.newsletterSubscriber.deleteMany();
  await db.contactMessage.deleteMany();
  await db.activityLog.deleteMany();
  await db.user.deleteMany();

  const catMap = new Map<string, string>();
  for (const c of categories) {
    const created = await db.category.create({
      data: { ...c, image: null },
    });
    catMap.set(c.slug, created.id);
  }

  const productIds: { id: string; slug: string; name: string; priceCents: number }[] = [];
  for (const p of products) {
    const categoryId = catMap.get(p.category);
    if (!categoryId) throw new Error(`Missing category ${p.category}`);
    const created = await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        priceCents: p.priceCents,
        compareAtCents: p.compareAtCents ?? null,
        categoryId,
        ingredients: p.ingredients,
        allergens: p.allergens,
        nutrition: JSON.stringify(p.nutrition),
        tags: (p.tags ?? []).join(","),
        isFeatured: !!p.featured,
        status: "ACTIVE",
        images: {
          create: p.images.map((url, i) => ({ url, alt: `${p.name}`, sortOrder: i })),
        },
        inventory: {
          create: {
            quantity: p.quantity,
            lowStockAt: p.lowStockAt ?? 5,
            bakedOn: p.bakedTodayHoursAgo != null ? new Date(Date.now() - p.bakedTodayHoursAgo * 3600_000) : null,
          },
        },
      },
    });
    productIds.push({ id: created.id, slug: created.slug, name: created.name, priceCents: created.priceCents });
  }

  // Users -------------------------------------------------------------
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.create({
    data: { email: adminEmail, passwordHash: adminHash, name: "Camille Roux", role: "ADMIN" },
  });

  const demoPassword = await bcrypt.hash("DemoCustomer1", 12);
  const customer = await db.user.create({
    data: { email: "customer@example.com", passwordHash: demoPassword, name: "Elena Marsh", role: "CUSTOMER", phone: "+44 7700 900123" },
  });
  await db.address.create({
    data: { userId: customer.id, label: "Home", line1: "14 Lamb's Conduit Street", city: "London", postcode: "WC1N 3LE", isDefault: true },
  });
  await db.wishlist.create({
    data: { userId: customer.id, items: { create: [{ productId: productIds[4].id }, { productId: productIds[0].id }] } },
  });

  // Orders ------------------------------------------------------------
  const statuses = ["COMPLETED", "COMPLETED", "OUT_FOR_DELIVERY", "BAKING", "PAID", "CANCELLED"];
  const names = [
    { email: "j.hartley@example.com", name: "James Hartley", phone: "+44 7700 900301" },
    { email: "sofia.m@example.com", name: "Sofia Mendes", phone: "+44 7700 900302" },
    { email: "customer@example.com", name: "Elena Marsh", phone: "+44 7700 900123" },
    { email: "t.okafor@example.com", name: "Tom Okafor", phone: "+44 7700 900304" },
    { email: "priya.r@example.com", name: "Priya Raman", phone: "+44 7700 900305" },
    { email: "l.weber@example.com", name: "Lena Weber", phone: "+44 7700 900306" },
  ];
  let dayOffset = 13;
  for (let i = 0; i < statuses.length; i++) {
    const cust = names[i];
    const line1 = productIds[(i * 5 + 1) % productIds.length];
    const line2 = productIds[(i * 7 + 4) % productIds.length];
    const items = [
      { productId: line1.id, productName: line1.name, unitCents: line1.priceCents, quantity: 2 },
      { productId: line2.id, productName: line2.name, unitCents: line2.priceCents, quantity: 1 },
    ];
    const subtotal = items.reduce((s, l) => s + l.unitCents * l.quantity, 0);
    const delivery = subtotal >= 5000 ? 0 : 495;
    const discount = i === 0 ? Math.round(subtotal * 0.1) : 0;
    const createdAt = new Date(Date.now() - dayOffset * 86400_000 - i * 3600_000);
    dayOffset -= 2;
    const order = await db.order.create({
      data: {
        orderNumber: `MD-DEMO${String(i + 1).padStart(3, "0")}`,
        userId: cust.email === "customer@example.com" ? customer.id : null,
        email: cust.email,
        customerName: cust.name,
        phone: cust.phone,
        fulfilment: i % 3 === 0 ? "DELIVERY" : "PICKUP",
        addressLine1: i % 3 === 0 ? `${10 + i} Hatton Garden` : null,
        city: i % 3 === 0 ? "London" : null,
        postcode: i % 3 === 0 ? "EC1N 8DX" : null,
        promoCode: i === 0 ? "WELCOME10" : null,
        subtotalCents: subtotal,
        deliveryCents: delivery,
        discountCents: discount,
        totalCents: subtotal - discount + delivery,
        status: statuses[i],
        createdAt,
        updatedAt: createdAt,
        items: { create: items },
        payment: {
          create: {
            provider: "mock",
            status: statuses[i] === "CANCELLED" ? "FAILED" : "SUCCEEDED",
            amountCents: subtotal - discount + delivery,
            reference: `mock_MD-DEMO${i + 1}`,
          },
        },
      },
    });
    void order;
  }

  // Promotions / marketing --------------------------------------------
  for (const p of promotions) {
    await db.promotion.create({ data: { ...p, active: true } });
  }
  await db.newsletterSubscriber.createMany({
    data: [
      { email: "hello@foodielondon.test", source: "footer" },
      { email: "bakes@example.org", source: "homepage" },
    ],
  });
  await db.contactMessage.create({
    data: { name: "Marco Bellini", email: "marco@example.com", subject: "Wedding cake enquiry", message: "Hello! We're getting married next June and would love to discuss a pistachio and rose celebration cake for 90 guests." },
  });

  // Site content -------------------------------------------------------
  const settings: Record<string, unknown> = {
    hero: {
      eyebrow: "Artisan bakery · London",
      titleLines: ["Made slowly.", "Loved instantly."],
      subtitle: "Small-batch pastries, bread, and desserts baked fresh with carefully sourced ingredients.",
      primaryCta: "Shop today's collection",
      secondaryCta: "Discover our story",
    },
    announcement: "Strawberry Season Collection — now in the shop until the berries run out",
    contact: { address: "58 Lamb's Conduit Street, Bloomsbury, London WC1N", phone: "+44 20 7946 0810", email: "hello@maisondouce.co.uk" },
    hours: [
      { days: "Tuesday – Friday", time: "7:30 – 18:00" },
      { days: "Saturday", time: "8:00 – 17:00" },
      { days: "Sunday", time: "8:00 – 14:00" },
      { days: "Monday", time: "Closed — the ovens rest" },
    ],
    story: {
      title: "Flour, water, salt — and patience.",
      body: "Maison Douce began in 2019 in a tiny Bloomsbury railway arch with one deck oven and an unreasonable belief that London deserved slower bread. Six years later the arch is a full atelier, but the method hasn't changed: stone-milled flour, cultured butter, natural levains, and bakers who touch every piece by hand.",
    },
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.create({ data: { key, valueJson: JSON.stringify(value) } });
  }

  await db.activityLog.createMany({
    data: [
      { actor: admin.email, action: "seed.completed", detail: `Seeded ${products.length} products, ${statuses.length} orders` },
      { actor: "system", action: "inventory.synced", detail: "Initial stock levels recorded" },
    ],
  });

  console.log(`Seed complete: ${productIds.length} products, ${categories.length} categories.`);
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("Demo customer: customer@example.com / DemoCustomer1");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
