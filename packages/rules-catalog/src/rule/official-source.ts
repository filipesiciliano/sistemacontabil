/** Official normative source backing a rule (law, complementary law, resolution, manual). */
export interface OfficialSource {
  readonly title: string;
  /** Article, annex, item or section inside the document. */
  readonly reference: string;
  readonly url?: string;
}
