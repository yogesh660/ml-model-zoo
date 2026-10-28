// From text to vectors: the two steps that happen before a Transformer sees anything.
// Tokenization (text -> integer ids) and embeddings (ids -> vectors, plus position).
// See regression.js for conventions.
const r = String.raw;

module.exports = [
  {
    id: 'tokenization', short: 'Tokenization (BPE)', title: 'Tokenization and Byte-Pair Encoding (BPE)',
    task: 'concepts', level: 2, minutes: 20,
    explainer: 'bpe', architecture: 'tokenizer', labFile: 'language',
    archIntro: r`What happens to a sentence between you pressing Enter and the model doing any maths, shown with GPT-2’s real tokenizer settings. Hover over any stage (or tap it on a phone) for what it does and an example.`,
    summary: r`Models read numbers, not text. A tokenizer cuts text into pieces from a fixed vocabulary and gives each piece an id. Byte-Pair Encoding learns those pieces by repeatedly merging the most frequent pair.`,
    lead: r`A tokenizer turns <code class="no-math">"Tokenizers are unbelievably useful"</code> into a short list of integers, one per piece. It is not a neural network and it is not trained by gradient descent: it is a fixed lookup procedure, learned once from a large text corpus, and every model is tied to the tokenizer it was trained with.`,
    intuition: [
      r`There are three obvious ways to cut text. <strong>Characters</strong> need a tiny vocabulary and never meet an unknown symbol, but sequences become very long, and attention cost grows with the square of the length. <strong>Whole words</strong> keep sequences short, but the vocabulary explodes (every name, typo and verb form) and any word not seen in training becomes an unknown <code class="no-math">[UNK]</code>. <strong>Subwords</strong> sit in between: frequent words stay whole (<em>the</em>, <em>model</em>), rare words are split into reusable parts (for example <em>un</em> + <em>believ</em> + <em>ably</em>).`,
      r`<strong>Byte-Pair Encoding</strong> finds those subwords automatically. Start with single characters. Count every pair of neighbouring symbols in the corpus, merge the most frequent pair into one new symbol, and repeat. Each merge adds one entry to the vocabulary; after a few tens of thousands of merges, common words are single tokens and everything else can still be spelled out from smaller pieces. To tokenize new text, the same merges are replayed in the same order.`,
      r`Modern LLM tokenizers run BPE on <strong>bytes</strong> instead of characters (GPT-2, GPT-4, Llama 3). The 256 possible byte values form the base vocabulary, so any text in any language, emoji or binary junk can be encoded and nothing is ever unknown. The price is that languages under-represented in the training corpus need many more tokens for the same sentence, which makes them slower and more expensive to process.`,
    ],
    analogy: r`Text messaging shorthand that grows over time: people who type “thank you” often enough start writing “ty”. BPE does the same thing statistically: the most frequent pairs earn their own shortcut, rare words are still spelled out letter by letter.`,
    steps: [
      r`<strong>Normalise</strong> the text if the tokenizer does that (Unicode normalisation, sometimes lower-casing; GPT-style tokenizers keep text exactly as is).`,
      r`<strong>Pre-tokenize</strong>: split into word-like chunks on spaces and punctuation with a regular expression, keeping the leading space as part of the word (GPT-2 shows it as <code class="no-math">Ġ</code>, SentencePiece as <code class="no-math">▁</code>), so merges never cross word boundaries.`,
      r`<strong>Train</strong> (once): start from characters or bytes, repeatedly merge the most frequent adjacent pair, and record every merge in order until the vocabulary reaches its target size.`,
      r`<strong>Encode</strong> new text: split each chunk into bytes and apply the recorded merges in priority order. Look up each resulting piece in the vocabulary to get its id.`,
      r`Add <strong>special tokens</strong> such as <code class="no-math">&lt;|endoftext|&gt;</code>, <code class="no-math">[CLS]</code>, <code class="no-math">[SEP]</code> or chat-role markers, and pad or truncate to the context length.`,
      r`<strong>Decode</strong> is the reverse: ids → pieces → bytes → text. Encoding then decoding gives back the exact original string.`,
    ],
    math: [
      { h: 'One BPE merge', tex: r`$$(a^\*, b^\*) = \arg\max_{(a,b)} \operatorname{count}(a\,b), \qquad V \leftarrow V \cup \{a^\*b^\*\}$$`, p: r`Count each adjacent pair across the corpus, weighted by how often each word occurs. The winning pair becomes one symbol everywhere, and the counts are recomputed.` },
      { h: 'Vocabulary size', tex: r`$$|V| = |\text{base symbols}| + \#\text{merges} + \#\text{special tokens}$$`, p: r`GPT-2: $256$ bytes $+\; 50{,}000$ merges $+\; 1$ end-of-text token $= 50{,}257$. A bigger vocabulary means shorter sequences but a larger embedding table and rarer, less well-trained tokens.` },
      { h: 'WordPiece (BERT) picks merges differently', tex: r`$$\text{score}(a, b) = \frac{\operatorname{count}(ab)}{\operatorname{count}(a)\,\operatorname{count}(b)}$$`, p: r`Instead of raw frequency, it prefers pairs that occur together more often than their parts would suggest. Continuation pieces are marked with ##: <code class="no-math">un ##believ ##ably</code>.` },
      { h: 'Unigram LM (SentencePiece) works the other way round', tex: r`$$\hat{\mathbf x} = \arg\max_{\mathbf x \in S(\text{text})} \prod_i p(x_i)$$`, p: r`Start from a large candidate vocabulary and prune the pieces that hurt the corpus likelihood least. Encoding picks the most probable segmentation, and training can sample different segmentations as a form of regularisation.` },
      { h: 'Why token count matters', tex: r`$$\text{attention cost} \propto T^2, \qquad T \approx \frac{\text{characters}}{4} \text{ for English}$$`, p: r`Context limits, API prices and latency are all counted in tokens. Text that tokenizes badly (rare languages, long numbers, unusual code) uses up the context window faster.` },
    ],
    keyPoints: [
      r`A tokenizer is fixed before the model is trained; a model only understands ids from its own tokenizer.`,
      r`BPE = start from characters or bytes, repeatedly merge the most frequent neighbouring pair, replay those merges to encode.`,
      r`Byte-level BPE never produces an unknown token, but rare scripts and languages can take several times more tokens.`,
      r`Many “LLM quirks” are tokenizer quirks: counting letters in a word, arithmetic on long numbers, and leading-space sensitivity.`,
    ],
    code: r`# 1) Byte-pair encoding from scratch on a toy corpus
from collections import Counter

corpus = {"low": 5, "lower": 2, "newest": 6, "widest": 3}
words = {tuple(w) + ("</w>",): c for w, c in corpus.items()}       # split into characters

def merge_step(words):
    pairs = Counter()
    for sym, c in words.items():
        for a, b in zip(sym, sym[1:]):
            pairs[a, b] += c
    (a, b), n = pairs.most_common(1)[0]
    out = {}
    for sym, c in words.items():
        new, i = [], 0
        while i < len(sym):
            if i < len(sym) - 1 and sym[i] == a and sym[i + 1] == b:
                new.append(a + b); i += 2
            else:
                new.append(sym[i]); i += 1
        out[tuple(new)] = c
    return out, (a, b, n)

for _ in range(6):
    words, m = merge_step(words)
    print("merge", m)          # ('e','s',9) ('es','t',9) ('est','</w>',9) ('l','o',7) ...

# 2) A real tokenizer (pip install tiktoken)
import tiktoken
enc = tiktoken.get_encoding("gpt2")
ids = enc.encode("Tokenizers are unbelievably useful")
print(ids, [enc.decode([i]) for i in ids], enc.n_vocab)       # 50257 tokens

# 3) Train your own byte-level BPE (pip install tokenizers)
from tokenizers import ByteLevelBPETokenizer
tok = ByteLevelBPETokenizer()
tok.train(files=["my_corpus.txt"], vocab_size=8000, min_frequency=2, special_tokens=["<|endoftext|>"])`,
    pitfalls: [
      r`Using a model with a different tokenizer than it was trained with: the ids mean different things and the output is garbage.`,
      r`Estimating context length in words or characters; count tokens with the model’s own tokenizer.`,
      r`Forgetting that <code class="no-math">"Hello"</code> and <code class="no-math">" Hello"</code> are different tokens; stray spaces in prompts change what the model sees.`,
      r`Adding new special tokens without resizing (and training) the model’s embedding table.`,
    ],
    quiz: [
      { q: r`At each training step, BPE merges:`, o: [r`The two rarest characters`, r`The most frequent pair of neighbouring symbols`, r`Every pair that appears at least twice`, r`Whole words into sentences`], a: 1, why: r`One merge per step, chosen by frequency; the merge is then applied everywhere.` },
      { q: r`Why can byte-level BPE never produce an unknown token?`, o: [r`It has an infinite vocabulary`, r`Every possible byte is in the base vocabulary, so anything can be spelled out`, r`It ignores characters it does not know`, r`It uses a neural network to guess`], a: 1, why: r`Any text is a sequence of bytes, and all 256 byte values are tokens.` },
      { q: r`A larger vocabulary generally gives:`, o: [r`Longer sequences and a smaller embedding table`, r`Shorter sequences and a larger embedding table`, r`No change in sequence length`, r`Better arithmetic automatically`], a: 1, why: r`More merges mean bigger pieces (fewer tokens per text), but each extra token needs its own row of embedding weights.` },
      { q: r`To tokenize new text, a BPE tokenizer:`, o: [r`Retrains on the new text`, r`Replays the learned merges in the order they were learned`, r`Picks merges at random`, r`Looks up whole sentences`], a: 1, why: r`Merge order is the priority; that makes encoding deterministic.` },
    ],
    usedBy: ['transformer_networks'],
    prereq: ['lstm_networks'],
    related: ['embeddings', 'transformer_networks'],
    labIntro: r`A real BPE tokenizer, trained in your browser on a short paragraph about machine learning (shown below the lab). Drag the merges slider to grow the vocabulary, or press <em>Train</em> to watch the merges happen one by one. Type anything into the box to see how it is cut up and which ids it gets.`,
    tryThis: [
      r`Set merges to 0: every character is its own token. Now press <em>Train</em> and watch frequent words like “ the” and “ model” collapse into single tokens.`,
      r`Type a word that is not in the corpus, like “unlearnable” or “remodel”. It is still tokenized, from pieces the tokenizer has seen.`,
      r`Type “Model” with a capital M, or a word in Hindi or an emoji. Unseen characters fall back to raw bytes, and the token count jumps.`,
      r`Compare “ the” with “the” at the start of the box: the leading space is part of the token.`,
    ],
    keywords: 'tokenization tokenizer bpe byte pair encoding wordpiece sentencepiece unigram subword vocabulary tiktoken gpt token ids',
  },
  {
    id: 'embeddings', short: 'Embeddings', title: 'Embeddings and Positional Encoding',
    task: 'concepts', level: 2, minutes: 22,
    explainer: 'embed', architecture: 'embedding', labFile: 'language',
    archIntro: r`The input layer of a GPT-2-sized Transformer, from token ids to the vectors the first attention layer reads. Hover over any part (or tap it on a phone) for its shape, its parameter count and what it learns.`,
    summary: r`An embedding turns each token id into a learned vector, so that similar tokens end up close together. Positional encodings add the word order that attention would otherwise ignore.`,
    lead: r`A token id like <code class="no-math">2746</code> is just a name: id 2746 is not “bigger” or “closer” to anything than id 12. An <strong>embedding</strong> replaces each id with a row of a learned table, a vector of a few hundred numbers, and training arranges those vectors so that their geometry means something: similar words point in similar directions.`,
    intuition: [
      r`The naive way to feed ids to a network is <strong>one-hot</strong> vectors: 50,257 numbers, all zero except a single 1. They are huge, and every pair of words is equally far apart, so “cat” is no more similar to “kitten” than to “carburettor”. Multiplying a one-hot vector by a weight matrix just picks out one row of it, so in practice we skip the multiplication and <strong>look the row up</strong>. That table of rows is the embedding layer: a matrix of shape vocabulary × d.`,
      r`The rows start random and are learned. Words that appear in similar contexts receive similar gradients and drift together (“You shall know a word by the company it keeps”). Directions in the space can become meaningful too: the step from <em>man</em> to <em>woman</em> is roughly the same as from <em>king</em> to <em>queen</em>. Word2vec and GloVe learned such vectors on their own; in a Transformer the table is simply the first layer and is trained together with everything else.`,
      r`Self-attention compares every token with every other token but has no idea where they are: “dog bites man” and “man bites dog” would look identical. So a <strong>positional encoding</strong> is added to each token’s embedding. The original Transformer used fixed sine and cosine waves of different wavelengths; GPT-2 and BERT learn one vector per position; many current LLMs (Llama, Mistral) use rotary embeddings (RoPE), which rotate queries and keys by an angle that depends on position.`,
      r`Embeddings at the input are <strong>static</strong>: “bank” has one vector whether it is a river bank or a money bank. After a few attention layers the vector is mixed with its context and becomes <strong>contextual</strong>. Those contextual vectors, pooled over a sentence, are the “sentence embeddings” used for semantic search and retrieval-augmented generation.`,
    ],
    analogy: r`A map of a city where every word is a building. At first the buildings are scattered at random. Over training, words that are used for the same purposes move into the same neighbourhood, and the streets between neighbourhoods start to mean something: walking “north” might always mean “more formal”, walking “east” “female rather than male”.`,
    steps: [
      r`Tokenize the text into ids ([[tokenization|see tokenization]]).`,
      r`Create an embedding matrix $E$ of shape $|V| \times d$ (for GPT-2 small: $50{,}257 \times 768$), initialised with small random numbers.`,
      r`For each id, take its row: $e_t = E[\text{id}_t]$. A sentence of $T$ tokens becomes a $T \times d$ matrix.`,
      r`Add a position vector $p_t$ for each position $t$ (sinusoidal, learned, or applied later as a rotation with RoPE).`,
      r`Feed the result into the first [[transformer_networks|Transformer]] block. Gradients from the loss flow all the way back into the rows of $E$ that were used.`,
      r`Optionally reuse $E^\top$ as the output layer (weight tying), so the same table maps ids to vectors and vectors back to scores over ids.`,
    ],
    math: [
      { h: 'Lookup = one-hot times a matrix', tex: r`$$e = \mathbf 1_{\text{id}}^\top E = E[\text{id}, :] \in \mathbb R^{d}$$`, p: r`Mathematically a linear layer applied to a one-hot vector, implemented as an index operation because the one-hot vector would be enormous.` },
      { h: 'Similarity is an angle', tex: r`$$\cos(u, v) = \frac{u \cdot v}{\lVert u\rVert\,\lVert v\rVert} \in [-1, 1]$$`, p: r`1 means the same direction, 0 unrelated, −1 opposite. Nearest-neighbour search over embeddings almost always uses cosine similarity or a dot product.` },
      { h: 'Learning from co-occurrence (GloVe)', tex: r`$$J = \sum_{i,j} f(X_{ij})\,\big(w_i \cdot \tilde w_j + b_i + \tilde b_j - \log X_{ij}\big)^2$$`, p: r`$X_{ij}$ counts how often word $j$ appears near word $i$. Fitting dot products to log counts forces words with similar neighbours to have similar vectors. The lab on this page trains exactly this kind of objective.` },
      { h: 'Sinusoidal positional encoding', tex: r`$$PE_{(t,\,2i)} = \sin\!\Big(\frac{t}{10000^{2i/d}}\Big), \qquad PE_{(t,\,2i+1)} = \cos\!\Big(\frac{t}{10000^{2i/d}}\Big)$$`, p: r`Each pair of dimensions is a clock ticking at a different speed: early dimensions change every token, late ones barely change across thousands. Any shift $k$ is a fixed rotation, so relative positions are easy to read off.` },
      { h: 'What the first block receives', tex: r`$$x_t = E[\text{id}_t] + p_t, \qquad X \in \mathbb R^{T \times d}$$`, p: r`The original Transformer also multiplied $E[\text{id}_t]$ by $\sqrt d$ so the embedding is not drowned out by the position signal.` },
      { h: 'Parameter count', tex: r`$$|V| \cdot d = 50{,}257 \times 768 \approx 38.6\text{ M}$$`, p: r`About 31% of GPT-2 small’s 124 M parameters sit in this one table, which is why output layers usually share (tie) it.` },
    ],
    keyPoints: [
      r`An embedding layer is a learned lookup table: id in, vector out. It is trained like any other weight.`,
      r`Closeness in embedding space (cosine similarity) reflects similar usage, not dictionary meaning.`,
      r`Attention is blind to order; positional information must be added (sinusoidal, learned or RoPE).`,
      r`Input embeddings are static; vectors after attention layers are contextual, and those are what sentence embeddings and semantic search use.`,
    ],
    code: r`import math, torch, torch.nn as nn

vocab, d, T = 50257, 768, 8
ids = torch.randint(0, vocab, (1, T))              # stand-in for one tokenized sentence

tok_emb = nn.Embedding(vocab, d)                 # the lookup table, vocab x d
pos_emb = nn.Embedding(1024, d)                  # learned positions (GPT-2 / BERT style)
x = tok_emb(ids) + pos_emb(torch.arange(T))      # (1, T, d): what the first block reads

# fixed sinusoidal positions (original Transformer)
def sinusoidal(T, d):
    pos = torch.arange(T).unsqueeze(1)
    freq = torch.exp(torch.arange(0, d, 2) * (-math.log(10000.0) / d))
    pe = torch.zeros(T, d)
    pe[:, 0::2], pe[:, 1::2] = torch.sin(pos * freq), torch.cos(pos * freq)
    return pe

# cosine similarity between two token vectors
cos = nn.functional.cosine_similarity(tok_emb.weight[ids[0, 1]], tok_emb.weight[ids[0, 2]], dim=0)

# pre-trained sentence embeddings for search (pip install sentence-transformers)
# from sentence_transformers import SentenceTransformer
# model = SentenceTransformer("all-MiniLM-L6-v2")          # 384-dimensional vectors
# vecs = model.encode(["a cat on a mat", "a kitten on a rug"], normalize_embeddings=True)`,
    pitfalls: [
      r`Comparing embeddings from two different models; each model has its own space and the axes do not line up.`,
      r`Reading analogies like king − man + woman ≈ queen as proof of understanding: they work for some relations and fail quietly for many others, and they inherit biases from the training text.`,
      r`Using the raw input embeddings of a Transformer as sentence embeddings; use a model trained for sentence similarity.`,
      r`Forgetting positional information in a custom attention model, then wondering why word order has no effect.`,
    ],
    quiz: [
      { q: r`An embedding layer is mathematically equivalent to:`, o: [r`A convolution`, r`Multiplying a one-hot vector by a weight matrix`, r`A softmax over the vocabulary`, r`A fixed hash function`], a: 1, why: r`The product picks out one row, so frameworks implement it as a lookup.` },
      { q: r`Why do Transformers need positional encodings?`, o: [r`To make embeddings smaller`, r`Self-attention treats its input as an unordered set`, r`To normalise the vectors`, r`To speed up the softmax`], a: 1, why: r`Without positions, shuffling the words gives the same set of outputs.` },
      { q: r`Two words have cosine similarity close to 1. That means:`, o: [r`They are spelled similarly`, r`Their vectors point in nearly the same direction, usually because they are used in similar contexts`, r`They have the same token id`, r`They always appear next to each other`], a: 1, why: r`Similar contexts produce similar gradients, which pull the vectors together.` },
      { q: r`How many parameters does a 50,257 × 768 embedding table have?`, o: [r`768`, r`50,257`, r`About 38.6 million`, r`About 124 million`], a: 2, why: r`One 768-number row per token: $50{,}257 \times 768$.` },
    ],
    usedBy: ['transformer_networks', 'recurrent_neural_networks', 'lstm_networks'],
    prereq: ['tokenization'],
    related: ['tokenization', 'transformer_networks', 'gradient-descent'],
    labIntro: r`Sixteen words and about a hundred short sentences (“the queen lives in the palace”, “the puppy chased the ball”). Press <em>Train</em> to learn 8-dimensional word vectors from scratch with a GloVe-style objective, right here in your browser; the map shows them projected to 2-D. Then click words to find their nearest neighbours, or try a vector analogy.`,
    tryThis: [
      r`Press <em>Train</em> and watch the random cloud sort itself into royals, ordinary people, animals and food.`,
      r`Click “cat”: its nearest neighbour is “dog”, not “kitten”. Both are adult pets that sleep all day, so they share more contexts.`,
      r`Switch to <em>Analogy</em> and pick king − man + woman: the arrow from man to woman, added to king, lands next to queen.`,
      r`Press <em>Random start</em> and look at the analogy again: before training, the arithmetic finds nothing.`,
    ],
    keywords: 'embedding embeddings word2vec glove vector one-hot cosine similarity positional encoding sinusoidal rope learned position semantic search',
  },
];
