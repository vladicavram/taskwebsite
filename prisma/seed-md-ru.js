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

const cityPool = [
  'Chișinău Centru','Chișinău Botanica','Chișinău Râșcani','Chișinău Buiucani','Chișinău Ciocana','Chișinău Telecentru',
  'Chișinău Poșta Veche','Chișinău Sculeanca','Chișinău Durlești','Chișinău Codru','Chișinău Sîngera','Chișinău Cricova',
  'Bălți','Comrat','Soroca','Orhei','Cahul','Ungheni','Edineț','Hîncești','Căușeni','Anenii Noi','Strășeni','Drochia',
  'Florești','Ialoveni','Ștefan Vodă','Cimișlia','Rezina','Briceni','Nisporeni'
]
const roLocations = cityPool
const ruLocations = cityPool

const roQualifiers = ['Standard', 'Rapid', 'Premium', 'Eco', 'Express', 'Urgent', 'Weekend', 'Business', 'Familie', 'Budget', 'Profesional', 'Detaliat', 'Cu materiale', 'Fara materiale']
const ruQualifiers = ['Стандарт', 'Срочно', 'Премиум', 'Эко', 'Экспресс', 'Суперсрочно', 'Выходной', 'Бизнес', 'Семейный', 'Бюджет', 'Профи', 'Детально', 'С материалами', 'Без материалов']

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
  `https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`,
  `https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`,
  `https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`,
  `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85${imgParams}`,
  `https://images.unsplash.com/photo-1519710164239-da123dc03ef4${imgParams}`,
  `https://images.unsplash.com/photo-1484154218962-a197022b5858${imgParams}`,
  `https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`,
  `https://images.unsplash.com/photo-1469474968028-56623f02e42e${imgParams}`,
  `https://images.unsplash.com/photo-1465805139202-a644e217f00e${imgParams}`,
  `https://images.unsplash.com/photo-1452626038306-9aae5e071dd3${imgParams}`
]

const categoryImages = {
  Curatenie: [
    `https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`,
    `https://images.unsplash.com/photo-1582719478248-4a00f3f77fe6${imgParams}`,
    `https://images.unsplash.com/photo-1581579186890-45585b3c38fe${imgParams}`
  ],
  'Reparatii electrice': [
    `https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`,
    `https://images.unsplash.com/photo-1508873699372-7aeab60b44ab${imgParams}`,
    `https://images.unsplash.com/photo-1504384308090-c894fdcc538d${imgParams}`
  ],
  'Instalatii sanitare': [
    `https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`,
    `https://images.unsplash.com/photo-1589578527966-0d484df2769b${imgParams}`,
    `https://images.unsplash.com/photo-1504198453319-5ce911bafcde${imgParams}`
  ],
  'IT si retele': [
    `https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`,
    `https://images.unsplash.com/photo-1520607162513-77705c0f0d4a${imgParams}`,
    `https://images.unsplash.com/photo-1518770660439-4636190af475${imgParams}`
  ],
  'Mutari si transport': [
    `https://images.unsplash.com/photo-1497366754035-f200968a6e72${imgParams}`,
    `https://images.unsplash.com/photo-1542452255191-c85d3a1e0b7b${imgParams}`,
    `https://images.unsplash.com/photo-1529429617124-aee7d6a5c12d${imgParams}`
  ],
  'Pictura si zugraveli': [
    `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85${imgParams}`,
    `https://images.unsplash.com/photo-1501453675342-41c0f7bd0cbb${imgParams}`,
    `https://images.unsplash.com/photo-1473181488821-2d23949a045a${imgParams}`
  ],
  'Montaj mobilier': [
    `https://images.unsplash.com/photo-1505693415763-3ed5e04ba4cd${imgParams}`,
    `https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`,
    `https://images.unsplash.com/photo-1505691723518-36a5ac3be353${imgParams}`
  ],
  Gradinarit: [
    `https://images.unsplash.com/photo-1465805139202-a644e217f00e${imgParams}`,
    `https://images.unsplash.com/photo-1501004318641-b39e6451bec6${imgParams}`,
    `https://images.unsplash.com/photo-1441974231531-c6227db76b6e${imgParams}`
  ],
  Evenimente: [
    `https://images.unsplash.com/photo-1519710164239-da123dc03ef4${imgParams}`,
    `https://images.unsplash.com/photo-1523906834658-6e24ef2386f9${imgParams}`,
    `https://images.unsplash.com/photo-1525182008055-f88b95ff7980${imgParams}`
  ],
  'Lectii si meditatii': [
    `https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`,
    `https://images.unsplash.com/photo-1523580846011-d3a5bc25702b${imgParams}`,
    `https://images.unsplash.com/photo-1524504388940-b1c1722653e1${imgParams}`
  ],
  'Livrari locale': [
    `https://images.unsplash.com/photo-1484154218962-a197022b5858${imgParams}`,
    `https://images.unsplash.com/photo-1542838132-92c53300491e${imgParams}`,
    `https://images.unsplash.com/photo-1601050690597-df62cfe512c9${imgParams}`
  ],
  'Design interior': [
    `https://images.unsplash.com/photo-1452626038306-9aae5e071dd3${imgParams}`,
    `https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e${imgParams}`,
    `https://images.unsplash.com/photo-1493809842364-78817add7ffb${imgParams}`
  ]
}

