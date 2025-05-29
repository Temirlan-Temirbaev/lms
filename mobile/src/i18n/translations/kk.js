export default {
  common: {
    loading: 'Жүктелуде...',
    error: 'Қате',
    success: 'Сәтті',
    cancel: 'Болдырмау',
    save: 'Сақтау',
    delete: 'Жою',
    edit: 'Өңдеу',
    next: 'Келесі',
    previous: 'Алдыңғы',
    finish: 'Аяқтау',
    ok: 'Жақсы',
  },
  auth: {
    // Common
    appName: 'QazaQsha',
    email: 'Электрондық пошта',
    password: 'Құпия сөз',
    error: 'Қате',
    success: 'Сәтті',
    
    // Login
    login: 'Кіру',
    loginTitle: 'Аккаунтқа кіру',
    loginFailed: 'Кіру сәтсіз аяқталды',
    checkCredentials: 'Деректеріңізді тексеріңіз',
    noAccount: 'Аккаунтыңыз жоқ па?',
    signUp: 'Тіркелу',
    forgotPassword: 'Құпия сөзді қалпына келтіру',
    
    // Register
    register: 'Тіркелу',
    registerTitle: 'Жаңа аккаунт жасау',
    fullName: 'Аты-жөні',
    fullNameOptional: 'Аты-жөні (міндетті емес)',
    confirmPassword: 'Құпия сөзді растау',
    registrationFailed: 'Тіркелу сәтсіз аяқталды',
    hasAccount: 'Аккаунтыңыз бар ма?',
    signIn: 'Кіру',
    
    // Reset Password
    resetPassword: 'Құпия сөзді қалпына келтіру',
    resetPasswordDesc: 'Құпия сөзіңізді қалпына келтіру үшін электрондық поштаңызды енгізіңіз',
    enterNewPassword: 'Жаңа құпия сөзді енгізіңіз',
    sendResetEmail: 'Қалпына келтіру сілтемесін жіберу',
    resetEmailSent: 'Құпия сөзді қалпына келтіру сілтемесі электрондық поштаңызға жіберілді',
    resetEmailFailed: 'Құпия сөзді қалпына келтіру сілтемесін жіберу сәтсіз аяқталды',
    newPassword: 'Жаңа құпия сөз',
    confirmNewPassword: 'Жаңа құпия сөзді растау',
    passwordResetSuccess: 'Құпия сөз сәтті өзгертілді',
    passwordResetFailed: 'Құпия сөзді өзгерту сәтсіз аяқталды',
    rememberPassword: 'Құпия сөзіңізді еске түсірдіңіз бе?',
    
    // New fields
    telephone: 'Телефон',
    telephoneOptional: 'Телефон (міндетті емес)',
    gender: 'Жыныс',
    genderOptional: 'Жыныс (міндетті емес)',
    age: 'Жасы',
    ageOptional: 'Жасы (міндетті емес)',
    male: 'Ер',
    female: 'Әйел',
    other: 'Басқа',
    invalidAge: 'Жас 1-ден 120-ға дейін болуы керек',
    telephoneRequired: 'Телефон нөірін енгізіңіз',
    genderRequired: 'Жынысыңызды таңдаңыз',
    
    // Validation
    fillAllFields: 'Барлық өрістерді толтырыңыз',
    fillRequiredFields: 'Міндетті өрістерді толтырыңыз (email және құпия сөз)',
    passwordsDontMatch: 'Құпия сөздер сәйкес келмейді',
    passwordTooShort: 'Құпия сөз кемінде 6 таңбадан тұруы керек',
    tryAgain: 'Қайталап көріңіз',
    passwordsDoNotMatch: 'Құпия сөздер сәйкес келмейді',
    passwordTooShort: 'Құпия сөз кем дегенде 6 таңбадан тұруы керек',
    invalidEmailFormat: 'Электрондық пошта мекенжайы қате форматта',
    invalidCredentials: 'Электрондық пошта немесе құпия сөз қате',
    serverError: 'Сервер қатесі. Кейінірек қайталаңыз',
    emailAlreadyExists: 'Бұл электрондық пошта тіркелген',
    enterOtp: 'OTP кодты енгізіңіз',
    otpSent: 'OTP код электрондық поштаңызға жіберілді',
    otpInvalid: 'OTP код дұрыс емес',
    resendOtp: 'OTP кодты қайта жіберу',
    otpResent: 'OTP код қайта жіберілді',
    verifyOtp: 'OTP кодты растау',
    otpVerificationFailed: 'OTP кодты растау сәтсіз аяқталды',
    otpVerificationSuccess: 'OTP код сәтті расталды',
    otpExpired: 'OTP кодтың мерзімі аяқталды',
  },
  test: {
    // Header
    timeLeft: 'Қалған уақыт',
    questionProgress: 'Сұрақ {{current}} / {{total}}',
    noAnswer: 'Жауап жоқ',
    image: 'Сурет',
    // Questions
    noQuestions: 'Сұрақтар жоқ',
    unknownType: 'Белгісіз сұрақ түрі',
    
    // Navigation
    previous: 'Алдыңғы',
    next: 'Келесі',
    finish: 'Аяқтау',
    
    // Overlays
    submitTitle: 'Тестті тапсыру',
    submitMessage: 'Тестті тапсырғыңыз келетініне сенімдісіз бе? Тапсырғаннан кейін жауаптарды өзгерту мүмкін емес.',
    cancel: 'Болдырмау',
    submit: 'Тапсыру',
    
    // Errors
    error: 'Қате',
    errorLoadTest: 'Тестті жүктеу кезінде қате орын алды',
    ok: 'Жақсы',
    
    // Incomplete warning
    incompleteTitle: 'Аяқталмаған тест',
    incompleteMessage: 'Сізде {{count}} жауапсыз сұрақ бар. Тестті тапсырғыңыз келетініне сенімдісіз бе?',
    submitAnyway: 'Бәрібір тапсыру',
    
    // Question types
    instructions: {
      multipleChoice: 'Дұрыс жауапты таңдаңыз',
      matching: 'Әр элементті сәйкес жауаппен сәйкестендіріңіз',
      ordering: 'Элементтерді дұрыс ретпен орналастырыңыз',
      fillInBlanks: 'Бос орындарды толтырыңыз',
      input: 'Жауабыңызды төменге жазыңыз',
      categories: 'Элементтерді дұрыс санатқа орналастырыңыз'
    },
    typeHere: '🖊️',
    // Categories
    // availableItems: 'Қолжетімді элементтер:',
    selectCategory: 'Санатты таңдаңыз',
    selectCategoryFor: 'Бұл элемент үшін санатты таңдаңыз',
    
    // Input hints
    inputHint: 'Кеңес: Емлеге және екпінге назар аударыңыз',
    fillInBlanksHint: 'Кеңес: Етістіктердің жіктелуі мен келісіміне назар аударыңыз',
    
    // Loading
    loading: 'Жүктелуде...',

    // Results
    results: 'Тест нәтижелері',
    passed: 'Тест сәтті тапсырылды',
    failed: 'Тест сәтсіз аяқталды',
    pointsEarned: '{{earned}}/{{total}} ұпай жиналды',
    questionResults: 'Сұрақтар бойынша нәтижелер',
    question: 'Сұрақ',
    correct: 'Дұрыс',
    incorrect: 'Қате',
    yourAnswer: 'Сіздің жауабыңыз',
    correctAnswer: 'Дұрыс жауап',
    explanation: 'Түсіндірме'
  },
  placementTest: {
    // Loading states
    loading: 'Деңгейді анықтау тесті жүктелуде...',
    tryAgain: 'Қайталап көріңіз',
    
    // Headers
    questionCount: 'Сұрақ {{current}} / {{total}}',
    timeLeft: 'Қалған уақыт',
    
    // Navigation
    previous: 'Алдыңғы',
    next: 'Келесі',
    submit: 'Тапсыру',
    
    // Question types
    noQuestions: 'Сұрақтар жоқ',
    unsupportedType: 'Қолдау көрсетілмейтін сұрақ түрі',
    
    // Categories
    // availableItems: 'Қолжетімді элементтер:',
    addTo: '{{category}} қосу',
    
    // Instructions
    typeAnswer: 'Жауабыңызды осында жазыңыз',
    
    // Confirmation dialog
    confirmSubmit: 'Тестті тапсыру',
    confirmMessage: 'Жауаптарыңызды тапсырғыңыз келетініне сенімдісіз бе? Тапсырғаннан кейін оларды өзгерту мүмкін емес.',
    cancel: 'Болдырмау',
    
    // Errors
    error: 'Қате',
    loadError: 'Тестті жүктеу кезінде қате орын алды. Қайталап көріңіз.',
    submitError: 'Тестті тапсыру кезінде қате орын алды. Қайталап көріңіз.',

    // Results
    results: 'Деңгейді анықтау тестінің нәтижелері',
    assignedLevel: 'Сіздің деңгейіңіз: {{level}}',
    pointsEarned: '{{earned}}/{{total}} ұпай жиналды',
    questionResults: 'Сұрақтар бойынша нәтижелер',
    question: 'Сұрақ',
    correct: 'Дұрыс',
    incorrect: 'Қате',
    yourAnswer: 'Сіздің жауабыңыз',
    correctAnswer: 'Дұрыс жауап',
    explanation: 'Түсіндірме'
  },
  lesson: {
    // Loading states
    loading: 'Сабақ жүктелуде...',
    
    // Buttons
    markAsCompleted: 'Аяқтау',
    completed: 'Аяқталды',
    
    // Success messages
    completedSuccess: 'Сабақ аяқталды деп белгіленді!',
    
    // Errors
    loadError: 'Сабақты жүктеу кезінде қате орын алды',
    completeError: 'Сабақты аяқталды деп белгілеу кезінде қате орын алды',
    error: 'Қате',
    success: 'Сәтті',
    
    // Table headers
    table: {
      time: 'Уақыт',
      english: 'Ағылшынша',
      kazakh: 'Қазақша',
      russian: 'Орысша',
      example: 'Мысал',
      translation: 'Аударма',
      usage: 'Қолданылуы',
    }
  },
  home: {
    // Loading states
    loading: 'Курстар жүктелуде...',
    
    // Course card
    lessons: '{{count}} Сабақ',
    tests: '{{count}} Тест',
    currentLevel: 'Қазіргі деңгей',
    
    // Placement test
    placementTest: {
      title: 'Деңгейді анықтау тестін тапсырыңыз',
      description: 'Тілді білу деңгейіңізді анықтап, сәйкес курстарды ашыңыз.',
      startButton: 'Тестті бастау',
    },
    
    // Course levels
    levels: {
      beginner: 'Бастауыш',
      elementary: 'Негізгі',
      intermediate: 'Орта',
      upperIntermediate: 'Жоғары орта',
    },
    
    // Errors
    loadError: 'Курстарды жүктеу кезінде қате орын алды',
    error: 'Қате',
    
    // Navigation
    courseDetails: 'Курс туралы',
  },
  navigation: {
    // Tab Navigation
    home: 'Басты бет',
    profile: 'Профиль',
    
    // Auth Screens
    login: 'Кіру',
    register: 'Тіркелу',
    
    // Home Stack
    courses: 'Курстар',
    courseDetails: 'Курс туралы',
    lesson: 'Сабақ',
    test: 'Тест',
    testResults: 'Тест нәтижелері',
    
    // Profile Stack
    editProfile: 'Профильді өңдеу',
    changePassword: 'Құпия сөзді өзгерту',
    myProgress: 'Менің үлгерімім',
    
    // Placement Test
    placementTest: 'Деңгейді анықтау тесті',
    placementTestResult: 'Тест нәтижесі',
  },
  profile: {
    // User Info
    user: 'Қолданушы',
    level: 'Деңгей',
    
    // Stats
    learningStats: 'Оқу статистикасы',
    lessons: 'Сабақтар',
    tests: 'Жаттығулар',
    dayStreak: 'Кіру белсенділігі',
    
    // Account Settings
    accountSettings: 'Аккаунт баптаулары',
    editProfile: 'Профильді өңдеу',
    editProfileDesc: 'Жеке ақпаратыңызды жаңарту',
    changePassword: 'Құпия сөзді өзгерту',
    changePasswordDesc: 'Құпия сөзіңізді жаңарту',
    viewProgress: 'Үлгерімді көру',
    viewProgressDesc: 'Оқу жолыңызды бақылау',
    
    // Logout
    logout: 'Шығу',
    logoutConfirm: 'Шығуды растау',
    logoutMessage: 'Шығуды қалайсыз ба?',
    cancel: 'Болдырмау',
    
    // Edit Profile
    name: 'Аты-жөні',
    enterName: 'Аты-жөніңізді енгізіңіз',
    enterEmail: 'Электрондық поштаңызды енгізіңіз',
    enterTelephone: 'Телефон нөміріңізді енгізіңіз',
    enterAge: 'Жасыңызды енгізіңіз',
    save: 'Сақтау',
    nameRequired: 'Аты-жөні міндетті',
    telephoneRequired: 'Телефон нөмірі міндетті',
    genderRequired: 'Жынысыңызды таңдаңыз',
    invalidAge: 'Жас 1-ден 120-ға дейін болуы керек',
    profileUpdated: 'Профиль жаңартылды',
    updateFailed: 'Профильді жаңарту сәтсіз аяқталды',
    currentPassword: 'Ағымдағы құпия сөз',
    enterCurrentPassword: 'Ағымдағы құпия сөзді енгізіңіз',
    newPassword: 'Жаңа құпия сөз',
    enterNewPassword: 'Жаңа құпия сөзді енгізіңіз',
    confirmNewPassword: 'Құпия сөзді растау',
    confirmNewPasswordPlaceholder: 'Жаңа құпия сөзді қайта енгізіңіз',
    passwordChanged: 'Құпия сөз сәтті өзгертілді',
    passwordChangeFailed: 'Құпия сөзді өзгерту кезінде қате орын алды',
    fillAllFields: 'Барлық өрістерді толтырыңыз'
  },
  progress: {
    // Headers
    title: 'Менің үлгерімім',
    overview: 'Жалпы шолу',
    
    // Stats
    completedLessons: 'Аяқталған сабақтар',
    completedTests: 'Аяқталған жаттығулар',
    currentLevel: 'Ағымдағы деңгей',
    
    // Course Progress
    courseProgress: 'Курс бойынша үлгерім',
    lessonsCompleted: '{{completed}}/{{total}} сабақ аяқталды',
    testsCompleted: '{{completed}}/{{total}} тест аяқталды',
    
    // Loading states
    loading: 'Үлгерім жүктелуде...',
    noProgress: 'Үлгерім туралы ақпарат жоқ',
    error: 'Үлгерімді жүктеу кезінде қате орын алды',
    tryAgain: 'Қайталап көріңіз',
    
    // Course status
    notStarted: 'Басталған жоқ',
    inProgress: 'Оқу барысында',
    completed: 'Аяқталды',
  },
  language: {
    select: 'Тілді таңдау',
    change: 'Тілді өзгерту',
    changeDesc: 'Қолданба тілін өзгерту'
  },
  course: {
    loadError: 'Курс мәліметтерін жүктеу кезінде қате орын алды',
    lessonNumber: 'Сабақ {number}',
    score: '{score}%',
    lessons: 'Сабақтар',
    tests: 'Жаттығулар',
    noLessons: 'Сабақтар жоқ',
    noTests: 'Жаттығулар жоқ'
  },
  // Add more translation keys as needed
}; 