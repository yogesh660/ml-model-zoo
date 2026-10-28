// Sequence models: RNN -> GRU -> LSTM -> Transformer. See regression.js for conventions.
const r = String.raw;

const digitsLoad = r`import torch, torch.nn as nn
from sklearn.datasets import load_digits

# read each 8x8 digit image as a sequence: 8 time steps, 8 pixels per step
digits = load_digits()
X = torch.tensor(digits.images / 16.0, dtype=torch.float32)    # (n, 8, 8)
y = torch.tensor(digits.target)`;

module.exports = [
  {
    id: 'recurrent_neural_networks', explainer: 'rnn', short: 'RNNs', title: 'Recurrent Neural Networks (RNNs)',
    task: 'classification', module: 'Sequences', level: 2, minutes: 18,
    summary: r`A network with a memory: it reads a sequence one step at a time and carries a hidden state forward. Simple, and forgetful.`,
    lead: r`An RNN reads a sequence one item at a time. At every step it mixes the new input with a running summary of everything so far, the <strong>hidden state</strong> $h_t$, and passes that summary on to the next step.`,
    intuition: [
      r`Feed-forward networks see a fixed-size input all at once. Text, speech, sensor readings and prices arrive as sequences of any length, where order matters. An RNN handles this with one small trick: the same cell is applied at every step, and its output at step $t$ becomes part of its input at step $t+1$.`,
      r`Think of $h_t$ as a short note the network keeps updating as it reads. With one hidden unit, $h_t = \tanh(w\,h_{t-1} + u\,x_t)$. If the recurrent weight $|w| < 1$, an input from 10 steps ago has been multiplied by $w$ ten times, so it fades: $0.8^{10} \approx 0.1$. If $|w| > 1$ things blow up (and tanh saturates). Training has the same problem in reverse: gradients flowing back through time shrink or explode, so vanilla RNNs struggle to learn anything that spans more than a handful of steps. That is the problem [[gru_networks|GRUs]] and [[lstm_networks|LSTMs]] were built to solve.`,
    ],
    analogy: r`Reading a book while only allowed to keep a single sticky note: every page you overwrite a little of it, so early chapters slowly blur away.`,
    steps: [
      r`Start with $h_0 = 0$.`,
      r`At each step, combine the previous state and the new input: $h_t = \tanh(W_h h_{t-1} + W_x x_t + b)$. The same weights are reused at every step.`,
      r`Read out what you need: the last state $h_T$ for classifying a whole sequence, or every $h_t$ for tagging each step.`,
      r`Train with backpropagation through time (BPTT): unroll the loop into a deep network with shared weights and backpropagate through it.`,
      r`Clip gradients to stop explosions; use a GRU or LSTM when you need longer memory.`,
    ],
    math: [
      { h: 'The recurrence', tex: r`$$h_t = \tanh(W_h\,h_{t-1} + W_x\,x_t + b), \qquad \hat y = \operatorname{softmax}(W_o\,h_T + c)$$`, p: r`$W_h$, $W_x$ and $b$ are shared across all time steps, so the parameter count does not grow with sequence length.` },
      { h: 'Why memory fades (and gradients vanish)', tex: r`$$\frac{\partial h_T}{\partial h_k} = \prod_{t=k+1}^{T} \operatorname{diag}\!\big(1 - h_t^2\big)\,W_h$$`, p: r`A product of $T - k$ matrices. If their size is below 1 the product shrinks exponentially with distance (vanishing); above 1 it grows (exploding). The lab shows exactly this product for a one-unit RNN.` },
    ],
    hyper: [[r`hidden_size`, r`Size of the memory vector $h_t$.`, r`32–256.`], [r`num_layers`, r`Stacked recurrent layers.`, r`1–2.`], [r`nonlinearity`, r`tanh or relu.`, r`tanh (relu explodes more easily).`], [r`gradient clipping`, r`Caps gradient norm during BPTT.`, r`clip_grad_norm_ at 1.0.`]],
    pros: ['Handles sequences of any length with a fixed number of parameters.', 'Small, simple and fast per step; natural for streaming data.', 'The conceptual base for GRUs and LSTMs.'],
    cons: ['Short memory: vanishing gradients after roughly 10–20 steps.', 'Exploding gradients without clipping.', 'Sequential: each step waits for the previous one, so training does not parallelise over time.'],
    use: r`Short sequences, streaming or on-device settings where a tiny model matters, or to understand the ideas behind gated RNNs.`,
    avoid: r`Anything that needs long-range memory; use a [[lstm_networks|LSTM]], [[gru_networks|GRU]] or [[transformer_networks|Transformer]].`,
    complexity: [r`$O(T\,d^2)$ per sequence, sequential in $T$`, r`$O(d^2)$ per step`],
    glance: { learns: 'Shared input, recurrent and output weights', family: 'Recurrent network' },
    code: digitsLoad + r`

class RNNClassifier(nn.Module):
    def __init__(self, hidden=64):
        super().__init__()
        self.rnn = nn.RNN(input_size=8, hidden_size=hidden, batch_first=True)
        self.out = nn.Linear(hidden, 10)

    def forward(self, x):
        states, h_last = self.rnn(x)        # states: every h_t, h_last: final h_T
        return self.out(h_last[-1])

model = RNNClassifier()
opt = torch.optim.Adam(model.parameters(), lr=2e-3)
for epoch in range(30):
    opt.zero_grad()
    loss = nn.functional.cross_entropy(model(X), y)
    loss.backward()
    nn.utils.clip_grad_norm_(model.parameters(), 1.0)     # tame exploding gradients
    opt.step()`,
    pitfalls: [r`Forgetting gradient clipping and watching the loss jump to NaN.`, r`Expecting a vanilla RNN to remember something from 50 steps ago.`, r`Padding variable-length sequences and letting the padding flow into $h_T$; use packed sequences or masks.`],
    quiz: [
      { q: r`What makes an RNN "recurrent"?`, o: [r`It has many layers`, r`Its hidden state from the previous step is fed back in at the next step`, r`It uses convolutions over time`, r`It reads the sequence backwards`], a: 1, why: r`The loop $h_{t-1} \to h_t$ with shared weights is the defining feature.` },
      { q: r`With a recurrent weight of 0.5, roughly how much of an input survives 5 steps later (ignoring tanh)?`, o: [r`50%`, r`10%`, r`About 3%`, r`All of it`], a: 2, why: r`$0.5^5 = 0.03$. Memory fades geometrically.` },
      { q: r`Why does a vanilla RNN struggle with long-range dependencies?`, o: [r`It has too few parameters`, r`Gradients are multiplied by the recurrent Jacobian at every step and shrink or explode`, r`It cannot process long inputs`, r`It has no output layer`], a: 1, why: r`Backpropagation through time multiplies many Jacobians together.` },
    ],
    related: ['gru_networks', 'lstm_networks', 'mlp_classifier'],
    prereq: ['mlp_classifier'],
    concepts: ['gradient-descent', 'sigmoid-and-link-functions'],
    labIntro: r`A one-unit RNN, unrolled over 24 time steps. Each box is the same cell at a different time; its colour is the hidden state $h_t$. Press <em>Play</em> to watch an input travel through the sequence, then change the recurrent weight $w$.`,
    tryThis: [r`With $w = 0.8$, watch the first pulse fade: how much of it is left at the last step?`, r`Raise $w$ to 1.3: the state saturates near ±1 and stops responding to new inputs.`, r`Look at the bottom chart: the influence of step 1 on the final state is the vanishing gradient, plotted directly.`],
    keywords: 'rnn recurrent neural network hidden state sequence bptt vanishing gradient',
  },
  {
    id: 'gru_networks', explainer: 'gru', short: 'GRUs', title: 'Gated Recurrent Units (GRUs)',
    task: 'classification', module: 'Sequences', level: 3, minutes: 18,
    summary: r`An RNN with two gates that decide, at every step, how much of the memory to keep and how much to overwrite.`,
    lead: r`A GRU adds a learned switch to the RNN. The <strong>update gate</strong> $z_t$ decides how much of the old state to keep and how much to replace with new content. When $z_t \approx 0$, the state passes through untouched, so memory and gradients survive for many steps.`,
    intuition: [
      r`A vanilla RNN rewrites its memory at every step whether it wants to or not. A GRU instead blends: $h_t = (1 - z_t)\odot h_{t-1} + z_t \odot \tilde h_t$. With $z_t$ near 0 it copies the old state forward; near 1 it replaces it with the candidate $\tilde h_t$. Because the gate is computed from the current input and state, the network learns <em>when</em> to write.`,
      r`The <strong>reset gate</strong> $r_t$ controls how much of the old state is used when proposing the candidate. With $r_t \approx 0$ the candidate ignores history, which helps the network start a fresh thought, for example at the start of a new sentence. GRUs have fewer parameters than LSTMs and often perform about as well.`,
    ],
    analogy: r`A notebook with a pencil and an eraser: most pages you just carry forward, and you only erase and rewrite a line when something important happens.`,
    steps: [
      r`Compute the update gate $z_t = \sigma(W_z x_t + U_z h_{t-1})$ and reset gate $r_t = \sigma(W_r x_t + U_r h_{t-1})$, each between 0 and 1.`,
      r`Propose new content using the reset-scaled history: $\tilde h_t = \tanh(W x_t + U(r_t \odot h_{t-1}))$.`,
      r`Blend: $h_t = (1 - z_t)\odot h_{t-1} + z_t\odot\tilde h_t$.`,
      r`Read out from $h_T$ (or every $h_t$) as with an RNN.`,
    ],
    math: [
      { h: 'Gates', tex: r`$$z_t = \sigma(W_z x_t + U_z h_{t-1} + b_z), \qquad r_t = \sigma(W_r x_t + U_r h_{t-1} + b_r)$$`, p: r`The [[sigmoid-and-link-functions|sigmoid]] keeps each gate between 0 (closed) and 1 (open), elementwise per memory unit.` },
      { h: 'Candidate and update', tex: r`$$\tilde h_t = \tanh\!\big(W x_t + U(r_t \odot h_{t-1}) + b\big), \qquad h_t = (1 - z_t)\odot h_{t-1} + z_t\odot\tilde h_t$$`, p: r`An interpolation between keeping and replacing.` },
      { h: 'Why gradients survive', tex: r`$$\frac{\partial h_t}{\partial h_{t-1}} \approx \operatorname{diag}(1 - z_t) \quad\text{when } z_t \text{ is small}$$`, p: r`If the gate stays near 0, the Jacobian is close to the identity, so the product over many steps does not vanish. Compare with the RNN, where every step multiplies by $W_h$ and a tanh derivative.` },
    ],
    hyper: [[r`hidden_size`, r`Memory size.`, r`64–512.`], [r`num_layers`, r`Stacked GRUs.`, r`1–3.`], [r`dropout`, r`Between stacked layers.`, r`0.1–0.3.`], [r`bidirectional`, r`Also read the sequence backwards.`, r`On for whole-sequence classification.`]],
    pros: ['Remembers much longer than a vanilla RNN.', 'Fewer parameters and faster than an LSTM (two gates, no separate cell).', 'Strong default for small and medium sequence tasks.'],
    cons: ['Still sequential: slow to train on long sequences.', 'Memory still degrades over very long ranges.', 'Usually outperformed by Transformers when data is plentiful.'],
    use: r`Time series, sensor streams and text classification with modest data or compute.`,
    avoid: r`Long documents and large datasets, where Transformers parallelise better and capture longer context.`,
    complexity: [r`$O(T\,d^2)$, about 3× an RNN`, r`$O(d^2)$ per step`],
    glance: { learns: 'Gate, candidate and output weights', family: 'Gated recurrent network' },
    code: digitsLoad + r`

class GRUClassifier(nn.Module):
    def __init__(self, hidden=64):
        super().__init__()
        self.gru = nn.GRU(input_size=8, hidden_size=hidden, batch_first=True)
        self.out = nn.Linear(hidden, 10)

    def forward(self, x):
        _, h_last = self.gru(x)
        return self.out(h_last[-1])

model = GRUClassifier()
print(sum(p.numel() for p in model.parameters()), "parameters")   # ~3x an RNN of the same width`,
    pitfalls: [r`Confusing conventions: some papers (and PyTorch) swap the roles of $z_t$ and $1 - z_t$. The idea is the same.`, r`Using a GRU where a simple moving average or gradient boosting on lag features would do.`],
    quiz: [
      { q: r`What does the update gate $z_t \approx 0$ mean (in the convention used here)?`, o: [r`Erase the memory`, r`Copy the previous state forward almost unchanged`, r`Ignore the input entirely and output zero`, r`Reset the network`], a: 1, why: r`$h_t = (1 - z_t)h_{t-1} + z_t\tilde h_t \approx h_{t-1}$.` },
      { q: r`What is the reset gate for?`, o: [r`Clearing the output`, r`Deciding how much history to use when proposing new content`, r`Resetting the weights`, r`Choosing the learning rate`], a: 1, why: r`It scales $h_{t-1}$ inside the candidate computation.` },
      { q: r`Compared with an LSTM, a GRU:`, o: [r`Has more gates`, r`Has no separate cell state and fewer parameters`, r`Cannot be trained with backpropagation`, r`Is a Transformer`], a: 1, why: r`Two gates and one state vector instead of three gates plus a cell.` },
    ],
    related: ['recurrent_neural_networks', 'lstm_networks', 'transformer_networks'],
    prereq: ['recurrent_neural_networks'],
    concepts: ['sigmoid-and-link-functions', 'gradient-descent'],
    labIntro: r`The same 24-step timeline as the RNN lesson, now with an update gate. The gate opens (bright bar) when an input arrives and closes otherwise. Compare how long the GRU (cyan) and a plain RNN (grey) remember the first pulse.`,
    tryThis: [r`Lower "gate when idle" toward 0: the GRU keeps the first pulse almost perfectly while the RNN forgets it.`, r`Raise it to 0.5: the GRU now forgets about as fast as the RNN.`, r`Turn on the second pulse and see the gate open again to overwrite the memory.`],
    keywords: 'gru gated recurrent unit update gate reset gate sequence memory',
  },
  {
    id: 'lstm_networks', explainer: 'lstm', short: 'LSTMs', title: 'Long Short-Term Memory Networks (LSTMs)',
    task: 'classification', module: 'Sequences', level: 3, minutes: 22,
    summary: r`An RNN with a separate memory cell and three gates (forget, input, output) that decide what to store, keep and reveal.`,
    lead: r`An LSTM keeps two things per step: a <strong>cell state</strong> $c_t$, a long-term memory that is only changed by small, gated additions, and a <strong>hidden state</strong> $h_t$, the part it shows to the rest of the network. Three gates control the flow: forget, input and output.`,
    intuition: [
      r`Picture the cell state as a conveyor belt running through time. At each step the <strong>forget gate</strong> $f_t$ decides how much of what is on the belt to keep, the <strong>input gate</strong> $i_t$ decides how much new information to place on it, and the <strong>output gate</strong> $o_t$ decides how much of the belt to reveal as $h_t$. Because the belt is updated by addition rather than repeated squashing, information (and gradient) can travel hundreds of steps.`,
      r`The classic test is "remember something, ignore distractions, recall it later": a value appears at the start, then many irrelevant inputs follow, then the network must report the value. A vanilla RNN smears the value with every distractor. An LSTM opens its input gate once, closes it, holds the forget gate near 1, and opens the output gate at the end. The lab runs exactly this task.`,
    ],
    analogy: r`A safe with three doors: one to throw old things out, one to put new things in, one to show what is inside. Most of the time all three stay shut and the contents are kept intact.`,
    steps: [
      r`Compute three gates from $x_t$ and $h_{t-1}$: forget $f_t$, input $i_t$, output $o_t$ (each a sigmoid, 0 to 1).`,
      r`Propose new content $\tilde c_t = \tanh(W_c x_t + U_c h_{t-1})$.`,
      r`Update the cell: $c_t = f_t \odot c_{t-1} + i_t \odot \tilde c_t$ (keep some old, add some new).`,
      r`Reveal part of it: $h_t = o_t \odot \tanh(c_t)$.`,
      r`Initialise the forget-gate bias to about 1 so the network starts by remembering.`,
    ],
    math: [
      { h: 'Gates', tex: r`$$f_t = \sigma(W_f x_t + U_f h_{t-1} + b_f), \quad i_t = \sigma(W_i x_t + U_i h_{t-1} + b_i), \quad o_t = \sigma(W_o x_t + U_o h_{t-1} + b_o)$$`, p: r`Each gate is a vector the same size as the memory, so different units can keep or forget independently.` },
      { h: 'Cell and hidden state', tex: r`$$c_t = f_t\odot c_{t-1} + i_t\odot\tilde c_t, \qquad h_t = o_t\odot\tanh(c_t)$$`, p: r`The cell state is updated additively: the key difference from an RNN.` },
      { h: 'The gradient highway', tex: r`$$\frac{\partial c_t}{\partial c_{k}} = \prod_{s=k+1}^{t} \operatorname{diag}(f_s)$$`, p: r`Along the cell path, gradients are only scaled by forget gates. With $f_s \approx 1$, they reach far into the past without vanishing.` },
    ],
    hyper: [[r`hidden_size`, r`Size of $c_t$ and $h_t$.`, r`64–512.`], [r`num_layers`, r`Stacked LSTMs.`, r`1–3.`], [r`forget-gate bias`, r`Initial tendency to remember.`, r`1.0 (a common trick).`], [r`dropout / bidirectional`, r`Regularisation and backward reading.`, r`0.1–0.3; bidirectional for classification.`]],
    pros: ['Long memory through the additive cell path.', 'Robust and well understood; strong on time series and speech.', 'Explicit gates are somewhat interpretable.'],
    cons: ['About 4× the parameters of an RNN of the same width.', 'Sequential computation limits training speed.', 'Transformers usually win on large text datasets.'],
    use: r`Time-series forecasting, speech, handwriting, and text tasks with moderate data where long memory matters.`,
    avoid: r`Very long contexts with lots of data and GPUs available: Transformers train faster and attend directly.`,
    complexity: [r`$O(T\,d^2)$, about 4× an RNN`, r`$O(d^2)$ per step`],
    glance: { learns: 'Weights for three gates and the candidate', family: 'Gated recurrent network' },
    code: digitsLoad + r`

class LSTMClassifier(nn.Module):
    def __init__(self, hidden=64):
        super().__init__()
        self.lstm = nn.LSTM(input_size=8, hidden_size=hidden, batch_first=True)
        self.out = nn.Linear(hidden, 10)
        # start by remembering: forget-gate biases (second quarter of each bias vector) set to 1
        for name, b in self.lstm.named_parameters():
            if "bias" in name:
                b.data[hidden:2 * hidden].fill_(1.0)

    def forward(self, x):
        _, (h_last, c_last) = self.lstm(x)
        return self.out(h_last[-1])`,
    pitfalls: [r`Leaving the forget-gate bias at 0, which makes the network forget by default early in training.`, r`Confusing $h_t$ (what the LSTM shows) with $c_t$ (what it remembers).`, r`Using an LSTM for tabular data with no meaningful order.`],
    quiz: [
      { q: r`Which gate decides how much of the old cell state to keep?`, o: [r`Input gate`, r`Forget gate`, r`Output gate`, r`Reset gate`], a: 1, why: r`$c_t = f_t \odot c_{t-1} + \dots$` },
      { q: r`Why do gradients survive longer in an LSTM than in a vanilla RNN?`, o: [r`It uses ReLU`, r`The cell state is updated by addition and only scaled by the forget gate`, r`It has more layers`, r`It uses attention`], a: 1, why: r`Along the cell path the Jacobian is $\operatorname{diag}(f_t)$, close to the identity when $f_t \approx 1$.` },
      { q: r`To remember a value and ignore 20 distractors, an LSTM ideally keeps:`, o: [r`Input gate open, forget gate near 0`, r`Input gate open once, then closed; forget gate near 1`, r`All gates at 0.5`, r`Output gate always open`], a: 1, why: r`Write once, then hold; the output gate opens when the value is needed.` },
    ],
    related: ['gru_networks', 'recurrent_neural_networks', 'transformer_networks'],
    prereq: ['gru_networks'],
    concepts: ['sigmoid-and-link-functions', 'gradient-descent'],
    labIntro: r`The memory task: a value arrives at step 1, then 20 distractor inputs, then the network must recall the value. Watch the cell state (the conveyor belt) and the three gates step by step, and compare with a plain RNN trying the same thing.`,
    tryThis: [r`Press <em>Play</em> with the defaults: the input gate opens once, the forget gate holds, and the value is recalled almost exactly.`, r`Switch the input gate to "always open": distractors pour into the cell and recall falls apart.`, r`Lower the forget gate to 0.8: the stored value leaks away, just like the RNN.`],
    keywords: 'lstm long short term memory cell state forget gate input gate output gate',
  },
  {
    id: 'transformer_networks', explainer: 'attention', short: 'Transformers', title: 'Transformers and Self-Attention',
    task: 'classification', module: 'Sequences', level: 3, minutes: 24,
    summary: r`No recurrence at all: every token looks directly at every other token through attention, all in parallel. The architecture behind modern LLMs.`,
    lead: r`A Transformer replaces "read step by step" with "look everywhere at once". Each token asks a question (a <strong>query</strong>), every token advertises what it contains (a <strong>key</strong>), and each token collects information (the <strong>values</strong>) from the tokens whose keys best match its query.`,
    intuition: [
      r`In "The animal did not cross the street because it was tired", the word "it" needs to find "animal". An RNN would have to carry "animal" through six steps of memory. Self-attention lets "it" compare itself with every word directly and pull in information from the best match, however far away it is. Distance stops mattering.`,
      r`The comparison is a dot product between the query of one token and the key of another, scaled and turned into weights with a [[sigmoid-and-link-functions|softmax]]. The output for a token is the weighted average of all value vectors. Several <strong>heads</strong> do this in parallel, each with its own query/key/value projections, so one head can track meaning ("which noun is this pronoun about?") while another tracks position ("what came just before me?"). Since attention ignores order, <strong>positional encodings</strong> are added to the inputs. Stack attention with small feed-forward layers, residual connections and layer norm, and you have a Transformer block.`,
    ],
    analogy: r`A room where everyone holds up a sign describing themselves (keys), each person has a question in mind (query), and each listens most closely to the people whose signs match their question.`,
    steps: [
      r`Turn tokens into vectors (embeddings) and add positional encodings.`,
      r`For each token, compute query $q = xW_Q$, key $k = xW_K$ and value $v = xW_V$.`,
      r`Score every pair: $q_i \cdot k_j / \sqrt{d_k}$; mask future tokens in decoders.`,
      r`Softmax each row of scores into attention weights that sum to 1.`,
      r`Output for token $i$: $\sum_j a_{ij} v_j$. Do this in several heads, concatenate, and project.`,
      r`Add a feed-forward layer, residual connections and layer norm; stack many blocks; pool (or use a [CLS] token) and classify.`,
    ],
    math: [
      { h: 'Scaled dot-product attention', tex: r`$$\operatorname{Attention}(Q, K, V) = \operatorname{softmax}\!\Big(\frac{QK^\top}{\sqrt{d_k}}\Big)V$$`, p: r`Row $i$ of the softmax matrix is the attention distribution of token $i$ over all tokens.` },
      { h: 'Why divide by √d', tex: r`$$q, k \sim \mathcal N(0, I_{d}) \;\Rightarrow\; \operatorname{Var}(q\cdot k) = d$$`, p: r`Without scaling, larger dimensions give larger scores, the softmax becomes nearly one-hot, and its gradients vanish. The lab’s temperature slider shows that effect.` },
      { h: 'Multi-head attention', tex: r`$$\operatorname{MHA}(X) = [\text{head}_1; \dots; \text{head}_h]\,W_O, \qquad \text{head}_j = \operatorname{Attention}(XW_Q^{j}, XW_K^{j}, XW_V^{j})$$`, p: r`Each head can specialise in a different kind of relationship.` },
      { h: 'Cost', tex: r`$$\text{time and memory} \propto T^2 d$$`, p: r`Every token attends to every token, so long contexts are expensive; much current research is about making this cheaper.` },
    ],
    hyper: [[r`d_model, heads, layers`, r`Model width, attention heads, depth.`, r`Start from a pre-trained checkpoint.`], [r`max sequence length`, r`Context window.`, r`Cost grows with its square.`], [r`learning rate + warm-up`, r`Fine-tuning schedule.`, r`2e-5 to 5e-5 with linear warm-up.`], [r`dropout`, r`Regularisation.`, r`0.1.`]],
    pros: ['Direct access between any two positions: long-range context is easy.', 'Fully parallel over the sequence, so training scales on GPUs.', 'Pre-trained models transfer to new tasks with little labelled data.'],
    cons: ['Quadratic cost in sequence length.', 'Data- and compute-hungry when trained from scratch.', 'Large models are expensive to serve.'],
    use: r`Text, code, and increasingly images, audio and time series, especially when a pre-trained model exists.`,
    avoid: r`Tiny datasets with no pre-trained model, or short simple sequences where a GRU or a linear model is enough.`,
    complexity: [r`$O(T^2 d + T d^2)$ per layer, parallel over $T$`, r`Same per sequence`],
    glance: { learns: 'Embeddings, Q/K/V projections, feed-forward weights', family: 'Attention network' },
    code: digitsLoad + r`

class TinyTransformer(nn.Module):
    def __init__(self, d=64, heads=4, layers=2):
        super().__init__()
        self.embed = nn.Linear(8, d)
        self.pos = nn.Parameter(torch.zeros(1, 8, d))                # learned positional encoding
        block = nn.TransformerEncoderLayer(d, heads, dim_feedforward=128, batch_first=True)
        self.encoder = nn.TransformerEncoder(block, layers)
        self.out = nn.Linear(d, 10)

    def forward(self, x):
        h = self.encoder(self.embed(x) + self.pos)                   # every row attends to every row
        return self.out(h.mean(dim=1))

# for real text, fine-tune a pre-trained model instead:
# from transformers import AutoModelForSequenceClassification`,
    pitfalls: [r`Training a Transformer from scratch on a few thousand examples; fine-tune a pre-trained one.`, r`Forgetting positional information: without it, "dog bites man" and "man bites dog" look identical.`, r`Reading attention weights as explanations. They show where information flows, not why the model decided.`],
    quiz: [
      { q: r`In self-attention, what does a token’s query get compared with?`, o: [r`Its own value`, r`The keys of every token`, r`The output layer`, r`The previous hidden state`], a: 1, why: r`Scores are $q_i \cdot k_j$ for all $j$.` },
      { q: r`Why are positional encodings needed?`, o: [r`To speed up training`, r`Attention by itself ignores word order`, r`To normalise the values`, r`To mask future tokens`], a: 1, why: r`Shuffling the tokens would otherwise give the same set of outputs.` },
      { q: r`How does attention’s cost grow with sequence length $T$?`, o: [r`Linearly`, r`Quadratically`, r`Logarithmically`, r`Not at all`], a: 1, why: r`A $T \times T$ score matrix.` },
      { q: r`What does a causal mask do?`, o: [r`Hides future tokens so each token only attends to itself and the past`, r`Removes padding`, r`Drops attention heads`, r`Reverses the sequence`], a: 0, why: r`Needed for text generation, where the next token must not be visible.` },
    ],
    related: ['lstm_networks', 'gru_networks', 'convolutional_neural_networks'],
    prereq: ['lstm_networks'],
    concepts: ['sigmoid-and-link-functions', 'gradient-descent'],
    labIntro: r`A toy Transformer you can read. Each word has a small, labelled embedding (is it a noun, an animal, a place, a pronoun, a verb). Click a word to make it the query: the arcs show where it looks, and the panel below works through the scores, softmax and output. Two heads are available: one matches meaning, one looks at position.`,
    tryThis: [r`Click "it": the meaning head sends most of its attention to "animal", six words away.`, r`Switch to the position head: every word now looks mainly at the word just before it.`, r`Lower the temperature: attention becomes almost one-hot. Raise it: attention spreads evenly and the output becomes an average of everything.`, r`Turn on the causal mask and click the first word: it can only attend to itself.`],
    keywords: 'transformer attention self-attention query key value multi-head positional encoding llm bert gpt',
  },
];
