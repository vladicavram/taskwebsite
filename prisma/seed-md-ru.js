const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const password = bcrypt.hashSync('parola123', 10)

const categories = [
  'Curatenie',
  'Reparatii electrice',
  'Instalatii sanitare',
  'IT si retele',
  'Mutari si transport',
  'Pictura si zugraveli',
  'Montaj mobilier',
  'Gradinarit',
  'Evenimente',
  'Lectii si meditatii',
  'Livrari locale',
  'Design interior'
]

const roFirst = ['Ion', 'Ana', 'Mihai', 'Elena', 'Vasile', 'Andrei', 'Maria', 'Petru', 'Cristina', 'Daniel', 'Sorina', 'Radu', 'Irina', 'Nicolae', 'Lavinia', 'Iulia', 'Victor', 'Nicoleta', 'Ovidiu', 'Simona', 'Sergiu', 'Tatiana', 'Alexandru', 'Camelia', 'Florin', 'Gabriela', 'Ciprian', 'Doina', 'Ionut', 'Loredana']
const roLast = ['Popescu', 'Rusu', 'Ceban', 'Turcanu', 'Lungu', 'Dumitru', 'Balan', 'Rosca', 'Miron', 'Stoica', 'Vicol', 'Bordei', 'Cazacu', 'Ivanov', 'Neagu', 'Pavel', 'Baciu', 'Mocanu', 'Pruteanu', 'Nistor', 'Munteanu', 'Burlacu', 'Zamfir', 'Moraru', 'Onofrei', 'Scripcaru', 'Tudor', 'Cojocaru', 'Stanciu', 'Andries']
const roBios = [
  'Disponibil pentru proiecte locale, serios si punctual.',
  'Lucrez curat, comunic des si respect termenele.',
  'Aduc scule proprii, ofer garantie pe manopera.',
  'Imi place sa las locul impecabil si clientul multumit.',
  'Program flexibil, raspund rapid si vin pregatit.'
]
const roSkills = [
  'curatenie, mici reparatii, livrari',
  'montaj mobilier, electrice usoare, zugraveli',
  'IT si retele de baza, configurari',
  'instalatii sanitare usoare, siliconari, etansari',
  'transport local, manipulare, ambalare'
]

const ruFirst = ['Ivan', 'Olga', 'Dmitri', 'Svetlana', 'Sergei', 'Natalia', 'Alexei', 'Ekaterina', 'Nikolai', 'Maria', 'Andrey', 'Tatiana', 'Pavel', 'Irina', 'Viktor', 'Galina', 'Maksim', 'Anastasia', 'Oleg', 'Yulia', 'Vladimir', 'Daria', 'Roman', 'Elena', 'Artem', 'Ksenia', 'Leonid', 'Polina', 'Kirill', 'Alina']
const ruLast = ['Ivanov', 'Petrova', 'Sidorov', 'Smirnova', 'Kuznetsov', 'Popova', 'Volkov', 'Fedorova', 'Morozov', 'Semenova', 'Orlov', 'Vinogradova', 'Lebedev', 'Sorokina', 'Egorov', 'Makarova', 'Nikiforov', 'Alekseeva', 'Baranov', 'Zaitseva', 'Komarov', 'Belova', 'Pavlov', 'Vlasova', 'Antonov', 'Grigorieva', 'Stepanov', 'Zvereva', 'Bogdanov', 'Vorobieva']
const ruBios = [
  'Работаю аккуратно, соблюдаю сроки и чистоту.',
  'Всегда на связи, уточняю детали и даю честные сроки.',
  'Привожу свой инструмент, объясняю что делаю.',
  'Люблю, когда клиент доволен результатом и порядком.',
  'Гибкий график, прихожу вовремя и без задержек.'
]
const ruSkills = [
  'уборка, мелкий ремонт, доставки',
  'сборка мебели, легкая электрика, покраска',
  'настройка интернета, wi-fi, мелкие IT задачи',
  'сантехника базовая, герметизация, замены',
  'переезды, упаковка, помощь с грузом'
]

const roLocations = ['Chisinau', 'Balti', 'Comrat', 'Soroca']
const ruLocations = ['Chisinau', 'Balti', 'Comrat', 'Soroca']

