export default {
  common: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    next: 'Далее',
    previous: 'Назад',
    finish: 'Завершить',
    ok: 'ОК',
  },
  auth: {
    // Common
    appName: 'QazaQsha',
    email: 'Электронная почта',
    password: 'Пароль',
    error: 'Ошибка',
    success: 'Успешно',
    
    // Login
    login: 'Войти',
    loginTitle: 'Вход в аккаунт',
    loginFailed: 'Ошибка входа',
    checkCredentials: 'Проверьте ваши данные',
    noAccount: 'Нет аккаунта?',
    signUp: 'Зарегистрироваться',
    forgotPassword: 'Восстановить пароль',
    
    // Register
    register: 'Регистрация',
    registerTitle: 'Создать новый аккаунт',
    fullName: 'Полное имя',
    confirmPassword: 'Подтвердите пароль',
    registrationFailed: 'Ошибка регистрации',
    hasAccount: 'Уже есть аккаунт?',
    signIn: 'Войти',
    
    // Reset Password
    resetPassword: 'Сброс пароля',
    resetPasswordDesc: 'Введите ваш email для сброса пароля',
    enterNewPassword: 'Введите новый пароль',
    sendResetEmail: 'Отправить ссылку для сброса',
    resetEmailSent: 'Ссылка для сброса пароля отправлена на ваш email',
    resetEmailFailed: 'Не удалось отправить ссылку для сброса пароля',
    newPassword: 'Новый пароль',
    confirmNewPassword: 'Подтвердите новый пароль',
    passwordResetSuccess: 'Пароль успешно изменен',
    passwordResetFailed: 'Не удалось изменить пароль',
    rememberPassword: 'Вспомнили пароль?',

    // New fields
    telephone: 'Телефон',
    gender: 'Пол',
    age: 'Возраст',
    male: 'Мужской',
    female: 'Женский',
    other: 'Другой',
    invalidAge: 'Возраст должен быть от 1 до 120 лет',
    telephoneRequired: 'Пожалуйста, введите номер телефона',
    genderRequired: 'Пожалуйста, выберите пол',
    
    // Validation
    fillAllFields: 'Пожалуйста, заполните все поля',
    passwordsDontMatch: 'Пароли не совпадают',
    passwordTooShort: 'Пароль должен содержать минимум 6 символов',
    tryAgain: 'Пожалуйста, попробуйте снова',
    passwordsDoNotMatch: 'Пароли не совпадают',
    invalidEmailFormat: 'Неверный формат электронной почты',
    invalidCredentials: 'Неверный email или пароль',
    serverError: 'Ошибка сервера. Попробуйте позже',
    emailAlreadyExists: 'Этот email уже зарегистрирован',
    
    // OTP
    enterOtp: 'Введите OTP код',
    otpSent: 'OTP код отправлен на вашу электронную почту',
    otpInvalid: 'Неверный OTP код',
    resendOtp: 'Отправить OTP код повторно',
    otpResent: 'OTP код отправлен повторно',
    verifyOtp: 'Подтвердить OTP',
    otpVerificationFailed: 'Не удалось подтвердить OTP код',
    otpVerificationSuccess: 'OTP код успешно подтвержден',
    otpExpired: 'Срок действия OTP кода истек',
  },
  test: {
    // Header
    timeLeft: 'Осталось времени',
    questionProgress: 'Вопрос {{current}} из {{total}}',
    noAnswer: 'Ответ отсутствует',
    image: 'Изображение',
    // Questions
    noQuestions: 'Нет доступных вопросов',
    unknownType: 'Неизвестный тип вопроса',
    
    // Navigation
    previous: 'Назад',
    next: 'Далее',
    finish: 'Завершить',
    
    // Overlays
    submitTitle: 'Отправить тест',
    submitMessage: 'Вы уверены, что хотите отправить тест? После отправки вы не сможете изменить свои ответы.',
    cancel: 'Отмена',
    submit: 'Отправить',
    
    // Errors
    error: 'Ошибка',
    errorLoadTest: 'Произошла ошибка при загрузке теста',
    ok: 'OK',
    
    // Incomplete warning
    incompleteTitle: 'Незавершенный тест',
    incompleteMessage: 'У вас есть {{count}} неотвеченных вопросов. Вы уверены, что хотите отправить тест?',
    submitAnyway: 'Отправить anyway',
    
    // Question types
    instructions: {
      multipleChoice: 'Выберите правильный ответ',
      matching: 'Сопоставьте каждый элемент с соответствующим ответом',
      ordering: 'Расположите элементы в правильном порядке',
      fillInBlanks: 'Заполните пропуски',
      input: 'Введите ваш ответ ниже',
      categories: 'Распределите элементы по правильным категориям'
    },

    typeHere: '🖊️',
    
    // Categories
    availableItems: 'Доступные элементы:',
    selectCategory: 'Выберите категорию',
    selectCategoryFor: 'Выберите категорию для этого элемента',
    
    // Input hints
    inputHint: 'Подсказка: Обратите внимание на правописание и ударения',
    fillInBlanksHint: 'Подсказка: Обратите внимание на спряжение глаголов и согласование',
    
    // Loading
    loading: 'Загрузка...',

    // Results
    results: 'Результаты теста',
    passed: 'Тест пройден',
    failed: 'Тест не пройден',
    pointsEarned: 'Набрано {{earned}} из {{total}} баллов',
    questionResults: 'Результаты по вопросам',
    question: 'Вопрос',
    correct: 'Правильно',
    incorrect: 'Неправильно',
    yourAnswer: 'Ваш ответ',
    correctAnswer: 'Правильный ответ',
    explanation: 'Объяснение'
  },
  placementTest: {
    // Loading states
    loading: 'Загрузка теста на определение уровня...',
    tryAgain: 'Попробовать снова',
    
    // Headers
    questionCount: 'Вопрос {{current}} из {{total}}',
    timeLeft: 'Осталось времени',
    
    // Navigation
    previous: 'Назад',
    next: 'Далее',
    submit: 'Отправить',
    
    // Question types
    noQuestions: 'Нет доступных вопросов',
    unsupportedType: 'Неподдерживаемый тип вопроса',
    
    // Categories
    availableItems: 'Доступные элементы:',
    addTo: 'Добавить в {{category}}',
    
    // Instructions
    typeAnswer: 'Введите ваш ответ здесь',
    
    // Confirmation dialog
    confirmSubmit: 'Отправить тест?',
    confirmMessage: 'Вы уверены, что хотите отправить свои ответы? После отправки их нельзя будет изменить.',
    cancel: 'Отмена',
    
    // Errors
    error: 'Ошибка',
    loadError: 'Не удалось загрузить тест. Пожалуйста, попробуйте снова.',
    submitError: 'Не удалось отправить тест. Пожалуйста, попробуйте снова.',

    // Results
    results: 'Результаты теста на определение уровня',
    assignedLevel: 'Ваш уровень: {{level}}',
    pointsEarned: 'Набрано {{earned}} из {{total}} баллов',
    questionResults: 'Результаты по вопросам',
    question: 'Вопрос',
    correct: 'Правильно',
    incorrect: 'Неправильно',
    yourAnswer: 'Ваш ответ',
    correctAnswer: 'Правильный ответ',
    explanation: 'Объяснение'
  },
  lesson: {
    // Loading states
    loading: 'Загрузка урока...',
    
    // Buttons
    markAsCompleted: 'Отметить как завершенный',
    completed: 'Завершено',
    
    // Success messages
    completedSuccess: 'Урок отмечен как завершенный!',
    
    // Errors
    loadError: 'Не удалось загрузить урок',
    completeError: 'Не удалось отметить урок как завершенный',
    error: 'Ошибка',
    success: 'Успешно',
    
    // Table headers
    table: {
      time: 'Время',
      english: 'Английский',
      kazakh: 'Казахский',
      russian: 'Русский',
      example: 'Пример',
      translation: 'Перевод',
      usage: 'Использование',
    }
  },
  home: {
    // Loading states
    loading: 'Загрузка курсов...',
    
    // Course card
    lessons: '{{count}} Уроков',
    tests: '{{count}} Тестов',
    currentLevel: 'Текущий уровень',
    
    // Placement test
    placementTest: {
      title: 'Пройдите тест на определение уровня',
      description: 'Определите свой уровень владения языком и откройте подходящие курсы.',
      startButton: 'Начать тест',
    },
    
    // Course levels
    levels: {
      beginner: 'Начальный',
      elementary: 'Базовый',
      intermediate: 'Средний',
      upperIntermediate: 'Выше среднего',
    },
    
    // Errors
    loadError: 'Не удалось загрузить курсы',
    error: 'Ошибка',
    
    // Navigation
    courseDetails: 'О курсе',
  },
  navigation: {
    // Tab Navigation
    home: 'Главная',
    profile: 'Профиль',
    
    // Auth Screens
    login: 'Вход',
    register: 'Регистрация',
    
    // Home Stack
    courses: 'Курсы',
    courseDetails: 'О курсе',
    lesson: 'Урок',
    test: 'Тест',
    testResults: 'Результаты теста',
    
    // Profile Stack
    editProfile: 'Редактировать профиль',
    changePassword: 'Изменить пароль',
    myProgress: 'Мой прогресс',
    
    // Placement Test
    placementTest: 'Тест на определение уровня',
    placementTestResult: 'Результат теста',
  },
  profile: {
    // User Info
    user: 'Пользователь',
    level: 'Уровень',
    
    // Stats
    learningStats: 'Статистика обучения',
    lessons: 'Уроки',
    tests: 'Тесты',
    dayStreak: 'Дней подряд',
    
    // Account Settings
    accountSettings: 'Настройки аккаунта',
    editProfile: 'Редактировать профиль',
    editProfileDesc: 'Обновить личную информацию',
    changePassword: 'Изменить пароль',
    changePasswordDesc: 'Обновить пароль',
    viewProgress: 'Просмотр прогресса',
    viewProgressDesc: 'Отслеживание прогресса обучения',
    
    // Logout
    logout: 'Выйти',
    logoutConfirm: 'Подтверждение выхода',
    logoutMessage: 'Вы уверены, что хотите выйти?',
    cancel: 'Отмена',
    
    // Edit Profile
    name: 'Имя',
    enterName: 'Введите ваше имя',
    enterEmail: 'Введите вашу почту',
    enterTelephone: 'Введите ваш номер телефона',
    enterAge: 'Введите ваш возраст',
    save: 'Сохранить',
    nameRequired: 'Имя обязательно',
    telephoneRequired: 'Номер телефона обязателен',
    genderRequired: 'Пожалуйста, выберите пол',
    invalidAge: 'Возраст должен быть от 1 до 120 лет',
    profileUpdated: 'Профиль обновлен',
    updateFailed: 'Не удалось обновить профиль',
    currentPassword: 'Текущий пароль',
    enterCurrentPassword: 'Введите текущий пароль',
    newPassword: 'Новый пароль',
    enterNewPassword: 'Введите новый пароль',
    confirmNewPassword: 'Подтверждение пароля',
    confirmNewPasswordPlaceholder: 'Введите новый пароль еще раз',
    passwordChanged: 'Пароль успешно изменен',
    passwordChangeFailed: 'Ошибка при изменении пароля',
    fillAllFields: 'Пожалуйста, заполните все поля'
  },
  progress: {
    // Headers
    title: 'Мой прогресс',
    overview: 'Обзор',
    
    // Stats
    completedLessons: 'Завершенные уроки',
    completedTests: 'Завершенные тесты',
    currentLevel: 'Текущий уровень',
    
    // Course Progress
    courseProgress: 'Прогресс по курсу',
    lessonsCompleted: 'Завершено {{completed}}/{{total}} уроков',
    testsCompleted: 'Завершено {{completed}}/{{total}} тестов',
    
    // Loading states
    loading: 'Загрузка прогресса...',
    noProgress: 'Нет информации о прогрессе',
    error: 'Ошибка при загрузке прогресса',
    tryAgain: 'Попробовать снова',
    
    // Course status
    notStarted: 'Не начат',
    inProgress: 'В процессе',
    completed: 'Завершен',
  },
  language: {
    select: 'Выбор языка',
    change: 'Изменить язык',
    changeDesc: 'Изменить язык приложения'
  },
  course: {
    loadError: 'Ошибка при загрузке данных курса',
    lessonNumber: 'Урок {number}',
    score: '{score}%',
    lessons: 'Уроки',
    tests: 'Тесты',
    noLessons: 'Нет доступных уроков',
    noTests: 'Нет доступных тестов'
  },
  // Add more translation keys as needed
}; 