const titleCategoryMap = {
  'Curatenie generala in apartament': 'Curatenie',
  'Montaj dulap si reglaj usi': 'Montaj mobilier',
  'Vopsire pereti living': 'Pictura si zugraveli',
  'Instalare masina de spalat': 'Instalatii sanitare',
  'Reparatie priza si verificare tablou': 'Reparatii electrice',
  'Transport canapea': 'Mutari si transport',
  'Gradinarit: tuns iarba si gard viu': 'Gradinarit',
  'Curatare dupa renovare': 'Curatenie',
  'Depanare internet si Wi-Fi': 'IT si retele',
  'Asamblare pat si noptiere': 'Montaj mobilier',
  'Mutare birou mic': 'Mutari si transport',
  'Lectii de romana pentru copil': 'Lectii si meditatii',
  'Eveniment: fotograf la botez': 'Evenimente',
  'Schimbat baterie chiuveta si etansare': 'Instalatii sanitare',
  'Montaj corpuri de iluminat': 'Reparatii electrice',
  'Curatare canapele si covoare': 'Curatenie',
  'Corectie gresie desprinsa in baie': 'Instalatii sanitare',
  'Instalare sistem video interfon': 'Reparatii electrice',
  'Livrare cumparaturi senior': 'Livrari locale',
  'Reparat usa de interior care agata': 'Montaj mobilier',
  'Генеральная уборка квартиры': 'Curatenie',
  'Сборка шкафа и регулировка дверей': 'Montaj mobilier',
  'Покраска стен в гостиной': 'Pictura si zugraveli',
  'Подключение стиральной машины': 'Instalatii sanitare',
  'Ремонт розетки и проверка щитка': 'Reparatii electrice',
  'Перевозка дивана': 'Mutari si transport',
  'Садовые работы: газон и изгородь': 'Gradinarit',
  'Уборка после ремонта': 'Curatenie',
  'Настройка интернета и Wi-Fi': 'IT si retele',
  'Сборка кровати и тумбочек': 'Montaj mobilier',
  'Офисный переезд': 'Mutari si transport',
  'Уроки румынского для школьника': 'Lectii si meditatii',
  'Фотограф на семейное событие': 'Evenimente',
  'Замена смесителя и герметизация': 'Instalatii sanitare',
  'Монтаж светильников': 'Reparatii electrice',
  'Химчистка дивана и ковров': 'Curatenie',
  'Исправить отклеившуюся плитку в ванной': 'Instalatii sanitare',
  'Монтаж домофона на 3 квартиры': 'Reparatii electrice',
  'Доставка покупок пожилому человеку': 'Livrari locale',
  'Починить межкомнатную дверь': 'Montaj mobilier'
}