const roTaskTemplates = [
  {
    title: 'Curatenie generala in apartament',
    description: 'Curatenie amanuntita cu aspirat, spalat geamuri si dezinfectat bucatarie/baie. Prefer produse eco in %area%.'
  },
  {
    title: 'Montaj dulap si reglaj usi',
    description: 'Am nevoie de montaj corect pentru un dulap IKEA si reglaj la usile existente in %area%. Va rog sa aduceti scule.'
  },
  {
    title: 'Vopsire pereti living',
    description: 'Se cere pregatire perete, chituire usoara si aplicare doua straturi de lavabila premium, fara miros puternic, zona %area%.'
  },
  {
    title: 'Instalare masina de spalat',
    description: 'Conectare la apa si scurgere, verificare furtun si etansare pentru a evita scurgerile in %area%.'
  },
  {
    title: 'Reparatie priza si verificare tablou',
    description: 'O priza face scantei, diagnostic si inlocuire siguranta daca e cazul, siguranta si testare finale in %area%.'
  },
  {
    title: 'Transport canapea',
    description: 'Canapea extensibila, parter la parter, nevoie de doua persoane si duba. Ridicare din %area%, protectie la colturi.'
  },
  {
    title: 'Gradinarit: tuns iarba si gard viu',
    description: 'Curatare curte 200 mp, tuns iarba si corectat gard viu in %area%. Eliminare resturi la final.'
  },
  {
    title: 'Curatare dupa renovare',
    description: 'Curatare praf fin, spalare geamuri si dezinfectare suprafete in %area%. Sculele pot fi aduse de echipa.'
  },
  {
    title: 'Depanare internet si Wi-Fi',
    description: 'Router pierde conexiune. Verificare cabluri, schimbare canal Wi-Fi si optimizare acoperire in %area%.'
  },
  {
    title: 'Asamblare pat si noptiere',
    description: 'Pat matrimonial cu sertare, doua noptiere. Va rog experienta cu mobilier modular. Zona %area%.'
  },
  {
    title: 'Mutare birou mic',
    description: '2 birouri, 4 scaune si cutii. Etaj 2 la etaj 1, acces lift. Caut transport organizat in %area%.'
  },
  {
    title: 'Lectii de romana pentru copil',
    description: 'Copil clasa a 5-a, focus pe vocabular si dictare. Sedinte de 90 minute, o data pe saptamana in %area%.'
  },
  {
    title: 'Eveniment: fotograf la botez',
    description: 'Caut fotograf pentru 4 ore, livrare poze editate. Experienta cu evenimente de familie in %area%.'
  },
  {
    title: 'Schimbat baterie chiuveta si etansare',
    description: 'Baterie noua deja cumparata. Demontare, montare si verificare scurgeri in %area%.'
  },
  {
    title: 'Montaj corpuri de iluminat',
    description: '3 lustre si 2 aplice, plafon beton. Siguranta la conexiuni si testare la final in %area%.'
  },
  {
    title: 'Curatare canapele si covoare',
    description: 'Curatare cu injectie-extractie, solutii hipoalergenice. Living 20mp, canapea 3 locuri, in %area%.'
  },
  {
    title: 'Corectie gresie desprinsa in baie',
    description: 'Reaplicare adeziv si chit pentru 6 placi. Asigurare planeitate si culoare potrivita chitului in %area%.'
  },
  {
    title: 'Instalare sistem video interfon',
    description: 'Bloc cu 3 apartamente, cablare existenta. Montaj panou si monitoare, testare comunicare in %area%.'
  },
  {
    title: 'Livrare cumparaturi senior',
    description: 'Lista pregatita, nevoie de livrare la usa si plata cash in %area%. Respectarea produselor de pe lista.'
  },
  {
    title: 'Reparat usa de interior care agata',
    description: 'Probabil ajustare balamale si slefuire usoara. Sa nu ramana zgarieturi; locatie %area%.'
  }
]

