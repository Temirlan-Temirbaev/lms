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
  },
  auth: {
    // Common
    appName: 'QazaQsha',
    email: 'Электронная почта',
    password: 'Пароль',
    error: 'Ошибка',
    
    // Login
    login: 'Войти',
    loginTitle: 'Вход в аккаунт',
    loginFailed: 'Ошибка входа',
    checkCredentials: 'Проверьте ваши данные',
    noAccount: 'Нет аккаунта?',
    signUp: 'Зарегистрироваться',
    
    // Register
    register: 'Регистрация',
    registerTitle: 'Создать новый аккаунт',
    fullName: 'Полное имя',
    confirmPassword: 'Подтвердите пароль',
    registrationFailed: 'Ошибка регистрации',
    hasAccount: 'Уже есть аккаунт?',
    signIn: 'Войти',
    
    // Validation
    fillAllFields: 'Пожалуйста, заполните все поля',
    passwordsNotMatch: 'Пароли не совпадают',
    passwordTooShort: 'Пароль должен содержать минимум 6 символов',
    tryAgain: 'Пожалуйста, попробуйте снова',
    passwordsDoNotMatch: 'Пароли не совпадают',
  },
  test: {
    // Header
    timeLeft: 'Осталось времени',
    questionProgress: 'Вопрос {{current}} из {{total}}',
    
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
    
    // Categories
    availableItems: 'Доступные элементы:',
    selectCategory: 'Выберите категорию',
    selectCategoryFor: 'Выберите категорию для этого элемента',
    
    // Input hints
    inputHint: 'Подсказка: Обратите внимание на правописание и ударения',
    fillInBlanksHint: 'Подсказка: Обратите внимание на спряжение глаголов и согласование',
    
    // Loading
    loading: 'Загрузка...'
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
    save: 'Сохранить',
    nameRequired: 'Имя обязательно',
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