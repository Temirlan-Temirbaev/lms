require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Test = require('./models/Test');
const PlacementTest = require('./models/PlacementTest');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample data
const courses = [
  {
    level: 'A1',
    title: 'Beginner Level - A1',
    description: 'Basic language skills for absolute beginners.',
  },
  {
    level: 'A2',
    title: 'Elementary Level - A2',
    description: 'Elementary language skills for basic communication.',
  },
  {
    level: 'B1',
    title: 'Intermediate Level - B1',
    description: 'Intermediate language skills for everyday situations.',
  },
  {
    level: 'B2',
    title: 'Upper Intermediate Level - B2',
    description: 'Advanced language skills for complex situations.',
  },
];

const lessons = [
  // A1 Lessons
  {
    title: 'Introduction to Basics',
    content: `# Introduction to Basics
    
## Greetings and Introductions

Hello! Welcome to your first language lesson. In this lesson, we will learn basic greetings and introductions.

### Common Greetings

- Hello = Hola
- Good morning = Buenos días
- Good afternoon = Buenas tardes
- Good evening = Buenas noches
- How are you? = ¿Cómo estás?
- I'm fine, thank you = Estoy bien, gracias
- What's your name? = ¿Cómo te llamas?
- My name is... = Me llamo...
- Nice to meet you = Encantado/a de conocerte

### Practice

Try introducing yourself using the phrases above. Remember to practice pronunciation!
    `,
    order: 1,
  },
  {
    title: 'Numbers and Counting',
    content: `# Numbers and Counting
    
## Basic Numbers 1-20

In this lesson, we will learn how to count from 1 to 20.

### Numbers 1-10

1. Uno
2. Dos
3. Tres
4. Cuatro
5. Cinco
6. Seis
7. Siete
8. Ocho
9. Nueve
10. Diez

### Numbers 11-20

11. Once
12. Doce
13. Trece
14. Catorce
15. Quince
16. Dieciséis
17. Diecisiete
18. Dieciocho
19. Diecinueve
20. Veinte

### Practice

Try counting from 1 to 20. Use these numbers to describe quantities of objects around you.
    `,
    order: 2,
  },
  // A2 Lessons
  {
    title: 'Daily Routines',
    content: `# Daily Routines
    
## Talking About Your Day

In this lesson, we will learn vocabulary and phrases related to daily routines.

### Common Daily Activities

- I wake up at... = Me despierto a las...
- I have breakfast = Desayuno
- I go to work/school = Voy al trabajo/a la escuela
- I have lunch = Almuerzo
- I come home = Vuelvo a casa
- I have dinner = Ceno
- I go to bed = Me acuesto

### Time Expressions

- In the morning = Por la mañana
- In the afternoon = Por la tarde
- In the evening = Por la noche
- Early = Temprano
- Late = Tarde

### Practice

Describe your daily routine using the vocabulary above.
    `,
    order: 1,
  },
  {
    title: 'Shopping and Food',
    content: `# Shopping and Food
    
## At the Market

In this lesson, we will learn vocabulary and phrases related to shopping and food.

### Food Categories

- Fruits = Frutas
- Vegetables = Verduras
- Meat = Carne
- Fish = Pescado
- Dairy = Lácteos
- Bread = Pan

### Useful Phrases

- How much is it? = ¿Cuánto cuesta?
- I would like... = Quisiera...
- Do you have...? = ¿Tiene...?
- I need... = Necesito...
- That's too expensive = Es demasiado caro

### Practice

Role-play a shopping scenario using the vocabulary and phrases above.
    `,
    order: 2,
  },
  // B1 Lessons
  {
    title: 'Travel and Transportation',
    content: `# Travel and Transportation
    
## Planning a Trip

In this lesson, we will learn vocabulary and phrases related to travel and transportation.

### Transportation Methods

- By plane = En avión
- By train = En tren
- By bus = En autobús
- By car = En coche
- By boat = En barco

### Useful Phrases

- I would like to book a ticket = Quisiera reservar un billete
- What time does the train/bus leave? = ¿A qué hora sale el tren/autobús?
- How much is a ticket to...? = ¿Cuánto cuesta un billete para...?
- Is there a direct flight to...? = ¿Hay un vuelo directo a...?
- Can I have a window/aisle seat? = ¿Puedo tener un asiento de ventana/pasillo?

### Practice

Plan a trip to a destination of your choice using the vocabulary and phrases above.
    `,
    order: 1,
  },
  {
    title: 'Health and Wellness',
    content: `# Health and Wellness
    
## At the Doctor's Office

In this lesson, we will learn vocabulary and phrases related to health and wellness.

### Body Parts

- Head = Cabeza
- Arm = Brazo
- Leg = Pierna
- Stomach = Estómago
- Back = Espalda
- Throat = Garganta

### Symptoms and Conditions

- I have a headache = Tengo dolor de cabeza
- I have a fever = Tengo fiebre
- I feel dizzy = Me siento mareado/a
- I have a cold = Tengo un resfriado
- I'm allergic to... = Soy alérgico/a a...

### Practice

Role-play a doctor's appointment using the vocabulary and phrases above.
    `,
    order: 2,
  },
  // B2 Lessons
  {
    title: 'Work and Career',
    content: `# Work and Career
    
## Job Interviews and Workplace Communication

In this lesson, we will learn vocabulary and phrases related to work and career.

### Job Interview Questions

- Tell me about yourself = Hábleme de usted
- What are your strengths? = ¿Cuáles son sus puntos fuertes?
- What are your weaknesses? = ¿Cuáles son sus puntos débiles?
- Why do you want to work here? = ¿Por qué quiere trabajar aquí?
- What are your career goals? = ¿Cuáles son sus objetivos profesionales?

### Workplace Communication

- I would like to schedule a meeting = Me gustaría programar una reunión
- I need more time to complete this task = Necesito más tiempo para completar esta tarea
- I have a question about... = Tengo una pregunta sobre...
- Could you please clarify...? = ¿Podría aclarar...?
- I suggest we... = Sugiero que...

### Practice

Role-play a job interview using the vocabulary and phrases above.
    `,
    order: 1,
  },
  {
    title: 'Environment and Sustainability',
    content: `# Environment and Sustainability
    
## Discussing Environmental Issues

In this lesson, we will learn vocabulary and phrases related to environment and sustainability.

### Environmental Issues

- Climate change = Cambio climático
- Pollution = Contaminación
- Deforestation = Deforestación
- Renewable energy = Energía renovable
- Recycling = Reciclaje

### Expressing Opinions

- I believe that... = Creo que...
- In my opinion... = En mi opinión...
- I agree/disagree with... = Estoy de acuerdo/en desacuerdo con...
- On the one hand... on the other hand... = Por un lado... por otro lado...
- The main problem is... = El problema principal es...

### Practice

Discuss an environmental issue using the vocabulary and phrases above.
    `,
    order: 2,
  },
];

