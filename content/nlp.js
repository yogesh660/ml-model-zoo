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

  // ------------------------------------------------------------------ Lesson 2
{
  id: 'word-and-sentence-tokenization',
  short: 'Word & Sentence Tokenization',
  title: 'Word and sentence tokenization',
  task: 'concepts',
  module: '1 · Words and text',
  level: 1,
  minutes: 14,
  noLab: true,
  summary: r`Tokenization partitions continuous streams of natural language characters into discrete linguistic units: sentences and words. While splitting on whitespace serves as a naive first approximation for English, authentic prose is rife with boundary ambiguities: sentence segmenters must distinguish between abbreviation markers ("Dr.", "Inc.", "U.S.") and true sentence-terminal full stops, while word tokenisers must split clitics and contractions ("don't" $\to$ "do", "n't"), isolate punctuation, and preserve hyphenated technical terms. Standard rule-based finite-state tokenisers (such as the Penn Treebank standard) and unsupervised sentence boundary detectors (such as Kiss and Strunk's Punkt algorithm) provide the structured foundation for syntactic parsing and feature extraction.`,
  lead: r`To a computer, a book or webpage is an unbroken sequence of bytes. Before an algorithm can count frequencies, assign parts of speech, or parse syntactic dependencies, it must decide where one thought ends and the next begins, and where individual words separate. Yet human writing resists simplistic delimiter rules: is "St." a saint or a street? Does "Ph.D." terminate a sentence if it ends a paragraph? Is "rock'n'roll" one word or three? Resolving these edge cases cleanly is the objective of word and sentence tokenisation.`,
  intuition: [
    r`The illusion of whitespace separation: In English and Latin-script languages, spaces between words tempt developers to write simple text.split(' '). However, naive whitespace splitting fails on multiple fronts: it glues punctuation onto words ("apple." instead of "apple" and "."), lumps contracted auxiliary verbs into unrecognisable compounds ("we'll" instead of "we" and "will"), and fractures multi-word idioms. In non-segmented writing systems like Chinese, Japanese, or Thai, words are written continuously without spaces, rendering whitespace splitting completely useless.`,
    r`Sentence Boundary Disambiguation (SBD): Splitting text into sentences (Sentence Boundary Detection or sentence segmentation) appears trivial—look for periods, question marks, and exclamation points. However, the period character '.' is overloaded: it serves as a sentence terminator, a decimal point in numbers (3.14), an abbreviation marker ("e.g.", "Prof."), an ellipsis (...), an email/URL element, and an acronym separator ("U.S.A."). If a sentence segmenter splits after "Dr.", subsequent syntactic parsers fail because they receive broken grammatical sentence fragments.`,
    r`The Punkt unsupervised boundary discovery paradigm: Tiberius Kiss and Jan Strunk (2006) proved that sentence boundary disambiguation can be solved with high accuracy without manual rules or labelled training corpora. The Punkt algorithm examines unannotated text using statistical collocations: it identifies abbreviations by calculating whether a word followed by a period occurs frequently without the period, evaluates whether the following word is heavily capitalized, and tests whether the two-word sequence exhibits high mutual information. Punkt achieves over 98% accuracy across multilingual corpora without needing hand-engineered language grammars.`,
    r`Penn Treebank standard for word tokenisation: The Penn Treebank (PTB) tokenisation convention established the standard for linguistic parsing. Rather than discarding punctuation or treating words as monolithic strings, PTB separates clitics and contractions into distinct syntactic morphemes: "don't" becomes "do" and "n't" (so "n't" can be tagged as an adverbial negation), "they'll" becomes "they" and "'ll", and possessive "'s" separates from its noun ("cat's" $\to$ "cat", "'s"). Standardising contractions into distinct grammatical tokens enables uniform downstream syntactic analysis.`,
  ],
  analogy: r`Think of reading a continuous ticker-tape transcript of spoken dialogue. Without spaces, words run together like "wevegottogotothestation". Punctuation marks are like hand gestures made by the speaker: a period is sometimes a firm drop of the hand indicating a finished thought (end of sentence), but other times it is merely an abbreviated flick indicating a job title ("Dr. Smith"). A naive tokeniser is like a paper cutter that blindly slices the ticker tape every time it spots a dot: it accidentally cuts Dr. Smith in half, separating the doctor from their surname and ruining the medical file. A linguistically aware tokeniser inspects the surrounding context: it recognizes that "Dr." is an abbreviation prefix, preserves the integrity of the name, and only drops the slicing blade when a true full stop signals a fresh thought.`,
  steps: [
    {
      title: r`Detect and protect abbreviations and numeric decimals`,
      desc: r`Prevent full stops inside acronyms and numbers from triggering sentence splits.`,
      detail: r`Scan the text with regular expressions to identify decimal points ($[0-9]+\.[0-9]+$) and common honorific / business abbreviations ("Mr.", "Mrs.", "Dr.", "Inc.", "Ltd."). Replace their periods with temporary sentinel tokens to shield them from sentence splitting rules.`,
    },
    {
      title: r`Segment text into sentences`,
      desc: r`Split paragraph strings at authentic terminal punctuation boundaries.`,
      detail: r`Identify terminal punctuation (periods, exclamation marks, question marks) followed by whitespace and an uppercase letter. Split the text into an array of sentence strings, and restore any shielded abbreviation periods.`,
    },
    {
      title: r`Isolate standard punctuation marks`,
      desc: r`Detach commas, brackets, colons, and quotes from adjacent words.`,
      detail: r`Insert whitespace around non-word punctuation marks (e.g. converting "hello," to "hello , "). Treat opening and closing quotes as separate tokens, converting double quotation marks into paired direction-sensitive quotes where appropriate.`,
    },
    {
      title: r`Expand clitics and contractions (Penn Treebank standard)`,
      desc: r`Separate contracted verbal auxiliaries and possessives into distinct tokens.`,
      detail: r`Apply regex substitution to separate clitics: split "'ll", "'ve", "'re", "'m", "'d", and possessive "'s". Split negative contractions ending in "n't" (e.g. "can't" $\to$ "ca", "n't"; "won't" $\to$ "wo", "n't"; "didn't" $\to$ "did", "n't") so negation can receive independent syntactic tags.`,
    },
    {
      title: r`Emit discrete token array`,
      desc: r`Split the formatted character stream into an array of string tokens.`,
      detail: r`Split the prepared text on whitespace delimiters. The resulting array of tokens contains individual words, morphemic contraction fragments, and punctuation elements ready for downstream dictionary vectorisation or part-of-speech tagging.`,
    },
  ],
  math: [
    {
      h: r`Log-likelihood ratio for abbreviation detection (Punkt)`,
      tex: r`\Lambda = 2 \left( \log L(H_1) - \log L(H_0) \right) = 2 \sum_{i} k_i \log \frac{p_i}{p}`,
      p: r`The Punkt algorithm evaluates whether a word with a trailing period (such as "Corp.") is an abbreviation ($H_1$) or an end-of-sentence word ($H_0$) by computing the log-likelihood ratio test of independence. Words with large positive $\Lambda$ scores are added to the abbreviation lexicon.`,
    },
    {
      h: r`Token-to-Type Ratio (TTR)`,
      tex: r`\text{TTR} = \frac{|\mathcal{V}|}{N_{\text{tokens}}} = \frac{\text{Unique Types}}{\text{Total Running Tokens}}`,
      p: r`Here $|\mathcal{V}|$ is the vocabulary size (number of unique types) and $N_{\text{tokens}}$ is total running token count. TTR quantifies lexical diversity in a corpus. Over-tokenising words increases $|\mathcal{V}|$ artificially, while under-tokenising leads to higher out-of-vocabulary rates.`,
    },
    {
      h: r`Heaps' Law of vocabulary growth`,
      tex: r`|\mathcal{V}| = k \cdot N_{\text{tokens}}^\beta, \quad 0 < \beta < 1`,
      p: r`Heaps' Law models how vocabulary size $|\mathcal{V}|$ grows asymptotically with corpus size $N_{\text{tokens}}$. Parameters $k \approx 10$ to $100$ and $\beta \approx 0.4$ to $0.6$ depend directly on how aggressively contractions, hyphens, and compound words are split during tokenisation.`,
    },
  ],
  keyPoints: [
    r`Tokenisation converts raw continuous text into discrete sentence and word elements.`,
    r`Naive whitespace splitting fails on punctuation, clitics, contractions, and unsegmented languages like Chinese.`,
    r`Sentence Boundary Detection must disambiguate periods used for abbreviations, decimals, and true sentence terminations.`,
    r`The Penn Treebank standard separates contractions ("don't" $\to$ "do", "n't") into distinct syntactic units.`,
    r`Unsupervised algorithms like Punkt discover language-specific abbreviations without manual grammar engineering.`,
  ],
  pitfalls: [
    r`Discarding all punctuation during word tokenisation: Stripping punctuation destroys sentence boundaries, removes numerical decimals, and strips grammatical markers; punctuation should be isolated as distinct tokens rather than deleted.`,
    r`Assuming periods always indicate sentence boundaries: Splitting on every period creates fragmented sentences around abbreviations ("Dr. Jane Smith moved to the U.S. in 2020.").`,
    r`Treating contractions as monolithic single words: Treating "don't" as an indivisible token prevents models from recognizing the negation operator "n't" and the auxiliary verb "do" independently.`,
    r`Language-specific tokeniser assumptions: Applying an English whitespace tokeniser to unsegmented scripts (such as Chinese or Japanese) outputs the entire paragraph as a single giant token; specialized segmenters (like Jieba or MeCab) are required.`,
    r`Inconsistent hyphen handling: Inconsistently handling hyphens ("state-of-the-art" vs "state of the art") splits single conceptual adjectives into fragments, causing vocabulary fragmentation unless normalised.`,
  ],
  code: r`import re

# Rule-based word and sentence tokenisation pipeline (Penn Treebank standard)
sample_text = "Dr. Smith arrived at 3.15 p.m. He said, 'We couldn't visit the U.S. capital!' Did you see him?"

# 1. Rule-based Sentence Boundary Detection
# Known honorific / title abbreviations to protect
abbreviations = ["Dr", "Mr", "Mrs", "Ms", "Prof", "Inc", "Ltd", "Jr", "Sr", "U.S", "p.m", "a.m"]

def sentence_tokenize(text):
    # Protect abbreviation periods by replacing them with temporary placeholder
    protected_text = text
    for abbr in abbreviations:
        # Match whole word abbreviation followed by dot
        pattern = r'\b' + re.escape(abbr) + r'\.'
        protected_text = re.sub(pattern, abbr + "@DOT@", protected_text)
    
    # Split on sentence terminals (. ! ?) followed by whitespace or end of string
    raw_sentences = re.split(r'(?<=[.!?])\s+', protected_text)
    
    # Restore protected periods
    sentences = [s.replace("@DOT@", ".") for s in raw_sentences if s.strip()]
    return sentences

sentences = sentence_tokenize(sample_text)
print(f"Detected {len(sentences)} sentences:")
for i, s in enumerate(sentences):
    print(f"  Sentence {i+1}: \"{s}\"")

# 2. Penn Treebank style Word Tokenisation
def word_tokenize_ptb(sentence):
    text = sentence
    
    # Isolate leading and trailing quotes, brackets, and punctuation
    text = re.sub(r'([,;:\(\)\[\]\{\}\?!])', r' \1 ', text)
    
    # Isolate periods that are true terminals (not in decimals or abbreviations)
    text = re.sub(r'(?<!\d)\.(?!\d)', r' . ', text)
    
    # Handle negative contractions: split "n't"
    text = re.sub(r"(?i)\b([a-z]+)n't\b", r"\1 n't", text)
    # Special cases: "can't" -> "ca n't", "won't" -> "wo n't"
    text = re.sub(r"(?i)\bca n't\b", "ca n't", text)
    text = re.sub(r"(?i)\bwo n't\b", "wo n't", text)
    
    # Handle other clitics: 'll, 're, 've, 'm, 'd, 's
    text = re.sub(r"'(ll|re|ve|m|d|s)\b", r" '\1", text)
    
    # Split on whitespace
    tokens = [tok for tok in text.split() if tok]
    return tokens

print(f"\nWord tokens for Sentence 2 (\"We couldn't visit the U.S. capital!\"):")
tokens_s2 = word_tokenize_ptb(sentences[1])
print(tokens_s2)
print(f"Notice 'couldn\\'t' split into: ['could', \"n't\"]")
print(f"Notice punctuation isolated:     ['!']")`,
  quiz: [
    {
      q: r`Why does naive whitespace splitting (text.split(' ')) fail when preparing real-world English text for NLP pipelines?`,
      o: [
        r`It attaches punctuation to adjacent words ("dog." instead of "dog" and "."), fails to separate contractions into distinct grammatical units, and cannot process unsegmented languages like Chinese`,
        r`It causes memory buffer overflows in standard Python dictionaries`,
        r`It converts all characters to uppercase automatically`,
        r`It can only process sentences shorter than ten words`,
      ],
      a: 0,
      why: r`Whitespace splitting glues punctuation onto tokens, creating duplicate vocabulary entries ("dog", "dog,", "dog."). It also fails to decompose grammatical contractions like "can't" into root and negation components.`,
    },
    {
      q: r`What makes Sentence Boundary Detection (SBD) challenging in natural language text?`,
      o: [
        r`The period character '.' is overloaded: it serves as a sentence terminator, an abbreviation indicator ("Dr."), a decimal separator (3.14), and an ellipsis marker (...)`,
        r`Sentences in English never exceed five words in length`,
        r`Exclamation marks and question marks cannot be processed using regular expressions`,
        r`Most operating systems do not support newline characters`,
      ],
      a: 0,
      why: r`Because the full stop is heavily overloaded as an abbreviation marker, decimal separator, and acronym element, simple rule-based splitting after every period causes severe fragmentation of proper names and numerical quantities.`,
    },
    {
      q: r`According to the Penn Treebank standard, how should the contraction "couldn't" be tokenised?`,
      o: [
        r`As two separate tokens: ["could", "n't"]`,
        r`As a single unified token: ["couldn't"]`,
        r`By deleting the apostrophe: ["couldnt"]`,
        r`By expanding to full dictionary words: ["could", "not"]`,
      ],
      a: 0,
      why: r`The Penn Treebank standard separates clitics and contractions into distinct tokens: "could" (modal auxiliary verb) and "n't" (adverbial negation), allowing downstream taggers to assign distinct parts of speech to each.`,
    },
    {
      q: r`How does the Punkt algorithm detect abbreviations in an unannotated text corpus without human-engineered grammar rules?`,
      o: [
        r`By calculating statistical collocations and log-likelihood ratio tests to determine if a token with a period frequently appears in non-terminal positions`,
        r`By querying a hard-coded online English dictionary via an API`,
        r`By translating the text into Latin first`,
        r`By counting the number of syllables in each word`,
      ],
      a: 0,
      why: r`Punkt evaluates whether a word followed by a period occurs with high probability inside sentences, whether subsequent words are capitalized, and whether the pair forms an abbreviation collocation, identifying abbreviations in an unsupervised manner.`,
    },
  ],
  usedBy: ['stop-words-and-n-grams', 'stemming-vs-lemmatisation', 'bag-of-words-and-tf-idf'],
  prereq: ['text-normalisation-unicode-and-regex'],
  related: ['text-normalisation-unicode-and-regex', 'tokenization', 'data-cleaning-and-validation'],
  keywords: 'tokenization tokenisation word tokenisation sentence segmentation sentence boundary detection punkt penn treebank clitics contractions nlp preprocessing',
},

  // ------------------------------------------------------------------ Lesson 3
{
  id: 'stop-words-and-n-grams',
  short: 'Stop Words & N-Grams',
  title: 'Stop words and n-grams',
  task: 'concepts',
  module: '1 · Words and text',
  level: 1,
  minutes: 14,
  noLab: true,
  summary: r`Stop words are ubiquitous grammatical function words (such as "the", "is", "at", "which") that provide syntactic scaffolding in prose but offer minimal domain-specific topical discrimination in information retrieval and document classification. N-grams capture local multi-word context by forming contiguous tuples of $n$ consecutive tokens (unigrams, bigrams, trigrams), upgrading bag-of-words models into context-sensitive phrase extractors capable of distinguishing "not guilty" from "guilty". Deciding when to filter stop words and engineering word or character n-gram vocabularies balances vector sparsity against semantic nuance.`,
  lead: r`If you tally the most frequent words in Shakespeare's plays, a corporate contract, and a medical textbook, the top of all three lists looks identical: "the", "and", "of", "to", "a", "in". These function words bind sentences together grammatically, but they reveal almost nothing about whether the document discusses Elizabethan tragedy, corporate liability, or cardiovascular surgery. Conversely, treating each word as an isolated island discards crucial phrasing: "hot dog" is not merely heat plus a canine, and "not bad" is positive praise despite containing a negative word. Navigating stop words and constructing n-grams provides the bridge from isolated word counts to contextual phrase representations.`,
  intuition: [
    r`Zipf's Law and the function word explosion: George Kingsley Zipf observed that the frequency of any word in a natural language corpus is inversely proportional to its rank in the frequency table: $f(w) \propto 1 / r^\alpha$ (where $\alpha \approx 1$). The top 50 to 100 most frequent words typically account for $40\%$ to $50\%$ of all word occurrences in a document. In tasks like topic modelling, search indexing, or author classification, these high-frequency function words inflate vector dimensionality, consume memory, and add noise without aiding class separation. Identifying and filtering stop words strips away this high-frequency noise floor.`,
    r`The peril of aggressive stop word removal: While removing stop words helps simple bag-of-words document search, indiscriminate filtering can destroy meaning. Consider sentiment analysis: stripping the stop word "not" transforms the movie review "The movie was not entertaining" into "movie entertaining"—inverting the sentiment from negative to positive. In question answering, filtering "to be or not to be" eliminates the entire query. Modern deep language models (such as BERT and GPT) never remove stop words because self-attention relies heavily on prepositions and pronouns to resolve syntactic dependencies.`,
    r`Capturing local context with N-grams: A unigram is a single isolated token ($n=1$). A bigram ($n=2$) groups two consecutive tokens ("machine learning", "deep learning"). A trigram ($n=3$) groups three ("natural language processing"). Moving from unigrams to n-grams allows statistical models to capture negation ("not good"), compound nouns ("New York City"), and domain idioms. Higher-order n-grams provide richer semantic context, but cause the vocabulary size to explode combinatorially.`,
    r`Character-level N-grams for robust morphology: N-grams can also be constructed at the subword character level rather than the word level. For example, the 3-character n-grams (character trigrams) of "<cat>" are "<ca", "cat", and "at>". Character n-grams are immune to out-of-vocabulary errors, capture morphological roots across inflections ("run", "running", "runner"), and withstand spelling mistakes and OCR typos (such as "definately" matching "definitely"), forming the secret weapon behind FastText and modern subword tokenisers.`,
  ],
  analogy: r`Think of assembling a jigsaw puzzle of a landscape. Stop words are like the thousands of plain blue sky pieces that look virtually identical: they make up half the box, take up huge table space, and tell you very little about whether the puzzle depicts Paris or the Grand Canyon. If you are indexing the puzzle in an inventory catalogue, sweeping the blue sky pieces aside (stop word filtering) lets you focus immediately on the distinctive landmark pieces (the Eiffel Tower or canyon cliffs). Single unigram words are like individual disconnected puzzle tabs: you hold a piece with a brown paw, another with red fabric, another with a wheel. Bigrams and trigrams are like clicking two or three interlocking pieces together: suddenly, you don't just have an isolated paw and wheel; you see a dog sitting in a bicycle basket. You capture the scene's composition without needing the entire thousand-piece puzzle.`,
  steps: [
    {
      title: r`Tokenise text into a clean sequence of words`,
      desc: r`Segment the input corpus into standardised tokens prior to grouping or filtering.`,
      detail: r`Normalise casing, isolate punctuation, and segment text into an ordered token list $[w_1, w_2, \dots, w_T]$. Retaining sequence order is critical: n-grams depend strictly on contiguous token adjacency.`,
    },
    {
      title: r`Filter domain-specific stop words`,
      desc: r`Strip common function words using tailored stop word dictionaries or frequency cutoffs.`,
      detail: r`Apply a stop word list (such as NLTK's English stop words or spaCy's curated lexicon). When building sentiment analysis or question answering systems, preserve negation words ("no", "not", "never", "without") to prevent semantic inversion. Alternatively, compute document frequencies dynamically and prune words appearing in $>80\%$ of corpus documents.`,
    },
    {
      title: r`Construct word-level sliding window N-grams`,
      desc: r`Slide a window of width $n$ across the token sequence to generate tuples.`,
      detail: r`For a sequence $[w_1, \dots, w_T]$, generate bigrams as $[(w_1, w_2), (w_2, w_3), \dots, (w_{T-1}, w_T)]$. Optionally pad the beginning and end of the sequence with start-of-sentence (<s>) and end-of-sentence (</s>) boundary tokens to capture sentence-edge transition statistics.`,
    },
    {
      title: r`Extract character-level subword N-grams`,
      desc: r`Generate overlapping character tuples within words to capture morphological roots.`,
      detail: r`Pad each word with boundary brackets (e.g. "<where>"). Extract sliding character slices of length $n$ (typically $n=3$ to $6$): ["<wh", "whe", "her", "ere", "re>"]. Character n-grams allow models to represent rare, misspelled, or out-of-vocabulary words through shared subword fragments.`,
    },
    {
      title: r`Prune rare N-grams and vectorise`,
      desc: r`Enforce minimum frequency thresholds to control combinatorial vocabulary explosion.`,
      detail: r`Bigrams and trigrams produce vast vocabularies where $90\%$ of combinations appear only once in the entire corpus. Prune n-grams with frequency count $< 3$ or min_df $< 2$. Build sparse count matrices mapping documents to surviving n-gram feature indices.`,
    },
  ],
  math: [
    {
      h: r`Zipf's Law frequency distribution`,
      tex: r`f(r) = \frac{C}{r^\alpha} \approx \frac{C}{r}, \quad \log f(r) = \log C - \alpha \log r`,
      p: r`Here $r$ is the frequency rank of a word (where $r=1$ is the most frequent word, e.g. "the"), $f(r)$ is its empirical frequency, and $\alpha \approx 1$. A log-log plot of word frequency versus rank forms a straight line with slope $-1$, proving that a minuscule fraction of words dominates total corpus volume.`,
    },
    {
      h: r`N-gram token count and sliding window formulation`,
      tex: r`\text{N-grams}(W, n) = \left\{ (w_i, w_{i+1}, \dots, w_{i+n-1}) \;\middle|\; 1 \le i \le |W| - n + 1 \right\}`,
      p: r`A document of length $T = |W|$ tokens yields exactly $T - n + 1$ contiguous n-grams. Adding $n-1$ boundary padding symbols at the start and end yields exactly $T + n - 1$ padded n-grams, preserving transition probabilities for initial and terminal words.`,
    },
    {
      h: r`Maximum likelihood bigram transition probability`,
      tex: r`P(w_i \mid w_{i-1}) = \frac{\operatorname{Count}(w_{i-1}, w_i)}{\operatorname{Count}(w_{i-1})}`,
      p: r`In classical n-gram language modelling, the conditional probability of word $w_i$ given preceding word $w_{i-1}$ is evaluated as the joint bigram count divided by the unigram count of the conditioning prefix.`,
    },
  ],
  keyPoints: [
    r`Stop words are high-frequency grammatical function words that carry minimal topical discrimination in bag-of-words search.`,
    r`Zipf's Law demonstrates that the top 100 most frequent words account for approximately half of all tokens in natural language corpora.`,
    r`Aggressive stop word removal destroys negation and subtle syntax, making it unsuitable for sentiment analysis and modern language models.`,
    r`N-grams capture contiguous local word context, enabling models to differentiate between distinct phrases like "not guilty" and "guilty".`,
    r`Character n-grams capture morphological variations and typos, providing robust representations for out-of-vocabulary words.`,
  ],
  pitfalls: [
    r`Stripping negation words in sentiment tasks: Blindly removing words like "not", "no", and "never" reverses sentiment polarities and ruins sentiment classifiers.`,
    r`Unconstrained N-gram vocabulary explosion: Generating unigrams, bigrams, and trigrams on large corpora without min_df thresholds inflates vocabulary to millions of sparse columns, causing GPU memory exhaustion.`,
    r`Applying stop word lists to modern Transformer models: Removing stop words before feeding text to BERT, RoBERTa, or GPT cripples self-attention, as transformers rely on prepositions and pronouns to parse sentence syntax.`,
    r`Ignoring casing when matching stop words: If stop words are lowercased ("the") but document tokens retain capitalization ("The"), stop word filtering fails on sentence-initial words unless casing is normalised first.`,
    r`Over-filtering rare domain terminology: Using automated frequency thresholds without domain review can inadvertently discard rare medical, legal, or technical acronyms that carry the highest topical information.`,
  ],
  code: r`import numpy as np
from collections import Counter

# Corpus of documents
documents = [
    "Machine learning is not magic, it is computer science.",
    "Deep learning is a subset of machine learning.",
    "Not bad at all, this machine learning model works well!"
]

# 1. Custom stop words list (preserving negation words: 'not')
standard_stop_words = {"is", "it", "a", "of", "at", "all", "this"}

def simple_tokenize(doc):
    # Lowercase and split on non-alphanumeric characters
    import re
    return [tok for tok in re.split(r'\W+', doc.lower()) if tok]

# Tokenise all documents
tokenized_docs = [simple_tokenize(d) for d in documents]

# 2. Filter stop words while retaining negations
filtered_docs = [
    [w for w in doc if w not in standard_stop_words]
    for doc in tokenized_docs
]

print("Document 1 before stop word filtering:")
print(tokenized_docs[0])
print("\nDocument 1 after stop word filtering (notice 'not' preserved):")
print(filtered_docs[0])

# 3. Generate Word-Level Bigrams and Trigrams
def generate_ngrams(tokens, n=2):
    return [tuple(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]

bigrams_doc1 = generate_ngrams(filtered_docs[0], n=2)
print(f"\nWord Bigrams (n=2) for Document 1:")
for bg in bigrams_doc1:
    print(f"  {' '.join(bg)}")

# 4. Character-level N-Grams for Subword Morphology
def generate_char_ngrams(word, n=3):
    padded = f"<{word}>"
    return [padded[i:i+n] for i in range(len(padded) - n + 1)]

sample_word = "learning"
char_trigrams = generate_char_ngrams(sample_word, n=3)
print(f"\nCharacter Trigrams (n=3) for '{sample_word}':")
print(char_trigrams)

# 5. Bigram Frequency Distribution across Corpus
all_bigrams = [bg for doc in filtered_docs for bg in generate_ngrams(doc, n=2)]
bigram_counts = Counter(all_bigrams)

print("\nMost frequent bigrams across corpus:")
for bg, count in bigram_counts.most_common(3):
    print(f"  '{' '.join(bg)}': {count} occurrences")
print("Verified: Word and character n-gram extraction executed successfully!")`,
  quiz: [
    {
      q: r`Why does Zipf's Law motivate the filtering of stop words in classical information retrieval and topic modelling?`,
      o: [
        r`Because the most frequent function words account for up to half of all tokens in a corpus while providing near-zero domain-specific topical discrimination`,
        r`Because computers cannot store words with fewer than three letters`,
        r`Because stop words cause divide-by-zero errors in matrix multiplication`,
        r`Because stop words are only used in conversational speech rather than written text`,
      ],
      a: 0,
      why: r`Zipf's Law states that word frequency decays inversely with rank. The top 50 words ("the", "of", "and") appear in virtually every document regardless of topic, diluting term vectors without offering discrimination between categories.`,
    },
    {
      q: r`Under what natural language processing task can indiscriminate stop word removal cause severe model degradation?`,
      o: [
        r`Sentiment analysis, because removing negation stop words (such as "not" or "never") inverts the semantic polarity of phrases like "not good" to "good"`,
        r`Image classification`,
        r`Speech synthesis`,
        r`Audio waveform Fourier analysis`,
      ],
      a: 0,
      why: r`Negation words ("not", "neither", "hardly") are often included in naive stop word lists. Stripping them completely reverses the sentiment of a sentence, turning praise into condemnation or vice versa.`,
    },
    {
      q: r`What critical advantage do character-level n-grams offer over word-level n-grams in text embeddings (as seen in FastText)?`,
      o: [
        r`They can construct representations for out-of-vocabulary words and are resilient to spelling mistakes and morphological inflections by sharing common subword character slices`,
        r`They eliminate the need for matrix multiplication`,
        r`They double the speed of GPU floating-point operations`,
        r`They require zero memory storage`,
      ],
      a: 0,
      why: r`If an unseen word or typo appears at test time (e.g. "definately"), word models fail (out-of-vocabulary). Character n-grams decompose the word into overlapping fragments ("def", "efi", "fin") that match known subwords, producing a robust embedding.`,
    },
    {
      q: r`Why do modern Transformer architectures (such as BERT and GPT) avoid removing stop words during pre-training and fine-tuning?`,
      o: [
        r`Self-attention mechanisms require full grammatical syntax (including pronouns, prepositions, and auxiliaries) to compute bidirectional syntactic and semantic dependencies accurately`,
        r`Because stop words cannot be stored in PyTorch tensors`,
        r`Because removing stop words reduces the training speed of GPUs`,
        r`Because Transformer models can only process sentences with an even number of tokens`,
      ],
      a: 0,
      why: r`Transformers model natural language holistically: function words provide essential structural clues for pronoun coreference, syntactic dependency parsing, and semantic role assignment. Deleting them destroys linguistic context.`,
    },
  ],
  usedBy: ['stemming-vs-lemmatisation', 'bag-of-words-and-tf-idf'],
  prereq: ['word-and-sentence-tokenization', 'text-normalisation-unicode-and-regex'],
  related: ['bag-of-words-and-tf-idf', 'tokenization', 'word-and-sentence-tokenization'],
  keywords: 'stop words n grams unigram bigram trigram zipf law subword character n grams language modeling nlp preprocessing vocabulary feature extraction',
},

  // ------------------------------------------------------------------ Lesson 4
{
  id: 'stemming-vs-lemmatisation',
  short: 'Stemming vs Lemmatisation',
  title: 'Stemming vs lemmatisation',
  task: 'concepts',
  module: '1 · Words and text',
  level: 1,
  minutes: 15,
  noLab: true,
  summary: r`Words occur in diverse inflected, derived, and conjugated surface forms across grammatical moods, numbers, and tenses ("organise", "organises", "organising", "organised"). Stemming and lemmatisation are two distinct linguistic normalisation techniques designed to collapse these surface variants into a common base representation, consolidating vocabulary size and enhancing document recall. Stemming applies heuristic, rule-based suffix-stripping algorithms (such as the Porter and Snowball stemmers) that chop word endings into crude root stems ("organ"), often yielding non-dictionary words and suffering from over-stemming and under-stemming. Lemmatisation applies full morphological analysis using comprehensive lexical databases (such as WordNet) and Part-of-Speech context to reduce words to their authentic canonical dictionary lemma ("better" $\to$ "good", "was" $\to$ "be").`,
  lead: r`If a user searches an e-commerce catalogue for "running shoes", they expect the engine to return products described as "runs", "runner", and "ran". If a sentiment classifier encounters the word "frustrated", it should leverage everything it learned about "frustrates", "frustrating", and "frustration". Without morphological normalisation, each inflected variant becomes an independent vocabulary dimension, fragmenting training counts and causing severe sparsity. But should we chop word endings with heuristic rules, or look them up in a morphological dictionary? Understanding the speed, precision, and grammatical trade-offs between stemming and lemmatisation is crucial for designing robust text processing pipelines.`,
  intuition: [
    r`The morphology challenge: In natural languages, inflectional morphology modifies words to express grammatical features (tense, person, number, case) without changing the core semantic meaning ("walk", "walks", "walked", "walking"). Derivational morphology forms completely new words from existing roots ("organise" $\to$ "organisation"). In un-normalised text, these variations inflate the vocabulary exponentially, spreading statistical frequencies thin across dozens of rare tokens.`,
    r`Stemming: Heuristic rule-based suffix chopping: In 1980, Martin Porter introduced the Porter Stemmer, which remains the most widely deployed stemming algorithm in computer science. Porter stemming consists of five sequential phases of hand-crafted cascading rewrite rules: for instance, mapping "sses" to "ss" ("caresses" $\to$ "caress"), "ies" to "i" ("ponies" $\to$ "poni"), and stripping "ing" or "ed" if the preceding stem contains a vowel ("motoring" $\to$ "motor"). Stemmers are blindingly fast because they rely purely on string pattern matching without lexical dictionaries. However, stems are often non-words ("poni", "commun"), and stemmers cannot handle irregular English grammar ("went" cannot be stemmed to "go").`,
    r`The twin pitfalls: Over-stemming and under-stemming: Stemmers suffer from two fundamental error modes: (1) Over-stemming occurs when two words with completely different semantic meanings are conflated to the identical root stem (e.g. "universe", "universal", and "university" all stem to "univers", erroneously equating higher education with astrophysics). (2) Under-stemming occurs when two words expressing the exact same semantic concept fail to stem to the same root (e.g. "European" and "Europe" yield "european" and "europ", remaining disjoint in the index).`,
    r`Lemmatisation: Lexical analysis with Part-of-Speech context: Lemmatisation resolves the shortcomings of stemming by performing complete morphological analysis. A lemmatiser requires two inputs: the surface word and its grammatical Part-of-Speech (POS) tag. By consulting comprehensive lexical databases like WordNet, a lemmatiser handles irregular inflections with ease: "better" with POS=adjective becomes "good", "saw" with POS=verb becomes "see", whereas "saw" with POS=noun remains "saw" (the cutting tool). Lemmatisation guarantees that the resulting base is a legitimate, human-interpretable dictionary headword ("lemma"), providing superior semantic fidelity at the expense of computational lookup overhead.`,
  ],
  analogy: r`Think of pruning and tending a large overgrown botanical garden. Stemming is like a groundskeeper armed with a petrol-powered hedge trimmer who walks along hedges blindly shearing three inches off the end of every branch: it is extraordinarily fast and reduces the wild bush to a tidy uniform height, but occasionally it shears off valuable roses, cuts electrical garden cables, or leaves splintered bare twigs (non-words like "poni"). Lemmatisation is like a skilled master horticulturist who examines each plant individually with pruning shears, identifies the exact plant species from its tag (Part-of-Speech context), traces the branches back to their healthy botanical joints, and trims them neatly to their canonical root system. The master horticulturist takes significantly longer than the petrol hedge trimmer, but every plant remains pristine and identifiable.`,
  steps: [
    {
      title: r`Tokenise and assign Part-of-Speech (POS) tags`,
      desc: r`Disambiguate word syntax to provide grammatical context for lemmatisation.`,
      detail: r`Tokenise the sentence and run a Part-of-Speech tagger (e.g. determining whether "leaves" is a plural noun as in tree foliage or a third-person singular verb as in exiting a room). POS tagging is essential: without syntactic context, lemmatisers cannot resolve polysemous word forms.`,
    },
    {
      title: r`Apply rule-based stemming (Porter / Snowball)`,
      desc: r`Execute sequential heuristic suffix stripping across string patterns.`,
      detail: r`Pass tokens through cascading regex replacement rules: step 1 strips plurals and third-person suffixes (-s, -es, -ed, -ing); step 2 simplifies double suffixes (-ational $\to$ -ate); steps 3 and 4 strip derivational endings (-ful, -ness, -ment). Output crude root stems for high-throughput search engines.`,
    },
    {
      title: r`Map POS tags to lexical database categories`,
      desc: r`Translate detailed Penn Treebank POS tags into coarse WordNet categories.`,
      detail: r`Penn Treebank tags (NN, NNS, VB, VBD, VBG, JJ, RB) must be mapped to the four coarse WordNet categories: Noun ('n'), Verb ('v'), Adjective ('a'), and Adverb ('r'). Unmatched or punctuation tokens default to Noun.`,
    },
    {
      title: r`Perform morphological lookup and rule-based lemma extraction`,
      desc: r`Query dictionary tables and apply morphological transformation rules.`,
      detail: r`Query the lexical database (WordNet). If the (word, POS) pair exists in the irregular inflection index (e.g. ("went", 'v') $\to$ "go", ("mice", 'n') $\to$ "mouse"), return the mapped lemma immediately. Otherwise, apply grammatical detachment rules (e.g. stripping '-s' for plural nouns).`,
    },
    {
      title: r`Select between stemming and lemmatisation for downstream tasks`,
      desc: r`Choose the optimal normalisation strategy based on latency, accuracy, and interpretability constraints.`,
      detail: r`Use stemming for high-throughput information retrieval, large-scale web search indexing, and real-time log ingestion where sub-millisecond execution is paramount. Use lemmatisation for sentiment analysis, semantic parsing, question answering, and topic modelling where grammatical correctness and human-interpretable features are vital.`,
    },
  ],
  math: [
    {
      h: r`Porter Stemmer measure of syllable complexity`,
      tex: r`[C](VC)^m [V], \quad m = \text{measure of syllable alternation}`,
      p: r`The Porter stemmer represents any word as an optional initial consonant sequence $[C]$, followed by $m$ alternating vowel-consonant sequences $(VC)^m$, followed by an optional trailing vowel sequence $[V]$. Suffix stripping rules fire only if the remaining stem satisfies a minimum syllable measure $m > 0$ or $m > 1$, preventing short root words like "bed" or "sing" from being destroyed into single letters.`,
    },
    {
      h: r`Over-stemming and Under-stemming error rates`,
      tex: r`E_{\text{over}} = \frac{|\{(w_i, w_j) : \operatorname{stem}(w_i) = \operatorname{stem}(w_j) \land \text{lemma}(w_i) \neq \text{lemma}(w_j)\}|}{\text{Total Pairs}}, \quad E_{\text{under}} = \frac{|\{(w_i, w_j) : \operatorname{stem}(w_i) \neq \operatorname{stem}(w_j) \land \text{lemma}(w_i) = \text{lemma}(w_j)\}|}{\text{Total Related Pairs}}`,
      p: r`Over-stemming measures false conflations (unrelated words mapped to identical stems, harming search precision), while under-stemming measures missed conflations (related words mapped to different stems, harming search recall).`,
    },
    {
      h: r`Vocabulary reduction efficiency ratio`,
      tex: r`\text{Compression Ratio} = 1 - \frac{|\mathcal{V}_{\text{normalised}}|}{|\mathcal{V}_{\text{raw}}|}, \quad |\mathcal{V}_{\text{stemmed}}| \le |\mathcal{V}_{\text{lemmatised}}| < |\mathcal{V}_{\text{raw}}|`,
      p: r`Stemming achieves higher vocabulary compression than lemmatisation because aggressive suffix stripping frequently collapses distinct semantic words together. Lemmatisation balances vocabulary compression while strictly preserving dictionary headwords.`,
    },
  ],
  keyPoints: [
    r`Stemming applies heuristic suffix stripping rules without dictionaries, producing crude roots that are often non-words.`,
    r`Lemmatisation applies full morphological analysis using lexical databases and Part-of-Speech tags, guaranteeing valid dictionary lemmas.`,
    r`Over-stemming erroneously conflates semantically unrelated words (e.g. "university" and "universe"), reducing retrieval precision.`,
    r`Under-stemming fails to group related morphological inflections (e.g. "Europe" and "European"), reducing retrieval recall.`,
    r`Stemming is favoured in high-speed search indexing; lemmatisation is preferred for syntactic parsing and semantic understanding.`,
  ],
  pitfalls: [
    r`Lemmatising without providing Part-of-Speech tags: Most lemmatisers default to Noun if no POS tag is supplied; attempting to lemmatise the verb "running" without POS='v' leaves it un-lemmatised as "running" instead of "run".`,
    r`Over-stemming in specialized domains: Applying aggressive stemmers to medical or legal documents conflates distinct terminology (e.g. "policy" and "police", or "medical" and "medication"), corrupting domain retrieval.`,
    r`Assuming stemming produces valid dictionary words: Stemming outputs like "commun", "poni", and "relat" are algorithmically convenient index keys, but cannot be displayed to end users in polished search results.`,
    r`Computational latency bottlenecks with lemmatisation: Lemmatisation requires dictionary hash lookups and prior POS tagging, running orders of magnitude slower than simple regex stemming on multi-gigabyte corpora.`,
    r`Irregular verb failure in stemmers: Rule-based stemmers cannot map irregular past tenses ("went" $\to$ "go", "sang" $\to$ "sing", "mice" $\to$ "mouse") because irregular inflections require lexical dictionary mapping.`,
  ],
  code: r`# Comparative implementation of Stemming vs Lemmatisation in pure Python

# 1. Simplified rule-based suffix stripper (mini-Porter style rules)
def simple_porter_stem(word):
    w = word.lower()
    # Step 1a: plurals and past participles
    if w.endswith('sses'): w = w[:-2]
    elif w.endswith('ies'): w = w[:-2]  # ponies -> poni
    elif w.endswith('ss'): pass
    elif w.endswith('s') and len(w) > 2: w = w[:-1]
    
    # Step 1b: -ed, -ing
    if w.endswith('eed'):
        if len(w) > 4: w = w[:-1]
    elif w.endswith('ed'):
        stem = w[:-2]
        if any(c in 'aeiou' for c in stem): w = stem
    elif w.endswith('ing'):
        stem = w[:-3]
        if any(c in 'aeiou' for c in stem): w = stem
        
    # Step 2: derivational suffixes
    if w.endswith('ational'): w = w[:-7] + 'ate'  # relational -> relate
    elif w.endswith('tional'): w = w[:-6] + 'tion'
    elif w.endswith('izer') or w.endswith('iser'): w = w[:-4] + 'ise'
    elif w.endswith('ly'): w = w[:-2]
    
    return w

# 2. Dictionary-based Lemmatiser with POS-context support
# Minimal WordNet-style irregular inflection dictionary
lemma_dict = {
    # Verbs: (word, 'v') -> lemma
    ('went', 'v'): 'go', ('gone', 'v'): 'go', ('going', 'v'): 'go', ('goes', 'v'): 'go',
    ('saw', 'v'): 'see', ('seen', 'v'): 'see', ('seeing', 'v'): 'see', ('sees', 'v'): 'see',
    ('running', 'v'): 'run', ('ran', 'v'): 'run', ('runs', 'v'): 'run',
    ('studying', 'v'): 'study', ('studied', 'v'): 'study', ('studies', 'v'): 'study',
    # Nouns: (word, 'n') -> lemma
    ('mice', 'n'): 'mouse', ('geese', 'n'): 'goose', ('feet', 'n'): 'foot',
    ('ponies', 'n'): 'pony', ('studies', 'n'): 'study', ('saw', 'n'): 'saw',
    # Adjectives: (word, 'a') -> lemma
    ('better', 'a'): 'good', ('best', 'a'): 'good', ('worse', 'a'): 'bad'
}

def simple_lemmatize(word, pos='n'):
    w = word.lower()
    # Direct irregular dictionary lookup
    if (w, pos) in lemma_dict:
        return lemma_dict[(w, pos)]
        
    # Regular inflection rules
    if pos == 'n' and w.endswith('s') and len(w) > 3:
        if w.endswith('ies'): return w[:-3] + 'y'
        return w[:-1]
    if pos == 'v' and w.endswith('ing') and len(w) > 4:
        return w[:-3]
    return w

# 3. Test words showing key distinctions
test_cases = [
    ("running", "v", "Regular verb inflection"),
    ("went", "v", "Irregular verb"),
    ("ponies", "n", "Plural noun"),
    ("better", "a", "Irregular comparative adjective"),
    ("saw", "v", "Ambiguous: past tense verb 'to see'"),
    ("saw", "n", "Ambiguous: noun tool 'saw'"),
    ("university", "n", "Over-stemming candidate"),
    ("universe", "n", "Over-stemming candidate")
]

print(f"{'Input Word':<12} | {'POS':<4} | {'Stem (Porter)':<15} | {'Lemma (WordNet)':<15} | {'Note':<30}")
print("-" * 85)

for word, pos, note in test_cases:
    stem_val = simple_porter_stem(word)
    lemma_val = simple_lemmatize(word, pos)
    print(f"{word:<12} | {pos:<4} | {stem_val:<15} | {lemma_val:<15} | {note:<30}")

print("\nKey observations:")
print("1. Stemming turns 'ponies' into non-word 'poni'; Lemmatisation returns valid dictionary word 'pony'.")
print("2. Stemming fails on irregular 'went' ('went'); Lemmatisation correctly maps to root 'go'.")
print("3. POS context allows Lemmatisation to distinguish verb 'saw' ('see') from noun 'saw' ('saw').")`,
  quiz: [
    {
      q: r`What is the primary operational difference between stemming and lemmatisation?`,
      o: [
        r`Stemming uses heuristic suffix-stripping rules without dictionaries (often producing non-words), whereas lemmatisation uses lexical databases and Part-of-Speech context to return authentic dictionary lemmas`,
        r`Stemming is for sentences, while lemmatisation is for paragraphs`,
        r`Stemming can only be computed on GPU hardware`,
        r`Lemmatisation deletes all vowels from input words`,
      ],
      a: 0,
      why: r`Stemming chops word endings using cascading heuristic string matching rules (producing roots like "poni" or "comput"). Lemmatisation consults a morphological lexicon (WordNet) with grammatical context to output valid dictionary headwords ("pony", "compute").`,
    },
    {
      q: r`What does "over-stemming" mean in natural language processing?`,
      o: [
        r`When two semantically distinct words are incorrectly chopped into the identical root stem (e.g. "universe" and "university" both stemming to "univers")`,
        r`When a stemmer crashes due to memory overflow`,
        r`When a word is stemmed more than three times consecutively`,
        r`When a stemmer converts text into binary numbers`,
      ],
      a: 0,
      why: r`Over-stemming is a false positive conflation error: the stemmer strips too aggressively, equating distinct concepts (such as "universal" and "university") under the same root, degrading search precision.`,
    },
    {
      q: r`Why does effective lemmatisation require providing the Part-of-Speech (POS) tag of a word?`,
      o: [
        r`Because grammatical role dictates the root lemma: "saw" as a verb maps to "see", whereas "saw" as a noun remains "saw" (the cutting tool)`,
        r`Because words without POS tags are deleted by the operating system`,
        r`Because POS tags double the frame rate of neural networks`,
        r`Because lexical databases only store adjectives`,
      ],
      a: 0,
      why: r`Many English surface forms are grammatically ambiguous. Without POS context, a lemmatiser cannot know whether "leaves" is the plural of noun "leaf" or the third-person present form of verb "leave".`,
    },
    {
      q: r`Under what scenario is stemming typically preferred over lemmatisation in production systems?`,
      o: [
        r`In large-scale search engines and high-throughput document retrieval indexing where sub-millisecond execution speed outweighs morphological linguistic purity`,
        r`In translation systems where exact dictionary words are required`,
        r`In medical billing software where strict legal compliance is required`,
        r`In speech synthesis text-to-speech systems`,
      ],
      a: 0,
      why: r`Stemming executes orders of magnitude faster than lemmatisation because it avoids POS tagging and dictionary lookups. For web search engines indexing billions of documents, its speed and recall improvements make it the industry standard.`,
    },
  ],
  usedBy: ['bag-of-words-and-tf-idf'],
  prereq: ['word-and-sentence-tokenization', 'text-normalisation-unicode-and-regex'],
  related: ['bag-of-words-and-tf-idf', 'stop-words-and-n-grams', 'word-and-sentence-tokenization'],
  keywords: 'stemming lemmatisation porter stemmer snowball wordnet morphology lemma pos tagging over stemming under stemming nlp preprocessing',
},

  // ------------------------------------------------------------------ Lesson 5
{
  id: 'bag-of-words-and-tf-idf',
  short: 'BoW & TF-IDF',
  title: 'Bag of words and TF-IDF',
  task: 'concepts',
  module: '1 · Words and text',
  level: 1,
  minutes: 16,
  noLab: true,
  summary: r`The Bag of Words (BoW) model represents text documents as fixed-length numeric vectors of token counts, discarding grammatical syntax and word order while preserving vocabulary frequency statistics. Term Frequency-Inverse Document Frequency (TF-IDF, Karen Spärck Jones, 1972) refines raw counts by multiplying local Term Frequency ($\text{tf}(t, d)$) by the global Inverse Document Frequency ($\text{idf}(t, D) = \log\frac{N}{|\{d \in D : t \in d\}|}$), systematically damping ubiquitous generic words while elevating informative, domain-specific keywords. Evaluated with cosine similarity over $L_2$-normalised sparse vectors, TF-IDF powers classical document retrieval, topic clustering, and linear text classification.`,
  lead: r`How can an algorithm determine whether a news article discusses astrophysics, international diplomacy, or organic chemistry when computers process only numbers? The simplest representation is to treat a document as a literal bag of words: toss all the words into a sack, shake away grammatical word order, and tally how many times each dictionary term appears. Yet raw word counts deceive: the word "the" might appear fifty times in every document, while the critical distinguishing word "supernova" appears only three times. TF-IDF resolves this disparity mathematically, weighting words by how uniquely informative they are across the entire document corpus.`,
  intuition: [
    r`The Bag of Words vector space model: Given a vocabulary $\mathcal{V}$ of $V$ unique words, any document $d$ can be mapped to a $V$-dimensional vector $\mathbf{x} = [c_1, c_2, \dots, c_V]$, where $c_i$ is the count of occurrences of word $w_i$ in document $d$. This representation possesses two profound properties: (1) it transforms arbitrary-length text into fixed-length mathematical vectors that can be fed directly to linear classifiers, support vector machines, or clustering algorithms; and (2) it discards word order completely ("dog bites man" and "man bites dog" yield identical vectors). Despite this radical simplification, word frequencies capture strong topical semantics.`,
    r`The limitation of raw term frequencies: If you compute Euclidean distance or dot products between raw count vectors, two flaws arise: (1) Longer documents have larger counts simply because they contain more words, creating artificial bias; and (2) Common words that appear everywhere ("said", "year", "people") dominate the dot product, drowning out rare, highly specific keywords ("mitochondria", "amortisation").`,
    r`Inverse Document Frequency as information content: In 1972, British computer scientist Karen Spärck Jones introduced Inverse Document Frequency (IDF) based on information theory. If a word $t$ appears in every single document across a corpus ($|\{d : t \in d\}| = N$), it carries zero discriminative information: $\log(N / N) = \log(1) = 0$. Conversely, if a word appears in only two documents out of ten thousand, it is a rare, highly specialized topic descriptor, producing a large positive IDF score. Multiplying Term Frequency by Inverse Document Frequency ($\text{TF} \times \text{IDF}$) scales each word's weight by its uniqueness.`,
    r`Cosine similarity over normalised sparse vectors: Because document vocabularies span tens of thousands of words, TF-IDF vectors are extremely sparse (over 99% of entries are zeros). Normalising each vector to unit Euclidean norm ($L_2$ normalisation) eliminates document length bias: dividing by vector magnitude ensures that a short 100-word essay and a 1,000-word technical report on the same topic map to identical directions in vector space. The inner dot product between two $L_2$-normalised vectors equals their cosine similarity $\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} \in [0, 1]$, providing a fast, scale-invariant metric for search engine document ranking.`,
  ],
  analogy: r`Imagine you are an investigator trying to identify which international culinary cuisine a mystery recipe belongs to. If you simply count raw ingredient quantities (Bag of Words), the recipe lists "4 cups water, 2 tablespoons salt, 1 tablespoon oil". These high-frequency ingredients make up 90% of the bowl, but water and salt appear in nearly every kitchen on Earth: they tell you nothing about whether the dish is French, Indian, or Mexican. Term Frequency is how much of an ingredient is in the bowl. Inverse Document Frequency is like consulting a global culinary spice pantry: salt is in 100% of pantries (IDF near zero); olive oil is in 40% (modest IDF); but "garam masala" is found in only 3% of pantries, and "fenugreek" in only 1%. Multiplying quantity by spice rarity immediately highlights the teaspoon of fenugreek as the true signature of the dish, correctly identifying the cuisine in seconds.`,
  steps: [
    {
      title: r`Construct global vocabulary dictionary`,
      desc: r`Extract all unique tokens across the document corpus and assign column indices.`,
      detail: r`Tokenise and normalise all documents across corpus $D$. Collect the set of unique words $\mathcal{V} = \{w_1, \dots, w_V\}$. Optionally prune words below a minimum document frequency (min_df) or above a maximum frequency (max_df) to eliminate noise and extreme stop words.`,
    },
    {
      title: r`Compute Term Frequency (TF) matrix`,
      desc: r`Count occurrences of each vocabulary word within each individual document.`,
      detail: r`Construct the document-term count matrix $C \in \mathbb{R}^{N \times V}$. Compute Term Frequency $\text{tf}(t, d)$: options include raw counts $f_{t, d}$, relative frequency $\frac{f_{t, d}}{\sum_{t'} f_{t', d}}$, or sub-linear logarithmic frequency $1 + \log(f_{t, d})$ (for $f_{t, d} > 0$) to diminish the leverage of repeated mentions.`,
    },
    {
      title: r`Calculate Inverse Document Frequency (IDF) vector`,
      desc: r`Measure the global rarity of each vocabulary word across the entire corpus.`,
      detail: r`For each word $t \in \mathcal{V}$, count the document frequency $\operatorname{df}(t) = |\{d \in D : t \in d\}|$. Compute smoothed IDF: $\operatorname{idf}(t) = \log\left(\frac{1 + N}{1 + \operatorname{df}(t)}\right) + 1$, where adding 1 to numerator and denominator prevents division by zero and ensures words appearing in all documents retain non-zero positive weights.`,
    },
    {
      title: r`Form TF-IDF matrix and apply L2 normalisation`,
      desc: r`Multiply local frequencies by global weights and project vectors onto the unit sphere.`,
      detail: r`Compute unnormalised weights $w_{d, t} = \text{tf}(t, d) \cdot \operatorname{idf}(t)$. For each document vector $\mathbf{w}_d$, divide by its Euclidean norm: $\tilde{\mathbf{w}}_d = \frac{\mathbf{w}_d}{\|\mathbf{w}_d\|_2} = \frac{\mathbf{w}_d}{\sqrt{\sum_t w_{d, t}^2}}$. $L_2$ normalisation neutralises document length differences completely.`,
    },
    {
      title: r`Query matching via cosine similarity`,
      desc: r`Rank documents by relevance to an incoming user search string.`,
      detail: r`Transform the search query into a TF-IDF vector $\mathbf{q}$ using the pre-computed corpus IDF weights and normalise $\|\mathbf{q}\|_2 = 1$. Evaluate relevance scores across all corpus documents via matrix multiplication: $\mathbf{s} = X_{\text{tfidf}} \mathbf{q}$. Sort documents descending by score to return top search results.`,
    },
  ],
  math: [
    {
      h: r`Smooth Inverse Document Frequency (scikit-learn standard)`,
      tex: r`\operatorname{idf}(t, D) = \log\left(\frac{1 + N}{1 + \operatorname{df}(t)}\right) + 1`,
      p: r`Here $N = |D|$ is the total number of documents in the corpus, and $\operatorname{df}(t) = |\{d \in D : t \in d\}|$ is the number of documents containing term $t$. The additive smoothing $+1$ ensures that words present in all documents do not receive a weight of zero.`,
    },
    {
      h: r`TF-IDF term weight calculation`,
      tex: r`\operatorname{tfidf}(t, d, D) = \operatorname{tf}(t, d) \cdot \operatorname{idf}(t, D)`,
      p: r`Term frequency $\operatorname{tf}(t, d)$ rewards words that appear frequently within document $d$, while $\operatorname{idf}(t, D)$ penalises words that appear commonly across the entire collection $D$, maximising the weight of domain-specific keywords.`,
    },
    {
      h: r`Cosine similarity over L2-normalised vectors`,
      tex: r`\cos(\theta) = \frac{\mathbf{x} \cdot \mathbf{y}}{\|\mathbf{x}\|_2 \|\mathbf{y}\|_2} = \sum_{t \in \mathcal{V}} \tilde{x}_t \cdot \tilde{y}_t \in [0, 1]`,
      p: r`Because TF-IDF entries are strictly non-negative ($x_t \ge 0$), the cosine of the angle between two document vectors is bounded in $[0, 1]$. An angle of $0^\circ$ ($\cos=1$) denotes identical relative term distributions, while an angle of $90^\circ$ ($\cos=0$) indicates completely disjoint vocabularies.`,
    },
  ],
  keyPoints: [
    r`The Bag of Words model represents text as fixed-length vectors of token counts, discarding grammatical syntax and word order.`,
    r`TF-IDF multiplies local Term Frequency by global Inverse Document Frequency to elevate uniquely informative keywords.`,
    r`Inverse Document Frequency (IDF) penalises ubiquitous terms, automatically dampening function words like "the" and "is".`,
    r`$L_2$ vector normalisation eliminates document length bias, allowing fair comparison between short abstracts and long treatises.`,
    r`Cosine similarity over normalised sparse TF-IDF vectors powers classical search ranking, document clustering, and text classification.`,
  ],
  pitfalls: [
    r`Ignoring vocabulary out-of-vocabulary (OOV) terms at test time: Words in test documents that never appeared in the training corpus have undefined IDF weights and must be ignored or mapped to an unknown token.`,
    r`Fitting TF-IDF on test data (data leakage): Computing IDF on the combination of training and test sets leaks global corpus statistics; always fit the TfidfVectorizer strictly on training data and transform test data.`,
    r`Failing to apply sub-linear TF scaling: Raw count TF assumes that twenty mentions of a word imply twenty times more importance than a single mention; sub-linear scaling ($1 + \log(\text{tf})$) mitigates this distortion.`,
    r`Dense array conversion memory blowup: Storing TF-IDF matrices as dense NumPy arrays ($N \times V$) consumes tens of gigabytes of RAM; always maintain representations as scipy.sparse CSR matrices.`,
    r`Polysemy and synonymy blindness: TF-IDF treats "sofa" and "couch" as completely orthogonal dimensions (synonymy), and cannot distinguish between "bank" of a river and financial "bank" (polysemy); dense neural embeddings resolve these semantic gaps.`,
  ],
  code: r`import numpy as np
import re

# Small corpus of 4 documents across two distinct topics (machine learning vs cooking)
corpus = [
    "Machine learning models require training data and algorithms.",
    "Deep neural networks learn representations from training data.",
    "The chef prepared a delicious pasta recipe with garlic sauce.",
    "Italian pasta dishes require garlic, olive oil, and fresh herbs."
]

# 1. Build Vocabulary
def tokenize(text):
    return [w for w in re.split(r'\W+', text.lower()) if len(w) > 2]

tokenized_corpus = [tokenize(doc) for doc in corpus]
vocab = sorted(list(set(w for doc in tokenized_corpus for w in doc)))
word_to_idx = {w: i for i, w in enumerate(vocab)}
N = len(corpus)
V = len(vocab)

print(f"Corpus size: {N} documents")
print(f"Vocabulary size: {V} unique terms")

# 2. Compute Count Matrix (Bag of Words)
count_matrix = np.zeros((N, V), dtype=np.float32)
for doc_idx, tokens in enumerate(tokenized_corpus):
    for tok in tokens:
        if tok in word_to_idx:
            count_matrix[doc_idx, word_to_idx[tok]] += 1.0

# 3. Compute Smooth Inverse Document Frequency (IDF)
# idf(t) = log((1 + N) / (1 + df(t))) + 1
doc_freq = np.sum(count_matrix > 0, axis=0)  # number of documents containing term
smooth_idf = np.log((1.0 + N) / (1.0 + doc_freq)) + 1.0

# 4. Compute TF-IDF Matrix and L2 Normalisation
tf_matrix = count_matrix  # using raw count TF
tfidf = tf_matrix * smooth_idf

# L2 vector normalisation per document row
row_norms = np.linalg.norm(tfidf, axis=1, keepdims=True)
tfidf_norm = tfidf / np.maximum(row_norms, 1e-8)

print("\nSample IDF weights:")
for sample_word in ["training", "garlic", "pasta", "data"]:
    w_idx = word_to_idx[sample_word]
    print(f"  '{sample_word:<10}': df={doc_freq[w_idx]:.0f}/{N}, IDF={smooth_idf[w_idx]:.4f}")

# 5. Information Retrieval Query Matching via Cosine Similarity
query = "pasta recipe garlic"
q_tokens = tokenize(query)
q_counts = np.zeros(V, dtype=np.float32)
for tok in q_tokens:
    if tok in word_to_idx:
        q_counts[word_to_idx[tok]] += 1.0

q_tfidf = q_counts * smooth_idf
q_norm = q_tfidf / np.maximum(np.linalg.norm(q_tfidf), 1e-8)

# Cosine similarity: dot product of normalized vectors
similarities = tfidf_norm @ q_norm

print(f"\nQuery: '{query}'")
print("Document relevance rankings (Cosine Similarity):")
ranked_indices = np.argsort(similarities)[::-1]
for rank, idx in enumerate(ranked_indices):
    print(f"  Rank {rank+1} (Score: {similarities[idx]:.4f}): \"{corpus[idx]}\"")

assert ranked_indices[0] == 2, "Top ranked document should be doc 3 (pasta recipe)!"
print("\nVerified: TF-IDF vectorisation and cosine similarity ranking executed successfully!")`,
  quiz: [
    {
      q: r`Why does Inverse Document Frequency (IDF) take the logarithm of inverse document frequency ($\log\frac{N}{\operatorname{df}(t)}$)?`,
      o: [
        r`To dampen the effect of extreme rarity; without the logarithm, a term appearing in 1 document out of 1,000,000 would receive an overwhelmingly massive weight of 1,000,000`,
        r`To convert negative counts into positive numbers`,
        r`Because computers can only multiply numbers that have been logged`,
        r`To prevent words with odd numbers of letters from being indexed`,
      ],
      a: 0,
      why: r`Linear inverse document frequency ($N / \operatorname{df}$) would scale by millions for rare typos or hapax legomena, swamping all other words. The logarithmic damping scales rarity gracefully according to information theory.`,
    },
    {
      q: r`What is the primary purpose of applying $L_2$ normalisation to document TF-IDF vectors?`,
      o: [
        r`To eliminate document length bias, ensuring that a 200-word summary and a 2,000-word detailed report on the identical topic map to the same directional vector`,
        r`To compress the sparse matrix into a single byte`,
        r`To convert all vector coefficients into integer values`,
        r`To invert the polarity of negative sentiment words`,
      ],
      a: 0,
      why: r`Long documents naturally contain higher word counts purely by virtue of length. $L_2$ normalisation projects each vector onto the unit hypersphere, making cosine similarity sensitive purely to relative word distributions rather than absolute volume.`,
    },
    {
      q: r`What classic semantic limitation does the Bag of Words model suffer from due to discarding word sequence order?`,
      o: [
        r`It cannot distinguish between phrases with identical words but opposite meanings, such as "man bites dog" versus "dog bites man"`,
        r`It cannot represent words longer than eight characters`,
        r`It fails when processing text with more than 100 sentences`,
        r`It cannot be trained using scikit-learn`,
      ],
      a: 0,
      why: r`Because the Bag of Words representation pools all word counts into a single histogram, all syntactic order, grammatical roles, and phrase compositions are discarded, making permutations of the same words indistinguishable.`,
    },
    {
      q: r`Why is it critical to compute IDF weights strictly on the training set and avoid fitting on test data?`,
      o: [
        r`Fitting IDF on test documents causes data leakage by exposing global corpus frequency statistics from the test set to the feature extraction pipeline`,
        r`Because test documents cannot be tokenised using regular expressions`,
        r`Because computing test IDF causes division by zero`,
        r`Because scikit-learn throws an unhandled exception when transforming test data`,
      ],
      a: 0,
      why: r`IDF reflects global corpus statistics. If test documents are included when calculating document frequencies, the model gains illicit foresight into the test distribution (data leakage). Preprocessors must be fit exclusively on training data.`,
    },
  ],
  usedBy: [],
  prereq: ['word-and-sentence-tokenization', 'stop-words-and-n-grams', 'text-normalisation-unicode-and-regex'],
  related: ['stop-words-and-n-grams', 'word-and-sentence-tokenization', 'text-normalisation-unicode-and-regex'],
  keywords: 'bag of words bow tf idf term frequency inverse document frequency information retrieval count vectorizer cosine similarity karen sparck jones nlp text classification',
},
];
