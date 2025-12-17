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

const ruFirst = ['Ivan', 'Olga', 'Dmitri', 'Svetlana', 'Sergei', 'Natalia', 'Alexei', 'Ekaterina', 'Nikolai', 'Maria', 'Andrey', 'Tatiana', 'Pavel', 'Irina', 'Viktor', 'Galina', 'Maksim', 'Anastasia', 'Oleg', 'Yulia', 'Vladimir', 'Daria', 'Roman', 'Elena', 'Artem', 'Ksenia', 'Leonid', 'Polina', 'Kirill', 'Alina']
const ruLast = ['Ivanov', 'Petrova', 'Sidorov', 'Smirnova', 'Kuznetsov', 'Popova', 'Volkov', 'Fedorova', 'Morozov', 'Semenova', 'Orlov', 'Vinogradova', 'Lebedev', 'Sorokina', 'Egorov', 'Makarova', 'Nikiforov', 'Alekseeva', 'Baranov', 'Zaitseva', 'Komarov', 'Belova', 'Pavlov', 'Vlasova', 'Antonov', 'Grigorieva', 'Stepanov', 'Zvereva', 'Bogdanov', 'Vorobieva']

const roLocations = ['Chisinau', 'Balti', 'Cahul', 'Orhei', 'Soroca', 'Ungheni', 'Edinet', 'Hincesti', 'Comrat', 'Ialoveni', 'Causeni', 'Drochia']
const ruLocations = ['Кишинев', 'Бельцы', 'Кагул', 'Орхей', 'Сороки', 'Унгены', 'Единцы', 'Хынчешты', 'Комрат', 'Яловены', 'Каушаны', 'Дрокия']

const roTaskTemplates = [
  {
    title: 'Curatenie generala in apartament din %area%',
    description: 'Curatenie amanuntita cu aspirat, spalat geamuri si dezinfectat bucatarie/baie. Prefer produse eco.'
  },
  {
    title: 'Montaj dulap si reglaj usi in %area%',
    description: 'Am nevoie de montaj corect pentru un dulap IKEA si reglaj la usile existente. Va rog sa aduceti scule.'
  },
  {
    title: 'Vopsire pereti living in %area%',
    description: 'Se cere pregatire perete, chituire usoara si aplicare doua straturi de lavabila premium, fara miros puternic.'
  },
  {
    title: 'Instalare masina de spalat in %area%',
    description: 'Conectare la apa si scurgere, verificare furtun si etansare pentru a evita scurgerile.'
  },
  {
    title: 'Reparatie priza si verificare tablou in %area%',
    description: 'O priza face scantei, doresc diagnostic si inlocuire siguranta daca e cazul. Siguranta si testare finale.'
  },
  {
    title: 'Transport canapea de la %area% la centru',
    description: 'Canapea extensibila, parter la parter, nevoie de doua persoane si duba. Protectie la colturi.'
  },
  {
    title: 'Gradinarit: tuns iarba si gard viu in %area%',
    description: 'Curatare curte 200 mp, tuns iarba si corectat gard viu. Eliminare resturi la final.'
  },
  {
    title: 'Curatare dupa renovare in %area%',
    description: 'Curatare praf fin, spalare geamuri si dezinfectare suprafete. Sculele pot fi aduse de echipa.'
  },
  {
    title: 'Depanare internet si Wi-Fi in %area%',
    description: 'Router pierde conexiune. Necesita verificare cabluri, schimbare canal Wi-Fi si optimizare acoperire.'
  },
  {
    title: 'Asamblare pat si noptiere in %area%',
    description: 'Pat matrimonial cu sertare, doua noptiere. Va rog experienta cu mobilier modular.'
  },
  {
    title: 'Mutare birou mic in %area%',
    description: '2 birouri, 4 scaune si cutii. Etaj 2 la etaj 1, acces lift. Caut transport organizat.'
  },
  {
    title: 'Lectii de romana pentru copil in %area%',
    description: 'Copil clasa a 5-a, focus pe vocabular si dictare. Sedinte de 90 minute, o data pe saptamana.'
  },
  {
    title: 'Eveniment: fotograf la botez in %area%',
    description: 'Caut fotograf pentru 4 ore, livrare poze editate. Experienta cu evenimente de familie.'
  },
  {
    title: 'Schimbat baterie chiuveta si etansare in %area%',
    description: 'Baterie noua deja cumparata. Demontare, montare si verificare scurgeri.'
  },
  {
    title: 'Montaj corpuri de iluminat in %area%',
    description: '3 lustre si 2 aplice, plafon beton. Siguranta la conexiuni si testare la final.'
  },
  {
    title: 'Curatare canapele si covoare in %area%',
    description: 'Curatare cu injectie-extractie, solutii hipoalergenice. Living 20mp, canapea 3 locuri.'
  },
  {
    title: 'Corectie gresie desprinsa in baie la %area%',
    description: 'Reaplicare adeziv si chit pentru 6 placi. Asigurare planeitate si culoare potrivita chitului.'
  },
  {
    title: 'Instalare sistem video interfon in %area%',
    description: 'Bloc cu 3 apartamente, cablare existenta. Montaj panou si monitoare, testare comunicare.'
  },
  {
    title: 'Livrare cumparaturi senior in %area%',
    description: 'Lista pregatita, nevoie de livrare la usa si plata cash. Respectarea produselor de pe lista.'
  },
  {
    title: 'Reparat usa de interior care agata in %area%',
    description: 'Probabil ajustare balamale si slefuire usoara. Sa nu ramana zgarieturi.'
  }
]