const titleImages = {
  'Curatenie generala in apartament': [`https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`],
  'Генеральная уборка квартиры': [`https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`],
  'Montaj dulap si reglaj usi': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Сборка шкафа и регулировка дверей': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Vopsire pereti living': [`https://images.unsplash.com/photo-1505693416388-ac5ce068fe85${imgParams}`],
  'Покраска стен в гостиной': [`https://images.unsplash.com/photo-1505693416388-ac5ce068fe85${imgParams}`],
  'Instalare masina de spalat': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Подключение стиральной машины': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Reparatie priza si verificare tablou': [`https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`],
  'Ремонт розетки и проверка щитка': [`https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`],
  'Transport canapea': [`https://images.unsplash.com/photo-1497366754035-f200968a6e72${imgParams}`],
  'Перевозка дивана': [`https://images.unsplash.com/photo-1497366754035-f200968a6e72${imgParams}`],
  'Gradinarit: tuns iarba si gard viu': [`https://images.unsplash.com/photo-1465805139202-a644e217f00e${imgParams}`],
  'Садовые работы: газон и изгородь': [`https://images.unsplash.com/photo-1465805139202-a644e217f00e${imgParams}`],
  'Curatare dupa renovare': [`https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`],
  'Уборка после ремонта': [`https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`],
  'Depanare internet si Wi-Fi': [`https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`],
  'Настройка интернета и Wi-Fi': [`https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`],
  'Asamblare pat si noptiere': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Сборка кровати и тумбочек': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Mutare birou mic': [`https://images.unsplash.com/photo-1497366754035-f200968a6e72${imgParams}`],
  'Офисный переезд': [`https://images.unsplash.com/photo-1497366754035-f200968a6e72${imgParams}`],
  'Lectii de romana pentru copil': [`https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`],
  'Уроки румынского для школьника': [`https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`],
  'Eveniment: fotograf la botez': [`https://images.unsplash.com/photo-1519710164239-da123dc03ef4${imgParams}`],
  'Фотограф на семейное событие': [`https://images.unsplash.com/photo-1519710164239-da123dc03ef4${imgParams}`],
  'Schimbat baterie chiuveta si etansare': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Замена смесителя и герметизация': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Montaj corpuri de iluminat': [`https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`],
  'Монтаж светильников': [`https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`],
  'Curatare canapele si covoare': [`https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`],
  'Химчистка дивана и ковров': [`https://images.unsplash.com/photo-1481277542470-605612bd2d61${imgParams}`],
  'Corectie gresie desprinsa in baie': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Исправить отклеившуюся плитку в ванной': [`https://images.unsplash.com/photo-1505691938895-1758d7feb511${imgParams}`],
  'Instalare sistem video interfon': [`https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`],
  'Монтаж домофона на 3 квартиры': [`https://images.unsplash.com/photo-1519389950473-47ba0277781c${imgParams}`],
  'Livrare cumparaturi senior': [`https://images.unsplash.com/photo-1484154218962-a197022b5858${imgParams}`],
  'Доставка покупок пожилому человеку': [`https://images.unsplash.com/photo-1484154218962-a197022b5858${imgParams}`],
  'Reparat usa de interior care agata': [`https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`],
  'Починить межкомнатную дверь': [`https://images.unsplash.com/photo-1503389152951-9f343605f61e${imgParams}`]
}

const usedTitles = new Set()

const categoryQueries = {
  Curatenie: 'apartment cleaning',
  'Reparatii electrice': 'electrician wiring',
  'Instalatii sanitare': 'plumber faucet install',
  'IT si retele': 'wifi technician setup',
  'Mutari si transport': 'moving boxes van',
  'Pictura si zugraveli': 'interior wall painting',
  'Montaj mobilier': 'furniture assembly home',
  Gradinarit: 'garden hedge trimming',
  Evenimente: 'event photographer',
  'Lectii si meditatii': 'private tutoring at home',
  'Livrari locale': 'grocery delivery bags',
  'Design interior': 'modern apartment interior'
}

