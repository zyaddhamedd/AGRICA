import type { Dictionary } from "../../types";
import common from "./common";
import { homeDictionary, productsDictionary, herbsSpicesDictionary } from "@/content/page-dictionaries";
import { standardDictionary } from "@/content/standard/dictionaries";

const dictionary = {
  common,
  home: homeDictionary("fr"),
  products: productsDictionary("fr"),
  standard: standardDictionary("fr"),
  herbsSpices: herbsSpicesDictionary("fr"),
} satisfies Dictionary;

export default dictionary;
