import type { Locale } from "@/i18n/config";
import type { ProductsDictionary, HerbsSpicesDictionary } from "@/i18n/types";
import type { ProduceFamilyId, ProduceProductId, WorldId } from "@/types/agrica";
import type { HerbsSpicesFamilyId } from "@/types/herbs-spices";
import { PRODUCT_LIBRARY } from "@/data/products";
import { HERBS_SPICES_CATALOGUE, HERBS_SPICES_FAMILIES } from "@/data/herbs-spices/catalogue";

const produceIds = Object.values(PRODUCT_LIBRARY).flatMap((world) => world.families.flatMap((family) => family.products.map((item) => item.id)));
const herbIds = HERBS_SPICES_CATALOGUE.map((item) => item.id);

function keyed<T extends string>(ids: readonly T[], names: readonly string[]): Readonly<Record<T, { name: string; aliases: readonly string[]; imageAlt: string }>> {
  if (ids.length !== names.length) throw new Error(`Translation count mismatch: ${names.length}/${ids.length}`);
  return Object.fromEntries(ids.map((id, index) => {
    const english = id.startsWith("produce:")
      ? Object.values(PRODUCT_LIBRARY).flatMap((world) => world.families.flatMap((family) => family.products)).find((item) => item.id === id)!.name
      : HERBS_SPICES_CATALOGUE.find((item) => item.id === id)!.name;
    const name = names[index];
    return [id, { name, aliases: name === english ? [english] : [english, name], imageAlt: name }];
  })) as unknown as Record<T, { name: string; aliases: readonly string[]; imageAlt: string }>;
}

const produceNames: Record<Locale, readonly string[]> = {
  en: ["Oranges","Lemons","Egyptian Limes","Mandarins","Grapes","Pomegranates","Strawberries","Blueberries","Mangoes","Guava","Dates","Watermelon","Potatoes","Sweet Potatoes","Onions","Garlic","Green Beans","Artichokes","Carrots","Taro","IQF Strawberries","IQF Mango","IQF Pomegranate Arils","IQF Green Beans","IQF Green Peas","IQF Okra","IQF Molokhia","IQF Artichokes","IQF Broccoli","Mixed Vegetables","Half-Fried French Fries","Dried Lemon","Raisins","Sun-Dried Tomatoes","Dehydrated Onion","Dehydrated Garlic","Dried Molokhia"],
  ar: ["برتقال","ليمون","ليمون أخضر مصري","يوسفي","عنب","رمان","فراولة","توت أزرق","مانجو","جوافة","تمور","بطيخ","بطاطس","بطاطا حلوة","بصل","ثوم","فاصوليا خضراء","خرشوف","جزر","قلقاس","فراولة مجمدة بتقنية IQF","مانجو مجمدة بتقنية IQF","حبوب رمان مجمدة بتقنية IQF","فاصوليا خضراء مجمدة بتقنية IQF","بازلاء خضراء مجمدة بتقنية IQF","بامية مجمدة بتقنية IQF","ملوخية مجمدة بتقنية IQF","خرشوف مجمد بتقنية IQF","بروكلي مجمد بتقنية IQF","خضروات مشكلة مجمدة","بطاطس نصف مقلية","ليمون مجفف","زبيب","طماطم مجففة بالشمس","بصل مجفف","ثوم مجفف","ملوخية مجففة"],
  ru: ["Апельсины","Лимоны","Египетские лаймы","Мандарины","Виноград","Гранаты","Клубника","Голубика","Манго","Гуава","Финики","Арбузы","Картофель","Батат","Репчатый лук","Чеснок","Зелёная фасоль","Артишоки","Морковь","Таро","Клубника IQF","Манго IQF","Зёрна граната IQF","Зелёная фасоль IQF","Зелёный горошек IQF","Бамия IQF","Молохея IQF","Артишоки IQF","Брокколи IQF","Овощная смесь","Картофель фри полуобжаренный","Сушёный лимон","Изюм","Вяленые томаты","Дегидрированный лук","Дегидрированный чеснок","Сушёная молохея"],
  de: ["Orangen","Zitronen","Ägyptische Limetten","Mandarinen","Trauben","Granatäpfel","Erdbeeren","Heidelbeeren","Mangos","Guaven","Datteln","Wassermelonen","Kartoffeln","Süßkartoffeln","Zwiebeln","Knoblauch","Grüne Bohnen","Artischocken","Karotten","Taro","IQF-Erdbeeren","IQF-Mango","IQF-Granatapfelkerne","IQF-Grüne Bohnen","IQF-Grüne Erbsen","IQF-Okra","IQF-Molokhia","IQF-Artischocken","IQF-Brokkoli","Gemüsemischung","Halbfrittierte Pommes frites","Getrocknete Zitronen","Rosinen","Sonnengetrocknete Tomaten","Dehydrierte Zwiebeln","Dehydrierter Knoblauch","Getrocknete Molokhia"],
  fr: ["Oranges","Citrons","Citrons verts égyptiens","Mandarines","Raisins frais","Grenades","Fraises","Myrtilles","Mangues","Goyaves","Dattes","Pastèques","Pommes de terre","Patates douces","Oignons","Ail","Haricots verts","Artichauts","Carottes","Taro","Fraises IQF","Mangue IQF","Arilles de grenade IQF","Haricots verts IQF","Petits pois IQF","Gombo IQF","Molokhia IQF","Artichauts IQF","Brocoli IQF","Mélange de légumes","Frites préfrites","Citron séché","Raisins secs","Tomates séchées au soleil","Oignon déshydraté","Ail déshydraté","Molokhia séchée"],
};

