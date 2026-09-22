import type { CommonDictionary } from "../../types";

const common = {
  navigation: {
    primaryLabel: "Основная навигация", siteDialogLabel: "Навигация по сайту", sitePagesLabel: "Разделы сайта",
    home: "Главная", products: "Продукция", standard: "Наш стандарт", company: "Компания", startTrade: "Начать сотрудничество",
    menu: "Меню", close: "Закрыть", openMenu: "Открыть меню навигации", closeMenu: "Закрыть меню навигации",
    agricaHome: "Главная страница AGRICA", cairoEgypt: "Каир, Египет", agricultureCairo: "Аграрный Каир",
    exportStatement: "Египетская продукция, подготовленная для мировых рынков.", b2bExport: "Экспорт сельхозпродукции для бизнеса",
    produceWorlds: "Свежая / Замороженная / Сушёная",
  },
  footer: {
    navigationLabel: "Навигация в подвале", oneOriginThreeWorlds: "Одно происхождение · Три направления",
    nextExportProgramme: "Ваша следующая экспортная программа", controlledFromOrigin: "Контроль от места происхождения",
    originGlobalReadiness: "Египетское происхождение · Готовность к мировым поставкам", exploreProduce: "Изучить продукцию",
    buildQuotation: "Сформировать запрос", discoverProducts: "Открыть каталог",
    originHeadline: "Египетское происхождение.", worldHeadline: "Готово для мировых рынков.",
    description: "Свежая, замороженная и сушёная продукция, подготовленная для международных поставок.", beginHere: "Начните здесь",
    tradeDesk: "Отдел экспорта", exportConversation: "Обсудить экспортную поставку", backToTop: "Наверх",
  },
  languageSwitcher: {
    label: "Язык", openLabel: "Выбрать язык", closeLabel: "Закрыть меню языков",
    optionsLabel: "Доступные языки", currentLanguage: "Текущий язык",
  },
  divisions: {
    navigationLabel: "Подразделения AGRICA", produce: "Сельхозпродукция", herbsSpices: "Травы и специи",
    current: "{division} — текущее подразделение", switchTo: "Перейти в раздел «{division}»",
    herbsMenuOpen: "Открыть меню трав и специй", herbsMenuClose: "Закрыть меню трав и специй",
    herbsPagesLabel: "Разделы «Травы и специи»", businessDivision: "Подразделение AGRICA.", process: "Процесс",
  },
  accessibility: {
    skipMain: "Перейти к основному содержанию", skipProducts: "Перейти к каталогу продукции",
    skipStandard: "Перейти к этапам стандарта", footerHome: "Главная страница AGRICA",
    openProductSearch: "Открыть поиск продукции", searchProducts: "Поиск продукции",
    clearSearch: "Очистить поисковый запрос", closeSearch: "Закрыть строку поиска", filterFamilies: "Фильтр по категории продукции",
    filterHerbsFamilies: "Фильтр каталога по категории ингредиентов", clearIngredientSearch: "Очистить поиск ингредиентов",
  },
  actions: {
    back: "Назад", close: "Закрыть", explore: "Подробнее", contact: "Связаться", enquire: "Отправить запрос", remove: "Удалить",
    addToEnquiry: "Добавить в запрос", addedToEnquiry: "Добавлено в запрос", viewMaterial: "Посмотреть материал",
    hideMaterial: "Скрыть материал", clear: "Очистить", resetCatalogue: "Сбросить каталог", buildQuote: "Сформировать запрос",
    reviewEnquiry: "Проверить запрос", prepareEnquiry: "Подготовить запрос", previewEnquiry: "Предпросмотр запроса",
  },
  enquiry: {
    exportEnquiry: "Экспортный запрос", buildQuotationTitle: "Сформируйте запрос.", closeQuotation: "Закрыть запрос",
    removeItem: "Удалить {name}", empty: "Выберите продукцию из каталога, чтобы начать.",
    destinationMarket: "Рынок назначения", destinationPlaceholder: "Страна / порт", destination: "Назначение",
    estimatedVolume: "Ориентировочный объём", volumePlaceholder: "Месячная потребность", company: "Компания",
    companyPlaceholder: "Название компании", workEmail: "Рабочая почта", email: "Электронная почта",
    addProductFirst: "Добавьте хотя бы один продукт перед подготовкой запроса.",
    prepared: "Запрос подготовлен. В рабочей версии он будет отправлен напрямую экспортной команде AGRICA.",
    cropSelected: "Выбрана 1 культура", cropsSelected: "Выбрано культур: {count}",
    reviewItems: "Проверить позиции экспортного запроса: {count}", addItem: "Добавить {name} в запрос",
    removeItemFromEnquiry: "Удалить {name} из запроса", localPreview: "Предпросмотр запроса",
    selectedMaterials: "Выбранные материалы", closeEnquiry: "Закрыть запрос",
    selectedMaterialsLabel: "Выбранные материалы", previewNotice: "Предпросмотр запроса — отправка будет подключена позднее.",
    enquiryList: "Список запроса",
  },
  catalogue: {
    searchMaterials: "Поиск материалов", searchMaterialsPlaceholder: "Название, категория или форма", all: "Все",
    allFamilies: "Все категории", browseIngredients: "Просмотр каталога ингредиентов", material: "материал",
    materials: "материалов", noMaterials: "Для выбранных условий материалы не найдены.",
  },
} satisfies CommonDictionary;

export default common;
