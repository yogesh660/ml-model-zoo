const r = String.raw;

module.exports = [
  {
    id: 'backpropagation-and-autodiff',
    short: 'Backprop and autodiff',
    title: 'Backpropagation and Automatic Differentiation',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Computing exact loss gradients across millions of nested parameters using the multivariate chain rule on directed computation graphs.`,
    lead: r`Neural networks learn by adjusting weights to reduce prediction loss, but computing gradients numerically via finite differences across millions of parameters is computationally impossible. Backpropagation applies the multivariate calculus chain rule in reverse topological order across a directed acyclic computation graph. Reverse-mode automatic differentiation evaluates exact gradients for all parameters simultaneously in a single backward pass with compute cost proportional to the forward pass.`,
    intuition: [
      r`Suppose you train a neural network with 1,000 weights and need the gradient of the loss with respect to each weight. The naive numerical method perturbs weight w_1 by a tiny step epsilon = 0.0001, executes a complete forward pass to measure the change in loss, and divides by epsilon. You must repeat this full forward pass 1,000 times—once for every individual parameter! For modern deep learning models containing billions of weights, computing gradients numerically would take centuries for a single optimisation step.`,
      r`Backpropagation recognizes that any neural network is simply a composite chain of elementary mathematical operations (additions, matrix multiplications, non-linear activations) arranged in a Directed Acyclic Graph (DAG). During the forward pass, data flows from inputs to loss, and intermediate activations are cached in memory. To determine how much an early weight influenced the final scalar loss, we work backwards from the output. By the multivariate chain rule, the gradient at any intermediate node equals the sum of incoming adjoint gradients from its downstream consumers multiplied by the local Jacobian.`,
      r`Forward-mode autodiff propagates tangent derivatives forward alongside activations. It is efficient when a function has few inputs and many outputs. In deep learning, however, the loss function maps millions of parameters to a single scalar loss. Reverse-mode automatic differentiation computes adjoint derivatives backwards from the scalar root, yielding exact, analytically perfect gradients for all parameters simultaneously in approximately twice the computational time of a single forward pass.`,
    ],
    analogy: r`A financial auditor tracing a multi-million-pound deficit back through an enterprise ledger: rather than recalculating the entire global supply chain for every invoice, the auditor works backward from the final balance sheet line-by-line, apportioning exact responsibility to each contributing department.`,
    steps: [
      r`Construct the forward computational tape: trace tensor operations during the forward pass, recording operation types and caching intermediate values needed for local Jacobians.`,
      r`Evaluate terminal scalar loss: compute the objective value $L(y, \hat{y})$ and seed the backward gradient root with $\bar{L} = \partial L / \partial L = 1.0$.`,
      r`Traverse graph in reverse topological order: visit each node from output to input, applying its specific vector-Jacobian product (VJP).`,
      r`Accumulate gradients at branching nodes: when an intermediate tensor feeds multiple downstream operations, sum the adjoint contributions.`,
      r`Update leaf parameter tensors: apply the accumulated gradients via your optimiser and clear intermediate activations to free GPU memory.`,
    ],
    math: [
      {
        h: 'Multivariate chain rule on a directed acyclic graph',
        tex: r`\frac{\partial L}{\partial u_i} = \sum_{j \in \text{Children}(u_i)} \frac{\partial L}{\partial u_j} \frac{\partial u_j}{\partial u_i}`,
        p: r`Where $u_i$ is an intermediate node in the computation graph. The adjoint derivative $\bar{u}_i = \partial L / \partial u_i$ accumulates contributions from all descendant nodes that consumed $u_i$ during forward execution.`,
      },
      {
        h: 'Vector-Jacobian product (VJP) for linear transformations',
        tex: r`Z = X W \implies \frac{\partial L}{\partial X} = \frac{\partial L}{\partial Z} W^T, \qquad \frac{\partial L}{\partial W} = X^T \frac{\partial L}{\partial Z}`,
        p: r`Where $\bar{Z} = \partial L / \partial Z \in \mathbb{R}^{B \times D_{\text{out}}}$ is the incoming gradient tensor, $X \in \mathbb{R}^{B \times D_{\text{in}}}$, and $W \in \mathbb{R}^{D_{\text{in}} \times D_{\text{out}}}$. Gradients are evaluated via matrix transposition without materialising enormous explicit Jacobian tensors.`,
      },
      {
        h: 'Computational complexity bound (Baur–Strassen theorem)',
        tex: r`\text{ops}\left(\nabla L(\mathbf{w})\right) \le c \cdot \text{ops}\left(L(\mathbf{w})\right), \qquad c \approx 2 \text{ to } 5`,
        p: r`The Baur–Strassen theorem guarantees that evaluating the entire gradient vector $\nabla L$ via reverse-mode autodiff requires a small constant multiple $c$ of the forward pass floating-point operations, completely independent of parameter count $P$.`,
      },
    ],
    keyPoints: [
      r`Reverse-mode automatic differentiation evaluates exact gradients for all model parameters in a single backward pass.`,
      r`Branching tensors in computation graphs sum gradients from all downstream consumers (multivariate chain rule).`,
      r`Intermediate forward activations must be retained in memory until the backward pass completes, dictating GPU memory usage during training.`,
    ],
    pitfalls: [
      r`In-place tensor modifications: mutating a tensor in-place overwrites activations required by backward Jacobians, corrupting gradient calculations.`,
      r`Forgetting to zero accumulated gradients: deep learning frameworks accumulate gradients by default; omitting zero_grad() compounds gradients across training steps.`,
      r`Performing finite-difference gradient checks in single precision float32, which introduces numerical roundoff artifacts rather than verifying autodiff correctness.`,
    ],
    code: r`import numpy as np

# Scalar reverse-mode autodiff engine
class Value:
    def __init__(self, data, _children=()):
        self.data = float(data)
        self.grad = 0.0
        self._backward = lambda: None
        self._prev = set(_children)

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other))
        def _backward():
            self.grad += out.grad
            other.grad += out.grad
        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other))
        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad
        out._backward = _backward
        return out

    def tanh(self):
        t = np.tanh(self.data)
        out = Value(t, (self,))
        def _backward():
            self.grad += (1.0 - t**2) * out.grad
        out._backward = _backward
        return out

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1.0
        for node in reversed(topo):
            node._backward()

# Evaluate loss: L = (y - tanh(x*w + b))^2
x, y = Value(2.0), Value(1.0)
w, b = Value(0.5), Value(-0.2)
pred = (x * w + b).tanh()
diff = pred + Value(-y.data)
loss = diff * diff
loss.backward()

# Finite difference verification
eps = 1e-6
w_plus = Value(0.5 + eps)
l_plus = ((x * w_plus + b).tanh() + Value(-y.data)) * ((x * w_plus + b).tanh() + Value(-y.data))
w_minus = Value(0.5 - eps)
l_minus = ((x * w_minus + b).tanh() + Value(-y.data)) * ((x * w_minus + b).tanh() + Value(-y.data))
num_grad_w = (l_plus.data - l_minus.data) / (2 * eps)

