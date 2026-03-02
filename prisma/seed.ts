import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Namirnice ────────────────────────────────────────────────────────────────

  const ingredients = await Promise.all([
    // Meso i riba
    prisma.ingredient.upsert({ where: { name: 'Pileći file' }, update: {}, create: { name: 'Pileći file', unit: 'kg', nationalPrice: 550, category: 'meso' } }),
    prisma.ingredient.upsert({ where: { name: 'Svinjski but' }, update: {}, create: { name: 'Svinjski but', unit: 'kg', nationalPrice: 700, category: 'meso' } }),
    prisma.ingredient.upsert({ where: { name: 'Mljeveno meso (mešano)' }, update: {}, create: { name: 'Mljeveno meso (mešano)', unit: 'kg', nationalPrice: 600, category: 'meso' } }),
    prisma.ingredient.upsert({ where: { name: 'Tunjevina u ulju' }, update: {}, create: { name: 'Tunjevina u ulju', unit: 'kom', nationalPrice: 250, category: 'meso' } }),

    // Mlečni i jaja
    prisma.ingredient.upsert({ where: { name: 'Jaja' }, update: {}, create: { name: 'Jaja', unit: 'kom', nationalPrice: 25, category: 'mlecni' } }),
    prisma.ingredient.upsert({ where: { name: 'Mleko' }, update: {}, create: { name: 'Mleko', unit: 'litar', nationalPrice: 100, category: 'mlecni' } }),
    prisma.ingredient.upsert({ where: { name: 'Jogurt' }, update: {}, create: { name: 'Jogurt', unit: 'kg', nationalPrice: 150, category: 'mlecni' } }),
    prisma.ingredient.upsert({ where: { name: 'Sir mladi' }, update: {}, create: { name: 'Sir mladi', unit: 'kg', nationalPrice: 800, category: 'mlecni' } }),
    prisma.ingredient.upsert({ where: { name: 'Kisela pavlaka' }, update: {}, create: { name: 'Kisela pavlaka', unit: 'kg', nationalPrice: 350, category: 'mlecni' } }),
    prisma.ingredient.upsert({ where: { name: 'Maslac' }, update: {}, create: { name: 'Maslac', unit: 'kg', nationalPrice: 1200, category: 'mlecni' } }),

    // Žitarice
    prisma.ingredient.upsert({ where: { name: 'Ovas' }, update: {}, create: { name: 'Ovas', unit: 'kg', nationalPrice: 300, category: 'zitarice' } }),
    prisma.ingredient.upsert({ where: { name: 'Pirinač' }, update: {}, create: { name: 'Pirinač', unit: 'kg', nationalPrice: 250, category: 'zitarice' } }),
    prisma.ingredient.upsert({ where: { name: 'Integralna testenina' }, update: {}, create: { name: 'Integralna testenina', unit: 'kg', nationalPrice: 220, category: 'zitarice' } }),
    prisma.ingredient.upsert({ where: { name: 'Integralni hleb' }, update: {}, create: { name: 'Integralni hleb', unit: 'kom', nationalPrice: 130, category: 'zitarice' } }),

    // Povrće
    prisma.ingredient.upsert({ where: { name: 'Paradajz' }, update: {}, create: { name: 'Paradajz', unit: 'kg', nationalPrice: 200, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Paprika' }, update: {}, create: { name: 'Paprika', unit: 'kg', nationalPrice: 250, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Krastavac' }, update: {}, create: { name: 'Krastavac', unit: 'kg', nationalPrice: 150, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Spanać' }, update: {}, create: { name: 'Spanać', unit: 'kg', nationalPrice: 300, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Brokoli' }, update: {}, create: { name: 'Brokoli', unit: 'kg', nationalPrice: 350, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Krompir' }, update: {}, create: { name: 'Krompir', unit: 'kg', nationalPrice: 100, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Mrkva' }, update: {}, create: { name: 'Mrkva', unit: 'kg', nationalPrice: 120, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Crni luk' }, update: {}, create: { name: 'Crni luk', unit: 'kg', nationalPrice: 100, category: 'povrce' } }),
    prisma.ingredient.upsert({ where: { name: 'Beli luk' }, update: {}, create: { name: 'Beli luk', unit: 'kom', nationalPrice: 50, category: 'zacini' } }),

    // Voće
    prisma.ingredient.upsert({ where: { name: 'Banana' }, update: {}, create: { name: 'Banana', unit: 'kg', nationalPrice: 200, category: 'ostalo' } }),
    prisma.ingredient.upsert({ where: { name: 'Jabuka' }, update: {}, create: { name: 'Jabuka', unit: 'kg', nationalPrice: 150, category: 'ostalo' } }),

    // Začini i ulja
    prisma.ingredient.upsert({ where: { name: 'Maslinovo ulje' }, update: {}, create: { name: 'Maslinovo ulje', unit: 'litar', nationalPrice: 1200, category: 'zacini' } }),
    prisma.ingredient.upsert({ where: { name: 'Suncokretovo ulje' }, update: {}, create: { name: 'Suncokretovo ulje', unit: 'litar', nationalPrice: 250, category: 'zacini' } }),
    prisma.ingredient.upsert({ where: { name: 'Med' }, update: {}, create: { name: 'Med', unit: 'kg', nationalPrice: 1500, category: 'ostalo' } }),
    prisma.ingredient.upsert({ where: { name: 'Konzerva paradajza' }, update: {}, create: { name: 'Konzerva paradajza', unit: 'kom', nationalPrice: 120, category: 'povrce' } }),
  ])

  const ing = Object.fromEntries(ingredients.map(i => [i.name, i]))
  console.log(`✅ Kreirano ${ingredients.length} namirnica`)

  // ─── Recepti ─────────────────────────────────────────────────────────────────

  const recipes = [
    {
      name: 'Kajgana sa povrćem',
      mealTypes: ['dorucak'],
      prepTime: 10,
      difficulty: 'lako',
      calories: 400,
      protein: 22,
      fat: 30,
      carbs: 10,
      tags: ['brzo', 'visoko_proteinski'],
      steps: [
        'Papriкu i luk iseckati na sitne kockice.',
        'Zagrejati maslinovo ulje na tiganju na srednoj vatri.',
        'Dodati luk i papriкu, dinstati 3 minuta.',
        'Razbiti jaja u tiganj, posoliti i pobiberiti.',
        'Mešati dok se jaja ne stegnu po ukusu (mekša ili čvršća kajgana).',
        'Servirati toplo.',
      ],
      ingredients: [
        { name: 'Jaja', amount: 3 },
        { name: 'Paprika', amount: 0.1 },
        { name: 'Crni luk', amount: 0.05 },
        { name: 'Maslinovo ulje', amount: 0.015 },
      ],
    },
    {
      name: 'Ovsena kaša sa bananom',
      mealTypes: ['dorucak'],
      prepTime: 10,
      difficulty: 'lako',
      calories: 500,
      protein: 14,
      fat: 8,
      carbs: 88,
      tags: ['brzo', 'veganski', 'bez_glutena'],
      steps: [
        'Mleko sipati u šerpu i zagrejati na srednoj vatri.',
        'Dodati ovas i kuvati uz stalno mešanje 5 minuta.',
        'Ugasiti vatru, dodati med i promešati.',
        'Sipati u zdelicu i prekriti seckanom bananom.',
      ],
      ingredients: [
        { name: 'Ovas', amount: 0.08 },
        { name: 'Mleko', amount: 0.2 },
        { name: 'Banana', amount: 0.15 },
        { name: 'Med', amount: 0.01 },
      ],
    },
    {
      name: 'Tost sa jajima i sirom',
      mealTypes: ['dorucak'],
      prepTime: 15,
      difficulty: 'lako',
      calories: 480,
      protein: 28,
      fat: 26,
      carbs: 36,
      tags: ['brzo', 'visoko_proteinski'],
      steps: [
        'Hleb prepeci u tosteru ili na tiganju.',
        'Na maslacu propržiti jaja (oko 3 minuta).',
        'Staviti jaja na tost i posuti seckanim sirom.',
        'Posoliti i pobiberiti po ukusu.',
      ],
      ingredients: [
        { name: 'Integralni hleb', amount: 2 },
        { name: 'Jaja', amount: 2 },
        { name: 'Sir mladi', amount: 0.05 },
        { name: 'Maslac', amount: 0.01 },
      ],
    },
    {
      name: 'Pileće prsa sa brokolijem',
      mealTypes: ['rucak', 'vecera'],
      prepTime: 30,
      difficulty: 'lako',
      calories: 450,
      protein: 48,
      fat: 16,
      carbs: 20,
      tags: ['visoko_proteinski', 'fit', 'bez_glutena'],
      steps: [
        'Pileće prsa oprati i posušiti papirnim ubrusom.',
        'Posoliti, pobiberiti i premазati maslinovim uljem.',
        'Grilovati na zagrejanom tiganju 6-7 minuta po strani.',
        'Brokoli podeliti na cvetice i blanširati 3 minuta u slanoj vodi.',
        'Beli luk sitno iseckati i propržiti na maslinovom ulju 1 minut.',
        'Dodati brokoli i promešati. Servirati uz piletinu.',
      ],
      ingredients: [
        { name: 'Pileći file', amount: 0.2 },
        { name: 'Brokoli', amount: 0.2 },
        { name: 'Beli luk', amount: 1 },
        { name: 'Maslinovo ulje', amount: 0.02 },
      ],
    },
    {
      name: 'Pileća supa',
      mealTypes: ['rucak'],
      prepTime: 45,
      difficulty: 'srednje',
      calories: 320,
      protein: 30,
      fat: 8,
      carbs: 28,
      tags: ['fit', 'bez_glutena'],
      steps: [
        'Piletinu oprati i staviti u lonac sa 1.5 litra vode.',
        'Dodati celo povrće (mrkvu, krompir, luk) i zakuvati.',
        'Skiдati penu dok se pojavljuje.',
        'Kuvati na tihoj vatri 40 minuta.',
        'Izvaditi piletinu, isčupati meso na komade i vratiti u supu.',
        'Posoliti i pobiberiti po ukusu. Servirati toplo.',
      ],
      ingredients: [
        { name: 'Pileći file', amount: 0.25 },
        { name: 'Mrkva', amount: 0.1 },
        { name: 'Krompir', amount: 0.15 },
        { name: 'Crni luk', amount: 0.08 },
      ],
    },
    {
      name: 'Špagete bolonjeze',
      mealTypes: ['rucak', 'vecera'],
      prepTime: 40,
      difficulty: 'srednje',
      calories: 680,
      protein: 38,
      fat: 22,
      carbs: 78,
      tags: ['porodicni', 'ekonomican'],
      steps: [
        'Luk i beli luk sitno iseckati i propržiti na ulju 3 minuta.',
        'Dodati mljeveno meso i pržiti uz mešanje dok ne porumeni.',
        'Dodati konzervu paradajza, posoliti, pobiberiti i kuvati 20 minuta.',
        'U slanoj vodi skuvati testeninu al dente (prema uputству na pakovanju).',
        'Sos sipati preko testenine i servirati.',
      ],
      ingredients: [
        { name: 'Integralna testenina', amount: 0.1 },
        { name: 'Mljeveno meso (mešano)', amount: 0.15 },
        { name: 'Konzerva paradajza', amount: 1 },
        { name: 'Crni luk', amount: 0.08 },
        { name: 'Beli luk', amount: 1 },
        { name: 'Suncokretovo ulje', amount: 0.015 },
      ],
    },
    {
      name: 'Pirinač sa piletinom i povrćem',
      mealTypes: ['rucak', 'vecera'],
      prepTime: 35,
      difficulty: 'lako',
      calories: 560,
      protein: 42,
      fat: 12,
      carbs: 68,
      tags: ['fit', 'visoko_proteinski', 'ekonomican'],
      steps: [
        'Pirinač kuvati po uputству na pakovanju (oko 18 min).',
        'Piletinu iseckati na kockice i posoliti.',
        'Na ulju propržiti piletinu 5-6 minuta po strani.',
        'Dodati iseckanu papriкu i luk, dinstati još 3 minuta.',
        'Pomešati sa kuvanim pirinčem i servirati.',
      ],
      ingredients: [
        { name: 'Pirinač', amount: 0.08 },
        { name: 'Pileći file', amount: 0.18 },
        { name: 'Paprika', amount: 0.1 },
        { name: 'Crni luk', amount: 0.05 },
        { name: 'Suncokretovo ulje', amount: 0.01 },
      ],
    },
    {
      name: 'Pileća salata sa paradajzom',
      mealTypes: ['rucak', 'vecera', 'uzina'],
      prepTime: 15,
      difficulty: 'lako',
      calories: 340,
      protein: 36,
      fat: 16,
      carbs: 10,
      tags: ['fit', 'brzo', 'bez_glutena', 'visoko_proteinski'],
      steps: [
        'Pileći file iseckati na sitne kockice i propržiti na ulju 6 minuta.',
        'Paradajz i krastavac iseckati na kockice.',
        'Pomešati povrće sa piletinom.',
        'Preliti maslinovim uljem, posoliti i pobiberiti.',
        'Po želji dodati kаp limunovog sока.',
      ],
      ingredients: [
        { name: 'Pileći file', amount: 0.15 },
        { name: 'Paradajz', amount: 0.15 },
        { name: 'Krastavac', amount: 0.1 },
        { name: 'Maslinovo ulje', amount: 0.02 },
      ],
    },
    {
      name: 'Jogurt sa medom i bananom',
      mealTypes: ['dorucak', 'uzina'],
      prepTime: 5,
      difficulty: 'lako',
      calories: 290,
      protein: 14,
      fat: 5,
      carbs: 48,
      tags: ['brzo', 'veganski', 'bez_glutena'],
      steps: [
        'Jogurt sipati u zdelicu.',
        'Bananu iseckati na kolutove i staviti na jogurt.',
        'Preliti medom po ukusu.',
        'Odmah servirati.',
      ],
      ingredients: [
        { name: 'Jogurt', amount: 0.2 },
        { name: 'Banana', amount: 0.1 },
        { name: 'Med', amount: 0.015 },
      ],
    },
    {
      name: 'Salata od tunjevine',
      mealTypes: ['rucak', 'vecera', 'uzina'],
      prepTime: 10,
      difficulty: 'lako',
      calories: 310,
      protein: 32,
      fat: 14,
      carbs: 10,
      tags: ['brzo', 'visoko_proteinski', 'ekonomican', 'bez_glutena'],
      steps: [
        'Tunjevinu ocediti od ulja i staviti u zdelicu.',
        'Paradajz i krastavac iseckati na kockice.',
        'Pomešati sve sastojke.',
        'Preliti maslinovim uljem i posoliti po ukusu.',
      ],
      ingredients: [
        { name: 'Tunjevina u ulju', amount: 1 },
        { name: 'Paradajz', amount: 0.15 },
        { name: 'Krastavac', amount: 0.1 },
        { name: 'Maslinovo ulje', amount: 0.015 },
      ],
    },
    {
      name: 'Spanać sa jajima',
      mealTypes: ['dorucak', 'vecera'],
      prepTime: 15,
      difficulty: 'lako',
      calories: 360,
      protein: 24,
      fat: 26,
      carbs: 8,
      tags: ['fit', 'visoko_proteinski', 'bez_glutena'],
      steps: [
        'Beli luk sitno iseckati i propržiti na maslinovom ulju 1 minut.',
        'Dodati oprani spanać i dinstati 3-4 minuta dok ne ovene.',
        'Napraviti udubine i razbiti jaja u spanać.',
        'Poklopiti i kuvati 3-5 minuta dok se belo ne stegne.',
        'Posoliti i pobiberiti. Servirati toplo.',
      ],
      ingredients: [
        { name: 'Spanać', amount: 0.2 },
        { name: 'Jaja', amount: 2 },
        { name: 'Beli luk', amount: 1 },
        { name: 'Maslinovo ulje', amount: 0.015 },
      ],
    },
    {
      name: 'Pileći ćevapi sa povrćem',
      mealTypes: ['rucak', 'vecera'],
      prepTime: 30,
      difficulty: 'srednje',
      calories: 520,
      protein: 44,
      fat: 18,
      carbs: 38,
      tags: ['srpska_kuhinja', 'visoko_proteinski'],
      steps: [
        'Mljevenu piletinu izmešati sa soli, biberom i lukom u prahu.',
        'Oblikovati ćevape i ostaviti 15 minuta u frižideru.',
        'Grilovati ćevape 10-12 minuta, okretati svakih 3-4 minuta.',
        'Papriкu i luk iseckati i servirati uz ćevape.',
        'Servirati sa ajvarom ili jogurtom.',
      ],
      ingredients: [
        { name: 'Mljeveno meso (mešano)', amount: 0.2 },
        { name: 'Paprika', amount: 0.15 },
        { name: 'Crni luk', amount: 0.08 },
        { name: 'Suncokretovo ulje', amount: 0.01 },
      ],
    },
  ]

  for (const recipeData of recipes) {
    const { ingredients: recipeIngredients, ...data } = recipeData

    const existing = await prisma.recipe.findFirst({ where: { name: data.name } })
    if (existing) {
      console.log(`  ⏭  Recept "${data.name}" već postoji, preskačem`)
      continue
    }

    await prisma.recipe.create({
      data: {
        ...data,
        ingredients: {
          create: recipeIngredients.map(ri => ({
            amount: ri.amount,
            ingredient: { connect: { name: ri.name } },
          })),
        },
      },
    })
    console.log(`  ✅ Kreiran recept: ${data.name}`)
  }

  console.log(`\n🎉 Seed završen!`)
}

main()
  .catch(e => {
    console.error('❌ Seed greška:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
