import type { ProduceProductId, WorldId } from "@/types/agrica";
import type {
  ClientReviewPriority,
  ProductCardConfidence,
  ProductCardContent,
  ProductCardField,
  ProductCardFieldLabelKey,
  PublicProductCardContent,
} from "@/types/product-card-content";

type FieldSeed = Omit<ProductCardField, "displayOrder">;

const researched = (
  labelKey: ProductCardFieldLabelKey,
  value: string,
  sourceRefs: readonly string[],
  confidence: ProductCardConfidence = "HIGH",
): FieldSeed => ({
  labelKey,
  value,
  assumed: false,
  reviewRequired: true,
  sourceRefs,
  confidence,
});

const assumed = (
  labelKey: ProductCardFieldLabelKey,
  value: string,
  assumptionReason: string,
  sourceRefs: readonly string[] = ["S01"],
): FieldSeed => ({
  labelKey,
  value,
  assumed: true,
  reviewRequired: true,
  assumptionReason,
  sourceRefs,
  confidence: "LOW",
});

const card = (
  productId: ProduceProductId,
  category: WorldId,
  fields: readonly FieldSeed[],
  assumptions: readonly string[],
  priority: ClientReviewPriority,
  imageBrief: string,
  imageDependencies: readonly string[],
  publicName?: string,
): ProductCardContent => {
  const sourceRefs = [...new Set(fields.flatMap((field) => field.sourceRefs))];
  return {
    productId,
    ...(publicName ? { publicName } : {}),
    category,
    fields: fields.map((field, index) => ({ ...field, displayOrder: index + 1 })),
    clientReview: { required: true, assumptions, priority },
    internalNote: "Conservative public copy approved for implementation; replace provisional commercial wording after AGRICA review.",
    sourceRefs,
    confidence: priority === "HIGH" ? "LOW" : "MEDIUM",
    imageBrief: {
      readiness: imageDependencies.length === 0 ? "READY" : "PROVISIONAL",
      brief: imageBrief,
      dependencies: imageDependencies,
    },
  };
};

const commonSizing = "Buyer specification / applicable commercial sizing";
const commonPack = "Common export formats; buyer specification";
const buyerPack = "Buyer-specific format";
const productPreparation = "According to product specification";
const frozenStorage = "−18°C or colder";
const driedPack = "Moisture-protective food-grade packaging; programme dependent";
const driedBarrierPack = "Moisture-barrier food-grade packaging; programme dependent";
const driedStorage = "Cool, dry and protected from light, moisture and strong odours";