const tests = [
  // A1 Tests
  {
    title: 'A1 Basics Test',
    description: 'Test your knowledge of basic vocabulary and phrases.',
    questions: [
      {
        type: 'multiple-choice',
        question: 'How do you say "Hello" in Spanish?',
        options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        correctAnswer: 'Hola',
        explanation: 'Hola means Hello in Spanish.',
        points: 1,
      },
      {
        type: 'multiple-choice',
        question: 'How do you say "Good morning" in Spanish?',
        options: ['Buenos días', 'Buenas tardes', 'Buenas noches', 'Buen provecho'],
        correctAnswer: 'Buenos días',
        explanation: 'Buenos días means Good morning in Spanish.',
        points: 1,
      },
      {
        type: 'matching',
        question: 'Match the numbers with their Spanish equivalents.',
        options: ['1', '2', '3', '4'],
        correctAnswer: ['Uno', 'Dos', 'Tres', 'Cuatro'],
        explanation: 'The correct matches are: 1 = Uno, 2 = Dos, 3 = Tres, 4 = Cuatro.',
        points: 2,
      },
      {
        type: 'fill-in-blanks',
        question: 'Complete the sentence: "Me _____ Juan." (My name is Juan)',
        correctAnswer: 'llamo',
        explanation: 'The correct phrase is "Me llamo Juan" which means "My name is Juan".',
        points: 1,
      },
      {
        type: 'input',
        question: 'How do you say "Thank you" in Spanish?',
        correctAnswer: 'gracias',
        explanation: 'Gracias means Thank you in Spanish.',
        points: 1,
      },
    ],
    passingScore: 60,
    timeLimit: 15,
    order: 1,
    isFinal: true,
  },
  // A2 Tests
  {
    title: 'A2 Daily Life Test',
    description: 'Test your knowledge of vocabulary related to daily routines and shopping.',
    questions: [
      {
        type: 'multiple-choice',
        question: 'Which phrase means "I wake up" in Spanish?',
        options: ['Me despierto', 'Me acuesto', 'Desayuno', 'Ceno'],
        correctAnswer: 'Me despierto',
        explanation: 'Me despierto means I wake up in Spanish.',
        points: 1,
      },
      {
        type: 'ordering',
        question: 'Put these daily activities in a logical order.',
        options: ['Me acuesto', 'Me despierto', 'Ceno', 'Desayuno'],
        correctAnswer: ['Me despierto', 'Desayuno', 'Ceno', 'Me acuesto'],
        explanation: 'The logical order is: I wake up, I have breakfast, I have dinner, I go to bed.',
        points: 2,
      },
      {
        type: 'matching',
        question: 'Match the food categories with their Spanish equivalents.',
        options: ['Fruits', 'Vegetables', 'Meat', 'Fish'],
        correctAnswer: ['Frutas', 'Verduras', 'Carne', 'Pescado'],
        explanation: 'The correct matches are: Fruits = Frutas, Vegetables = Verduras, Meat = Carne, Fish = Pescado.',
        points: 2,
      },
      {
        type: 'fill-in-blanks',
        question: 'Complete the sentence: "¿_____ cuesta?" (How much is it?)',
        correctAnswer: 'Cuánto',
        explanation: 'The correct phrase is "¿Cuánto cuesta?" which means "How much is it?".',
        points: 1,
      },
      {
        type: 'input',
        question: 'How do you say "I need" in Spanish?',
        correctAnswer: 'necesito',
        explanation: 'Necesito means I need in Spanish.',
        points: 1,
      },
    ],
    passingScore: 60,
    timeLimit: 15,
    order: 1,
    isFinal: true,
  },
  // B1 Tests
  {
    title: 'B1 Travel and Health Test',
    description: 'Test your knowledge of vocabulary related to travel and health.',
    questions: [
      {
        type: 'multiple-choice',
        question: 'Which phrase means "by train" in Spanish?',
        options: ['En tren', 'En avión', 'En coche', 'En barco'],
        correctAnswer: 'En tren',
        explanation: 'En tren means by train in Spanish.',
        points: 1,
      },
      {
        type: 'matching',
        question: 'Match the transportation methods with their Spanish equivalents.',
        options: ['By plane', 'By bus', 'By car', 'By boat'],
        correctAnswer: ['En avión', 'En autobús', 'En coche', 'En barco'],
        explanation: 'The correct matches are: By plane = En avión, By bus = En autobús, By car = En coche, By boat = En barco.',
        points: 2,
      },
      {
        type: 'fill-in-blanks',
        question: 'Complete the sentence: "Tengo dolor de _____." (I have a headache)',
        correctAnswer: 'cabeza',
        explanation: 'The correct phrase is "Tengo dolor de cabeza" which means "I have a headache".',
        points: 1,
      },
      {
        type: 'ordering',
        question: 'Put these body parts in order from top to bottom.',
        options: ['Pierna', 'Cabeza', 'Estómago', 'Brazo'],
        correctAnswer: ['Cabeza', 'Brazo', 'Estómago', 'Pierna'],
        explanation: 'The order from top to bottom is: Head (Cabeza), Arm (Brazo), Stomach (Estómago), Leg (Pierna).',
        points: 2,
      },
      {
        type: 'input',
        question: 'How do you say "I have a fever" in Spanish?',
        correctAnswer: 'tengo fiebre',
        explanation: 'Tengo fiebre means I have a fever in Spanish.',
        points: 1,
      },
    ],
    passingScore: 70,
    timeLimit: 20,
    order: 1,
    isFinal: true,
  },
  // B2 Tests
  {
    title: 'B2 Comprehensive Language Test',
    description: 'A comprehensive test covering all aspects of advanced Spanish language skills.',
    questions: [
      {
        type: 'multiple-choice',
        question: 'Which of the following is the correct subjunctive form of "hablar" in the phrase "Es importante que tú _____"?',
        options: ['hablas', 'hables', 'hablarás', 'hablarías'],
        correctAnswer: 'hables',
        explanation: 'In Spanish, after phrases like "es importante que", we use the subjunctive mood. The correct subjunctive form of "hablar" for "tú" is "hables".',
        points: 1,
      },
      {
        type: 'matching',
        question: 'Match each Spanish idiom with its English equivalent.',
        options: [
          'Estar en las nubes',
          'Tomar el pelo',
          'Ser pan comido',
          'Meter la pata'
        ],
        correctAnswer: [
          'To have your head in the clouds',
          'To pull someone\'s leg',
          'To be a piece of cake',
          'To put your foot in your mouth'
        ],
        explanation: 'Spanish idioms often don\'t translate literally. "Estar en las nubes" means to be distracted or daydreaming, "Tomar el pelo" means to joke with someone, "Ser pan comido" means something is very easy, and "Meter la pata" means to make a mistake or say something inappropriate.',
        points: 2,
      },
      {
        type: 'fill-in-blanks',
        question: 'Complete this common Spanish saying: "Más vale pájaro en mano que _____ volando."',
        correctAnswer: ['ciento', 'cien'],
        explanation: 'The complete saying is "Más vale pájaro en mano que ciento volando" which is equivalent to the English "A bird in the hand is worth two in the bush." It means it\'s better to have something certain than something uncertain.',
        points: 1,
      },
      {
        type: 'ordering',
        question: 'Put these words in the correct order to form a grammatically correct Spanish sentence.',
        options: [
          'película',
          'La',
          'interesante',
          'muy',
          'fue'
        ],
        correctAnswer: [
          'La',
          'película',
          'fue',
          'muy',
          'interesante'
        ],
        explanation: 'The correct order in Spanish is "La película fue muy interesante" which means "The movie was very interesting." In Spanish, adjectives usually come after the noun they modify.',
        points: 2,
      },
      {
        type: 'input',
        question: 'What is the Spanish term for "sustainable development"?',
        correctAnswer: ['desarrollo sostenible', 'desarrollo sustentable'],
        explanation: 'Both "desarrollo sostenible" and "desarrollo sustentable" are accepted translations for "sustainable development" in Spanish.',
        points: 1,
      },
      {
        type: 'fill-in-blanks',
        question: 'In the sentence "Yo _____ que estudiar para el examen", what verb form should be used to say "I had to study for the exam"?',
        correctAnswer: ['tuve', 'tenía'],
        explanation: '"Tuve que estudiar" means "I had to study" using the preterite tense, indicating a completed action. "Tenía que estudiar" uses the imperfect tense and can also be correct depending on context.',
        points: 1,
      },
      {
        type: 'matching',
        question: 'Match each Spanish preposition with its correct usage.',
        options: [
          'Por',
          'Para',
          'En',
          'A'
        ],
        correctAnswer: [
          'Used for duration, exchange, or reason (por la mañana)',
          'Used for purpose, destination, or deadline (para mañana)',
          'Used for location or state (en casa)',
          'Used for direction or personal direct objects (voy a Madrid)'
        ],
        explanation: 'Spanish prepositions have specific uses: "por" is used for duration, exchange, or reason; "para" is used for purpose, destination, or deadline; "en" is used for location or state; and "a" is used for direction or with personal direct objects.',
        points: 2,
      },
      {
        type: 'fill-in-blanks',
        question: 'Complete the sentence with the correct verb forms: "Si yo _____(tener) tiempo, _____(ir) contigo al cine."',
        correctAnswer: {
          'blank1': ['tuviera', 'tuviese'],
          'blank2': ['iría']
        },
        explanation: 'This is a conditional sentence. The first blank requires the imperfect subjunctive form of "tener" (tuviera/tuviese), and the second blank requires the conditional form of "ir" (iría).',
        points: 2,
      },
      {
        type: 'categories',
        question: 'Categorize the following words into their correct grammatical categories.',
        options: [
          'correr', 'rápido', 'casa', 'feliz', 'comer', 'bonito', 
          'libro', 'triste', 'hablar', 'lentamente', 'ciudad', 'inteligente'
        ],
        correctAnswer: {
          'Verbs': ['correr', 'comer', 'hablar'],
          'Nouns': ['casa', 'libro', 'ciudad'],
          'Adjectives': ['feliz', 'bonito', 'triste', 'inteligente'],
          'Adverbs': ['rápido', 'lentamente']
        },
        explanation: 'In Spanish grammar, verbs are action words (correr, comer, hablar), nouns are people, places, or things (casa, libro, ciudad), adjectives describe nouns (feliz, bonito, triste, inteligente), and adverbs modify verbs, adjectives, or other adverbs (rápido, lentamente).',
        points: 3,
      },
    ],
    passingScore: 70,
    timeLimit: 30,
    order: 1,
    isFinal: true,
  },
];