const ruTaskTemplates = [
  {
    title: 'Генеральная уборка квартиры',
    description: 'Полная уборка с мытьем окон, кухни и санузла. Желательно использовать экологичные средства в районе %area%.'
  },
  {
    title: 'Сборка шкафа и регулировка дверей',
    description: 'Нужно аккуратно собрать шкаф IKEA и отрегулировать двери в %area%. Инструменты возьмите с собой.'
  },
  {
    title: 'Покраска стен в гостиной',
    description: 'Подготовка стены, легкая шпаклевка и два слоя краски без резкого запаха. Локация %area%.'
  },
  {
    title: 'Подключение стиральной машины',
    description: 'Подключить воду и слив, проверить шланги и герметичность, сделать пробный запуск в %area%.'
  },
  {
    title: 'Ремонт розетки и проверка щитка',
    description: 'Одна розетка искрит, нужен осмотр, замена и тестирование автомата. %area%, безопасность в приоритете.'
  },
  {
    title: 'Перевозка дивана',
    description: 'Диван-кровать, нужен фургон и 2 грузчика. Забор из %area%, желательны ремни и защита углов.'
  },
  {
    title: 'Садовые работы: газон и изгородь',
    description: 'Участок 200 м², убрать мусор, постричь газон и подровнять изгородь в %area%. Вывоз веток включить.'
  },
  {
    title: 'Уборка после ремонта',
    description: 'Убрать строительную пыль, вымыть окна и продезинфицировать поверхности в %area%. Желателен промышленный пылесос.'
  },
  {
    title: 'Настройка интернета и Wi-Fi',
    description: 'Роутер теряет связь. Проверить кабель, сменить канал Wi-Fi, оптимизировать покрытие в %area%.'
  },
  {
    title: 'Сборка кровати и тумбочек',
    description: 'Кровать с ящиками и две тумбочки. Нужен опыт с модульной мебелью. Локация %area%.'
  },
  {
    title: 'Офисный переезд',
    description: '2 стола, 4 стула и коробки. С 2 этажа на 1, есть лифт. Нужна аккуратная перевозка в %area%.'
  },
  {
    title: 'Уроки румынского для школьника',
    description: '5 класс, акцент на словарный запас и диктовку. Занятия 90 минут раз в неделю в %area%.'
  },
  {
    title: 'Фотограф на семейное событие',
    description: 'Нужен фотограф на 4 часа, передача обработанных фото. Опыт съемки крестин/юбилеев. Район %area%.'
  },
  {
    title: 'Замена смесителя и герметизация',
    description: 'Новый смеситель есть. Снять старый, установить новый, проверить на протечки в %area%.'
  },
  {
    title: 'Монтаж светильников',
    description: '3 люстры и 2 бра, потолок бетон. Нужна надежная изоляция и проверка. Адрес %area%.'
  },
  {
    title: 'Химчистка дивана и ковров',
    description: 'Инжекционно-экстракционная чистка, гипоаллергенные средства. Диван на 3 места, ковер 20 м², %area%.'
  },
  {
    title: 'Исправить отклеившуюся плитку в ванной',
    description: 'Переклеить 6 плиток, заново затереть швы в подходящем цвете. Ровная поверхность обязательна. Район %area%.'
  },
  {
    title: 'Монтаж домофона на 3 квартиры',
    description: 'Кабель уже проложен. Установить панель и мониторы, проверить связь в %area%.'
  },
  {
    title: 'Доставка покупок пожилому человеку',
    description: 'Список готов, нужно купить и доставить до двери, расчёт наличными. Соблюдать список точно. %area%.'
  },
  {
    title: 'Починить межкомнатную дверь',
    description: 'Подрегулировать петли и слегка подшлифовать, без видимых царапин. Локация %area%.'
  }
]

const imgParams = '?auto=format&fit=crop&w=1200&q=80&sat=-5'
const taskImages = [
  `https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8${imgParams}`,
  `https://images.unsplash.com/photo-1581579188845-1b9d1c2d7c16${imgParams}`,
  `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85${imgParams}`,
  `https://images.unsplash.com/photo-1505693416388-904bf23c92ad${imgParams}`,
  `https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`,
  `https://images.unsplash.com/photo-1505692069463-5e3405e7a5dc${imgParams}`,
  `https://images.unsplash.com/photo-1505691938895-1758d7feb599${imgParams}`,
  `https://images.unsplash.com/photo-1519710164239-da123dc03ef4${imgParams}`,
  `https://images.unsplash.com/photo-1484154218962-a197022b5858${imgParams}`,
  `https://images.unsplash.com/photo-1505691938895-1758d7feb522${imgParams}`
]