export const PRODUCT_CARD_CONTENT: Readonly<Record<string, ProductCardContent>> = {
  "produce:orange": card("produce:orange", "fresh", [
    researched("typicalEgyptianSeason", "December–May; variety dependent", ["S04", "S06"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA varieties are not yet approved."),
    assumed("sizeCalibre", commonSizing, "AGRICA calibre range is not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "3–8°C", ["S07"]),
    researched("relativeHumidity", "90–95%", ["S07"]),
    researched("handling", "Variety, maturity and transit duration determine the final programme", ["S07"]),
  ], ["Egyptian calendar applies.", "Variety, calibre and pack format are programme-selected."], "MEDIUM", "Neutral studio photograph of whole oranges and one cut fruit; no labels, farm or varietal cues.", []),

  "produce:lemon": card("produce:lemon", "fresh", [
    researched("typicalEgyptianSeason", "October–May; variety dependent", ["S04", "S06"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA varieties are not yet approved."),
    assumed("sizeCalibre", commonSizing, "AGRICA calibre range is not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "12–14°C", ["S08"]),
    researched("relativeHumidity", "90–95%", ["S08"]),
    researched("handling", "Colour and maturity affect the appropriate storage programme", ["S08"]),
  ], ["Egyptian calendar applies.", "Variety, sizing and pack format are programme-selected."], "MEDIUM", "Whole yellow lemons with one cut half; neutral background and no packaging.", []),

  "produce:egyptian-lime": card("produce:egyptian-lime", "fresh", [
    assumed("productType", "Egyptian citrus lime; confirmed per buyer programme", "Exact commercial and botanical identity is not yet approved."),
    assumed("season", "Programme dependent", "No AGRICA-specific supply window is approved."),
    assumed("sizeCalibre", commonSizing, "AGRICA calibre range is not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "10–13°C", ["S09"]),
    researched("relativeHumidity", "90–95%", ["S09"]),
    researched("handling", "Protect from ethylene and chilling temperatures", ["S09"]),
  ], ["Product is treated as an Egyptian commercial lime type.", "Identity, season and commercial presentation are programme-selected."], "HIGH", "Green Egyptian citrus limes shown generically; avoid botanical captions and varietal cues.", ["Exact lime type"]),

  "produce:mandarin": card("produce:mandarin", "fresh", [
    researched("typicalEgyptianSeason", "October–April; cultivar dependent", ["S04", "S06"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA cultivars are not yet approved."),
    assumed("sizeCalibre", commonSizing, "AGRICA calibre range is not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "5–8°C", ["S10"]),
    researched("relativeHumidity", "90–95%", ["S10"]),
    researched("handling", "Cultivar and maturity determine the final handling programme", ["S10"]),
  ], ["Egyptian calendar applies.", "Cultivar, sizing and pack format are programme-selected."], "MEDIUM", "Whole mandarins with one naturally peeled fruit; no variety or pack implication.", []),

  "produce:grape": card("produce:grape", "fresh", [
    researched("typicalEgyptianExportWindow", "May–August; variety dependent", ["S05", "S06"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA grape varieties and colours are not yet approved."),
    assumed("berryBunchSpecification", "Buyer specification", "Berry and bunch tolerances are not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "−1 to 0°C with prompt cooling", ["S11"]),
    researched("relativeHumidity", "90–95%", ["S11"]),
    researched("handling", "Rapid cooling and gentle handling help protect berry and stem condition", ["S11"]),
  ], ["Egyptian export window applies.", "Variety, colour, berry specification and pack are programme-selected."], "MEDIUM", "Neutral bunches of export-quality table grapes; colour must be approved before production.", ["Grape colour and variety"]),

  "produce:pomegranate": card("produce:pomegranate", "fresh", [
    researched("typicalEgyptianSeason", "August–November; stored supply programme dependent", ["S06"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA varieties are not yet approved."),
    assumed("sizeCalibre", "Weight, count or diameter according to buyer specification", "AGRICA count and calibre are not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "Approximately 5–7°C, depending on programme duration", ["S12"]),
    researched("relativeHumidity", "90–95%", ["S12"]),
    researched("handling", "Protect from impact damage, water loss and shrivelling", ["S12"]),
  ], ["Egyptian calendar applies.", "Stored extension, variety, count and pack are programme-selected."], "MEDIUM", "Whole pomegranates with one opened fruit; avoid named-variety characteristics.", []),

  "produce:fresh-strawberry": card("produce:fresh-strawberry", "fresh", [
    researched("typicalEgyptianSeason", "November–April; programme dependent", ["S06", "S34"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA varieties are not yet approved."),
    assumed("sizeCalibre", commonSizing, "AGRICA calibre range is not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA punnet and carton formats are not yet approved."),
    researched("storage", "0 ± 0.5°C with prompt cooling", ["S13"]),
    researched("relativeHumidity", "90–95%", ["S13"]),
    researched("handling", "Rapid cooling and gentle handling are critical after harvest", ["S13"]),
  ], ["Egyptian calendar applies.", "Variety, calibre and pack are programme-selected."], "MEDIUM", "Fresh whole strawberries with natural size variation; no branded punnet.", []),

  "produce:blueberry": card("produce:blueberry", "fresh", [
    researched("productForm", "Fresh blueberries", ["S01"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA variety and active programme are not yet approved."),
    assumed("berryCalibre", "Buyer specification", "AGRICA berry calibre is not yet approved."),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "Approximately 0°C", ["S14"]),
    researched("relativeHumidity", "90–95%", ["S14"]),
    researched("handling", "Cool promptly and protect from crushing and moisture loss", ["S14"]),
  ], ["Card describes a potential fresh-blueberry programme without claiming availability, origin or season."], "HIGH", "Fresh loose blueberries in a neutral shallow tray; no origin or availability cues.", ["Active AGRICA blueberry programme"]),

  "produce:fresh-mango": card("produce:fresh-mango", "fresh", [
    researched("typicalEgyptianSeason", "July–November; variety dependent", ["S06"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA varieties are not yet approved."),
    assumed("sizeCalibre", "Fruit weight or size code according to buyer specification", "AGRICA size range is not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "Approximately 13°C for mature-green fruit and 10°C for ripe fruit", ["S15"]),
    researched("relativeHumidity", "90–95%", ["S15"]),
    assumed("dispatchMaturity", "Required ripeness at dispatch is confirmed per programme", "AGRICA dispatch-maturity options are not yet approved.", ["S15"]),
  ], ["Egyptian calendar applies.", "Variety, size, maturity and pack are programme-selected."], "MEDIUM", "Whole mangoes with one cut fruit; use a neutral colour profile until variety is confirmed.", ["Mango variety and skin colour"]),

  "produce:guava": card("produce:guava", "fresh", [
    researched("productForm", "Fresh guava", ["S01"]),
    assumed("variety", "Confirmed per buyer programme", "AGRICA variety and active programme are not yet approved."),
    assumed("dispatchMaturity", "Confirmed per buyer programme", "AGRICA dispatch maturity is not yet approved.", ["S16"]),
    assumed("sizeCalibre", "Buyer specification", "AGRICA size range is not yet approved."),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "8–10°C for mature-green or partly ripe fruit; 5–8°C for fully ripe fruit", ["S16"]),
    researched("relativeHumidity", "90–95%", ["S16"]),
  ], ["Card describes a potential fresh-guava programme without claiming origin, season or availability."], "HIGH", "Whole fresh guava with one cut fruit; avoid cultivar-specific skin colour.", ["Guava variety and active programme"]),

  "produce:date": card("produce:date", "fresh", [
    assumed("productStage", "Confirmed per buyer programme", "Khalal, Rutab or Tamar stage is not yet approved."),
    assumed("variety", "Confirmed per buyer programme", "AGRICA date varieties are not yet approved."),
    assumed("sizeCalibre", "Buyer specification", "AGRICA date size and count are not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "According to variety, moisture and maturity stage", ["S17"]),
    researched("handling", "Fresh, semi-dry and dried stages require different handling programmes", ["S17", "S35"]),
  ], ["Maturity stage, variety, moisture class and pack are programme-selected."], "HIGH", "Neutral date-fruit arrangement without a named variety or explicit maturity-stage caption.", ["Date variety and maturity stage"]),

  "produce:watermelon": card("produce:watermelon", "fresh", [
    researched("typicalEgyptianSeason", "April–October; programme dependent", ["S06"]),
    assumed("type", "Seeded or seedless according to buyer programme", "AGRICA seed status and varieties are not yet approved."),
    assumed("sizeCalibre", "Unit weight or count according to buyer specification", "AGRICA unit-weight range is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA presentation and pack formats are not yet approved."),
    researched("storage", "10–15°C", ["S18"]),
    researched("relativeHumidity", "85–90%", ["S18"]),
    researched("handling", "Protect from bruising and prolonged chilling", ["S18"]),
  ], ["Egyptian calendar applies.", "Seed status, unit weight and presentation are programme-selected."], "MEDIUM", "Whole watermelon with one cut section; avoid explicit seeded or seedless claims.", []),

  "produce:potato": card("produce:potato", "fresh", [
    assumed("intendedUse", "Table or processing according to programme", "AGRICA end-use programmes are not yet approved."),
    assumed("variety", "Confirmed per buyer programme", "AGRICA varieties are not yet approved."),
    assumed("cropWindow", "Confirmed per buyer programme", "A single AGRICA crop window is not yet approved.", ["S06", "S36"]),
    assumed("sizeCalibre", "Buyer specification", "AGRICA size range is not yet approved."),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "According to intended end use", ["S19"]),
    researched("buyerNote", "Variety, calibration and storage are matched to table, fry or crisp use", ["S19"]),
  ], ["Table or processing use, crop, variety, size and storage programme are order-specific."], "HIGH", "Neutral clean whole potatoes; end-use variety should be selected before final production.", ["Potato end use and variety"]),

  "produce:sweet-potato": card("produce:sweet-potato", "fresh", [
    researched("typicalEgyptianSeason", "July–April; programme dependent", ["S06"]),
    assumed("varietyColour", "Confirmed per buyer programme", "AGRICA varieties and skin/flesh colours are not yet approved."),
    assumed("sizeCalibre", "Weight, diameter or length according to buyer specification", "AGRICA size range is not yet approved."),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "12.5–15°C", ["S20"]),
    researched("relativeHumidity", "Above 90%", ["S20"]),
    researched("handling", "Protect cured roots from chilling, abrasion and impact damage", ["S20"]),
  ], ["Egyptian calendar applies.", "Skin/flesh colour, curing, sizing and pack are programme-selected."], "MEDIUM", "Whole roots with minimal exposed flesh; final flesh colour requires approval.", ["Sweet-potato skin and flesh colour"]),

  "produce:onion": card("produce:onion", "fresh", [
    assumed("productForm", "Cured dry bulb onions", "The current catalogue does not explicitly distinguish cured bulb onion from other forms."),
    researched("typicalEgyptianHarvest", "March–September; stored supply programme dependent", ["S06"]),
    assumed("colourType", "Confirmed per buyer programme", "AGRICA onion colours and types are not yet approved."),
    assumed("sizeCalibre", "Bulb diameter according to buyer specification", "AGRICA diameter range is not yet approved."),
    assumed("packFormat", "Ventilated format according to buyer specification", "AGRICA pack formats and weights are not yet approved.", ["S21"]),
    researched("storage", "Approximately 0°C", ["S21"]),
    researched("relativeHumidity", "65–70% with good ventilation", ["S21"]),
  ], ["Product is treated as cured dry bulb onion.", "Colour, crop, size and stored-supply status are programme-selected."], "MEDIUM", "Cured dry bulb onions; final red or yellow colour should follow the selected programme.", ["Onion colour"]),

  "produce:garlic": card("produce:garlic", "fresh", [
    assumed("productForm", "Fresh or cured bulbs according to programme", "AGRICA fresh/cured form is not yet approved."),
    researched("typicalEgyptianFreshSeason", "December–April; cured supply differs", ["S06"]),
    assumed("colourType", "Confirmed per buyer programme", "AGRICA type and colour are not yet approved."),
    assumed("sizeCalibre", "Bulb diameter and integrity according to buyer specification", "AGRICA size and quality tolerances are not yet approved."),
    assumed("packFormat", "Ventilated format according to buyer specification", "AGRICA pack formats and weights are not yet approved.", ["S22"]),
    researched("storage", "−1 to 0°C", ["S22"]),
    researched("relativeHumidity", "60–70% with good ventilation", ["S22"]),
  ], ["Fresh/cured form, colour and commercial type are programme-selected."], "MEDIUM", "Whole intact garlic bulbs with one separated clove; neutral type and no packaging.", []),

  "produce:fresh-green-bean": card("produce:fresh-green-bean", "fresh", [
    researched("typicalEgyptianSeason", "October–June; programme dependent", ["S06"]),
    assumed("type", "Fine, round or flat-pod type according to programme", "AGRICA bean types are not yet approved."),
    assumed("calibre", "Pod width and length according to buyer specification", "AGRICA pod calibre is not yet approved."),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "5–7.5°C", ["S23"]),
    researched("relativeHumidity", "95–100%", ["S23"]),
    researched("handling", "Protect from water loss and prolonged chilling", ["S23"]),
  ], ["Egyptian calendar applies.", "Bean type, pod calibre and pack are programme-selected."], "MEDIUM", "Fresh loose green pods with natural variation; no exact calibre reference.", []),

  "produce:fresh-artichoke": card("produce:fresh-artichoke", "fresh", [
    assumed("productForm", "Whole globe artichokes", "Whole globe form is inferred from the fresh-product identity."),
    researched("typicalEgyptianSeason", "November–May; programme dependent", ["S06"]),
    assumed("sizeCalibre", "Bud diameter or count according to buyer specification", "AGRICA bud calibre is not yet approved."),
    assumed("qualitySpecification", "Compactness, stem and defect tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S02"]),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "Approximately 0°C", ["S24"]),
    researched("relativeHumidity", "Above 95%", ["S24"]),
  ], ["Product is treated as whole globe artichoke.", "Calibre, stem and quality tolerances are programme-selected."], "MEDIUM", "Whole globe artichokes; no processed hearts or bottoms.", []),

  "produce:carrot": card("produce:carrot", "fresh", [
    assumed("productForm", "Topped, bunched or washed according to programme", "AGRICA preparation forms are not yet approved."),
    researched("typicalEgyptianSeason", "December–May; programme dependent", ["S06"]),
    assumed("sizeCalibre", "Diameter, weight or length according to buyer specification", "AGRICA size range is not yet approved."),
    assumed("packFormat", commonPack, "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "Approximately 0°C", ["S25"]),
    researched("relativeHumidity", "98–100%", ["S25"]),
    researched("handling", "Keep away from ethylene-producing commodities", ["S25"]),
  ], ["Egyptian calendar applies.", "Preparation form, calibration and pack are programme-selected."], "MEDIUM", "Neutral topped carrots; avoid bunch or washed-pack presentation until approved.", ["Carrot preparation form"]),

  "produce:taro": card("produce:taro", "fresh", [
    assumed("productForm", "Whole corms or cormels according to programme", "AGRICA corm/cormel form and species are not yet approved."),
    researched("typicalEgyptianSeason", "September–March; programme dependent", ["S06"]),
    assumed("sizeCalibre", "Unit weight or diameter according to buyer specification", "AGRICA size range is not yet approved."),
    assumed("packFormat", "Ventilated format according to buyer specification", "AGRICA pack formats and weights are not yet approved."),
    researched("storage", "7–10°C", ["S26"]),
    researched("relativeHumidity", "80–95%", ["S26"]),
    researched("handling", "Protect from cuts, impact damage and chilling", ["S26"]),
  ], ["Whole corm/cormel form and commercial species are programme-selected."], "MEDIUM", "Whole clean taro corms; no botanical or variety label.", ["Taro species and commercial form"]),

  "produce:iqf-strawberry": card("produce:iqf-strawberry", "frozen", [
    assumed("productForm", "Confirmed per buyer programme", "Exact whole or cut form is not yet approved."),
    assumed("cutCalibration", "Buyer specification", "AGRICA cut and calibration are not yet approved."),
    assumed("preparation", productPreparation, "AGRICA processing specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27"]),
    assumed("buyerSpecification", "Berry integrity, colour, clumping, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S27"]),
  ], ["Exact whole/cut form, preparation, calibration and pack are programme-selected."], "MEDIUM", "Frosted strawberry material without a calibrated cut claim; final form must match the programme.", ["IQF strawberry form"]),

  "produce:iqf-mango": card("produce:iqf-mango", "frozen", [
    assumed("productForm", "Confirmed per buyer programme", "Exact cut form is not yet approved."),
    assumed("cutCalibration", "Buyer specification", "AGRICA cut dimensions are not yet approved."),
    assumed("preparation", productPreparation, "AGRICA processing specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27"]),
    assumed("buyerSpecification", "Cut dimensions, colour, maturity, fibre, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S27"]),
  ], ["Exact cut, dimensions, maturity, preparation and pack are programme-selected."], "MEDIUM", "Frosted mango pieces with non-calibrated dimensions; no exact cut claim.", ["IQF mango cut and colour"]),

  "produce:iqf-pomegranate-arils": card("produce:iqf-pomegranate-arils", "frozen", [
    researched("productForm", "Individually frozen pomegranate arils", ["S01", "S27"]),
    assumed("calibre", "Buyer specification", "AGRICA aril calibration is not yet approved."),
    assumed("preparation", productPreparation, "AGRICA processing specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27"]),
    assumed("buyerSpecification", "Aril integrity, colour, membrane, leakage, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S27"]),
  ], ["Calibration, preparation and pack are programme-selected."], "MEDIUM", "Individually frozen loose arils with light natural frost; no packaging.", []),

  "produce:iqf-green-bean": card("produce:iqf-green-bean", "frozen", [
    assumed("productForm", "Whole or cut according to buyer programme", "Exact whole or cut form is not yet approved."),
    assumed("cutCalibration", "Pod calibre and cut length according to buyer specification", "AGRICA calibre and cut are not yet approved."),
    assumed("preparation", productPreparation, "AGRICA trimming and blanching specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27", "S28"]),
    assumed("buyerSpecification", "Colour, ends, strings, broken pieces, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S28"]),
  ], ["Whole/cut form, calibre, preparation and pack are programme-selected."], "MEDIUM", "Frosted green-bean material; final whole or cut form requires approval.", ["IQF green-bean form"]),

  "produce:iqf-green-pea": card("produce:iqf-green-pea", "frozen", [
    assumed("productForm", "Whole green peas according to buyer programme", "Whole-pea form is inferred from the product identity."),
    assumed("calibre", "Buyer specification", "AGRICA pea calibration is not yet approved."),
    assumed("preparation", productPreparation, "AGRICA blanching specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27", "S28"]),
    assumed("buyerSpecification", "Maturity, tenderness, colour, clumping, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S28"]),
  ], ["Whole-pea form, calibration, preparation and pack are programme-selected."], "MEDIUM", "Loose individually frozen green peas with natural size variation.", []),

  "produce:iqf-okra": card("produce:iqf-okra", "frozen", [
    assumed("productForm", "Whole or cut according to buyer programme", "Exact whole or cut form is not yet approved."),
    assumed("cutCalibration", "Pod calibre or cut length according to buyer specification", "AGRICA calibre and cut are not yet approved."),
    assumed("preparation", productPreparation, "AGRICA trimming and blanching specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27", "S28"]),
    assumed("buyerSpecification", "Colour, fibre, stem, broken pieces, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S28"]),
  ], ["Whole/cut form, pod calibre, stem trim, preparation and pack are programme-selected."], "MEDIUM", "Frosted okra material; final whole or cut form and calibre require approval.", ["IQF okra form and calibre"]),

  "produce:iqf-molokhia": card("produce:iqf-molokhia", "frozen", [
    assumed("productForm", "Whole leaf or chopped according to buyer programme", "Exact whole-leaf or chopped form is not yet approved."),
    assumed("leafCutSpecification", "Buyer specification", "AGRICA leaf or chop dimensions are not yet approved."),
    assumed("preparation", productPreparation, "AGRICA processing specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27"]),
    assumed("buyerSpecification", "Colour, stem content, texture, foreign matter and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S27"]),
  ], ["Whole-leaf/chopped form, preparation and pack are programme-selected."], "HIGH", "Frozen molokhia texture without implying a whole-leaf or chopped retail format.", ["Whole-leaf or chopped form"]),

  "produce:iqf-artichoke": card("produce:iqf-artichoke", "frozen", [
    assumed("productForm", "Hearts, bottoms, quarters or pieces according to buyer programme", "The wording describes possible specification categories, not a confirmed offered range."),
    assumed("calibre", "Buyer specification", "AGRICA calibration is not yet approved."),
    assumed("preparation", productPreparation, "AGRICA trimming and processing specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27", "S28"]),
    assumed("buyerSpecification", "Trim, fibre, colour, broken pieces, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S28"]),
  ], ["Hearts, bottoms, quarters or pieces are specification categories, not a claimed offered range."], "HIGH", "Frosted artichoke material cropped to avoid asserting a specific commercial style.", ["IQF artichoke form"]),

  "produce:iqf-broccoli": card("produce:iqf-broccoli", "frozen", [
    assumed("productForm", "Florets or cuts according to buyer programme", "Exact floret or cut style is not yet approved."),
    assumed("calibre", "Floret and stem dimensions according to buyer specification", "AGRICA calibration is not yet approved."),
    assumed("preparation", productPreparation, "AGRICA trimming and blanching specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27", "S28"]),
    assumed("buyerSpecification", "Colour, stem ratio, fines, defects and tolerances agreed per programme", "AGRICA quality tolerances are not yet approved.", ["S28"]),
  ], ["Floret/cut form, calibration, preparation and pack are programme-selected."], "MEDIUM", "Individually frozen broccoli pieces; exact floret and stem calibration should remain indistinct.", ["IQF broccoli form"]),

  "produce:mixed-vegetables": card("produce:mixed-vegetables", "frozen", [
    assumed("productComposition", "Blend according to buyer programme", "No AGRICA recipe is yet approved."),
    assumed("componentCalibration", "Buyer specification", "Component cuts and calibration are not yet approved."),
    assumed("preparation", "According to agreed product specification", "AGRICA preparation specification is not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27", "S28"]),
    assumed("buyerNote", "Final component ratio and cuts are confirmed before order", "Recipe and component ratios are not yet approved."),
  ], ["Recipe, proportions, cuts, preparation and pack are entirely programme-selected."], "HIGH", "Do not produce until the blend is selected; any visible recipe would become a product claim.", ["Complete mixed-vegetable recipe"]),

  "produce:half-fried-french-fries": card("produce:half-fried-french-fries", "frozen", [
    assumed("productForm", "Pre-fried frozen potato fries", "Pre-fried identity follows the approved professional naming decision."),
    assumed("cut", "Buyer specification", "AGRICA fry cut is not yet approved."),
    assumed("potatoSpecification", "According to buyer programme", "AGRICA potato variety and raw-material specification are not yet approved."),
    assumed("processing", "Oil and coating specification confirmed per programme", "AGRICA oil, coating and additive details are not yet approved."),
    assumed("packFormat", buyerPack, "AGRICA pack formats and weights are not yet approved."),
    researched("frozenStorage", frozenStorage, ["S27"]),
    assumed("buyerSpecification", "Colour, defects, texture and cooking-performance criteria agreed per programme", "AGRICA quality and cooking tolerances are not yet approved."),
  ], ["Pre-fried identity, cut, potato, oil, coating, preparation and pack require client review."], "HIGH", "Neutral frozen pre-fried potato fries; avoid measurable cut dimensions or branded packaging.", ["Fry cut and processing specification"], "Pre-fried Frozen French Fries"),

  "produce:dried-lemon": card("produce:dried-lemon", "dried", [
    assumed("productForm", "Confirmed per buyer programme", "Exact whole, sliced, peel or powder form is not yet approved."),
    assumed("cutSize", "Buyer specification", "AGRICA cut and size are not yet approved."),
    assumed("treatment", productPreparation, "AGRICA drying and treatment specification is not yet approved."),
    assumed("packFormat", driedPack, "AGRICA pack formats and weights are not yet approved.", ["S30"]),
    researched("storage", driedStorage, ["S30"]),
    assumed("buyerSpecification", "Moisture, colour, defects, foreign matter and other limits agreed per programme", "AGRICA quality limits are not yet approved.", ["S30"]),
  ], ["Exact citrus type, whole/cut form, treatment and pack are programme-selected."], "HIGH", "Dried citrus material without a varietal label; exact whole or sliced form should be approved first.", ["Dried-lemon form"]),

  "produce:raisin": card("produce:raisin", "dried", [
    assumed("productType", "Confirmed per buyer programme", "Variety, colour and seed status are not yet approved."),
    assumed("sizeCount", "Buyer specification", "AGRICA raisin size or count is not yet approved."),
    assumed("treatment", productPreparation, "AGRICA oil, sulphur and coating status are not yet approved."),
    assumed("packFormat", driedPack, "AGRICA pack formats and weights are not yet approved.", ["S29", "S30"]),
    researched("storage", "Cool, dry and protected from moisture and strong odours", ["S29", "S30"]),
    assumed("buyerSpecification", "Moisture, stems, defects, foreign matter and other limits agreed per programme", "AGRICA quality limits are not yet approved.", ["S29"]),
  ], ["Variety, colour, seed status, size, treatment and pack are programme-selected."], "HIGH", "Loose neutral raisins; final colour, size and seed status require approval.", ["Raisin colour and style"]),

  "produce:sun-dried-tomato": card("produce:sun-dried-tomato", "dried", [
    assumed("productForm", "Confirmed per buyer programme", "Exact halves, strips, pieces or other form is not yet approved."),
    assumed("cutSize", "Buyer specification", "AGRICA cut and size are not yet approved."),
    assumed("treatment", productPreparation, "AGRICA salt, oil, sulphite and ingredient specification is not yet approved."),
    assumed("packFormat", driedPack, "Dry-packed or oil-packed identity and packaging are not yet approved.", ["S31"]),
    assumed("storage", "According to the final moisture, ingredients and packaging system", "Storage depends on unapproved dry/oil-packed identity.", ["S31"]),
    assumed("buyerSpecification", "Moisture, colour, ingredients, defects and other limits agreed per programme", "AGRICA quality and ingredient limits are not yet approved.", ["S31"]),
  ], ["Cut, dry/oil-packed state, treatment, ingredients and pack are programme-selected."], "HIGH", "Dried tomato material without oil, herbs or packaging; final form requires approval.", ["Dry-packed or oil-packed form"]),

  "produce:dehydrated-onion": card("produce:dehydrated-onion", "dried", [
    assumed("productForm", "Confirmed per buyer programme", "Exact flake, granule, minced or powder form is not yet approved."),
    assumed("particleSize", "Buyer specification", "AGRICA sieve or dimensional specification is not yet approved."),
    assumed("treatment", productPreparation, "AGRICA additives and processing aids are not yet approved."),
    assumed("packFormat", driedBarrierPack, "AGRICA pack formats and weights are not yet approved.", ["S32"]),
    researched("storage", driedStorage, ["S30", "S32"]),
    assumed("buyerSpecification", "Moisture, colour, particle size, foreign matter and other limits agreed per programme", "AGRICA quality and microbiological limits are not yet approved.", ["S32"]),
  ], ["Commercial form, particle size, treatment and pack are programme-selected."], "HIGH", "Neutral dehydrated onion material; final flakes, granules or powder form must be selected.", ["Dehydrated-onion form"]),

  "produce:dehydrated-garlic": card("produce:dehydrated-garlic", "dried", [
    assumed("productForm", "Confirmed per buyer programme", "Exact flake, granule, minced or powder form is not yet approved."),
    assumed("particleSize", "Buyer specification", "AGRICA sieve or dimensional specification is not yet approved."),
    assumed("treatment", productPreparation, "AGRICA additives and processing aids are not yet approved."),
    assumed("packFormat", driedBarrierPack, "AGRICA pack formats and weights are not yet approved.", ["S33"]),
    researched("storage", driedStorage, ["S30", "S33"]),
    assumed("buyerSpecification", "Moisture, colour, particle size, foreign matter and other limits agreed per programme", "AGRICA quality and microbiological limits are not yet approved.", ["S33"]),
  ], ["Commercial form, particle size, treatment and pack are programme-selected."], "HIGH", "Neutral dehydrated garlic material; final flakes, granules or powder form must be selected.", ["Dehydrated-garlic form"]),

  "produce:dried-molokhia": card("produce:dried-molokhia", "dried", [
    assumed("productForm", "Confirmed per buyer programme", "Exact whole-leaf, crushed or powder form is not yet approved."),
    assumed("leafParticleSize", "Buyer specification", "AGRICA leaf or particle-size specification is not yet approved."),
    assumed("preparation", productPreparation, "AGRICA stem removal, drying and milling specification is not yet approved."),
    assumed("packFormat", driedBarrierPack, "AGRICA pack formats and weights are not yet approved.", ["S30"]),
    researched("storage", driedStorage, ["S30"]),
    assumed("buyerSpecification", "Colour, stems, particle size, foreign matter and other limits agreed per programme", "AGRICA quality and microbiological limits are not yet approved.", ["S30"]),
  ], ["Whole/crushed/powder form, species, preparation and pack are programme-selected."], "HIGH", "Dried molokhia material without implying whole leaf, crushed leaf or powder as the offered form.", ["Dried-molokhia form"]),
};

export const PUBLIC_PRODUCT_CARD_CONTENT: Readonly<Record<string, PublicProductCardContent>> =
  Object.fromEntries(
    Object.values(PRODUCT_CARD_CONTENT).map((content) => [
      content.productId,
      {
        productId: content.productId,
        ...(content.publicName ? { publicName: content.publicName } : {}),
        category: content.category,
        fields: content.fields.map(({ labelKey, value, displayOrder }) => ({
          labelKey,
          value,
          displayOrder,
        })),
      },
    ]),
  );

export function getPublicProductCardContent(productId: ProduceProductId): PublicProductCardContent {
  const content = PUBLIC_PRODUCT_CARD_CONTENT[productId];
  if (!content) throw new Error(`Missing finalized product-card content for ${productId}`);
  return content;
}