const titleQueries = {
  'Curatenie generala in apartament': 'deep cleaning apartment',
  'Генеральная уборка квартиры': 'deep cleaning apartment',
  'Montaj dulap si reglaj usi': 'wardrobe assembly tools',
  'Сборка шкафа и регулировка дверей': 'wardrobe assembly tools',
  'Vopsire pereti living': 'painting living room walls',
  'Покраска стен в гостиной': 'painting living room walls',
  'Instalare masina de spalat': 'washing machine installation',
  'Подключение стиральной машины': 'washing machine installation',
  'Reparatie priza si verificare tablou': 'electrician repairing outlet',
  'Ремонт розетки и проверка щитка': 'electrician repairing outlet',
  'Transport canapea': 'sofa moving service',
  'Перевозка дивана': 'sofa moving service',
  'Gradinarit: tuns iarba si gard viu': 'gardening hedge trim',
  'Садовые работы: газон и изгородь': 'gardening hedge trim',
  'Curatare dupa renovare': 'post renovation cleaning',
  'Уборка после ремонта': 'post renovation cleaning',
  'Depanare internet si Wi-Fi': 'technician fixing wifi',
  'Настройка интернета и Wi-Fi': 'technician fixing wifi',
  'Asamblare pat si noptiere': 'assembling bed furniture',
  'Сборка кровати и тумбочек': 'assembling bed furniture',
  'Mutare birou mic': 'office moving boxes',
  'Офисный переезд': 'office moving boxes',
  'Lectii de romana pentru copil': 'romanian tutor student',
  'Уроки румынского для школьника': 'romanian tutor student',
  'Eveniment: fotograf la botez': 'event photographer baptism',
  'Фотограф на семейное событие': 'event photographer family',
  'Schimbat baterie chiuveta si etansare': 'plumber replacing faucet',
  'Замена смесителя и герметизация': 'plumber replacing faucet',
  'Montaj corpuri de iluminat': 'installing ceiling lights',
  'Монтаж светильников': 'installing ceiling lights',
  'Curatare canapele si covoare': 'sofa carpet cleaning',
  'Химчистка дивана и ковров': 'sofa carpet cleaning',
  'Corectie gresie desprinsa in baie': 'bathroom tile repair',
  'Исправить отклеившуюся плитку в ванной': 'bathroom tile repair',
  'Instalare sistem video interfon': 'intercom installation',
  'Монтаж домофона на 3 квартиры': 'intercom installation',
  'Livrare cumparaturi senior': 'grocery delivery senior',
  'Доставка покупок пожилому человеку': 'grocery delivery senior',
  'Reparat usa de interior care agata': 'interior door repair',
  'Починить межкомнатную дверь': 'interior door repair'
}

function buildImageUrl(baseTitle, categoryName, seed) {
  const query = titleQueries[baseTitle]
    || (categoryName && categoryQueries[categoryName])
    || categoryName
    || 'local handyman service'
  const keyword = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ',')
    .replace(/,+/g, ',')
    .replace(/^,|,$/g, '') || 'service'
  return `https://loremflickr.com/1200/800/${keyword}?lock=${seed}`
}

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
  const areaPool = lang === 'ro' ? roLocations : ruLocations
  const qualifierPool = lang === 'ro' ? roQualifiers : ruQualifiers
  const baseTitle = template.title
  const locationIndex = Math.floor(i / qualifierPool.length)
  let area = pick(areaPool, locationIndex)
  let qualifierIndex = i
  let qualifier = pick(qualifierPool, qualifierIndex)
  let title = `${baseTitle} - ${qualifier} (${area})`

  while (usedTitles.has(title)) {
    qualifierIndex += 1
    qualifier = pick(qualifierPool, qualifierIndex)
    area = pick(areaPool, locationIndex + qualifierIndex)
    title = `${baseTitle} - ${qualifier} (${area})`
  }

  usedTitles.add(title)

  const description = template.description.replace('%area%', area)
  const categoryName = titleCategoryMap[baseTitle] || category?.name || null
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
  const imageUrl = null
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
