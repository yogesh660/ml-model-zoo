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
];
