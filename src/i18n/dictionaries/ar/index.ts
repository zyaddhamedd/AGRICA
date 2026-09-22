import type { Dictionary } from "../../types";
import common from "./common";
import { homeDictionary, productsDictionary, herbsSpicesDictionary } from "@/content/page-dictionaries";
import { standardDictionary } from "@/content/standard/dictionaries";

const dictionary = {
  common,
  home: homeDictionary("ar"),
  products: productsDictionary("ar"),
  standard: standardDictionary("ar"),
  herbsSpices: herbsSpicesDictionary("ar"),
} satisfies Dictionary;

export default dictionary;