print(f"Analytical autodiff gradient dL/dw: {w.grad:.6f}")
print(f"Numerical finite-difference dL/dw:  {num_grad_w:.6f}")
print(f"Absolute discrepancy: {abs(w.grad - num_grad_w):.2e}")`,
    quiz: [
      {
        q: r`Why is reverse-mode automatic differentiation universally preferred over forward-mode automatic differentiation in deep learning?`,
        o: [
          r`Forward-mode cannot compute derivatives of non-linear activations`,
          r`Reverse-mode computes gradients for all input parameters in a single backward pass when the output is a scalar loss, whereas forward-mode requires one pass per parameter`,
          r`Reverse-mode consumes zero GPU memory`,
          r`Forward-mode only works on CPUs`,
        ],
        a: 1,
        why: r`In deep learning, loss functions map millions of parameters to a single scalar loss. Reverse-mode evaluates gradients for all inputs in one reverse pass, whereas forward-mode requires as many passes as there are input parameters.`,
      },
      {
        q: r`In a computation graph, what mathematical rule dictates how gradients are handled when a single tensor feeds into multiple downstream operation branches?`,
        o: [
          r`The gradients from all downstream branches must be multiplied together`,
          r`The gradients from all downstream branches must be summed together (multivariate chain rule)`,
          r`Only the largest downstream gradient is retained`,
          r`The gradient is set to zero to prevent exploding values`,
        ],
        a: 1,
        why: r`By the multivariate chain rule of calculus, if a variable x influences the final output through multiple paths, the total derivative dL/dx is the sum of the derivatives across all individual paths.`,
      },
      {
        q: r`Why does deep learning training consume significantly more GPU memory during backpropagation than during inference?`,
        o: [
          r`Because backward passes compile the network into machine code`,
          r`Because all intermediate layer activations computed in the forward pass must be held in memory to evaluate backward vector-Jacobian products`,
          r`Because weights are doubled in size during backpropagation`,
          r`Because the optimiser creates ten copies of the dataset`,
        ],
        a: 1,
        why: r`Evaluating local derivatives of activations (such as tanh or matrix products) requires the exact forward activation values, forcing frameworks to cache intermediate tensors until the backward pass completes.`,
      },
    ],
    usedBy: [],
    prereq: ['gradient-descent', 'loss-functions'],
    related: ['activation-functions', 'weight-initialisation-xavier-and-he', 'optimisers-sgd-momentum-rmsprop-adam-adamw'],
    keywords: 'backpropagation autodiff automatic differentiation reverse mode chain rule computation graph vjp jacobian gradient descent',
  },
  {
    id: 'activation-functions',
    short: 'Activation functions',
    title: 'Activation Functions: Sigmoid, Tanh, ReLU, GELU, and Swish',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Injecting non-linearity into neural architectures to enable universal function approximation while preserving healthy gradient flow.`,
    lead: r`Without non-linear activation functions, stacking 100 neural network layers collapses mathematically into a single matrix multiplication, incapable of learning anything beyond linear regression. Non-linear activations enable networks to approximate complex continuous functions, but each choice introduces distinct trade-offs between gradient saturation, computational efficiency, and zero-centred outputs. From early saturating sigmoids to ReLU, GELU, and Swish, modern activations are engineered to maintain healthy gradient propagation throughout deep transformer and convolutional backbones.`,
    intuition: [
      r`Imagine building a multi-layer neural network where each layer simply multiplies the input by a weight matrix: h = x W_1 and y = h W_2. Substituting the first equation into the second yields y = x (W_1 W_2) = x W_combined. No matter how many layers you stack, ten billion linear layers are mathematically identical to a single linear layer! The network cannot learn XOR, detect image contours, or model language syntax. Inserting a non-linear activation function between layers shatters this linearity, allowing the network to fold and curve the decision boundary in high-dimensional space.`,
      r`Early neural networks relied on the sigmoid function, which maps inputs into the range (0, 1). However, when input values become moderately large or small (e.g. |z| > 3), the sigmoid curve becomes almost completely flat. Its derivative tops out at 0.25 and drops to near zero in the wings. When backpropagating through 10 sigmoid layers, multiplying derivatives below 0.25 shrinks the gradient exponentially (0.25^10 is less than 0.000001), causing gradient updates in early layers to vanish entirely.`,
      r`The Rectified Linear Unit (ReLU) transformed deep learning by providing a constant derivative of 1.0 for all positive inputs, eliminating saturation and accelerating convergence. However, for negative inputs, ReLU outputs zero with a derivative of zero, causing inactive neurons to permanently die when pushed negative. Modern architectures (such as GPT, BERT, and modern vision backbones) employ smooth, non-monotonic activations like GELU (Gaussian Error Linear Unit) and Swish/SiLU, which retain small non-zero curvatures for negative inputs, ensuring continuous gradient flow.`,
    ],
    analogy: r`A sculptor carving marble: linear transformations can only slide, tilt, or stretch a stone slab in straight lines; non-linear activation functions provide the chisels to carve intricate curves, hollows, and detailed lifelike contours.`,
    steps: [
      r`Select output layer activation based on task: use Sigmoid for binary classification, Softmax for multi-class classification, and linear identity for regression.`,
      r`Choose default hidden activation: deploy ReLU as an initial baseline for standard feedforward and convolutional networks.`,
      r`Address dead neuron issues with LeakyReLU: if a high proportion of ReLU units output zero, introduce a small negative slope alpha = 0.01.`,
      r`Adopt GELU or Swish/SiLU for state-of-the-art architectures: use GELU for Transformers and language models, and Swish/SiLU for advanced vision networks.`,
      r`Verify activation statistics during training: monitor mean and variance of hidden layer activations to verify that distributions do not collapse or explode.`,
    ],
    math: [
      {
        h: 'Rectified Linear Unit (ReLU) and LeakyReLU',
        tex: r`\text{ReLU}(z) = \max(0, z), \qquad \text{LeakyReLU}(z) = \begin{cases} z & \text{if } z \ge 0 \\ \alpha z & \text{if } z < 0 \end{cases}`,
        p: r`Where $\alpha \ll 1$ (typically $\alpha = 0.01$). ReLU maintains a constant unit derivative $\partial / \partial z = 1$ for positive inputs, completely avoiding positive-side saturation, while LeakyReLU permits a small non-zero gradient $\alpha$ across the negative half-plane.`,
      },
      {
        h: 'Gaussian Error Linear Unit (GELU)',
        tex: r`\text{GELU}(z) = z \cdot \Phi(z) = z \cdot P(X \le z) \approx 0.5 z \left( 1 + \tanh\left( \sqrt{\frac{2}{\pi}} \left( z + 0.044715 z^3 \right) \right) \right)`,
        p: r`Where $\Phi(z)$ is the standard Gaussian cumulative distribution function. GELU probabilistically gates the input $z$ by how likely it is to exceed a random draw from $\mathcal{N}(0, 1)$, producing smooth non-monotonic curvature with non-zero gradients everywhere.`,
      },
      {
        h: 'Swish / Sigmoid Linear Unit (SiLU)',
        tex: r`\text{Swish}_\beta(z) = z \cdot \sigma(\beta z) = \frac{z}{1 + e^{-\beta z}}, \qquad \frac{d}{dz} \text{Swish}_1(z) = \sigma(z) + z \sigma(z)(1 - \sigma(z))`,
        p: r`Swish smoothly interpolates between linear behaviour at $\beta \to 0$ and ReLU at $\beta \to \infty$. Its non-monotonic dip near $z \approx -1.28$ allows small negative signals to propagate gradients backward.`,
      },
    ],
    keyPoints: [
      r`Non-linear activations prevent deep networks from collapsing mathematically into a single linear matrix multiplication.`,
      r`Saturating functions (Sigmoid, Tanh) cause vanishing gradients in deep networks because their derivatives approach zero away from the origin.`,
      r`GELU and Swish/SiLU provide smooth, non-monotonic gradient flow, serving as the standard activations for modern transformers and vision backbones.`,
    ],
    pitfalls: [
      r`Using Sigmoid or Tanh in hidden layers of deep neural networks (>5 layers), which severely dampens gradient propagation.`,
      r`The Dying ReLU trap: setting learning rates too high can push weights into regions where neurons output negative values for all dataset samples, permanently killing their gradient.`,
      r`Applying Softmax across the wrong tensor dimension: in multi-head attention or sequence classification, applying Softmax across the batch dimension instead of the class or key dimension breaks learning.`,
    ],
    code: r`import numpy as np

def sigmoid(z): return 1.0 / (1.0 + np.exp(-np.clip(z, -30, 30)))
def d_sigmoid(z): s = sigmoid(z); return s * (1.0 - s)
def relu(z): return np.maximum(0, z)
def d_relu(z): return (z > 0).astype(float)
def gelu(z): return 0.5 * z * (1.0 + np.tanh(np.sqrt(2.0 / np.pi) * (z + 0.044715 * z**3)))
def d_gelu(z, eps=1e-5): return (gelu(z + eps) - gelu(z - eps)) / (2 * eps)

test_pts = np.array([-3.0, 0.0, 3.0])
print(f"Evaluation points: {test_pts}")
print(f"Sigmoid derivatives: {np.round(d_sigmoid(test_pts), 4)} (vanishes at +/-3.0)")
print(f"ReLU derivatives:    {np.round(d_relu(test_pts), 4)} (constant 1.0 for z>0, dead at z<0)")
print(f"GELU derivatives:    {np.round(d_gelu(test_pts), 4)} (smooth, non-zero negative dip)")`,
    quiz: [
      {
        q: r`What occurs mathematically if all activation functions in a 50-layer deep neural network are replaced with linear identity functions f(z) = z?`,
        o: [
          r`The network becomes impossible to differentiate`,
          r`The entire 50-layer network collapses into a single equivalent linear regression model, incapable of learning non-linear relationships`,
          r`The network automatically achieves zero training error`,
          r`The network parameters double in size`,
        ],
        a: 1,
        why: r`Because the composition of linear transformations is always another linear transformation, any number of stacked linear layers collapses mathematically into a single matrix multiplication.`,
      },
      {
        q: r`Why does the standard Sigmoid activation function cause vanishing gradients when used across many hidden layers in deep networks?`,
        o: [
          r`Because its derivative is strictly negative everywhere`,
          r`Because its maximum derivative is only 0.25 and approaches 0 for inputs away from the origin, shrinking gradients exponentially during chain rule multiplication`,
          r`Because it cannot be computed in float32 precision`,
          r`Because it only accepts binary 0 and 1 inputs`,
        ],
        a: 1,
        why: r`The derivative of sigmoid is at most 0.25. Multiplying values below 0.25 across multiple layers causes gradients in early layers to vanish exponentially toward zero.`,
      },
      {
        q: r`What is a key advantage of GELU and Swish over standard ReLU in deep transformer architectures?`,
        o: [
          r`They require zero floating-point operations`,
          r`They are smooth and non-monotonic, allowing small negative values to propagate non-zero restorative gradients rather than hard-clipping them to zero`,
          r`They convert all model weights into positive integers`,
          r`They eliminate the need for backpropagation`,
        ],
        a: 1,
        why: r`Unlike ReLU's abrupt zero cut-off, GELU and Swish have smooth, non-monotonic curves that allow small negative signals to maintain gentle gradient flow, preventing permanently dead neurons.`,
      },
    ],
    usedBy: [],
    prereq: ['backpropagation-and-autodiff', 'gradient-descent'],
    related: ['weight-initialisation-xavier-and-he', 'optimisers-sgd-momentum-rmsprop-adam-adamw', 'sigmoid-and-link-functions'],
    keywords: 'activation functions relu gelu swish silu sigmoid tanh vanishing gradient dying relu non-linearity neural networks',
  },
  {
    id: 'weight-initialisation-xavier-and-he',
    short: 'Weight initialisation: Xavier, He',
    title: 'Weight Initialisation: Xavier and He',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Calibrating weight variance based on layer fan-in and fan-out to preserve signal variance and prevent vanishing or exploding activations across deep networks.`,
    lead: r`Initialising neural network weights to all zeros traps neurons in a symmetry lock where every unit computes identical outputs and receives identical gradients. Conversely, initialising weights with uncalibrated random variance causes activations and gradients to either explode exponentially to infinity or vanish to zero as depth increases. Xavier (Glorot) and He (Kaiming) initialisation scale weight variances inversely with layer dimensions, maintaining stable unit-variance signals from the very first training iteration.`,
    intuition: [
      r`Suppose you initialise all weights in a 100-neuron hidden layer to zero. For any input, every single neuron computes identical outputs. During backpropagation, every neuron receives the exact same gradient update. After the optimiser takes a step, all 100 neurons still share identical weights! The network is trapped in symmetry, effectively behaving as a single neuron regardless of width. Breaking symmetry requires initialising weights with random values.`,
      r`However, choosing random values carelessly creates extreme numerical instability. Consider a layer with 256 inputs initialised from a standard normal distribution N(0, 1). The variance of each neuron's output is roughly 256 times the input variance. Across 10 layers, the signal variance scales by 256^10, causing numbers to explode into NaN overflows within milliseconds. Conversely, initialising with weights that are too small (e.g. standard deviation 0.01) causes variance to decay exponentially to zero, extinguishing the signal completely within a few layers.`,
      r`In 2010, Xavier Glorot and Yoshua Bengio derived that preserving constant variance forward and backward for linear and symmetric activations (such as Tanh) requires scaling weight variance inversely with the average of fan-in and fan-out: Var(w) = 2 / (D_in + D_out). In 2015, Kaiming He discovered that because ReLU zeroes out negative inputs (halving the transmitted variance), ReLU layers require double the variance: Var(w) = 2 / D_in. This simple correction enabled training deep convolutional networks with over 100 layers without divergence.`,
    ],
    analogy: r`A chain of audio amplifiers: if each amplifier in a 20-stage studio rig multiplies signal volume by 1.5x, the sound deafens into screeching distortion; if each multiplies volume by 0.7x, the sound fades into silence. Xavier and He initialisation set every stage's gain to exactly 1.0x.`,
    steps: [
      r`Identify downstream activation non-linearity: check whether the layer uses symmetric/linear activations (Tanh, Sigmoid, Linear) or half-rectifying activations (ReLU, LeakyReLU, GELU).`,
      r`Compute fan-in and fan-out: calculate input dimensions $D_{\text{in}}$ and output dimensions $D_{\text{out}}$ (multiplying kernel spatial dimensions $k_w \cdot k_h \cdot C_{\text{in}}$ for convolutions).`,
      r`Apply Xavier/Glorot for Tanh or Sigmoid: draw weights from $\mathcal{N}\left(0, \frac{2}{D_{\text{in}} + D_{\text{out}}}\right)$ or uniform distribution $\mathcal{U}\left(-\sqrt{\frac{6}{D_{\text{in}} + D_{\text{out}}}}, \sqrt{\frac{6}{D_{\text{in}} + D_{\text{out}}}}\right)$.`,
      r`Apply He/Kaiming for ReLU and GELU: draw weights from $\mathcal{N}\left(0, \frac{2}{D_{\text{in}}}\right)$ to compensate for rectified negative inputs.`,
      r`Initialise bias vectors to zero: set all bias parameters to constant zero, avoiding arbitrary initial directional offsets.`,
    ],
    math: [
      {
        h: 'Forward signal variance propagation',
        tex: r`\text{Var}(y_j) = D_{\text{in}} \cdot \text{Var}(w) \cdot \text{Var}(x)`,
        p: r`Assuming input features $x$ and weights $w$ are mutually independent with mean zero. Preserving unit variance across the transformation ($\text{Var}(y) = \text{Var}(x)$) requires setting $\text{Var}(w) = 1 / D_{\text{in}}$.`,
      },
      {
        h: 'Xavier (Glorot) initialisation formula',
        tex: r`\text{Var}(w_{\text{Xavier}}) = \frac{2}{D_{\text{in}} + D_{\text{out}}}, \qquad w \sim \mathcal{N}\left( 0, \sqrt{\frac{2}{D_{\text{in}} + D_{\text{out}}}} \right)`,
        p: r`Taking the harmonic compromise between preserving forward activation variance ($1 / D_{\text{in}}$) and backward gradient variance ($1 / D_{\text{out}}$) guarantees balanced bidirectional signal flow for symmetric activations like Tanh.`,
      },
      {
        h: 'He (Kaiming) initialisation for ReLU networks',
        tex: r`\text{Var}(w_{\text{He}}) = \frac{2}{D_{\text{in}}}, \qquad w \sim \mathcal{N}\left( 0, \sqrt{\frac{2}{D_{\text{in}}}} \right)`,
        p: r`Because ReLU clips negative inputs to zero, $\mathbb{E}[(\max(0, x))^2] = \frac{1}{2} \text{Var}(x)$. To balance the 50% loss of signal energy through rectification, the weight variance must be doubled to $2 / D_{\text{in}}$.`,
      },
    ],
    keyPoints: [
      r`Initialising weights to constant values locks neurons into identical symmetry, preventing them from learning distinct features.`,
      r`Xavier initialisation balances forward and backward variance for symmetric, linear, and Tanh non-linearities.`,
      r`He initialisation doubles weight variance (2 / D_in) to compensate for ReLU setting half of all activations to zero.`,
    ],
    pitfalls: [
      r`Using Xavier initialisation in deep ReLU networks: after 20 layers, activation variance decays by 0.5^20, causing severe vanishing gradients.`,
      r`Sampling weights from standard normal N(0, 1) without scaling: variance scales with fan-in, causing immediate numerical overflow and NaN weights.`,
      r`Randomly initialising bias vectors: biases should be initialised to zero to avoid introducing arbitrary non-zero offsets before training.`,
    ],
    code: r`import numpy as np

np.random.seed(42)
D = 256
n_layers = 10
n_samples = 1000

# Input: standard Gaussian features
X = np.random.normal(0, 1.0, size=(n_samples, D))

def simulate_propagation(init_type):
    current = X.copy()
    for _ in range(n_layers):
        if init_type == "std_normal":
            W = np.random.normal(0, 1.0, size=(D, D))
        elif init_type == "xavier":
            std = np.sqrt(2.0 / (D + D))
            W = np.random.normal(0, std, size=(D, D))
        elif init_type == "he":
            std = np.sqrt(2.0 / D)
            W = np.random.normal(0, std, size=(D, D))
        current = np.maximum(0, np.dot(current, W)) # ReLU activation
    return np.var(current)

var_normal = simulate_propagation("std_normal")
var_xavier = simulate_propagation("xavier")
var_he = simulate_propagation("he")

print(f"10-layer forward ReLU variance:")
print(f"Standard Normal N(0,1): {var_normal:.2e} (explodes to infinity)")
print(f"Xavier initialisation:  {var_xavier:.2e} (vanishes toward zero)")
print(f"He initialisation:      {var_he:.2f} (stable near 1.0)")`,
    quiz: [
      {
        q: r`Why does initialising all weights in a neural network layer to zero prevent it from learning effectively?`,
        o: [
          r`Because zero weights cause the loss function to divide by zero`,
          r`Because all neurons in the layer compute identical forward outputs and receive identical backward gradients, remaining locked in identical symmetry`,
          r`Because backpropagation can only run on positive floating-point numbers`,
          r`Because zero weights delete the input data permanently`,
        ],
        a: 1,
        why: r`If all weights in a layer are equal, every neuron computes the same output and receives the same gradient update. Breaking this symmetry requires random initialisation.`,
      },
      {
        q: r`Why does He (Kaiming) initialisation use a variance of 2 / D_in instead of 1 / D_in?`,
        o: [
          r`Because He initialisation is designed for networks with twice as many layers`,
          r`To compensate for the fact that ReLU sets all negative values to zero, which halves the variance of the propagated signal`,
          r`Because GPU hardware requires numbers to be powers of two`,
          r`To ensure the learning rate can be doubled during training`,
        ],
        a: 1,
        why: r`ReLU zeroes out half of the Gaussian input distribution on average, reducing signal variance by 50%. Multiplying the initial variance by 2 restores the expected signal variance to 1.0.`,
      },
      {
        q: r`What happens if you initialise a 30-layer deep neural network with weights drawn from a standard normal distribution N(0, 1)?`,
        o: [
          r`The network converges in a single training epoch`,
          r`Activation variance compounds exponentially with depth, causing immediate floating-point overflow and NaN values`,
          r`The network automatically converts into an SVM`,
          r`The weights all decay to zero immediately`,
        ],
        a: 1,
        why: r`With fan-in D, each layer multiplies variance by D. Without scaling by 1/D, variance grows as D^L, leading to rapid numerical explosion and NaN values.`,
      },
    ],
    usedBy: [],
    prereq: ['backpropagation-and-autodiff', 'activation-functions'],
    related: ['optimisers-sgd-momentum-rmsprop-adam-adamw', 'gradient-descent', 'bias-variance-tradeoff'],
    keywords: 'weight initialisation xavier glorot he kaiming variance scaling symmetry breaking relu tanh deep learning',
  },
  {
    id: 'optimisers-sgd-momentum-rmsprop-adam-adamw',
    short: 'Optimisers: SGD to AdamW',
    title: 'Optimisers: SGD, Momentum, RMSProp, Adam, and AdamW',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Navigating non-convex loss landscapes using adaptive learning rates, first-order momentum, and decoupled weight decay.`,
    lead: r`Standard Stochastic Gradient Descent (SGD) struggles in ill-conditioned loss ravines where surfaces curve steeply in one dimension and gently in another, causing oscillations and slow progress. Modern deep learning relies on advanced optimisers that accelerate along consistent directions and adapt step sizes per parameter. Tracing the algorithmic lineage from classical SGD to Momentum, RMSProp, Adam, and AdamW reveals how decoupled weight decay resolved Adam's generalisation gap to become the standard optimiser for training deep transformers and vision backbones.`,
    intuition: [
      r`Imagine rolling a heavy bowling ball down a steep, narrow canyon where the canyon walls slope steeply downwards at 80 degrees, while the river floor slopes gently toward the sea at 2 degrees. If you take a step purely in the direction of steepest descent (standard SGD), you bounce violently back and forth between the canyon walls, making almost zero forward progress down the river. The loss function oscillates wildly along high-curvature dimensions while creeping at a crawl along low-curvature dimensions.`,
      r`Momentum addresses this by introducing physical inertia: it accumulates an exponentially decaying moving average of past gradients. Perpendicular oscillations cancel each other out, while forward momentum down the river floor compounds, propelling the optimiser smoothly forward. RMSProp tackles the problem from another angle: it divides the learning rate by the square root of running gradient variance. Dimensions with massive oscillating gradients have their step size dampened; dimensions with gentle gradients have their step size boosted.`,
      r`Adam combined both mechanisms: maintaining both an exponentially decaying average of past gradients (first moment) and past squared gradients (second moment). However, researchers noticed that SGD with momentum frequently achieved superior final test generalisation. In 2017, Loshchilov and Hutter showed why: frameworks implemented L2 regularisation by adding lambda * w directly to the gradient vector. In Adam, this gradient penalty was scaled by 1 / sqrt(v), penalising frequent features far less than rare features! AdamW decouples weight decay, applying the regularisation penalty directly to the weights after the adaptive step, restoring state-of-the-art generalisation and cementing AdamW as the gold standard for LLMs and vision transformers.`,
    ],
    analogy: r`Navigating a rocky, foggy mountain trail in a heavy toboggan: momentum provides forward physical inertia that carries you over small bumps and prevents sideways wobbling, while adaptive suspension automatically softens the ride over rugged terrain and accelerates on smooth flat stretches.`,
    steps: [
      r`Select baseline optimiser: deploy AdamW as the standard choice for Transformers, language models, and complex architectures; choose SGD with momentum for standard convolutional backbones.`,
      r`Configure core AdamW hyperparameters: set standard defaults: learning rate eta = 0.001, beta_1 = 0.9 (momentum), beta_2 = 0.999 (second moment), and epsilon = 1e-8.`,
      r`Apply decoupled weight decay: set weight decay lambda between 0.01 and 0.1 in AdamW, ensuring regularisation acts directly on parameters without distorting adaptive moments.`,
      r`Exclude 1D parameters from weight decay: explicitly disable weight decay for layer normalisation gains, biases, and embedding offsets to avoid underfitting.`,
      r`Pair with learning rate warmup and decay: combine AdamW with an initial linear warmup phase followed by cosine annealing decay to stabilize early training steps.`,
    ],
    math: [
      {
        h: 'Stochastic gradient descent with classical momentum',
        tex: r`v_t = \beta v_{t-1} + (1 - \beta) g_t, \qquad \theta_t = \theta_{t-1} - \eta v_t`,
        p: r`Where $g_t = \nabla_\theta \mathcal{L}(\theta_{t-1})$ is the stochastic minibatch gradient, $\beta \in [0.9, 0.99]$ is the momentum decay factor, and $\eta$ is the learning rate. Oscillations perpendicular to the gradient canyon cancel out while consistent gradient directions accelerate.`,
      },
      {
        h: 'Adam (Adaptive Moment Estimation) with bias correction',
        tex: r`m_t = \beta_1 m_{t-1} + (1 - \beta_1) g_t, \qquad v_t = \beta_2 v_{t-1} + (1 - \beta_2) g_t^2`,
        p: r`Where $\hat{m}_t = m_t / (1 - \beta_1^t)$ and $\hat{v}_t = v_t / (1 - \beta_2^t)$ correct for initialization bias toward zero during early training steps ($t=1, 2$). The update step divides the momentum estimate by $\sqrt{\hat{v}_t} + \epsilon$.`,
      },
      {
        h: 'AdamW decoupled weight decay formulation',
        tex: r`\theta_t = \theta_{t-1} - \eta \lambda \theta_{t-1} - \frac{\eta}{\sqrt{\hat{v}_t} + \epsilon} \hat{m}_t`,
        p: r`Where regularisation penalty $\eta \lambda \theta_{t-1}$ is subtracted directly from parameter $\theta$, completely decoupled from the adaptive gradient scale factor $\sqrt{\hat{v}_t}$. This guarantees true scale-invariant weight shrinkage.`,
      },
    ],
    keyPoints: [
      r`Momentum accumulates first-order gradient history, dampening oscillations across steep ill-conditioned ravines.`,
      r`RMSProp and Adam divide updates by the square root of second moments, automatically calibrating individual learning rates per parameter.`,
      r`AdamW fixes Adam's weight decay flaw by decoupling regularisation shrinkage from adaptive gradient scaling, restoring generalisation parity with SGD.`,
    ],
    pitfalls: [
      r`Implementing L2 regularisation inside Adam by adding lambda * w to the gradient: this dilutes weight decay on parameters with large gradients, corrupting regularisation.`,
      r`Omitting bias correction terms in custom Adam implementations: without dividing by (1 - beta^t), initial gradient steps are artificially tiny.`,
      r`Applying weight decay indiscriminately to normalisation scales and bias parameters: penalising affine shift/scale parameters damages representation capacity without aiding regularisation.`,
    ],
    code: r`import numpy as np

# Minimise 2D anisotropic ill-conditioned quadratic: f(x, y) = 0.5*x^2 + 12.5*y^2
def grad(pos): return np.array([pos[0], 25.0 * pos[1]])

pos_sgd = np.array([5.0, 1.0])
pos_mom = np.array([5.0, 1.0])
pos_adamw = np.array([5.0, 1.0])

v_mom = np.zeros(2)
m, v = np.zeros(2), np.zeros(2)
lr = 0.075

for t in range(1, 51):
    # 1. Standard SGD
    pos_sgd -= lr * grad(pos_sgd)
    
    # 2. SGD with Momentum (beta=0.8)
    g_m = grad(pos_mom)
    v_mom = 0.8 * v_mom + 0.2 * g_m
    pos_mom -= lr * v_mom
    
    # 3. AdamW (beta1=0.9, beta2=0.99, weight_decay=0.01)
    g_ad = grad(pos_adamw)
    m = 0.9 * m + 0.1 * g_ad
    v = 0.99 * v + 0.01 * (g_ad**2)
    m_hat = m / (1.0 - 0.9**t)
    v_hat = v / (1.0 - 0.99**t)
    pos_adamw = pos_adamw * (1.0 - lr * 0.01) - 0.2 * m_hat / (np.sqrt(v_hat) + 1e-8)

print('Initial loss:', round(0.5 * 5.0**2 + 12.5 * 1.0**2, 2))
print('Standard SGD loss after 50 steps:   ', round(0.5 * pos_sgd[0]**2 + 12.5 * pos_sgd[1]**2, 4))
print('SGD + Momentum loss after 50 steps: ', round(0.5 * pos_mom[0]**2 + 12.5 * pos_mom[1]**2, 4))
print('AdamW loss after 50 steps:          ', round(0.5 * pos_adamw[0]**2 + 12.5 * pos_adamw[1]**2, 4))`,
    quiz: [
      {
        q: r`Why does adding classical momentum help optimisers navigate steep, narrow loss ravines?`,
        o: [
          r`It reduces the memory required to store gradients to zero`,
          r`It accumulates an exponentially decaying moving average of past gradients, causing perpendicular oscillations to cancel while accelerating forward progress`,
          r`It computes second derivatives using the Hessian matrix`,
          r`It inverts the loss function so the minimum becomes a maximum`,
        ],
        a: 1,
        why: r`In steep ravines, gradient signs oscillate rapidly across the narrow walls. Momentum averages these oscillations out, dampening perpendicular bounce while building speed along the consistent gentle ravine floor.`,
      },
      {
        q: r`What key flaw in the original Adam optimiser did AdamW fix?`,
        o: [
          r`Adam could only run on CPU architectures`,
          r`Adam coupled L2 regularisation with adaptive gradient scaling by adding weight decay directly to the gradient vector, diluting regularisation for weights with large gradients`,
          r`Adam was incapable of computing momentum`,
          r`Adam required learning rates above 10.0 to converge`,
        ],
        a: 1,
        why: r`Original Adam added L2 regularisation to the gradient g_t, which was then divided by sqrt(v_t), reducing weight decay for parameters with frequent large gradients. AdamW decouples weight decay, applying direct shrinkage.`,
      },
      {
        q: r`Why are bias parameters and normalisation scale/shift gains typically excluded from weight decay during neural network training?`,
        o: [
          r`Because PyTorch cannot compute derivatives for 1D vectors`,
          r`Biases and normalisation parameters represent very few parameters and penalising them causes underfitting without preventing overfitting`,
          r`Because weight decay turns all bias parameters to positive infinity`,
          r`Because biases must always remain strictly zero`,
        ],
        a: 1,
        why: r`Overfitting is driven by complex combinations of weight matrices. Biases and normalisation affine parameters simply shift and scale representations; decaying them harms network expressivity without aiding regularisation.`,
      },
    ],
    usedBy: [],
    prereq: ['gradient-descent', 'backpropagation-and-autodiff'],
    related: ['activation-functions', 'weight-initialisation-xavier-and-he', 'quasi-newton-and-lbfgs'],
    keywords: 'optimisers sgd momentum rmsprop adam adamw weight decay adaptive learning rate gradient descent loss landscape',
  },

