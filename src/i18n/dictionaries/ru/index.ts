import type { Dictionary } from "../../types";
import common from "./common";
import { homeDictionary, productsDictionary, herbsSpicesDictionary } from "@/content/page-dictionaries";
import { standardDictionary } from "@/content/standard/dictionaries";

const dictionary = {
  common,
  home: homeDictionary("ru"),
  products: productsDictionary("ru"),
  standard: standardDictionary("ru"),
  herbsSpices: herbsSpicesDictionary("ru"),
} satisfies Dictionary;

export default dictionary;
