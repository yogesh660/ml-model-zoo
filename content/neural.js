// Neural networks path. See regression.js for conventions.
const r = String.raw;

module.exports = [
  {
    id: 'perceptron', short: 'Perceptron', title: 'The Perceptron',
    task: 'classification', module: 'From neurons to networks', level: 1, minutes: 14,
    summary: r`The 1958 ancestor of every neural network: a single neuron that nudges its weights each time it makes a mistake.`,
    lead: r`The perceptron computes $\operatorname{sign}(w^\top x + b)$. Whenever it misclassifies a point, it adds that point (times its label) to the weights. If the classes can be separated by a line, this simple rule is guaranteed to find one.`,
    intuition: [
      r`Picture the weight vector $w$ as an arrow perpendicular to the boundary. A misclassified positive point lies on the wrong side, so adding it to $w$ swings the arrow (and the boundary) toward it. A misclassified negative point is subtracted, which swings the boundary away.`,
      r`Rosenblatt’s convergence theorem says that if a separating line exists with margin $\gamma$, the perceptron makes at most $(R/\gamma)^2$ mistakes. But if no line separates the classes, it never settles: it keeps cycling. Fixing that, by adding hidden layers and smooth activations, led to the [[mlp_classifier|multi-layer perceptron]].`,
    ],
    analogy: r`A doorman with a checklist who adjusts how much each item counts every time he lets in the wrong person.`,
    steps: [r`Initialise $w = 0$, $b = 0$.`, r`Loop over the training points in random order.`, r`If $y_i(w^\top x_i + b) \le 0$, update $w \leftarrow w + \eta y_ix_i$ and $b \leftarrow b + \eta y_i$.`, r`Stop when an epoch passes with no mistakes, or after a set number of epochs.`],
    math: [
      { h: 'Update rule', tex: r`$$\text{if } y_i(w^\top x_i + b) \le 0: \quad w \leftarrow w + \eta\,y_i x_i, \quad b \leftarrow b + \eta\,y_i$$`, p: r`Labels are $\pm 1$. This is stochastic gradient descent on the "perceptron loss" $\max(0, -y_if(x_i))$.` },
      { h: 'Novikoff’s bound', tex: r`$$\#\text{mistakes} \le \Big(\frac{R}{\gamma}\Big)^2, \qquad R = \max_i\lVert x_i\rVert$$`, p: r`On separable data the number of updates is finite, however many points there are.` },
    ],
    hyper: [[r`eta0`, r`Learning rate.`, r`With zero initialisation it only rescales $w$; 1.0 is fine.`], [r`max_iter`, r`Epoch limit.`, r`Needed because non-separable data never converges.`], [r`penalty, alpha`, r`Optional regularisation.`, r`Usually none.`]],
    pros: ['Very simple, online, and fast.', 'Guaranteed to converge on separable data.', 'Historically and conceptually foundational.'],
    cons: ['Never converges on non-separable data.', 'No probabilities and no margin maximisation.', 'Linear boundaries only.'],
    use: r`Teaching, online learning on separable streams, or as a building block to understand neural nets.`,
    avoid: r`Real problems; use logistic regression or a linear SVM instead.`,
    complexity: [r`$O(\text{epochs}\cdot n\,p)$`, r`$O(p)$`],
    glance: { learns: 'One weight per feature + bias', family: 'Linear, online' },
    code: r`from sklearn.linear_model import Perceptron
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

model = make_pipeline(StandardScaler(), Perceptron(max_iter=1000, tol=1e-3, random_state=0)).fit(X_tr, y_tr)
print("test accuracy:", round(model.score(X_te, y_te), 3), "epochs run:", model[-1].n_iter_)`,
    pitfalls: [r`Expecting convergence on overlapping classes.`, r`Reading the final weights as meaningful when training stopped at an arbitrary epoch.`],
    quiz: [
      { q: r`When does the perceptron update its weights?`, o: [r`After every point`, r`Only when a point is misclassified`, r`Only at the end of an epoch`, r`When the loss increases`], a: 1, why: r`Correct points with $y_if(x_i) > 0$ cause no update.` },
      { q: r`On the XOR problem a single perceptron will:`, o: [r`Converge quickly`, r`Never find a perfect boundary`, r`Overfit`, r`Output probabilities`], a: 1, why: r`XOR is not linearly separable, so no single line classifies it.` },
    ],
    related: ['logistic_regression', 'mlp_classifier', 'support_vector_classifier'],
    prereq: ['gradient-descent'],
    concepts: ['gradient-descent', 'loss-functions'],
    labIntro: r`Watch the perceptron learn one update at a time. The highlighted point is the mistake that triggered the latest update.`,
    tryThis: [r`On "separable" data, press <em>Play</em> and count the updates until it stops.`, r`Switch to "XOR": the boundary keeps flipping and never settles.`],
    keywords: 'perceptron rosenblatt neuron linear online update rule',
  },
  {
    id: 'mlp_classifier', short: 'MLP classifier', title: 'Multi-Layer Perceptron Classification',
    task: 'classification', module: 'From neurons to networks', level: 2, minutes: 22,
    summary: r`Hidden layers of neurons learn their own features, so the network can draw any boundary. The core of deep learning.`,
    lead: r`Stack layers of neurons with non-linear activations between them, end with a softmax, and train everything jointly with backpropagation. Hidden layers learn intermediate features, which lets the network carve curved, even disconnected, decision regions.`,
    intuition: [
      r`Each hidden ReLU unit draws one line through the input space and outputs "how far past the line" a point is. The next layer combines these half-planes into polygons, curves and islands. That is how a two-layer network solves XOR, which no single perceptron can.`,
      r`Training is [[gradient-descent]] on cross-entropy loss. Backpropagation applies the chain rule layer by layer to get every weight’s gradient in one backward sweep. Initialisation, learning rate, batch size, L2 penalty and early stopping all matter.`,
    ],
    analogy: r`A team where the first row of workers each draws one rule of thumb, and the second row learns how to combine those rules into a decision.`,
    steps: [r`Scale the inputs.`, r`Forward: $h = \text{ReLU}(W_1x + b_1)$, $p = \text{softmax}(W_2h + b_2)$.`, r`Loss: cross-entropy plus L2 penalty.`, r`Backward: propagate $\partial L/\partial z = p - y$ back through the layers.`, r`Update with Adam on mini-batches; stop early on validation loss.`],
    math: [
      { h: 'Softmax output and cross-entropy', tex: r`$$p_c = \frac{e^{z_c}}{\sum_{c'} e^{z_{c'}}}, \qquad L = -\sum_c y_c\log p_c, \qquad \frac{\partial L}{\partial z} = p - y$$`, p: r`The gradient at the output is simply "predicted minus true", just as in [[logistic_regression]].` },
      { h: 'Backpropagating through a hidden layer', tex: r`$$\delta_1 = (W_2^\top\delta_2)\odot\mathbb 1[z_1 > 0], \qquad \frac{\partial L}{\partial W_1} = \delta_1 x^\top$$`, p: r`The ReLU derivative is 1 where the unit was active and 0 elsewhere, so gradients only flow through active units.` },
    ],
    hyper: [[r`hidden_layer_sizes`, r`Width and depth.`, r`(32,) to (128, 64).`], [r`activation`, r`relu, tanh or logistic.`, r`relu.`], [r`alpha`, r`L2 penalty.`, r`1e-5 to 1e-2.`], [r`learning_rate_init, batch_size`, r`Optimiser settings.`, r`1e-3; 32–256.`], [r`early_stopping`, r`Hold out validation data.`, r`On.`]],
    pros: ['Learns non-linear features automatically.', 'Scales with data and compute.', 'Same building block as modern deep learning.'],
    cons: ['Many hyperparameters; sensitive to scaling and initialisation.', 'Often beaten by boosting on small tabular data.', 'Black box.'],
    use: r`Large datasets with complex structure, or when you will move on to deep architectures.`,
    avoid: r`Small tabular datasets or when you need an interpretable model.`,
    complexity: [r`$O(\text{epochs}\cdot n\cdot\text{weights})$`, r`$O(\text{weights})$`],
    glance: { learns: 'Weights of every layer', family: 'Neural network' },
    code: r`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPClassifier

mlp = make_pipeline(StandardScaler(),
                    MLPClassifier(hidden_layer_sizes=(64, 32), alpha=1e-3, early_stopping=True,
                                  max_iter=1000, random_state=0)).fit(X_tr, y_tr)
print("test accuracy:", round(mlp.score(X_te, y_te), 3), "epochs:", mlp[-1].n_iter_)`,
    pitfalls: [r`Skipping input scaling.`, r`Judging a network by a single training run; seeds matter.`, r`Comparing to boosting without tuning either.`],
    quiz: [
      { q: r`Why can a two-layer network solve XOR but a perceptron cannot?`, o: [r`It trains for longer`, r`Hidden units create intermediate features that make the problem separable`, r`It uses a different loss`, r`It has a bias term`], a: 1, why: r`Two hidden lines carve the plane into regions the output layer can combine.` },
      { q: r`For softmax + cross-entropy, the gradient with respect to the logits is:`, o: [r`$y - p$`, r`$p - y$`, r`$p(1-p)$`, r`$\log p$`], a: 1, why: r`A clean result that makes training stable and fast.` },
    ],
    related: ['mlp_regressor', 'perceptron', 'convolutional_neural_networks'],
    prereq: ['perceptron', 'logistic_regression'],
    concepts: ['gradient-descent', 'loss-functions', 'regularization'],
    labIntro: r`A real neural network trained in your browser with backpropagation. Watch the boundary bend as the loss falls.`,
    tryThis: [r`Solve "XOR" with 4 hidden units. Then try it with 1: impossible.`, r`On "spiral", use 2 layers of 16 and be patient.`, r`Crank the learning rate until the loss curve starts to jump.`],
    keywords: 'mlp neural network classifier backpropagation hidden layer relu softmax',
  },
  {
    id: 'convolutional_neural_networks', short: 'CNNs', title: 'Convolutional Neural Networks (CNNs)',
    task: 'classification', module: 'Deep architectures', level: 3, minutes: 24,
    summary: r`Networks that slide small learned filters across an image, so they spot the same pattern wherever it appears.`,
    lead: r`A convolutional layer slides a small grid of weights (a filter) across the image and records how strongly each patch matches. Stacking such layers builds up from edges to textures to parts to objects.`,
    intuition: [
      r`A fully connected network on a 224×224 colour image would need 150,000 weights <em>per neuron</em> and would have to learn "cat ear" separately for every position. Convolution shares one small filter across all positions (<strong>weight sharing</strong>) and looks at local patches only (<strong>local connectivity</strong>). The same edge detector works everywhere: translation equivariance.`,
      r`After convolution, a non-linearity (ReLU) keeps only positive evidence, and pooling summarises small neighbourhoods so the representation shrinks and becomes tolerant to small shifts. Deeper layers see larger regions of the original image (a larger receptive field), so they can respond to bigger structures. A classifier head on top turns the final features into class probabilities.`,
    ],
    analogy: r`Scanning a page with a magnifying glass that lights up whenever it passes over a particular shape.`,
    steps: [r`Convolve the input with $K$ learned filters to produce $K$ feature maps.`, r`Apply ReLU.`, r`Pool (e.g. 2×2 max) to downsample.`, r`Repeat conv–ReLU–pool blocks, increasing the number of filters.`, r`Flatten or global-average-pool, then a dense softmax layer.`, r`Train end-to-end with cross-entropy and backpropagation; augment data (flips, crops) to generalise.`],
    math: [
      { h: 'Discrete 2-D convolution (cross-correlation)', tex: r`$$S(i, j) = \sum_{m}\sum_{n} I(i + m,\, j + n)\,K(m, n) + b$$`, p: r`Each output pixel is the dot product of the filter with the patch under it. Deep-learning libraries use cross-correlation and still call it convolution.` },
      { h: 'Output size', tex: r`$$H_{\text{out}} = \Big\lfloor\frac{H_{\text{in}} + 2P - F}{S}\Big\rfloor + 1$$`, p: r`$F$ = filter size, $P$ = padding, $S$ = stride. A 3×3 filter with padding 1 and stride 1 keeps the size.` },
      { h: 'Parameter count', tex: r`$$\#\text{params} = (F\cdot F\cdot C_{\text{in}} + 1)\cdot C_{\text{out}}$$`, p: r`A 3×3 conv from 64 to 128 channels has about 74k weights, regardless of image size.` },
    ],
    hyper: [[r`filters, kernel size`, r`Number and size of learned patterns.`, r`32→64→128…, 3×3.`], [r`stride, padding`, r`Step size and border handling.`, r`stride 1, "same" padding.`], [r`pooling`, r`Downsampling.`, r`2×2 max or global average.`], [r`optimiser, lr, weight decay`, r`Training.`, r`AdamW 1e-3 or SGD + momentum with a schedule.`], [r`augmentation`, r`Synthetic variations of images.`, r`Flips, crops, colour jitter.`]],
    pros: ['State of the art on images and other grid data.', 'Far fewer parameters than dense nets thanks to weight sharing.', 'Pre-trained backbones transfer well to new tasks.'],
    cons: ['Needs lots of labelled data or transfer learning.', 'GPU-hungry training.', 'Hard to interpret; vulnerable to adversarial perturbations.'],
    use: r`Images, spectrograms, some time series and any data with local spatial structure.`,
    avoid: r`Tabular data, where trees win.`,
    complexity: [r`$O(H\,W\,F^2\,C_{\text{in}}\,C_{\text{out}})$ per layer`, r`Same per image`],
    glance: { learns: 'Filters and dense weights', family: 'Deep, convolutional' },
    code: r`import torch, torch.nn as nn

class SmallCNN(nn.Module):
    def __init__(self, n_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),     # 28 -> 14
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),    # 14 -> 7
        )
        self.head = nn.Sequential(nn.Flatten(), nn.Linear(64 * 7 * 7, 128), nn.ReLU(),
                                  nn.Dropout(0.3), nn.Linear(128, n_classes))

    def forward(self, x):
        return self.head(self.features(x))

model = SmallCNN()
print(sum(p.numel() for p in model.parameters()), "parameters")`,
    pitfalls: [r`Training from scratch on a few thousand images; start from a pre-trained backbone.`, r`Forgetting to normalise inputs the way the pre-trained model expects.`, r`Augmenting the validation set.`],
    quiz: [
      { q: r`Why do CNNs need far fewer parameters than dense networks on images?`, o: [r`They use smaller images`, r`One small filter is shared across every position`, r`They skip the bias`, r`They use pooling only`], a: 1, why: r`Weight sharing: the same $3\times3$ weights are applied everywhere.` },
      { q: r`A 32×32 input, 5×5 filter, padding 0, stride 1 gives an output of:`, o: [r`32×32`, r`28×28`, r`27×27`, r`16×16`], a: 1, why: r`$(32 + 0 - 5)/1 + 1 = 28$.` },
      { q: r`What does max-pooling add?`, o: [r`More parameters`, r`Downsampling and tolerance to small shifts`, r`Colour invariance`, r`Non-linearity only`], a: 1, why: r`Taking the max over a window keeps the strongest response wherever it occurs in that window.` },
    ],
    related: ['mlp_classifier', 'recurrent_neural_networks'],
    prereq: ['mlp_classifier'],
    concepts: ['gradient-descent', 'regularization'],
    explainer: 'cnn', architecture: 'cnn',
    archIntro: r`A small CNN that reads 28×28 handwritten digits, drawn layer by layer. Hover over any part (or tap it on a phone) to see what it does, its input and output shape and how many weights it learns.`,
    labIntro: r`Pick an image and a filter. The middle panel is the feature map (the filter’s response at each position); the right panel is that map after ReLU and 2×2 max-pooling. Hover over the input to see the patch under the filter.`,
    tryThis: [r`Apply the vertical-edge filter to the square: only the left and right sides light up.`, r`Edit the filter weights by hand and design a horizontal-line detector.`, r`Compare the pooled map with the feature map: same pattern, a quarter of the size.`],
    keywords: 'cnn convolution filter kernel feature map pooling image deep learning',
  },
  // SEQUENCES
];