// Sample placement test
const placementTest = {
  title: 'Language Proficiency Placement Test',
  description: 'This test will assess your language proficiency level and place you in the appropriate course level.',
  timeLimit: 60,
  questions: [
    // A1 Level Questions
    {
      question: 'What is the correct greeting for "Good morning"?',
      type: 'multiple-choice',
      options: ['Buenos días', 'Buenas tardes', 'Buenas noches', 'Hola'],
      correctAnswer: 'Buenos días',
      explanation: '"Buenos días" is the correct greeting for "Good morning".',
      points: 1,
      level: 'A1'
    },
    {
      question: 'Complete the sentence: "Me _____ Juan."',
      type: 'fill-in-the-blank',
      correctAnswer: 'llamo',
      explanation: '"Me llamo Juan" means "My name is Juan".',
      points: 1,
      level: 'A1'
    },
    {
      question: 'Match the numbers with their Spanish equivalents.',
      type: 'matching',
      options: {
        items: ['1', '2', '3', '4', '5'],
        matches: ['uno', 'dos', 'tres', 'cuatro', 'cinco']
      },
      correctAnswer: [
        { item: '1', match: 'uno' },
        { item: '2', match: 'dos' },
        { item: '3', match: 'tres' },
        { item: '4', match: 'cuatro' },
        { item: '5', match: 'cinco' }
      ],
      explanation: 'These are the basic numbers in Spanish.',
      points: 2,
      level: 'A1'
    },
    {
      question: 'Put the words in the correct order to form a question: "llamas", "te", "¿Cómo", "?"',
      type: 'ordering',
      options: ['llamas', 'te', '¿Cómo', '?'],
      correctAnswer: ['¿Cómo', 'te', 'llamas', '?'],
      explanation: '"¿Cómo te llamas?" means "What is your name?"',
      points: 2,
      level: 'A1'
    },
    
    // A2 Level Questions
    {
      question: 'Which of the following is NOT a daily routine activity?',
      type: 'multiple-choice',
      options: ['Desayunar', 'Almorzar', 'Conducir', 'Bailar'],
      correctAnswer: 'Bailar',
      explanation: '"Bailar" (to dance) is not typically considered a daily routine activity.',
      points: 1,
      level: 'A2'
    },
    {
      question: 'Complete the sentence: "Quisiera _____ una habitación de hotel."',
      type: 'fill-in-the-blank',
      correctAnswer: 'reservar',
      explanation: '"Quisiera reservar una habitación de hotel" means "I would like to book a hotel room".',
      points: 1,
      level: 'A2'
    },
    {
      question: 'Categorize these foods into their correct categories.',
      type: 'categories',
      options: {
        categories: ['Frutas', 'Verduras', 'Carnes'],
        items: ['manzana', 'zanahoria', 'pollo', 'plátano', 'tomate', 'cerdo']
      },
      correctAnswer: {
        'Frutas': ['manzana', 'plátano'],
        'Verduras': ['zanahoria', 'tomate'],
        'Carnes': ['pollo', 'cerdo']
      },
      explanation: 'These are common food categories in Spanish.',
      points: 3,
      level: 'A2'
    },
    
    // B1 Level Questions
    {
      question: 'Which tense is used in the sentence: "Ayer fui al cine"?',
      type: 'multiple-choice',
      options: ['Presente', 'Pretérito perfecto', 'Pretérito indefinido', 'Futuro'],
      correctAnswer: 'Pretérito indefinido',
      explanation: '"Ayer fui al cine" (Yesterday I went to the cinema) uses the pretérito indefinido tense.',
      points: 2,
      level: 'B1'
    },
    {
      question: 'Complete the sentence using the subjunctive: "Espero que tú _____ (venir) a la fiesta."',
      type: 'fill-in-the-blank',
      correctAnswer: 'vengas',
      explanation: 'The subjunctive form of "venir" for "tú" is "vengas".',
      points: 2,
      level: 'B1'
    },
    {
      question: 'Match these idiomatic expressions with their meanings.',
      type: 'matching',
      options: {
        items: ['Estar como una cabra', 'Costar un ojo de la cara', 'Dar en el clavo', 'Tomar el pelo'],
        matches: ['To be crazy', 'To be very expensive', 'To hit the nail on the head', 'To pull someone\'s leg']
      },
      correctAnswer: [
        { item: 'Estar como una cabra', match: 'To be crazy' },
        { item: 'Costar un ojo de la cara', match: 'To be very expensive' },
        { item: 'Dar en el clavo', match: 'To hit the nail on the head' },
        { item: 'Tomar el pelo', match: 'To pull someone\'s leg' }
      ],
      explanation: 'These are common Spanish idiomatic expressions.',
      points: 3,
      level: 'B1'
    },
    
    // B2 Level Questions
    {
      question: 'Which of the following sentences contains a grammatical error?',
      type: 'multiple-choice',
      options: [
        'Si hubiera sabido, te habría dicho.',
        'A pesar de que estaba cansado, fue a trabajar.',
        'Me alegro que hayas venido.',
        'Tan pronto como llegue, te llamaré.'
      ],
      correctAnswer: 'Me alegro que hayas venido.',
      explanation: 'The correct form is "Me alegro de que hayas venido" (with the preposition "de").',
      points: 2,
      level: 'B2'
    },
    {
      question: 'Complete the sentence with the correct form: "Si _____ (tener) tiempo, iría contigo."',
      type: 'fill-in-the-blank',
      correctAnswer: 'tuviera',
      explanation: 'The imperfect subjunctive "tuviera" is used in conditional sentences.',
      points: 2,
      level: 'B2'
    },
    {
      question: 'Categorize these words according to their word type.',
      type: 'categories',
      options: {
        categories: ['Verbos', 'Sustantivos', 'Adjetivos'],
        items: ['correr', 'casa', 'bonito', 'hablar', 'libro', 'interesante']
      },
      correctAnswer: {
        'Verbos': ['correr', 'hablar'],
        'Sustantivos': ['casa', 'libro'],
        'Adjetivos': ['bonito', 'interesante']
      },
      explanation: 'These are the basic word types in Spanish grammar.',
      points: 3,
      level: 'B2'
    }
  ]
};

