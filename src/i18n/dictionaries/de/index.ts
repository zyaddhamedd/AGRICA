import type { Dictionary } from "../../types";
import common from "./common";
import { homeDictionary, productsDictionary, herbsSpicesDictionary } from "@/content/page-dictionaries";
import { standardDictionary } from "@/content/standard/dictionaries";

const dictionary = {
  common,
  home: homeDictionary("de"),
  products: productsDictionary("de"),
  standard: standardDictionary("de"),
  herbsSpices: herbsSpicesDictionary("de"),
} satisfies Dictionary;

export default dictionary;