const herbNames: Record<Locale, readonly string[]> = {
  en: ["Basil","Dill","Lemon Grass","Marjoram","Moringa","Oregano","Parsley","Peppermint","Rosemary","Spearmint","Thyme","Calendula","Chamomile","Hibiscus","Anise","Black Cumin","Caraway","Coriander","Fennel","Fenugreek","Flaxseed","Sesame","Cumin","Red Chilli Pepper","Licorice Root","Onion","Garlic"],
  ar: ["ريحان","شبت","حشيشة الليمون","بردقوش","مورينجا","أوريجانو","بقدونس","نعناع فلفلي","إكليل الجبل","نعناع بلدي","زعتر","آذريون","بابونج","كركديه","يانسون","حبة البركة","كراوية","كزبرة","شمر","حلبة","بذور الكتان","سمسم","كمون","فلفل أحمر حار","جذر العرقسوس","بصل","ثوم"],
  ru: ["Базилик","Укроп","Лемонграсс","Майоран","Моринга","Орегано","Петрушка","Перечная мята","Розмарин","Колосистая мята","Тимьян","Календула","Ромашка","Гибискус","Анис","Чёрный тмин","Тмин","Кориандр","Фенхель","Пажитник","Семена льна","Кунжут","Кумин","Красный перец чили","Корень солодки","Лук","Чеснок"],
  de: ["Basilikum","Dill","Zitronengras","Majoran","Moringa","Oregano","Petersilie","Pfefferminze","Rosmarin","Grüne Minze","Thymian","Ringelblume","Kamille","Hibiskus","Anis","Schwarzkümmel","Kümmel","Koriander","Fenchel","Bockshornklee","Leinsamen","Sesam","Kreuzkümmel","Rote Chilischote","Süßholzwurzel","Zwiebel","Knoblauch"],
  fr: ["Basilic","Aneth","Citronnelle","Marjolaine","Moringa","Origan","Persil","Menthe poivrée","Romarin","Menthe verte","Thym","Calendula","Camomille","Hibiscus","Anis","Nigelle","Carvi","Coriandre","Fenouil","Fenugrec","Graines de lin","Sésame","Cumin","Piment rouge","Racine de réglisse","Oignon","Ail"],
};

const familyNames: Record<Locale, readonly string[]> = {
  en: ["Citrus","Fresh Fruits","Vegetables & Tubers","IQF Fruits","IQF Vegetables","Frozen Potato Products","Dried Fruits","Dried Vegetables"],
  ar: ["حمضيات","فواكه طازجة","خضروات ودرنيات","فواكه مجمدة بتقنية IQF","خضروات مجمدة بتقنية IQF","منتجات بطاطس مجمدة","فواكه مجففة","خضروات مجففة"],
  ru: ["Цитрусовые","Свежие фрукты","Овощи и клубнеплоды","Фрукты IQF","Овощи IQF","Замороженные картофельные продукты","Сухофрукты","Сушёные овощи"],
  de: ["Zitrusfrüchte","Frisches Obst","Gemüse & Knollen","IQF-Früchte","IQF-Gemüse","Tiefgekühlte Kartoffelprodukte","Trockenfrüchte","Getrocknetes Gemüse"],
  fr: ["Agrumes","Fruits frais","Légumes et tubercules","Fruits IQF","Légumes IQF","Produits de pomme de terre surgelés","Fruits séchés","Légumes séchés"],
};
const produceFamilyIds: readonly ProduceFamilyId[] = ["citrus","fresh-fruits","vegetables-tubers","iqf-fruits","iqf-vegetables","frozen-potato-products","dried-fruits","dried-vegetables"];
const herbFamilyNames: Record<Locale, readonly string[]> = {
  en: ["Herbs","Flowers","Seeds","Spices","Roots","Dehydrated Vegetables"], ar: ["أعشاب","زهور","بذور","توابل","جذور","خضروات مجففة"], ru: ["Травы","Цветы","Семена","Специи","Корни","Дегидрированные овощи"], de: ["Kräuter","Blüten","Samen","Gewürze","Wurzeln","Dehydriertes Gemüse"], fr: ["Herbes","Fleurs","Graines","Épices","Racines","Légumes déshydratés"],
};