const ruTaskTemplates = [
  {
    title: 'Генеральная уборка квартиры в районе %area%',
    description: 'Полная уборка с мытьем окон, кухни и санузла. Желательно использовать экологичные средства.'
  },
  {
    title: 'Сборка шкафа и регулировка дверей в %area%',
    description: 'Нужно аккуратно собрать шкаф IKEA и отрегулировать двери. Инструменты возьмите с собой.'
  },
  {
    title: 'Покраска стен в гостиной, %area%',
    description: 'Подготовка стены, легкая шпаклевка и два слоя краски без резкого запаха. Нужен аккуратный мастер.'
  },
  {
    title: 'Подключение стиральной машины в %area%',
    description: 'Подключить воду и слив, проверить шланги и герметичность, сделать пробный запуск.'
  },
  {
    title: 'Ремонт розетки и проверка щитка в %area%',
    description: 'Одна розетка искрит, нужен осмотр, замена и тестирование автомата. Безопасность в приоритете.'
  },
  {
    title: 'Перевозка дивана из %area% в центр',
    description: 'Диван-кровать, нужен фургон и 2 грузчика. Желательны ремни и защита углов.'
  },
  {
    title: 'Садовые работы: стрижка газона и живой изгороди в %area%',
    description: 'Участок 200 м², убрать мусор, постричь газон и подровнять изгородь. Вывоз веток включить.'
  },
  {
    title: 'Уборка после ремонта в %area%',
    description: 'Убрать строительную пыль, вымыть окна и продезинфицировать поверхности. Желателен промышленный пылесос.'
  },
  {
    title: 'Настройка интернета и Wi-Fi в %area%',
    description: 'Роутер теряет связь. Проверить кабель, сменить канал Wi-Fi, оптимизировать покрытие.'
  },
  {
    title: 'Сборка кровати и тумбочек в %area%',
    description: 'Кровать с ящиками и две тумбочки. Нужен опыт с модульной мебелью.'
  },
  {
    title: 'Офисный переезд в %area%',
    description: '2 стола, 4 стула и коробки. С 2 этажа на 1, есть лифт. Нужна аккуратная перевозка.'
  },
  {
    title: 'Уроки румынского для школьника в %area%',
    description: '5 класс, акцент на словарный запас и диктовку. Занятия 90 минут раз в неделю.'
  },
  {
    title: 'Фотограф на семейное событие в %area%',
    description: 'Нужен фотограф на 4 часа, передача обработанных фото. Опыт съемки крестин/юбилеев.'
  },
  {
    title: 'Замена смесителя и герметизация в %area%',
    description: 'Новый смеситель есть. Снять старый, установить новый, проверить на протечки.'
  },
  {
    title: 'Монтаж светильников в %area%',
    description: '3 люстры и 2 бра, потолок бетон. Нужна надежная изоляция и проверка.'
  },
  {
    title: 'Химчистка дивана и ковров в %area%',
    description: 'Инжекционно-экстракционная чистка, гипоаллергенные средства. Диван на 3 места, ковер 20 м².'
  },
  {
    title: 'Исправить отклеившуюся плитку в ванной, %area%',
    description: 'Переклеить 6 плиток, заново затереть швы в подходящем цвете. Ровная поверхность обязательна.'
  },
  {
    title: 'Монтаж домофона на 3 квартиры в %area%',
    description: 'Кабель уже проложен. Установить панель и мониторы, проверить связь.'
  },
  {
    title: 'Доставка покупок пожилому человеку в %area%',
    description: 'Список готов, нужно купить и доставить до двери, расчёт наличными. Соблюдать список точно.'
  },
  {
    title: 'Починить межкомнатную дверь, задевает пол в %area%',
    description: 'Подрегулировать петли и слегка подшлифовать, без видимых царапин после работы.'
  }
]

const taskImages = [
  'https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8',
  'https://images.unsplash.com/photo-1581579188845-1b9d1c2d7c16',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
  'https://images.unsplash.com/photo-1505693416388-904bf23c92ad',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
  'https://images.unsplash.com/photo-1505692069463-5e3405e7a5dc',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb599',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb522'
]

function pick(arr, i) {
  return arr[i % arr.length]
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
    const bio = useRo
      ? 'Disponibil pentru proiecte locale, serios si punctual.'
      : 'Готов к локальным проектам, пунктуален и аккуратен.'
    const skills = useRo
      ? 'curatenie, mici reparatii, livrari'
      : 'уборка, мелкий ремонт, доставки'

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

function buildTask(lang, i, creatorId, categoryId) {
  const template = lang === 'ro' ? pick(roTaskTemplates, i) : pick(ruTaskTemplates, i)
  const area = lang === 'ro' ? pick(roLocations, i + 3) : pick(ruLocations, i + 3)
  const title = template.title.replace('%area%', area)
  const description = template.description.replace('%area%', area)
  const price = 100 + Math.floor(Math.random() * 901)
  const imageUrl = i % 5 === 0 ? pick(taskImages, i) : null
  return {
    title,
    description,
    price,
    location: area,
    creatorId,
    categoryId,
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
    tasks.push(buildTask(lang, i, creator.id, category.id))
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