// Import data into DB
// const importData = async () => {
//   try {
//     // Clear existing data
//     // await User.deleteMany();
//     // await Course.deleteMany();
//     // await Lesson.deleteMany();
//     // await Test.deleteMany();
//     // await PlacementTest.deleteMany();

//     console.log('Data cleared...');

//     // Create placement test
//     await PlacementTest.create(placementTest);
//     console.log('Placement test created');

//     // Create courses
//     const createdCourses = await Course.create(courses);
//     console.log(`${createdCourses.length} courses created`);

//     // Create lessons and associate with courses
//     for (let i = 0; i < lessons.length; i++) {
//       const lesson = lessons[i];
//       let courseIndex = 0;

//       if (i < 2) courseIndex = 0; // A1
//       else if (i < 4) courseIndex = 1; // A2
//       else if (i < 6) courseIndex = 2; // B1
//       else courseIndex = 3; // B2

//       lesson.course = createdCourses[courseIndex]._id;
//       await Lesson.create(lesson);
//     }
//     console.log(`${lessons.length} lessons created`);

//     // Create tests and associate with courses
//     for (let i = 0; i < tests.length; i++) {
//       const test = tests[i];
//       let courseIndex = 0;

//       if (i < 1) courseIndex = 0; // A1
//       else if (i < 2) courseIndex = 1; // A2
//       else if (i < 3) courseIndex = 2; // B1
//       else courseIndex = 3; // B2

//       test.course = createdCourses[courseIndex]._id;
//       await Test.create(test);
//     }
//     console.log(`${tests.length} tests created`);

//     // Create admin user
//     await User.create({
//       name: 'Admin User',
//       email: 'admin@example.com',
//       password: 'password123',
//     });
//     console.log('Admin user created...');

//     console.log('Data imported successfully!');
//     process.exit();
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// // Run the import
// importData(); 