export function produceCatalogue(locale: Locale): Pick<ProductsDictionary, "families" | "products"> {
  return {
    families: Object.fromEntries(produceFamilyIds.map((id, i) => [id, familyNames[locale][i]])) as Record<ProduceFamilyId, string>,
    products: keyed(produceIds, produceNames[locale]) as ProductsDictionary["products"],
  };
}

export function herbsCatalogue(locale: Locale): Pick<HerbsSpicesDictionary, "families" | "products" | "forms"> {
  const formsByLocale: Record<Locale, readonly string[]> = { en: ["Whole","Cut & Sifted","TBC (Tea Bag Cut)","Crushed","Powder","Flakes","Granules","Powder"], ar: ["كامل","مقطع ومنخول","تقطيع أكياس الشاي (TBC)","مجروش","مسحوق","رقائق","حبيبات","مسحوق"], ru: ["Цельный","Резаный и просеянный","Нарезка для чайных пакетиков (TBC)","Дроблёный","Порошок","Хлопья","Гранулы","Порошок"], de: ["Ganz","Geschnitten & gesiebt","Teebeutelschnitt (TBC)","Geschrotet","Pulver","Flocken","Granulat","Pulver"], fr: ["Entier","Coupé et tamisé","Coupe sachet de thé (TBC)","Concassé","Poudre","Flocons","Granulés","Poudre"] };
  const formIds = ["whole","cut-sifted","tbc","crushed","powder","Flakes","Granules","Powder"];
  return {
    families: Object.fromEntries(HERBS_SPICES_FAMILIES.map((family, i) => [family.id, herbFamilyNames[locale][i]])) as Record<HerbsSpicesFamilyId, string>,
    products: keyed(herbIds, herbNames[locale]) as HerbsSpicesDictionary["products"],
    forms: Object.fromEntries(formIds.map((id, i) => [id, formsByLocale[locale][i]])),
  };
}

const herbFamilyDescriptions: Record<Locale, Readonly<Record<HerbsSpicesFamilyId, string>>> = {
  en: { herbs:"Basil, dill, marjoram, mint varieties, and more.", flowers:"Calendula, chamomile, and hibiscus.", seeds:"Anise, caraway, coriander, fennel, and related seeds.", spices:"Cumin and red chilli pepper.", roots:"Licorice root.", "dehydrated-vegetables":"Onion and garlic." },
  ar: { herbs:"الريحان والشبت والبردقوش وأنواع النعناع وغيرها.", flowers:"الآذريون والبابونج والكركديه.", seeds:"اليانسون والكراوية والكزبرة والشمر وبذور أخرى.", spices:"الكمون والفلفل الأحمر الحار.", roots:"جذر العرقسوس.", "dehydrated-vegetables":"البصل والثوم." },
  ru: { herbs:"Базилик, укроп, майоран, разновидности мяты и другое.", flowers:"Календула, ромашка и гибискус.", seeds:"Анис, тмин, кориандр, фенхель и другие семена.", spices:"Кумин и красный перец чили.", roots:"Корень солодки.", "dehydrated-vegetables":"Лук и чеснок." },
  de: { herbs:"Basilikum, Dill, Majoran, Minzsorten und mehr.", flowers:"Ringelblume, Kamille und Hibiskus.", seeds:"Anis, Kümmel, Koriander, Fenchel und weitere Samen.", spices:"Kreuzkümmel und rote Chilischote.", roots:"Süßholzwurzel.", "dehydrated-vegetables":"Zwiebel und Knoblauch." },
  fr: { herbs:"Basilic, aneth, marjolaine, variétés de menthe et plus.", flowers:"Calendula, camomille et hibiscus.", seeds:"Anis, carvi, coriandre, fenouil et autres graines.", spices:"Cumin et piment rouge.", roots:"Racine de réglisse.", "dehydrated-vegetables":"Oignon et ail." },
};

export function herbsFamilyDescription(locale: Locale, familyId: HerbsSpicesFamilyId): string {
  return herbFamilyDescriptions[locale][familyId];
}
