// Lessons for this track. Conventions: see regression.js and CLAUDE.md.
const r = String.raw;
module.exports = [
  // ------------------------------------------------------------------ Lesson 1
  {
  id: 'text-normalisation-unicode-and-regex',
  short: 'Normalisation & Regex',
  title: 'Text normalisation, Unicode and regex',
  task: 'concepts',
  module: '1 · Words and text',
  level: 1,
  minutes: 14,
  noLab: true,
  summary: r`Raw unstructured text is fraught with encoding inconsistencies, non-standard whitespace, varying case representations, and visual homoglyphs. Text normalisation transforms raw character sequences into consistent canonical representations prior to tokenisation and language modelling. By mastering Unicode standardisation forms (NFC, NFD, NFKC, NFKD) to resolve visually identical glyph representations, deploying case folding to consolidate vocabularies, and using declarative regular expressions (regex) to strip noise and extract structured patterns (dates, URLs, phone numbers, monetary figures), natural language pipelines eliminate spurious out-of-vocabulary tokens and stabilise downstream model convergence.`,
  lead: r`To human eyes, the word "café" written with a precomposed acute accent character (U+00E9) looks indistinguishable from "cafe" followed by a combining acute accent (U+0065 U+0301). Yet to a computer or neural embedding layer, these represent completely different byte sequences and hash to distinct dictionary entries. A web scraper collecting user comments will encounter curly quotes, non-breaking spaces, emoticons, multiple exclamation marks, and mixed encodings. Before an algorithm can parse syntax or learn semantic embeddings, it must normalise text into clean, canonical strings.`,
  intuition: [
    r`The Unicode standard and canonical equivalence: The Unicode consortium assigns a unique code point (e.g. U+0041 for 'A') to every character across human writing systems. However, historical design compromises created multiple representations for identical glyphs: a character with an accent can be stored as a single "precomposed" code point (e.g. 'é' as U+00E9) or as a base character followed by a "combining" accent mark ('e' + '´' as U+0065 U+0301). Canonical equivalence establishes that these represent the exact same abstract character. Without Unicode normalisation, string equality tests ('é' == 'e\u0301') fail, splitting model vocabularies in two.`,
    r`The four Unicode normalisation forms: Unicode standardises four normalisation algorithms: normalisation Form D (NFD, canonical decomposition, separating accents into combining marks); normalisation Form C (NFC, canonical decomposition followed by canonical composition, standardising on precomposed characters); normalisation Form KD (NFKD, compatibility decomposition); and normalisation Form KC (NFKC, compatibility decomposition followed by composition). While NFC is the web and Linux standard, compatibility forms (NFKC/NFKD) resolve typographical formatting variants—folding superscript numbers ($2^5 \to 25$), ligature glyphs ('ﬁ' $\to$ 'fi'), and full-width Asian characters into standard ASCII equivalents.`,
    r`Case folding and vocabulary compression: In natural language processing, distinguishing "Apple" (the technology company) from "apple" (the fruit) requires case sensitivity; however, for many information retrieval and sentiment analysis tasks, treating "The", "the", and "THE" as three separate vocabulary tokens increases parameter memory and fragments statistical counts. Lowercasing reduces vocabulary size. In international text, standard lowercasing is insufficient: German 'ß' lowercases to 'ß', but case folding transforms it to 'ss' (allowing 'GROSS' to match 'groß'). Unicode case folding provides language-agnostic character parity.`,
    r`Pattern extraction and noise filtering via Regular Expressions: Once text is canonically encoded, regular expressions (regex) provide a declarative finite-state engine for syntactic pattern matching and text sanitisation. Regex enables removing HTML tags (<[^>]+>), collapsing runs of whitespace (\s+ to single space), stripping control characters, and extracting structured semantic tokens (such as URLs, email addresses, and monetary currencies) before feeding clean text into subword tokenisers like BPE or WordPiece.`,
  ],
  analogy: r`Imagine a postal sorting depot receiving millions of handwritten envelopes every morning. Some senders write "NEW YORK", others write "new york", and some write "New York". Some use fountain pens with sharp accents; others tape printed address labels with typographic ligatures; others leave messy coffee cup stains (HTML tags and control codes). If the sorting machine treats every minor typographic quirk as a completely new city destination, it would need twenty thousand distinct mail sorting bins for New York alone. Text normalisation is like the initial automated intake scanner: it flattens case to canonical lowercase, strips stray postal tape marks, normalises accented characters into standard regional spellings, and cleans excess spaces. All twenty variations drop into a single, clean "new york" sorting bin with zero postal confusion.`,
  steps: [
    {
      title: r`Apply Unicode canonical normalisation`,
      desc: r`Transform diverse byte encodings into standard NFC or NFKC representations.`,
      detail: r`Pass raw text through unicodedata.normalise('NFKC', text). NFKC performs compatibility decomposition followed by canonical composition, converting ligatures (such as 'ﬁ' to 'f' and 'i'), full-width characters, and combining accent marks into their standard canonical forms.`,
    },
    {
      title: r`Execute language-aware case folding`,
      desc: r`Convert text to lowercase using Unicode case folding rather than naive ASCII lowercasing.`,
      detail: r`Use str.casefold() rather than str.lower(). Case folding handles complex multilingual character conversions (such as transforming German 'ß' into 'ss' and resolving Greek uppercase sigma variations), ensuring true linguistic parity.`,
    },
    {
      title: r`Sanitise whitespace and remove non-printing control codes`,
      desc: r`Strip non-breaking spaces, zero-width characters, and collapse redundant spacing.`,
      detail: r`Replace non-breaking spaces (\u00A0) and zero-width joiners (\u200B) with standard spaces. Use regular expressions re.sub(r'\s+', ' ', text).strip() to collapse multiple consecutive space and newline characters into single spaces.`,
    },
    {
      title: r`Filter noise and extract structured entities via regex`,
      desc: r`Identify and protect domain-specific semantic patterns (URLs, emails, numbers).`,
      detail: r`Before applying destructive punctuation stripping, extract or mask structured entities using regular expression patterns: URLs (https?://\S+), email addresses ([\w\.-]+@[\w\.-]+\.\w+), and phone numbers. Replace them with special domain tokens (<URL>, <EMAIL>) to preserve semantic signal.`,
    },
    {
      title: r`Strip unwanted punctuation and accents`,
      desc: r`Optionally strip diacritical marks and special punctuation for search indexing.`,
      detail: r`To strip accents for search indexing, decompose using NFD and filter out combining characters: ''.join(c for c in unicodedata.normalise('NFD', text) if unicodedata.category(c) != 'Mn'). Remove non-alphanumeric punctuation while preserving intra-word hyphens and apostrophes where appropriate.`,
    },
  ],
  math: [
    {
      h: r`Unicode canonical equivalence condition`,
      tex: r`S_1 \equiv_{\text{canonical}} S_2 \iff \operatorname{NFD}(S_1) = \operatorname{NFD}(S_2)`,
      p: r`Two character sequences $S_1$ and $S_2$ are canonically equivalent if and only if their normalisation Form D (NFD) decompositions yield identical sequences of Unicode code points.`,
    },
    {
      h: r`Unicode compatibility equivalence condition`,
      tex: r`S_1 \equiv_{\text{compatibility}} S_2 \iff \operatorname{NFKD}(S_1) = \operatorname{NFKD}(S_2)`,
      p: r`Compatibility equivalence is a weaker relation that equates characters representing the same abstract meaning but possessing distinct visual typography (such as ligature 'ﬁ' $\equiv$ 'f' + 'i', or circled digit '①' $\equiv$ '1'). normalisation Form KC (NFKC) composes compatibility decompositions into canonical precomposed characters.`,
    },
    {
      h: r`Vocabulary reduction ratio`,
      tex: r`\rho_{\text{vocab}} = 1 - \frac{|V_{\text{norm}}|}{|V_{\text{raw}}|}, \quad \text{OOV Rate} = \frac{N_{\text{unseen}}}{N_{\text{total\_tokens}}}`,
      p: r`Normalising casing and Unicode representations dramatically compresses vocabulary size $|V|$, reducing embedding table parameter memory while lowering the Out-Of-Vocabulary (OOV) rate on unseen test text.`,
    },
  ],
  keyPoints: [
    r`Text normalisation converts noisy, unstructured text into clean canonical strings prior to tokenisation.`,
    r`Unicode characters can have multiple encodings; NFC and NFKC standardise precomposed and compatibility glyphs.`,
    r`Case folding (str.casefold()) provides linguistically accurate casing parity across multilingual scripts beyond simple ASCII lowercasing.`,
    r`Regular expressions enable declarative pattern extraction (URLs, emails, dates) and whitespace sanitisation.`,
    r`Normalisation compresses vocabulary size and slashes Out-Of-Vocabulary (OOV) rates in downstream language models.`,
  ],
  pitfalls: [
    r`Stripping accents when language meaning depends on them: In languages like Spanish or French, stripping accents alters lexical meaning ('año' = year vs 'ano' = anus; 'pêche' = peach/fishing vs 'péché' = sin); only strip accents when building broad search indexes.`,
    r`Using naive str.lower() instead of str.casefold(): Standard lowercasing fails on multilingual characters like German 'ß' or Turkish 'I/ı', creating subtle search and tokenisation bugs.`,
    r`Running regex punctuation stripping before URL/email extraction: Naively removing punctuation like dots and slashes destroys URLs and email addresses before they can be parsed or tokenised.`,
    r`Over-normalising numbers and dates: Replacing all numbers with a generic <NUM> token in financial or legal models destroys crucial numerical values; use tailored tokenisation where numerical magnitude matters.`,
    r`Inconsistent normalisation between training and inference: If training data is normalised using NFKC lowercasing but live inference receives un-normalised raw Unicode, tokenisers produce disjoint embeddings and broken predictions.`,
  ],
  code: r`import unicodedata
import re

# 1. Unicode Normalisation demonstration: Resolving visual homoglyphs
# Precomposed 'e' with acute accent (U+00E9) vs decomposed 'e' + combining acute (U+0065, U+0301)
str1 = "café"                  # Precomposed: '\u0063\u0061\u0066\u00e9'
str2 = "cafe\u0301"             # Decomposed:  '\u0063\u0061\u0066\u0065\u0301'

print("Raw Unicode comparison:")
print(f"str1 ('{str1}') length: {len(str1)}, bytes: {[ord(c) for c in str1]}")
print(f"str2 ('{str2}') length: {len(str2)}, bytes: {[ord(c) for c in str2]}")
print(f"Direct string equality (str1 == str2): {str1 == str2} (FAILS without normalisation)")

# Normalise using NFC (Canonical Composition)
norm1 = unicodedata.normalise('NFC', str1)
norm2 = unicodedata.normalise('NFC', str2)
print(f"After NFC normalisation (norm1 == norm2): {norm1 == norm2} (MATCHES!)\n")

# 2. Resolving Typographic Ligatures with NFKC
# Typographic ligature 'fi' (U+FB01) vs separate letters 'f' and 'i'
ligature_str = "The scientific ﬁnding"
nfkc_str = unicodedata.normalise('NFKC', ligature_str)
print(f"Raw ligature string:   '{ligature_str}' (length {len(ligature_str)})")
print(f"After NFKC normalisation: '{nfkc_str}' (length {len(nfkc_str)}, 'ﬁ' split to 'f'+'i')\n")

# 3. Unicode Case Folding
german_text = "Der Fluss ist GROSS"
casefolded = german_text.casefold()
print(f"Raw German text:       '{german_text}'")
print(f"After casefold():      '{casefolded}' ('GROSS' correctly matches 'gross')\n")

# 4. Regex Pattern Masking and Noise Sanitisation
raw_corpus = "Contact support@example.com or visit https://ai.example.org/help!  Price:   £150.00   (tax-free)."

# Extract structured entities before cleaning
url_pattern = r'https?://\S+'
email_pattern = r'[\w\.-]+@[\w\.-]+\.\w+'

urls_found = re.findall(url_pattern, raw_corpus)
emails_found = re.findall(email_pattern, raw_corpus)

# Replace structured entities with semantic tokens
clean_text = re.sub(url_pattern, '<URL>', raw_corpus)
clean_text = re.sub(email_pattern, '<EMAIL>', clean_text)

# Collapse redundant whitespace
clean_text = re.sub(r'\s+', ' ', clean_text).strip()

print("Regex Pipeline Results:")
print(f"Extracted URLs:   {urls_found}")
print(f"Extracted Emails: {emails_found}")
print(f"Sanitised Text:   '{clean_text}'")`,
  quiz: [
    {
      q: r`Why does direct string equality ('café' == 'cafe\u0301') evaluate to False in Python without Unicode normalisation?`,
      o: [
        r`Because Python compares character code points sequentially; the precomposed 'é' is a single code point (U+00E9), whereas decomposed 'e\u0301' is two separate code points (U+0065 and U+0301)`,
        r`Because Python converts strings to integers before comparison`,
        r`Because acute accents cannot be stored in UTF-8`,
        r`Because the string length exceeds 256 bytes`,
      ],
      a: 0,
      why: r`Unicode allows canonical equivalence: precomposed 'é' (U+00E9) and decomposed 'e' + combining accent (U+0065 U+0301) represent identical glyphs, but represent different byte code point sequences. Normalising with NFC or NFD standardises the representation.`,
    },
    {
      q: r`What is the difference between Unicode normalisation Form C (NFC) and normalisation Form KC (NFKC)?`,
      o: [
        r`NFC decomposes and recomposes canonical equivalents only; NFKC also decomposes compatibility variants (such as splitting ligatures 'ﬁ' into 'fi' and formatting superscripts $2^5 \to 25$)`,
        r`NFC is for English text, while NFKC is for Asian text`,
        r`NFC deletes all vowels, while NFKC preserves them`,
        r`NFKC is only available on 64-bit operating systems`,
      ],
      a: 0,
      why: r`Canonical equivalence (NFC) preserves visual glyph integrity (accents). Compatibility equivalence (NFKC) goes further, folding stylistic variants—such as ligatures ('ﬁ' $\to$ 'fi'), circled numbers, and fractions—into standard alphanumeric characters.`,
    },
    {
      q: r`Why is str.casefold() preferred over str.lower() when preparing multilingual text for natural language processing?`,
      o: [
        r`str.casefold() implements full Unicode case folding, correctly mapping complex multilingual characters (such as German 'ß' to 'ss') where simple lowercasing fails to establish equivalence`,
        r`str.casefold() executes 10 times faster than str.lower()`,
        r`str.casefold() strips all punctuation from the string`,
        r`str.lower() only works on ASCII characters below code point 128`,
      ],
      a: 0,
      why: r`Lowercasing German 'ß' leaves it unchanged as 'ß', which fails to match lowercase 'ss' in 'GROSS'. Case folding maps both to 'ss', establishing true linguistic equality across diverse languages.`,
    },
    {
      q: r`Why should structured entities (such as URLs and email addresses) be identified and masked with regex before general punctuation removal?`,
      o: [
        r`Because generic punctuation stripping removes periods, slashes, and colons, obliterating the syntactic structure of URLs and emails before they can be extracted`,
        r`Because regex cannot process strings that contain spaces`,
        r`Because URLs cause memory overflow in Python dictionaries`,
        r`Because tokenisers crash when processing punctuation`,
      ],
      a: 0,
      why: r`URLs and email addresses depend heavily on punctuation (://, ., @). If a pipeline strips punctuation first, 'https://example.com/login' is mutilated into 'https example com login', losing its semantic identity.`,
    },
  ],
  usedBy: [],
  prereq: ['exploratory-data-analysis'],
  related: ['tokenization', 'data-cleaning-and-validation', 'exploratory-data-analysis'],
  keywords: 'text normalisation unicode regex regular expressions nfc nfd nfkc nfkd case folding ligatures sanitisation tokenisation nlp preprocessing',
},
];
