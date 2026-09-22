import type { Dictionary } from "../../types";
import common from "./common";
import { homeDictionary, productsDictionary, herbsSpicesDictionary } from "@/content/page-dictionaries";
import { standardDictionary } from "@/content/standard/dictionaries";

const dictionary = {
  common,
  home: homeDictionary("en"),
  products: productsDictionary("en"),
  standard: standardDictionary("en"),
  herbsSpices: herbsSpicesDictionary("en"),
} satisfies Dictionary;

export default dictionary;