function pick(arr, i) {
  return arr[i % arr.length]
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeUsers() {
  const users = []
  for (let i = 0; i < 100; i++) {
    const useRo = i % 2 === 0
    const first = useRo ? pick(roFirst, i) : pick(ruFirst, i)
    const last = useRo ? pick(roLast, i) : pick(ruLast, i)
    const name = `${first} ${last}`
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${String(i).padStart(2, '0')}@example.com`
    const username = `${first.toLowerCase()}_${last.toLowerCase()}_${i}`
    const phone = `+373 6${String(1000000 + i * 3).slice(0, 6)}`
    const location = useRo ? pick(roLocations, i) : pick(ruLocations, i)
    const bio = useRo ? pick(roBios, i) : pick(ruBios, i)
    const skills = useRo ? pick(roSkills, i) : pick(ruSkills, i)

    users.push({
      email,
      username,
      name,
      password,
      phone,
      image: null,
      canApply: true,
      role: 'user',
      profile: {
        create: {
          bio,
          location,
          skills,
          verified: i % 5 === 0
        }
      }
    })
  }
  return users
}

function buildTask(lang, i, creatorId, category) {
  const template = lang === 'ro' ? pick(roTaskTemplates, i) : pick(ruTaskTemplates, i)
  const area = lang === 'ro' ? pick(roLocations, i + 3) : pick(ruLocations, i + 3)
  const title = template.title
  const description = template.description.replace('%area%', area)
  const categoryName = category?.name || null
  const priceBands = {
    Curatenie: [250, 450],
    'Reparatii electrice': [400, 800],
    'Instalatii sanitare': [350, 750],
    'IT si retele': [250, 600],
    'Mutari si transport': [500, 1000],
    'Pictura si zugraveli': [500, 900],
    'Montaj mobilier': [300, 650],
    Gradinarit: [250, 550],
    Evenimente: [500, 950],
    'Lectii si meditatii': [250, 450],
    'Livrari locale': [180, 350],
    'Design interior': [650, 1000]
  }
  const [min, max] = priceBands[categoryName] || [250, 650]
  const rawPrice = randBetween(min, max)
  const price = Math.round(rawPrice / 10) * 10
  const imageUrl = i % 5 === 0 ? pick(taskImages, i) : null
  return {
    title,
    description,
    price,
    location: area,
    creatorId,
    categoryId: category.id,
    imageUrl
  }
}

async function main() {
  console.log('Seeding categories...')
  const categoryRecords = await Promise.all(
    categories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name }
      })
    )
  )

  console.log('Fetching existing admins to preserve...')
  const adminUsers = await prisma.user.findMany({ where: { isAdmin: true }, select: { id: true, email: true } })
  const adminIds = adminUsers.map((a) => a.id)

  console.log('Seeding 100 users...')
  const usersData = makeUsers()

  // Clear dependent data first (safe order), but keep admins intact
  await prisma.notification.deleteMany({})
  await prisma.message.deleteMany({})
  await prisma.application.deleteMany({})
  await prisma.review.deleteMany({})
  await prisma.creditTransaction.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.profile.deleteMany({ where: { NOT: { userId: { in: adminIds } } } })
  await prisma.user.deleteMany({ where: { isAdmin: false } })

  const createdUsers = []
  for (const user of usersData) {
    const created = await prisma.user.create({
      data: user,
      include: { profile: true }
    })
    createdUsers.push(created)
  }

  console.log('Seeding 200 tasks...')
  const tasks = []
  for (let i = 0; i < 200; i++) {
    const creator = pick(createdUsers, i)
    const lang = i % 2 === 0 ? 'ro' : 'ru'
    const category = pick(categoryRecords, i)
    tasks.push(buildTask(lang, i, creator.id, category))
  }

  for (const t of tasks) {
    await prisma.task.create({ data: t })
  }

  console.log('✓ Done: 100 users, 200 tasks (20% with photos), prices 100-1000 MDL')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