// ------------------------------------------------------------------ Lesson 1
  {
    id: 'learning-rate-schedules-and-warm-up',
    short: 'LR schedules and warm-up',
    title: 'Learning-Rate Schedules and Warm-Up',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`A fixed learning rate is either too aggressive early in training or too coarse near the end. Schedules start gently with warm-up, scale to peak velocity, and anneal downward to settle into sharp, high-generalisation minima.`,
    lead: r`The learning rate is widely regarded as the most critical hyperparameter in deep learning. Modern training recipes rarely keep it constant: linear warm-up stabilises the network when momentum buffers and running statistics are empty, followed by cosine annealing or 1cycle decay to explore broadly and converge cleanly.`,
    intuition: [
      r`At the start of training ($t=1$), network weights are random, running moments in adaptive optimisers such as [[optimisers-sgd-momentum-rmsprop-adam-adamw|AdamW]] ($m_0=0, v_0=0$) are uninitialised, and intermediate representations fluctuate violently. Taking large gradient steps in this chaotic phase thrusts parameters into distorted, ill-conditioned loss ravines from which recovery is slow or impossible. Linear warm-up ramps the learning rate smoothly from near zero to its target peak over the first 1% to 5% of training steps, allowing gradient statistics to form reliable second-moment estimates before high-velocity updates begin.`,
      r`Once representations stabilise, maintaining a large learning rate allows the optimiser to cross saddle points and skip shallow, poor local basins. However, as the loss landscape transitions into a narrow valley containing desirable minima, a high step size causes parameters to oscillate back and forth between opposing walls without ever reaching the trough. Decaying the learning rate gradually contracts the step radius, enabling the parameter trajectory to settle smoothly into the lowest point of the basin.`,
      r`Among decay patterns, step decay (cutting the rate by a factor of 10 every $N$ epochs) produces sharp, discontinuous drops that require manual schedule tuning. By contrast, cosine annealing smoothly interpolates the learning rate along a half-cosine curve from $\eta_{\text{max}}$ down to $\eta_{\text{min}}$, offering smooth deceleration with zero abrupt plateaus. This approach has become the standard default across modern vision architectures and large language models.`,
    ],
    analogy: r`Like landing a spacecraft on an asteroid: thrusters fire delicately at first to establish stable orientation (warm-up), cruise at maximum velocity across space (peak rate), and gradually throttle down to a feathering touch for touchdown without bouncing off (cosine decay).`,
    steps: [
      r`Determine peak learning rate $\eta_{\text{max}}$: run an LR range test (Leslie Smith test) or adopt proven architecture defaults ($3 \times 10^{-4}$ for AdamW on Transformers; $10^{-1}$ for SGD on ConvNets).`,
      r`Configure the warm-up window: designate $T_{\text{warm}}$ (typically 1% to 5% of total iterations, or 1 to 5 epochs) to ramp the learning rate linearly from $\eta_{\text{min}}$ (or 0) to $\eta_{\text{max}}$.`,
      r`Select decay trajectory: deploy cosine annealing for fixed total training budgets $T_{\text{total}}$, or linear decay for bounded fine-tuning tasks.`,
      r`Synchronise with batch scale: when scaling effective batch size across multiple GPUs, scale $\eta_{\text{max}}$ proportionally (linear scaling $\eta \propto B$ or square-root scaling $\eta \propto \sqrt{B}$) and extend the warm-up window.`,
      r`Monitor validation dynamics: verify that loss does not explode in the initial 200 steps and that late-stage annealing coincides with sustained improvements in validation metrics.`,
    ],
    math: [
      {
        h: 'Linear warm-up schedule',
        tex: r`$$\eta_t = \eta_{\text{base}} + \frac{t}{T_{\text{warm}}}(\eta_{\text{max}} - \eta_{\text{base}}), \quad 1 \le t \le T_{\text{warm}}$$`,
        p: r`$t$ is the current training iteration, $T_{\text{warm}}$ is the total number of warm-up iterations, $\eta_{\text{base}}$ is the initial floor rate (often $0$ or $10^{-7}$), and $\eta_{\text{max}}$ is the peak target rate. This linear progression shields uninitialised layers from destabilising gradient shocks during initial steps.`,
      },
      {
        h: 'Cosine annealing decay',
        tex: r`$$\eta_t = \eta_{\text{min}} + \frac{1}{2}(\eta_{\text{max}} - \eta_{\text{min}})\left(1 + \cos\left(\frac{t - T_{\text{warm}}}{T_{\text{total}} - T_{\text{warm}}}\pi\right)\right), \quad T_{\text{warm}} \le t \le T_{\text{total}}$$`,
        p: r`$\eta_{\text{min}}$ is the asymptotic minimum learning rate (commonly $0.01 \cdot \eta_{\text{max}}$ or $0$), and $T_{\text{total}}$ is the planned step count. The argument to $\cos$ ranges smoothly from $0$ (where $\cos(0) = 1$) to $\pi$ (where $\cos(\pi) = -1$), providing continuous deceleration without discrete hyperparameter step thresholds.`,
      },
      {
        h: 'Step decay comparison',
        tex: r`$$\eta_k = \eta_0 \cdot \gamma^{\lfloor k / s \rfloor}$$`,
        p: r`$k$ is the completed epoch index, $s$ is the step interval (e.g. drop every 30 epochs), and $\gamma$ is the multiplicative discount factor (typically $0.1$ or $0.2$). While simple, step decay introduces sudden drop discontinuities that make progress sensitive to the exact choice of step boundaries.`,
      },
    ],
    keyPoints: [
      r`Linear warm-up prevents early divergence caused by noisy gradients and uncalibrated second-moment statistics in adaptive optimisers.`,
      r`Cosine annealing provides a smooth, schedule-long decay that eliminates the arbitrary epoch milestone tuning of step decay.`,
      r`Cosine schedules are budget-dependent: they require knowing the total step count $T_{\text{total}}$ in advance; interrupting training at 50% budget leaves the learning rate far too high for optimal convergence.`,
    ],
    pitfalls: [
      r`Omitting warm-up when training deep Transformers with AdamW, frequently resulting in immediate gradient explosion or loss divergence in the opening epochs.`,
      r`Setting $T_{\text{total}}$ in a cosine schedule significantly higher than actual training duration, which truncates training before the learning rate can anneal into its low-variance basin.`,
      r`Decaying the learning rate prematurely, trapping the optimiser in a mediocre local plateau before it has sufficiently traversed the parameter space.`,
    ],
    code: r`import numpy as np

def schedule_lr(step, total_steps=100, warm_steps=20, lr_max=0.01, lr_min=0.0001):
    # Linear warm-up phase
    if step < warm_steps:
        return lr_min + (lr_max - lr_min) * (step / warm_steps)
    # Cosine annealing decay phase
    progress = (step - warm_steps) / (total_steps - warm_steps)
    return lr_min + 0.5 * (lr_max - lr_min) * (1.0 + np.cos(np.pi * progress))

# Evaluate schedule at representative milestones
milestones = [5, 20, 60, 100]
print("Warm-up & Cosine Annealing Milestones (lr_max=0.01, warm=20, total=100):")
for s in milestones:
    rate = schedule_lr(s)
    phase = "Warm-up" if s < 20 else ("Peak" if s == 20 else "Cosine decay")
    print(f"Step {s:3d} ({phase:12s}): learning rate = {rate:.6f}")`,
    quiz: [
      {
        q: r`Why is linear warm-up particularly essential when training Transformers with Adam or AdamW?`,
        o: [
          r`Because Transformers have no activation functions in their feed-forward blocks`,
          r`Because early gradients are noisy and uninitialised second-moment variance buffers can produce destructively large initial parameter steps`,
          r`Because warm-up guarantees that training loss drops to zero within the first epoch`,
          r`Because AdamW cannot compute weight decay unless the learning rate is below 0.001`,
        ],
        a: 1,
        why: r`In early iterations, the second-moment estimate $v_t$ in Adam is biased near zero. Even with bias corrections, initial steps can be volatile; ramping the learning rate protects parameters until gradient statistics stabilise.`,
      },
      {
        q: r`What is the primary operational drawback of a cosine annealing schedule compared to adaptive learning rate methods?`,
        o: [
          r`It requires knowing the total step budget $T_{\text{total}}$ in advance to plan the decay curve`,
          r`It cannot be implemented with Stochastic Gradient Descent`,
          r`It increases the computational complexity of the backward pass from $O(N)$ to $O(N^2)$`,
          r`It forces the learning rate to increase exponentially after reaching the midpoint`,
        ],
        a: 0,
        why: r`Cosine annealing maps progress along $t / T_{\text{total}}$. If training is stopped early (or extended beyond $T_{\text{total}}$), the schedule does not align with the actual stopping point.`,
      },
      {
        q: r`Suppose you train a model with total steps $T_{\text{total}}=100$, warm-up steps $T_{\text{warm}}=20$, peak rate $\eta_{\text{max}}=0.01$, and minimum rate $\eta_{\text{min}}=0.0001$. What is the learning rate at step 60 (halfway through the cosine decay phase)?`,
        o: [
          r`Approximately 0.000100`,
          r`Approximately 0.005050`,
          r`Approximately 0.009900`,
          r`Approximately 0.002575`,
        ],
        a: 1,
        why: r`At step 60, progress through decay is $(60-20)/(100-20) = 40/80 = 0.5$. With $\cos(0.5\pi) = 0$, the rate is $\eta_{\text{min}} + 0.5(\eta_{\text{max}} - \eta_{\text{min}}) = 0.0001 + 0.5(0.0099) = 0.005050$.`,
      },
      {
        q: r`How does the 1cycle policy differ from standard monotonic cosine decay?`,
        o: [
          r`It keeps the learning rate permanently constant while varying batch size`,
          r`It increases learning rate to a peak while decreasing momentum, then decreases learning rate while increasing momentum`,
          r`It applies dropout only during the final 10% of training steps`,
          r`It skips backpropagation during alternate training mini-batches`,
        ],
        a: 1,
        why: r`Leslie Smith's 1cycle policy couples learning rate warm-up and decay with inverted momentum cycles (e.g. momentum drops from 0.95 to 0.85 during warm-up, then rises back to 0.95 during decay).`,
      },
    ],
    usedBy: [],
    prereq: ['optimisers-sgd-momentum-rmsprop-adam-adamw', 'backpropagation-and-autodiff'],
    related: ['weight-initialisation-xavier-and-he', 'vanishing-and-exploding-gradients-clipping', 'normalisation-batch-layer-rms'],
    keywords: 'learning rate schedule warmup cosine annealing step decay 1cycle sgdr adamw learning rate scheduler step size',
  },

  // ------------------------------------------------------------------ Lesson 2
  {
    id: 'vanishing-and-exploding-gradients-clipping',
    short: 'Vanishing/exploding gradients',
    title: 'Vanishing and Exploding Gradients, Gradient Clipping',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`In deep architectures, backpropagation repeatedly chains Jacobian matrices across layers: if their singular values average less than 1, gradients decay to zero; if greater than 1, they blow up to NaN.`,
    lead: r`Training networks with dozens or hundreds of layers requires gradients to propagate reliably from loss to input. Without architectural safeguards, repeated matrix products cause gradients to vanish exponentially into numerical insignificance or explode into non-finite NaNs. Modern deep learning addresses this through gradient norm clipping, non-saturating activations, normalisation, and residual skip connections.`,
    intuition: [
      r`Backpropagation computes the gradient of the loss with respect to early layer weights by chaining together partial derivatives across every intervening layer. In an $L$-layer network, the derivative at layer 1 is proportional to the product of $L-1$ weight matrices and activation Jacobian matrices. If the effective amplification factor at each layer is even slightly below one—say, $0.8$—then after 50 layers the gradient scales as $0.8^{50} \approx 1.4 \times 10^{-5}$. The earliest layers receive virtually no update signal and freeze in their random initialisation state.`,
      r`Conversely, if the effective amplification factor exceeds one—for instance, $1.2$—the product over 50 layers compounds to $1.2^{50} \approx 9,100$. A single step with this inflated gradient sends parameters flying into regions of extreme loss, overflowing floating-point limits and producing ` + '`NaN`' + r` loss values. This exploding gradient phenomenon is especially acute in recurrent networks unrolled across long sequences and in deep networks encountering sharp, steep loss cliffs.`,
      r`Gradient clipping is the primary algorithmic safeguard against exploding gradients. Rather than letting an unexpectedly large gradient take a disastrous leap, clipping caps the global vector norm at a predetermined threshold $c$ (typically $1.0$). By rescaling the entire gradient vector proportionally when its length exceeds $c$, the update preserves its exact descent direction while strictly bounding the maximum spatial displacement.`,
    ],
    analogy: r`Like whispering a message down a telephone line of 50 people: if each participant speaks at 80% volume, the message fades to complete silence (vanishing); if each shouts 20% louder than the last, the final output is a deafening, blown-out screech (exploding).`,
    steps: [
      r`Monitor layer-wise gradient norms: record $\lVert \nabla_{W_l} \mathcal{L} \rVert_2$ across depth during training to spot early decay or sudden magnitude spikes.`,
      r`Deploy non-saturating activations: replace sigmoid ($\sigma'(z) \le 0.25$) and tanh ($\tanh'(z) \le 1.0$) with [[activation-functions|ReLU or GELU]] to prevent derivative saturation.`,
      r`Enforce variance-preserving initialisation: apply [[weight-initialisation-xavier-and-he|He/Kaiming initialisation]] so weight tensors maintain signal variance across forward and backward sweeps.`,
      r`Apply global gradient norm clipping: compute the concatenated Euclidean norm across all parameter gradients and rescale by $c / \lVert g \rVert_2$ whenever $\lVert g \rVert_2 > c$.`,
      r`Incorporate residual pathways: insert skip connections ($x + f(x)$) to grant backpropagated gradients an unhindered linear highway directly to early layers.`,
    ],
    math: [
      {
        h: 'Backpropagated gradient product across layers',
        tex: r`$$\frac{\partial \mathcal{L}}{\partial h_1} = \frac{\partial \mathcal{L}}{\partial h_L} \prod_{l=1}^{L-1} \left( W_{l+1}^T \operatorname{diag}\big(\sigma'(z_l)\big) \right)$$`,
        p: r`$h_l$ is the hidden representation at layer $l$, $W_{l+1}$ is the weight matrix, and $\operatorname{diag}(\sigma'(z_l))$ is the diagonal Jacobian of the activation function. If the spectral radius of the transition matrix satisfies $\rho < 1$, the gradient norm shrinks as $O(\rho^L)$ (vanishing); if $\rho > 1$, it expands as $O(\rho^L)$ (exploding).`,
      },
      {
        h: 'Global gradient norm clipping',
        tex: r`$$g_{\text{clipped}} = \begin{cases} g & \text{if } \lVert g \rVert_2 \le c \\ c \frac{g}{\lVert g \rVert_2} & \text{if } \lVert g \rVert_2 > c \end{cases}, \qquad \lVert g \rVert_2 = \sqrt{\sum_{i=1}^P g_i^2}$$`,
        p: r`$g$ is the unrolled vector of all $P$ model parameter gradients, $\lVert g \rVert_2$ is its global Euclidean length, and $c$ is the maximum permitted clipping threshold (commonly $0.5$ to $1.0$). Global norm clipping preserves the exact geometric angle and descent direction of $g$, scaling only its step length.`,
      },
      {
        h: 'Value-based clipping comparison',
        tex: r`$$g_i' = \operatorname{clip}(g_i, -c, c) = \min(\max(g_i, -c), c)$$`,
        p: r`Element-wise clipping truncates each gradient scalar independently. While computationally trivial, clipping by value alters the orientation of the gradient vector in multi-dimensional space, skewing the optimiser away from the true steepest descent trajectory.`,
      },
    ],
    keyPoints: [
      r`Vanishing gradients freeze parameter updates in early layers, preventing the network from learning rich hierarchical representations.`,
      r`Global norm clipping rescales the gradient vector without altering its directional angle, protecting against catastrophic steps near steep loss cliffs.`,
      r`While clipping halts gradient explosions, vanishing gradients require structural remedies: non-saturating activations (ReLU/GELU), He initialisation, and residual skip connections.`,
    ],
    pitfalls: [
      r`Clipping coordinate-wise by value instead of global norm, which distorts the search direction and degrades optimisation trajectories.`,
      r`Setting the clipping threshold $c$ excessively small (e.g. $10^{-4}$), which effectively degenerates gradient descent into fixed-step sign navigation.`,
      r`Assuming gradient clipping cures vanishing gradients: clipping only bounds maximum gradient magnitude and cannot resurrect derivatives that have collapsed to zero.`,
    ],
    code: r`import numpy as np

# 1. Compare derivative decay across a 10-layer depth
depth = 10
sig_max_deriv = 0.25  # max derivative of standard sigmoid is 0.25
relu_deriv = 1.0      # active ReLU derivative is exactly 1.0

sig_decay = sig_max_deriv ** depth
relu_decay = relu_deriv ** depth
print(f"10-layer derivative product (sigmoid): {sig_decay:.2e}")
print(f"10-layer derivative product (active ReLU): {relu_decay:.2f}")

# 2. Global gradient norm clipping demonstration
np.random.seed(42)
grads = np.array([30.0, -25.0, 15.0, 10.0])
norm = np.linalg.norm(grads)
threshold = 1.0

if norm > threshold:
    clipped = grads * (threshold / norm)
else:
    clipped = grads

clipped_norm = np.linalg.norm(clipped)
cos_sim = np.dot(grads, clipped) / (norm * clipped_norm)

print(f"Original gradient vector: {grads.tolist()}, norm = {norm:.2f}")
print(f"Clipped gradient vector:  {np.round(clipped, 4).tolist()}, norm = {clipped_norm:.4f}")
print(f"Cosine directional similarity: {cos_sim:.4f} (direction perfectly preserved)")`,
    quiz: [
      {
        q: r`Why does global norm clipping preserve the search direction of gradient descent while element-wise value clipping does not?`,
        o: [
          r`Because global norm clipping applies the exact same scalar multiplier to every gradient coordinate`,
          r`Because global norm clipping sets negative gradients to zero`,
          r`Because element-wise clipping only operates on the final output layer`,
          r`Because global norm clipping converts the gradient to a probability distribution`,
        ],
        a: 0,
        why: r`Global norm clipping multiplies the entire gradient vector $g$ by the scalar $c / \lVert g \rVert_2$, scaling its magnitude without rotating its spatial angle in parameter space. Value clipping truncates individual components independently, shifting the vector direction.`,
      },
      {
        q: r`Why did deep neural networks built with sigmoid activation functions suffer severely from vanishing gradients?`,
        o: [
          r`Because sigmoid functions cannot be computed on modern GPUs`,
          r`Because the maximum value of the sigmoid derivative is only 0.25, guaranteeing exponential decay $(0.25)^L$ across depth`,
          r`Because sigmoid activations produce negative variance in hidden layers`,
          r`Because sigmoid derivatives are discontinuous at zero`,
        ],
        a: 1,
        why: r`Since $\sigma'(z) = \sigma(z)(1 - \sigma(z)) \le 0.25$, chaining $L$ sigmoid activations multiplies gradients by at most $0.25$ per layer, shrinking early layer gradients to near zero even with ideal weight scales.`,
      },
      {
        q: r`Which of the following architectural innovations provides a direct structural solution to vanishing gradients in 100+ layer networks?`,
        o: [
          r`Residual skip connections ($x + f(x)$)`,
          r`Element-wise gradient clipping by value`,
          r`Replacing AdamW with vanilla SGD without momentum`,
          r`Increasing the learning rate by a factor of 10 every epoch`,
        ],
        a: 0,
        why: r`Residual connections introduce an additive identity pathway $h_{l+1} = h_l + f(h_l)$. During backpropagation, $\frac{\partial \mathcal{L}}{\partial h_l} = \frac{\partial \mathcal{L}}{\partial h_{l+1}}(I + \frac{\partial f}{\partial h_l})$, ensuring that gradients can pass back unattenuated through the identity matrix term.`,
      },
      {
        q: r`If a model experiences exploding gradients causing loss values to display as NaN, what is the immediate recommended operational fix?`,
        o: [
          r`Increase the learning rate to bypass the unstable loss region`,
          r`Add global gradient norm clipping (e.g. threshold = 1.0) and verify weight initialisation`,
          r`Remove all normalisation layers from the network`,
          r`Double the batch size while keeping weights unclipped`,
        ],
        a: 1,
        why: r`Global gradient norm clipping immediately halts runaway update magnitudes near steep ravines, preventing parameters from jumping into invalid floating-point overflow regimes.`,
      },
    ],
    usedBy: [],
    prereq: ['backpropagation-and-autodiff', 'activation-functions', 'weight-initialisation-xavier-and-he'],
    related: ['optimisers-sgd-momentum-rmsprop-adam-adamw', 'learning-rate-schedules-and-warm-up', 'normalisation-batch-layer-rms'],
    keywords: 'vanishing gradients exploding gradients gradient clipping grad norm jacobian spectral radius nan loss explosion residual skip connection',
  },

  // ------------------------------------------------------------------ Lesson 3
  {
    id: 'normalisation-batch-layer-rms',
    short: 'Normalisation: Batch, Layer, RMS',
    title: 'Normalisation: Batch, Layer, and RMS Normalisation',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Intermediate activations shift and rescale during training as upstream weights update. Normalisation standardises activations across batch, channel, or feature dimensions to smooth the loss landscape and accelerate convergence.`,
    lead: r`Deep neural networks are notoriously vulnerable to internal activation drift: small weight changes in early layers cause cascading shifts in the mean and scale of downstream inputs. Normalisation techniques—principally Batch Normalisation for vision, Layer Normalisation for sequences, and RMS Normalisation for modern language models—stabilise internal distributions, allowing higher learning rates and dramatically smoother optimisation landscapes.`,
    intuition: [
      r`Imagine training layer 30 in a deep network. At every step, layers 1 through 29 update their parameters. Even if each update is modest, their combined effect alters the mean, variance, and distribution of the inputs arriving at layer 30. Layer 30 is perpetually trying to learn a mapping on a moving target. Without calibration, activations can saturate nonlinearities or drift toward extreme magnitudes, slowing training to a crawl.`,
      r`<strong>Batch Normalisation (BatchNorm)</strong> tackles this by computing the mean and variance across the batch dimension for each feature channel independently. By forcing the mini-batch activations to have zero mean and unit variance, it smooths the loss landscape and permits learning rates ten times larger. However, BatchNorm couples the representations of distinct examples within a batch, requires maintaining running statistics for inference, and deteriorates when mini-batch sizes are small ($B < 8$) or sequences vary in length.`,
      r`<strong>Layer Normalisation (LayerNorm)</strong> eliminates batch dependencies by computing the mean and variance across the hidden feature dimension for each individual sample independently. Because it operates within a single example, LayerNorm behaves identically during training and evaluation, handles dynamic sequence lengths effortlessly, and serves as the structural foundation of Transformers. Building on this, <strong>RMS Normalisation (RMSNorm)</strong> observes that the primary stabilisation benefit stems from scaling invariance rather than mean-centring; by normalising activations strictly by their root-mean-square, RMSNorm achieves identical training stability while cutting normalisation compute overhead by 10% to 50% in architectures like Llama and Mistral.`,
    ],
    analogy: r`Like tuning instruments in an orchestra: BatchNorm adjusts each instrument section by averaging volume across the whole day's rehearsals (the batch), whereas LayerNorm and RMSNorm balance all instruments within each individual musician's performance independently.`,
    steps: [
      r`Match normalisation type to architecture: deploy BatchNorm for 2D/3D ConvNets with large stable batches ($B \ge 32$); deploy LayerNorm or RMSNorm for Transformers, sequence models, or small-batch regimes.`,
      r`Compute reduction statistics: for LayerNorm, calculate sample mean $\mu_i$ and sample variance $\sigma_i^2$ across the hidden dimension $D$; for RMSNorm, calculate the root-mean-square $\operatorname{RMS}(x_i) = \sqrt{\frac{1}{D}\sum_j x_{i,j}^2 + \epsilon}$.`,
      r`Standardise activations: centre and divide by scale for LayerNorm; divide raw activations directly by the root-mean-square for RMSNorm.`,
      r`Apply learnable affine parameters: scale by learnable vector $\gamma$ and shift by $\beta$ ($y = \gamma \odot \hat{x} + \beta$), guaranteeing the network can recover any optimal activation distribution.`,
      r`Select architectural placement: in Transformer blocks, place normalisation before attention and feed-forward sublayers (Pre-LN: $x + \operatorname{SubLayer}(\operatorname{Norm}(x))$) to guarantee stable gradient flow without brittle warm-up requirements.`,
    ],
    math: [
      {
        h: 'Batch Normalisation (per feature channel across batch)',
        tex: r`$$\hat{x}_{i,k} = \frac{x_{i,k} - \mu_B}{\sqrt{\sigma_B^2 + \epsilon}}, \quad y_{i,k} = \gamma_k \hat{x}_{i,k} + \beta_k, \qquad \mu_B = \frac{1}{B}\sum_{i=1}^B x_{i,k}, \quad \sigma_B^2 = \frac{1}{B}\sum_{i=1}^B (x_{i,k} - \mu_B)^2$$`,
        p: r`$B$ is batch size, $x_{i,k}$ is the activation of sample $i$ at channel $k$, $\epsilon$ is a small numerical floor (e.g. $10^{-5}$), and $\gamma_k, \beta_k$ are learnable affine parameters. In inference, $\mu_B$ and $\sigma_B^2$ are replaced by frozen running population averages $\mu_{\text{run}}$ and $\sigma^2_{\text{run}}$.`,
      },
      {
        h: 'Layer Normalisation (per sample across hidden features)',
        tex: r`$$\hat{x}_{i,j} = \frac{x_{i,j} - \mu_i}{\sqrt{\sigma_i^2 + \epsilon}}, \quad y_{i,j} = \gamma_j \hat{x}_{i,j} + \beta_j, \qquad \mu_i = \frac{1}{D}\sum_{j=1}^D x_{i,j}, \quad \sigma_i^2 = \frac{1}{D}\sum_{j=1}^D (x_{i,j} - \mu_i)^2$$`,
        p: r`$D$ is the hidden representation dimension, and statistics are computed across features $j=1,\dots,D$ for each individual sample $i$ independently. Because no cross-sample averaging occurs, training and inference calculations are identical and completely invariant to batch size.`,
      },
      {
        h: 'Root Mean Square Normalisation (RMSNorm)',
        tex: r`$$\bar{x}_{i,j} = \frac{x_{i,j}}{\operatorname{RMS}(x_i)} \cdot \gamma_j, \qquad \operatorname{RMS}(x_i) = \sqrt{\frac{1}{D}\sum_{j=1}^D x_{i,j}^2 + \epsilon}$$`,
        p: r`RMSNorm discards the mean-centring step ($\mu_i=0$) and scales activations solely by their quadratic root-mean-square norm. By removing two sequential memory passes (mean computation and mean subtraction), RMSNorm accelerates execution latency on modern GPU tensor cores while preserving regularised scaling stability.`,
      },
    ],
    keyPoints: [
      r`BatchNorm normalises across samples in a mini-batch; LayerNorm normalises across hidden features within a single sample.`,
      r`RMSNorm removes mean subtraction from LayerNorm, matching its training stability while substantially reducing memory bandwidth and kernel overhead.`,
      r`Learnable affine parameters ($\gamma, \beta$) preserve representational capacity by allowing the network to scale or shift standardised activations if an identity mapping is optimal.`,
    ],
    pitfalls: [
      r`Using Batch Normalisation with small mini-batch sizes ($B \le 4$), where high sampling noise in batch statistics degrades convergence and final accuracy.`,
      r`Failing to set the model to evaluation mode (` + '`model.eval()`' + r`) during inference, causing BatchNorm to compute statistics on test batches instead of using tracked population averages.`,
      r`Using Post-LN (placing LayerNorm after the residual addition) without extensive learning rate warm-up, which causes sharp gradient instabilities in deep Transformer backbones.`,
    ],
    code: r`import numpy as np

# Synthetic batch: 2 samples, 5 hidden features
np.random.seed(42)
X = np.random.randn(2, 5) * 3.0 + 2.0  # mean ~ 2, std ~ 3

# 1. LayerNorm: zero mean and unit variance per sample across features
mu_ln = np.mean(X, axis=1, keepdims=True)
var_ln = np.var(X, axis=1, keepdims=True)
X_ln = (X - mu_ln) / np.sqrt(var_ln + 1e-5)

# 2. RMSNorm: unit root-mean-square per sample across features
rms = np.sqrt(np.mean(X**2, axis=1, keepdims=True) + 1e-5)
X_rms = X / rms

print("Original Sample 0:      ", np.round(X[0], 2).tolist())
print("Sample 0 mean and std:  ", round(float(np.mean(X[0])), 2), round(float(np.std(X[0])), 2))
print("LayerNorm Sample 0:     ", np.round(X_ln[0], 2).tolist())
print("LayerNorm mean and std: ", round(float(np.mean(X_ln[0])), 4), round(float(np.std(X_ln[0])), 4))
print("RMSNorm Sample 0:       ", np.round(X_rms[0], 2).tolist())
print("RMSNorm root-mean-square:", round(float(np.sqrt(np.mean(X_rms[0]**2))), 4))`,
    quiz: [
      {
        q: r`Why is Layer Normalisation preferred over Batch Normalisation in Transformers and natural language processing?`,
        o: [
          r`Because LayerNorm can only be applied to convolutional layers`,
          r`Because LayerNorm computes statistics across features within each token independently, handling variable sequence lengths and batch size 1 seamlessly`,
          r`Because LayerNorm completely eliminates the need for backpropagation`,
          r`Because BatchNorm requires labels to compute batch variance`,
        ],
        a: 1,
        why: r`LayerNorm operates along the channel/feature dimension for each individual token and sample independently. It does not mix information across the batch dimension, allowing identical execution during training and single-token inference.`,
      },
      {
        q: r`What key computational modification distinguishes RMSNorm from standard LayerNorm?`,
        o: [
          r`RMSNorm adds an exponential moving average across previous layers`,
          r`RMSNorm omits the mean subtraction step and standardises purely by the root-mean-square of activations`,
          r`RMSNorm replaces matrix multiplication with convolution`,
          r`RMSNorm eliminates all learnable parameters $\gamma$`,
        ],
        a: 1,
        why: r`RMSNorm posits that the scaling property of LayerNorm provides the primary training benefit. By omitting mean-centring ($\mu_i=0$), it reduces memory traffic and execution time while maintaining equivalent stability.`,
      },
      {
        q: r`What role do the learnable parameters $\gamma$ (scale) and $\beta$ (shift) serve in normalisation layers?`,
        o: [
          r`They enforce that activations are strictly bounded between 0 and 1`,
          r`They allow the network to learn any affine transformation of the standardised activations, including restoring original values if needed`,
          r`They prevent the optimiser from updating weight matrices`,
          r`They compute the test set accuracy at every forward pass`,
        ],
        a: 1,
        why: r`Without $\gamma$ and $\beta$, normalisation strictly forces activations to zero mean and unit variance, which might limit the representational power of non-linear activations. Learnable affine parameters allow the model to adapt or even undo the normalisation if optimal.`,
      },
      {
        q: r`What happens if you deploy a model containing Batch Normalisation in production but forget to switch it to evaluation mode?`,
        o: [
          r`The model refuses to process any inference requests and throws an immediate syntax error`,
          r`The model calculates mean and variance from the incoming test mini-batch rather than using frozen population statistics, causing erratic predictions on small batches`,
          r`All parameter weights are automatically reset to random Gaussian values`,
          r`The output probabilities become identical for every class`,
        ],
        a: 1,
        why: r`In training mode, BatchNorm computes statistics from the current batch. During inference on a single query ($B=1$), the batch variance is zero, producing undefined divisions or nonsensical outputs unless frozen running statistics are used.`,
      },
    ],
    usedBy: [],
    prereq: ['weight-initialisation-xavier-and-he', 'backpropagation-and-autodiff'],
    related: ['vanishing-and-exploding-gradients-clipping', 'learning-rate-schedules-and-warm-up', 'regularisation-dropout-weight-decay-early-stopping'],
    keywords: 'normalisation batchnorm layernorm rmsnorm internal covariate shift pre-ln post-ln affine scale shift standardisation transformer',
  },

  // ------------------------------------------------------------------ Lesson 4
  {
    id: 'regularisation-dropout-weight-decay-early-stopping',
    short: 'Regularisation: dropout, decay',
    title: 'Regularisation: Dropout, Weight Decay, and Early Stopping',
    task: 'concepts',
    module: 'Training fundamentals',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Overparameterised neural networks have enough capacity to memorise training noise verbatim. Regularisation bounds model complexity through stochastic feature dropout, weight shrinkage penalties, and validation-based early stopping.`,
    lead: r`Modern deep neural networks often contain far more parameters than training observations, granting them the capacity to achieve zero training error even on completely randomised labels. To ensure high test-time generalisation, practitioners combine three complementary regularisation pillars: weight decay to shrink parameter norms, inverted dropout to break co-adaptations between neurons, and early stopping to halt optimisation before noise memorisation begins.`,
    intuition: [
      r`Consider a dense neural network where two neurons in layer 2 always activate together to compensate for each other's errors. This co-adaptation creates fragile internal representations: if test data exhibits a slightly different distribution, both neurons misfire. <strong>Dropout</strong> shatters co-adaptations by randomly deactivating a subset of neurons (with probability $p$, typically $0.1$ to $0.5$) during each training forward pass. Because no neuron can rely on the presence of any other specific neuron, each is forced to learn robust, self-sufficient features. Mathematically, dropout acts as an implicit ensemble over $2^N$ possible thinned subnetworks.`,
      r`<strong>Weight Decay</strong> adds an $L_2$ penalty on parameter magnitudes, directly shrinking weights toward zero at every optimisation step. Keeping weights small ensures that small perturbations in input features cannot trigger massive, uncontrolled swings in downstream activations, effectively bounding the model's curvature. In adaptive optimisers such as [[optimisers-sgd-momentum-rmsprop-adam-adamw|AdamW]], this shrinkage must be decoupled from gradient scaling to prevent parameters with historically large gradients from escaping regularisation.`,
      r`<strong>Early Stopping</strong> exploits the learning dynamics of gradient descent. When training deep networks, optimisers typically capture broad, low-frequency patterns first before memorising high-frequency sample quirks and labelling errors. By continuously evaluating loss on a separate validation split and stopping training when validation loss stops improving (after a patience window, such as 5 epochs), early stopping acts as a non-parametric complexity control, preserving the checkpoint with the highest true generalisation power.`,
    ],
    analogy: r`Like training a robust disaster response team: weight decay ensures no single specialist hoards all responsibility, dropout ensures team members can function when colleagues are absent, and early stopping ends drills when team peak performance is reached before exhaustion induces bad habits.`,
    steps: [
      r`Partition a validation holdout: reserve 10% to 20% of training data (or establish cross-validation splits) to monitor generalisation independently of the optimiser's loss.`,
      r`Apply decoupled weight decay: set decay coefficient $\lambda$ (commonly $0.01$ to $0.1$ in AdamW) across 2D/3D weight matrices, while excluding 1D bias vectors and normalisation scales.`,
      r`Insert inverted dropout layers: position dropout modules ($p \in [0.1, 0.5]$) after activations or attention projections, scaling active units by $1 / (1-p)$ during training.`,
      r`Toggle evaluation mode: invoke ` + '`model.eval()`' + r` during inference to disable dropout, allowing all neurons to contribute deterministically without test-time scaling.`,
      r`Configure early stopping monitor: track validation loss with a patience threshold $P$ (e.g. 5 epochs), automatically rolling back to the best checkpoint when patience is exhausted.`,
    ],
    math: [
      {
        h: 'Decoupled weight decay parameter update',
        tex: r`$$w_t = (1 - \eta \lambda) w_{t-1} - \eta \Delta w_t$$`,
        p: r`$w_t$ is the weight vector at iteration $t$, $\eta$ is the learning rate, $\lambda$ is the weight decay coefficient, and $\Delta w_t$ is the gradient update direction (either the standard gradient or Adam's preconditioned gradient). The factor $(1 - \eta \lambda)$ shrinks the parameter toward zero at every step independently of gradient magnitudes.`,
      },
      {
        h: 'Inverted Dropout forward transform',
        tex: r`$$\tilde{h}_i = \frac{m_i}{1 - p} \cdot h_i, \qquad m_i \sim \operatorname{Bernoulli}(1 - p)$$`,
        p: r`$h_i$ is the original pre-dropout activation, $p$ is the dropout drop probability ($1-p$ is the survival probability), and $m_i \in \{0, 1\}$ is a random binary mask. Multiplying by the inverted scale factor $\frac{1}{1-p}$ ensures $\mathbb{E}[\tilde{h}_i] = h_i$, meaning expected activation magnitudes are preserved and test-time evaluation requires no post-scaling.`,
      },
      {
        h: 'Early stopping decision criterion',
        tex: r`$$\text{Halt if } t - \arg\min_{k \le t} \mathcal{L}_{\text{val}}(k) \ge P$$`,
        p: r`$\mathcal{L}_{\text{val}}(k)$ denotes validation loss evaluated at epoch $k$, and $P$ is the patience window. Training terminates when the number of epochs elapsed since the historical minimum validation loss reaches or exceeds $P$, preventing late-stage overfitting on idiosyncratic training artifacts.`,
      },
    ],
    keyPoints: [
      r`Weight decay penalises large parameter norms, smoothing the model's decision boundaries and bounding sensitivity to input noise.`,
      r`Inverted dropout trains an exponential ensemble of sub-architectures by randomly silencing units during forward passes, preventing co-adaptation.`,
      r`Early stopping serves as a compute-efficient regulariser that halts training before the network expends capacity memorising sample-specific label noise.`,
    ],
    pitfalls: [
      r`Leaving dropout active during inference, which introduces unwanted stochastic randomness and degraded deterministic test accuracy.`,
      r`Applying weight decay to bias parameters and normalisation scales ($\gamma, \beta$), which underfits the model by unnecessarily constraining affine shifts.`,
      r`Using $L_2$ regularisation inside Adam instead of decoupled weight decay (AdamW), where adaptive gradient denominators distort the intended shrinkage rate.`,
    ],
    code: r`import numpy as np

# 1. Inverted Dropout: preserve expectation across 10,000 activations
np.random.seed(42)
h = np.ones(10000) * 4.0
p_drop = 0.25
mask = (np.random.rand(10000) >= p_drop).astype(float)
h_drop = (h * mask) / (1.0 - p_drop)

print("Original activation mean: ", round(float(np.mean(h)), 2))
print("Inverted dropout mean:   ", round(float(np.mean(h_drop)), 2), "(expectation preserved)")

# 2. Decoupled weight decay step
w = 2.0
lr, wd = 0.1, 0.05
w_decayed = w * (1.0 - lr * wd)
print(f"Weight after decay step (lr={lr}, wd={wd}): {w_decayed:.4f}")

# 3. Early stopping loop with patience = 2
val_losses = [1.20, 0.90, 0.70, 0.72, 0.75, 0.80]
patience, best_loss, counter, stop_epoch = 2, float('inf'), 0, -1

for epoch, loss in enumerate(val_losses):
    if loss < best_loss:
        best_loss = loss
        counter = 0
    else:
        counter += 1
        if counter >= patience:
            stop_epoch = epoch
            break

print(f"Early stopping triggered at epoch {stop_epoch} (restoring best loss {best_loss:.2f})")`,
    quiz: [
      {
        q: r`Why does inverted dropout multiply surviving activations by $1 / (1 - p)$ during training?`,
        o: [
          r`To ensure that the loss function is strictly non-negative`,
          r`To maintain the same expected activation magnitude during training so that evaluation requires no modification`,
          r`To completely eliminate the need for backpropagation through hidden layers`,
          r`To convert negative activations into positive values`,
        ],
        a: 1,
        why: r`Because each neuron has probability $1-p$ of surviving, the expected sum of activations drops by a factor of $1-p$. Pre-scaling by $1/(1-p)$ ensures $\mathbb{E}[\tilde{h}] = h$, meaning the model can be used directly at test time without any rescaling.`,
      },
      {
        q: r`Why should weight decay typically be applied to weight matrices but excluded from bias vectors and normalisation scales?`,
        o: [
          r`Because bias vectors cannot be stored in 32-bit floating point format`,
          r`Because biases and normalisation gains govern output shifting and scaling; shrinking them toward zero restricts expressivity without reducing variance`,
          r`Because biases do not receive gradients during backpropagation`,
          r`Because regularising biases causes the Adam optimiser to divide by zero`,
        ],
        a: 1,
        why: r`Biases and normalisation parameters represent a tiny fraction of total model capacity. Penalising them forces the model's activations toward an arbitrary zero baseline, risking underfitting without improving overfitting protection.`,
      },
      {
        q: r`What is the primary mechanism through which dropout prevents overfitting in deep neural networks?`,
        o: [
          r`It breaks co-adaptations between neurons by forcing each unit to extract useful features in the absence of random peers`,
          r`It forces the learning rate to decay to zero after each mini-batch`,
          r`It rounds weight values to the nearest integer`,
          r`It discards 50% of the training labels at every epoch`,
        ],
        a: 0,
        why: r`Dropout ensures that no neuron can rely on a specific partner neuron to fix its errors. Neurons must develop standalone, generalisable features, functioning like an implicit ensemble over vast sub-networks.`,
      },
      {
        q: r`When implementing early stopping, what parameter state should be deployed to production?`,
        o: [
          r`The final weights from the very last training epoch`,
          r`The checkpoint that achieved the lowest recorded validation loss before patience was exhausted`,
          r`An average of all weights across all training epochs`,
          r`The initial random weights before training began`,
        ],
        a: 1,
        why: r`Early stopping continues past the optimum to confirm that validation loss has truly stopped improving. Once patience is exhausted, the training process must restore the checkpoint corresponding to the minimum validation loss.`,
      },
    ],
    usedBy: [],
    prereq: ['optimisers-sgd-momentum-rmsprop-adam-adamw', 'bias-variance-tradeoff', 'backpropagation-and-autodiff'],
    related: ['normalisation-batch-layer-rms', 'learning-rate-schedules-and-warm-up', 'vanishing-and-exploding-gradients-clipping'],
    keywords: 'regularisation dropout weight decay early stopping overparameterisation adamw inverted dropout l2 penalty patience co-adaptation validation loss',
  },
];
