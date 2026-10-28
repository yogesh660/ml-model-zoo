// Lessons for this track. Conventions: see regression.js and CLAUDE.md.
const r = String.raw;
module.exports = [
  // ------------------------------------------------------------------ Lesson 1
  {
  id: 'pixels-channels-and-colour-spaces',
  short: 'Pixels & Colours',
  title: 'Pixels, channels and colour spaces',
  task: 'concepts',
  module: 'Image basics',
  level: 1,
  minutes: 14,
  noLab: true,
  summary: r`Digital images are discrete multidimensional arrays of sampled spatial irradiance measurements. Understanding coordinate conventions, intensity quantisation across bit depths, memory layout differences ($H \times W \times C$ vs $C \times H \times W$), and mathematical conversions between colour spaces (RGB, Grayscale, HSV, and CIE $L^*a^*b^*$) forms the essential foundation for computer vision algorithms and convolutional neural network architectures.`,
  lead: r`Every digital photograph or video frame begins life as photons striking a silicon sensor grid, converted into an array of electrical voltages and discretised into numerical matrices. Before a machine learning algorithm can recognise an object, segment a medical scan, or guide an autonomous drone, it must interpret these raw numeric tensors. How an image is represented—whether as raw primary additive colour intensities, decoupled luminance and chrominance, or perceptually uniform coordinates—directly determines how effectively downstream filters and neural layers learn invariant visual representations.`,
  intuition: [
    r`Spatial sampling and radiometric quantisation: A continuous visual scene is sampled on a rectangular lattice of discrete picture elements ("pixels") over a grid of height $H$ and width $W$. Each pixel's brightness is quantised into a discrete integer value governed by bit depth. In standard 8-bit imaging, intensities range over $2^8 = 256$ discrete levels from $0$ (absence of light, pure black) to $255$ (sensor saturation, pure white). Higher bit depths, such as 12-bit or 16-bit used in medical imaging and astronomy, offer expanded dynamic range to prevent clipping in intense highlights or deep shadows.`,
    r`Additive trichromacy and the Bayer mosaic: Human colour perception is trichromatic, mediated by retinal cone cells sensitive to short (blue), medium (green), and long (red) optical wavelengths. Digital camera sensors capture this trichromatic signal using an overlaid mosaic filter (most commonly the Bayer colour filter array). Because human photopic vision possesses peak spatial and luminance acuity in the green spectral band, Bayer arrays allocate twice as many green sensor elements as red or blue (a $2 \times 2$ repeating pattern of $R, G, G, B$). Demosaicing algorithms then interpolate these sensor readings into three co-registered channel grids: Red, Green, and Blue.`,
    r`Tensor layouts and channel ordering: In spatial matrix coordinates, the origin $(0, 0)$ is situated at the top-left corner of the image, with row indices $y \in [0, H-1]$ pointing vertically downwards and column indices $x \in [0, W-1]$ pointing horizontally to the right. Numerical libraries differ in how colour channels are arranged in memory. Image processing toolkits like OpenCV and NumPy store arrays in channel-last layout ($H \times W \times C$), whereas deep learning frameworks like PyTorch standardise on channel-first tensors ($C \times H \times W$ or batch-first $N \times C \times H \times W$) to optimise parallel matrix multiplications on GPU tensor cores.`,
    r`The limitation of RGB and the power of decoupled colour spaces: RGB entangles illumination intensity (luminance) directly with chromatic hue. If an illuminant dims or a shadow falls across a surface, all three RGB colour values drop simultaneously, frustrating simple colour segmentation. Transforming to colour spaces like HSV (Hue, Saturation, Value) or CIE $L^*a^*b^*$ decouples perceived lightness from chromaticity. This allows computer vision systems to achieve lighting invariance by operating purely on the chrominance coordinates while remaining robust to harsh lighting shifts.`,
  ],
  analogy: r`Think of colour spaces as different vocabularies for mixing paint. RGB is like ordering paint by specifying the exact millilitres of red, green, and blue base pigments poured from three mechanical dispensers. This formulation tells the dispensing machine exactly what to mix, but it makes intuitive adjustments difficult: if an artist asks for "the same paint shade, but lit by bright sunshine rather than twilight," you would have to calculate complex proportional changes across all three pigment valves simultaneously. HSV, by contrast, describes paint the way an artist thinks: "Which pure pigment angle on the colour wheel (Hue)? How saturated is it, or is it muted with white (Saturation)? And how much light is shining on the canvas (Value)?" Both vocabularies specify identical colours, but HSV lets you adjust lighting without altering the hue.`,
  steps: [
    {
      title: r`Discretise sensor irradiance into pixel tensors`,
      desc: r`Map continuous optical scenes to discrete spatial coordinate grids and numerical bit depths.`,
      detail: r`An optical image of dimensions $H \times W$ with $C=3$ colour channels is represented as an array of shape $(H, W, 3)$ with 8-bit unsigned integer data types (uint8). Pixel values span $[0, 255]$, where $(0, 0, 0)$ denotes pure black and $(255, 255, 255)$ denotes pure white.`,
    },
    {
      title: r`Handle channel ordering conventions`,
      desc: r`Account for RGB versus BGR channel arrangements across libraries.`,
      detail: r`Standard imaging formats (PNG, JPEG, PIL) store channels in Red-Green-Blue (RGB) sequence. OpenCV historically defaults to Blue-Green-Red (BGR) channel ordering due to early camera frame grabber hardware conventions. Failing to convert BGR to RGB via cv2.cvtColor(img, cv2.COLOR_BGR2RGB) before processing swaps red and blue spectra, producing unnatural cyan faces and blue highlights.`,
    },
    {
      title: r`Convert trichromatic channels to perceptual grayscale`,
      desc: r`Collapse 3-channel colour images into single-channel luminance arrays matching human visual sensitivity.`,
      detail: r`Because the human eye is disproportionately sensitive to green wavelengths and least sensitive to blue, computing a naive arithmetic average $(R + G + B)/3$ yields distorted perceived brightness. Standard luminance standards (such as ITU-R BT.601) weight channels according to photopic luminous efficiency: $Y = 0.299 R + 0.587 G + 0.114 B$.`,
    },
    {
      title: r`Transform to cylindrical HSV colour space`,
      desc: r`Decouple chromatic tone and colour purity from overall illumination intensity.`,
      detail: r`Determine Value as $V = \max(R, G, B)$. Compute Saturation as the relative colour purity $S = (V - \min(R, G, B)) / V$. Compute Hue $H \in [0^\circ, 360^\circ)$ as an angular position along the colour circle determined by which colour channel forms the dominant peak.`,
    },
    {
      title: r`Normalise and reshape for neural processing`,
      desc: r`Scale integer pixel values to floating-point representations and transpose memory layouts.`,
      detail: r`Deep neural networks require zero-centred, unit-variance floating-point inputs. Convert uint8 arrays to float32, divide by $255.0$ to scale into $[0.0, 1.0]$, subtract dataset channel means, and permute spatial axes from $H \times W \times C$ to PyTorch's native $C \times H \times W$ tensor format.`,
    },
  ],
  math: [
    {
      h: r`Perceptual grayscale luminance (ITU-R BT.601)`,
      tex: r`Y = 0.299\,R + 0.587\,G + 0.114\,B`,
      p: r`The weights reflect the human eye's spectral sensitivity curve: green light contributes approximately $58.7\%$ of perceived luminance, red contributes $29.9\%$, and blue contributes only $11.4\%$. In high-definition video standards (ITU-R BT.709), updated coefficients $Y = 0.2126\,R + 0.7152\,G + 0.0722\,B$ are used.`,
    },
    {
      h: r`HSV colour transformation`,
      tex: r`V = \max(R, G, B), \quad S = \begin{cases} 0 & \text{if } V = 0 \\ \frac{V - \min(R, G, B)}{V} & \text{otherwise} \end{cases}`,
      p: r`Value $V \in [0, 1]$ measures brightness. Saturation $S \in [0, 1]$ quantifies colour purity (with $S=0$ representing neutral greyscale). Hue $H \in [0^\circ, 360^\circ)$ represents angular colour tone computed piecewise depending on whether $R$, $G$, or $B$ is maximal.`,
    },
    {
      h: r`Perceptual colour difference in CIE L*a*b* space`,
      tex: r`\Delta E^*_{ab} = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}`,
      p: r`In non-linear colour spaces like RGB, Euclidean distance does not align with human perceptual colour difference: two RGB vectors with distance 20 might appear indistinguishable, while another pair with distance 20 appears starkly different. CIE $L^*a^*b^*$ is designed to be perceptually uniform, such that Euclidean metric distance $\Delta E^*$ directly mirrors human perceptual difference.`,
    },
  ],
  keyPoints: [
    r`Digital images are 3D numeric tensors: Height $\times$ Width $\times$ Channels, typically quantised as 8-bit unsigned integers ($[0, 255]$).`,
    r`Grayscale luminance conversion requires perceptual weighting ($0.299 R + 0.587 G + 0.114 B$) rather than a simple unweighted arithmetic mean.`,
    r`RGB entangles lighting with chromaticity; HSV and CIE $L^*a^*b^*$ separate luminance from chrominance, enabling illumination-invariant feature extraction.`,
    r`OpenCV reads images in BGR channel order by default, whereas PIL, matplotlib, and PyTorch expect standard RGB order.`,
    r`Deep neural networks expect channel-first memory layout ($C \times H \times W$), requiring transposition from channel-last ($H \times W \times C$) numpy arrays.`,
  ],
  pitfalls: [
    r`OpenCV BGR versus RGB confusion: Forgetting that cv2.imread loads images in BGR format leads to reversed colour channels when passed to PyTorch or matplotlib, causing dramatic drops in inference accuracy.`,
    r`Unintended integer overflow in uint8 arithmetic: In 8-bit unsigned integer arithmetic, $250 + 10 = 4$ due to modulo 256 wrap-around; always cast arrays to float32 before performing additions, subtractions, or filtering.`,
    r`Calculating Euclidean distance across the angular Hue seam: In HSV space, pure red lies at both $0^\circ$ and $360^\circ$. A naive Euclidean distance between $5^\circ$ and $355^\circ$ yields $350^\circ$ rather than the true angular distance of $10^\circ$.`,
    r`Feeding unnormalised $[0, 255]$ integers into neural networks: Passing raw uint8 integers into neural layers causes exploding activations and saturated non-linearities; always scale to $[0.0, 1.0]$ and standardise channel statistics.`,
    r`Assuming equal perceptual sensitivity across channels: Performing image processing tasks (such as edge filtering or thresholding) on unweighted channel averages ignores human luminous sensitivity, losing critical contrast detail in green and red regions.`,
  ],
  code: r`import numpy as np

# Create a synthetic 4x4 RGB image with distinct primary and secondary colours
# Shape: Height=4, Width=4, Channels=3 (uint8)
img_rgb = np.zeros((4, 4, 3), dtype=np.uint8)
img_rgb[0, 0] = [255, 0, 0]     # Pure Red
img_rgb[0, 1] = [0, 255, 0]     # Pure Green
img_rgb[0, 2] = [0, 0, 255]     # Pure Blue
img_rgb[0, 3] = [255, 255, 0]   # Yellow (Red + Green)
img_rgb[1, 0] = [0, 255, 255]   # Cyan (Green + Blue)
img_rgb[1, 1] = [255, 0, 255]   # Magenta (Red + Blue)
img_rgb[1, 2] = [255, 255, 255] # White
img_rgb[1, 3] = [128, 128, 128] # Mid Grey

# 1. Grayscale conversion: ITU-R BT.601 perceptual luminance weights
# Y = 0.299 * R + 0.587 * G + 0.114 * B
rgb_norm = img_rgb.astype(np.float32) / 255.0
r = rgb_norm[..., 0]
g = rgb_norm[..., 1]
b = rgb_norm[..., 2]
gray_bt601 = 0.299 * r + 0.587 * g + 0.114 * b

print("RGB top-left 2x2 patch (R, G, B):")
print(img_rgb[:2, :2])

print("\nPerceptual Grayscale (BT.601, [0.0, 1.0]):")
print(np.round(gray_bt601[:2, :2], 3))
print(f"Pure Red luminance:   {gray_bt601[0, 0]:.3f} (matches 0.299)")
print(f"Pure Green luminance: {gray_bt601[0, 1]:.3f} (matches 0.587 - human eyes are most sensitive to green)")
print(f"Pure Blue luminance:  {gray_bt601[0, 2]:.3f} (matches 0.114)")

# 2. RGB to HSV conversion from scratch
v = np.max(rgb_norm, axis=-1)
c_min = np.min(rgb_norm, axis=-1)
delta = v - c_min

# Saturation: delta / v (0 if v == 0)
s = np.zeros_like(v)
non_zero = v > 0
s[non_zero] = delta[non_zero] / v[non_zero]

# Hue: piecewise angle [0, 360)
h = np.zeros_like(v)
mask_r = (delta > 0) & (v == r)
mask_g = (delta > 0) & (v == g) & (~mask_r)
mask_b = (delta > 0) & (v == b) & (~mask_r) & (~mask_g)

h[mask_r] = 60.0 * (((g[mask_r] - b[mask_r]) / delta[mask_r]) % 6)
h[mask_g] = 60.0 * (((b[mask_g] - r[mask_g]) / delta[mask_g]) + 2)
h[mask_b] = 60.0 * (((r[mask_b] - g[mask_b]) / delta[mask_b]) + 4)

print("\nHSV Channels (Hue in degrees, Saturation [0,1], Value [0,1]):")
print(f"Red:    H={h[0,0]:5.1f} deg, S={s[0,0]:.2f}, V={v[0,0]:.2f}")
print(f"Green:  H={h[0,1]:5.1f} deg, S={s[0,1]:.2f}, V={v[0,1]:.2f}")
print(f"Blue:   H={h[0,2]:5.1f} deg, S={s[0,2]:.2f}, V={v[0,2]:.2f}")
print(f"Yellow: H={h[0,3]:5.1f} deg, S={s[0,3]:.2f}, V={v[0,3]:.2f}")
print(f"Cyan:   H={h[1,0]:5.1f} deg, S={s[1,0]:.2f}, V={v[1,0]:.2f}")
print(f"Grey:   H={h[1,3]:5.1f} deg, S={s[1,3]:.2f}, V={v[1,3]:.2f} (Saturation is zero)")

# 3. Layout transposition: HWC to CHW for PyTorch
tensor_chw = np.transpose(rgb_norm, (2, 0, 1))
print(f"\nNumPy layout shape (HWC):   {rgb_norm.shape}")
print(f"PyTorch layout shape (CHW): {tensor_chw.shape}")`,
  quiz: [
    {
      q: r`Why does standard grayscale conversion weight green light much higher ($0.587$) than red ($0.299$) and blue ($0.114$)?`,
      o: [
        r`To match the photopic luminous sensitivity of the human visual system, which has peak cone acuity in the green spectrum`,
        r`Because digital camera sensors physically lack red and blue photoreceptors`,
        r`To prevent integer overflow when adding 8-bit channel intensities`,
        r`Because green light travels faster through optical glass lenses`,
      ],
      a: 0,
      why: r`Human eyes possess far more green-sensitive cones (M-cones) than blue (S-cones) or red (L-cones). The ITU-R BT.601 weights reflect this biological luminous efficiency, producing natural perceived brightness.`,
    },
    {
      q: r`What unintended visual defect occurs if an image loaded with OpenCV is displayed directly using a library expecting standard RGB order?`,
      o: [
        r`The image becomes completely inverted into a photographic negative`,
        r`Red and blue colour channels are swapped, making red objects appear blue and blue objects appear red`,
        r`The resolution of the image is downscaled by a factor of two`,
        r`The image is rotated 90 degrees counter-clockwise`,
      ],
      a: 1,
      why: r`OpenCV loads images in BGR format by default. If read without converting to RGB, channel 0 (blue) is interpreted as red, and channel 2 (red) is interpreted as blue.`,
    },
    {
      q: r`What primary advantage does the HSV colour space offer over RGB for computer vision tasks like colour-based object tracking?`,
      o: [
        r`HSV reduces image memory footprint from 3 bytes per pixel down to 1 byte per pixel`,
        r`HSV decouples chromatic colour tone (Hue) from illumination intensity (Value), making colour tracking resilient to shadows and lighting changes`,
        r`HSV allows non-linear convolution operations without using floating-point arithmetic`,
        r`HSV guarantees that all pixel coordinates sum to a constant value`,
      ],
      a: 1,
      why: r`In RGB, changing illumination shifts all three channel values simultaneously. In HSV, illumination variations primarily alter Value, while Hue remains invariant, simplifying colour-based segmentation under variable lighting.`,
    },
    {
      q: r`What happens when two uint8 pixel values 200 and 70 are added together in standard C-style or NumPy unsigned 8-bit arithmetic?`,
      o: [
        r`The result is automatically clamped to the maximum value of 255`,
        r`The value overflows modulo 256, resulting in 14 ($270 \pmod{256}$)`,
        r`The array automatically promotes to float64 without data loss`,
        r`The system raises an unhandled ZeroDivisionError exception`,
      ],
      a: 1,
      why: r`Unsigned 8-bit integers (uint8) span $0$ to $255$. Arithmetic overflow wraps around modulo 256: $(200 + 70) \pmod{256} = 14$, causing severe visual artifacts unless arrays are explicitly cast to floating-point types first.`,
    },
  ],
  usedBy: [],
  prereq: ['exploratory-data-analysis', 'convolutional_neural_networks'],
  related: ['edge-detection-sobel-and-canny', 'thresholding-histograms-and-morphology', 'normalisation-batch-layer-rms'],
  keywords: 'pixels channels colour spaces rgb bgr hsv grayscale luminance bayer filter bit depth uint8 chw hwc computer vision opencv',
},

  // ------------------------------------------------------------------ Lesson 2
  {
  id: 'edge-detection-sobel-and-canny',
  short: 'Sobel & Canny',
  title: 'Edge detection: Sobel and Canny',
  task: 'concepts',
  module: 'Image basics',
  level: 2,
  minutes: 16,
  noLab: true,
  summary: r`Edge detection identifies spatial intensity boundaries where physical scene properties—such as surface orientation, depth discontinuity, illumination gradients, or material reflectance—undergo abrupt changes. The Sobel operator computes discrete spatial derivative approximations using separable convolution kernels combining binomial smoothing with finite differences. The Canny edge detector extends gradient filtering into a multi-stage optimal pipeline incorporating Gaussian noise smoothing, directional gradient orientation, non-maximum suppression (NMS) for thin 1-pixel ridges, and dual-threshold hysteresis tracking.`,
  lead: r`To perceive objects, parse geometry, and navigate environments, natural and artificial visual systems first discard redundant interior textures and extract boundary contours. A solid wall, a roadway boundary, and a pedestrian silhouette are primarily defined by their edges. Edge detection formalises this principle mathematically: edges correspond to local extrema in spatial image gradients. From the discrete derivative approximations of the Sobel filter to John Canny's mathematically optimal edge criteria, boundary detection constitutes the cornerstone of classical vision and underpins early feature extraction in convolutional neural networks.`,
  intuition: [
    r`Edges as spatial derivative peaks: In a continuous two-dimensional image $I(x, y)$, brightness changes most rapidly in the direction of its spatial gradient vector $\nabla I = \left[\frac{\partial I}{\partial x}, \frac{\partial I}{\partial y}\right]^T$. The gradient magnitude $\|\nabla I\| = \sqrt{(\partial I/\partial x)^2 + (\partial I/\partial y)^2}$ quantifies the rate of intensity change, while the gradient orientation $\theta = \arctan2\left(\frac{\partial I}{\partial y}, \frac{\partial I}{\partial x}\right)$ points perpendicular (orthogonal) to the edge boundary, pointing in the direction of greatest brightening.`,
    r`Discrete approximation and the Sobel kernels: On a discrete pixel grid, spatial derivatives cannot be evaluated analytically; they must be approximated using finite differences. Simple forward or backward differences like $I(x+1, y) - I(x, y)$ are severely vulnerable to sensor noise. The Sobel operator resolves this by convolving with separable $3 \times 3$ kernels that compute a central difference along one dimension while simultaneously applying a triangular binomial smoothing filter $[1, 2, 1]^T$ along the perpendicular dimension. This orthogonal smoothing dampens high-frequency noise while preserving derivative sensitivity.`,
    r`The limitations of raw gradient magnitude: A raw Sobel gradient map produces thick, blurry ridges rather than crisp geometric boundaries. Thresholding the magnitude map with a single global cutoff creates an inescapable dilemma: setting the cutoff low introduces vast clouds of spurious texture noise, while setting it high fractures genuine object silhouettes into disconnected fragments.`,
    r`Canny's optimal edge detection pipeline: In 1986, John Canny formulated three mathematical criteria for optimal edge detection: low error rate (marking true edges without false detections), precise localisation (minimising spatial distance between marked edges and actual physical boundaries), and single response (preventing multiple duplicate responses for a single edge). Canny resolved these demands through a four-stage pipeline: Gaussian pre-filtering $\to$ directional Sobel gradients $\to$ Non-Maximum Suppression (thinning ridges to exactly 1 pixel by checking neighbours along the gradient normal) $\to$ Hysteresis thresholding with dual high and low cutoffs to preserve continuous contours.`,
  ],
  analogy: r`Imagine hiking in thick mountain fog trying to trace the knife-edge ridgeline along a mountain range. The Sobel gradient operates like an altimeter and compass: it tells you how steep the terrain is right under your boots and points in the direction of steepest ascent. But standing on a broad mountain flank, it is difficult to know if you are on the true knife-edge peak or merely a steep slope. Non-maximum suppression is like checking whether you stand at the absolute summit along the direction of slope: if a point just one metre uphill or downhill from you is higher, you are not on the true ridgeline crest. Hysteresis thresholding acts like an experienced mountaineering protocol: you only commit to following a ridge if its peak reaches an unmistakable alpine elevation (above the high threshold), but once safely on that ridge, you continue following it as long as the rock stays above the valley floor (above the low threshold), ignoring isolated low mounds.`,
  steps: [
    {
      title: r`Gaussian pre-smoothing`,
      desc: r`Convolve the raw image with a 2D Gaussian kernel to suppress high-frequency sensor noise.`,
      detail: r`Because differentiation acts as a high-pass filter that amplifies high-frequency electronic noise, smoothing the image with a Gaussian filter $G_\sigma$ of standard deviation $\sigma$ is essential. The effective scale parameter $\sigma$ dictates the size of features detected: small $\sigma$ preserves fine texture edges, while large $\sigma$ isolates dominant macro boundaries.`,
    },
    {
      title: r`Compute spatial gradient components and angles`,
      desc: r`Convolve the smoothed image with horizontal ($K_x$) and vertical ($K_y$) Sobel kernels.`,
      detail: r`Evaluate horizontal derivative $G_x = K_x * I$ and vertical derivative $G_y = K_y * I$. Compute gradient magnitude $G = \sqrt{G_x^2 + G_y^2}$ and directional orientation $\theta = \arctan2(G_y, G_x)$. The orientation angle $\theta$ defines the normal vector pointing across the edge.`,
    },
    {
      title: r`Apply Non-Maximum Suppression (NMS)`,
      desc: r`Thin thick gradient response ridges down to crisp 1-pixel-wide candidate edges.`,
      detail: r`Quantise the continuous gradient orientation $\theta$ into four canonical sectors centred at $0^\circ$ (horizontal), $45^\circ$ (diagonal), $90^\circ$ (vertical), and $135^\circ$ (anti-diagonal). For each pixel, compare its magnitude $G(r, c)$ against the two neighbouring pixels situated along the gradient normal. If $G(r, c)$ is not strictly greater than both directional neighbours, suppress it to zero.`,
    },
    {
      title: r`Classify pixels via double thresholding`,
      desc: r`Partition suppressed candidate pixels into strong, weak, and non-edge sets using dual thresholds.`,
      detail: r`Define two thresholds: a high threshold $T_{\text{high}}$ and a low threshold $T_{\text{low}}$ (typically set with ratio $T_{\text{high}} / T_{\text{low}} \approx 2$ to $3$). Candidate pixels with $G \ge T_{\text{high}}$ are classified as strong edges; pixels with $T_{\text{low}} \le G < T_{\text{high}}$ are marked as weak edges; pixels with $G < T_{\text{low}}$ are permanently discarded.`,
    },
    {
      title: r`Trace continuous contours using hysteresis`,
      desc: r`Connect weak edge candidates to strong edges using 8-connected neighbourhood flood-fill.`,
      detail: r`Iterate through the candidate edge map: any weak edge pixel that is topologically connected (via an 8-neighbourhood adjacency path) to a strong edge pixel is retained as a valid structural boundary. Isolated weak pixels that do not connect to strong edges are recognised as noise specks and suppressed.`,
    },
  ],
  math: [
    {
      h: r`Sobel convolution kernels`,
      tex: r`K_x = \begin{bmatrix}-1 & 0 & 1 \\ -2 & 0 & 2 \\ -1 & 0 & 1\end{bmatrix} = \begin{bmatrix}1 \\ 2 \\ 1\end{bmatrix} \begin{bmatrix}-1 & 0 & 1\end{bmatrix}, \quad K_y = \begin{bmatrix}-1 & -2 & -1 \\ 0 & 0 & 0 \\ 1 & 2 & 1\end{bmatrix} = \begin{bmatrix}-1 \\ 0 \\ 1\end{bmatrix} \begin{bmatrix}1 & 2 & 1\end{bmatrix}`,
      p: r`The horizontal kernel $K_x$ is the outer product of a vertical binomial smoothing filter $[1, 2, 1]^T$ and a horizontal central difference filter $[-1, 0, 1]$. Separability allows convolution in $O(2K)$ operations rather than $O(K^2)$ per pixel.`,
    },
    {
      h: r`Spatial gradient vector magnitude and orientation`,
      tex: r`\|\nabla I\| = \sqrt{G_x^2 + G_y^2}, \quad \theta = \arctan2(G_y, G_x)`,
      p: r`The magnitude $\|\nabla I\|$ reflects local edge contrast sharpness. The direction angle $\theta \in [-\pi, \pi]$ points in the direction of maximum intensity increase, which is orthogonal to the edge contour tangent.`,
    },
    {
      h: r`Non-maximum suppression condition along gradient normal`,
      tex: r`NMS(r, c) = \begin{cases} G(r, c) & \text{if } G(r, c) \ge G(p_1) \text{ and } G(r, c) \ge G(p_2) \\ 0 & \text{otherwise} \end{cases}`,
      p: r`Here $p_1$ and $p_2$ are the two adjacent grid positions along the quantised gradient orientation line $\theta(r, c)$. This thinning operation ensures that only local ridge maxima survive, eliminating blurry multi-pixel transitions.`,
    },
  ],
  keyPoints: [
    r`Edge detection identifies spatial intensity discontinuities corresponding to physical boundaries and depth changes.`,
    r`The Sobel operator combines discrete central difference differentiation with orthogonal binomial smoothing to mitigate noise.`,
    r`Raw gradient magnitude maps produce thick, blurry ridges; Canny's non-maximum suppression thins ridges to exactly 1 pixel width.`,
    r`Canny hysteresis uses two thresholds ($T_{\text{high}}$ and $T_{\text{low}}$), preserving weak edges only when they are topologically connected to strong edges.`,
    r`The gradient vector $\nabla I$ is strictly perpendicular (orthogonal) to the direction of the edge boundary contour.`,
  ],
  pitfalls: [
    r`Skipping Gaussian pre-smoothing: Calculating spatial derivatives directly on un-smoothed images amplifies high-frequency camera noise, spawning hundreds of false edge detections.`,
    r`Confusing gradient direction with edge contour direction: The gradient vector $\nabla I$ points across the edge boundary in the direction of steepest increase; the physical edge contour runs perpendicular to $\nabla I$ (rotated by $90^\circ$).`,
    r`Using a single global threshold: A single threshold inevitably fails; it either fractures faint genuine contours or floods the image with irrelevant background texture noise.`,
    r`Setting hysteresis thresholds without inspecting noise floor: Setting $T_{\text{low}}$ below the image sensor noise floor causes spurious background texture chains to connect with true objects, creating sprawling false contours.`,
    r`Convolving colour channels independently without magnitude fusion: Computing edges independently on R, G, and B channels and adding them naively creates phase misalignment; compute gradients across channels and take maximum magnitude across spectra.`,
  ],
  code: r`import numpy as np

# Synthetic test image: 8x8 with a sharp vertical boundary
img = np.zeros((8, 8), dtype=np.float32)
img[:, 4:] = 100.0  # Step edge from 0 to 100 intensity at column 4

# 1. Sobel separable 3x3 kernels for horizontal and vertical derivatives
Kx = np.array([
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
], dtype=np.float32)

Ky = np.array([
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1]
], dtype=np.float32)

# 2. 2D convolution (valid border)
H, W = img.shape
Gx = np.zeros((H - 2, W - 2), dtype=np.float32)
Gy = np.zeros((H - 2, W - 2), dtype=np.float32)

for i in range(H - 2):
    for j in range(W - 2):
        patch = img[i:i+3, j:j+3]
        Gx[i, j] = np.sum(patch * Kx)
        Gy[i, j] = np.sum(patch * Ky)

# 3. Gradient magnitude and orientation
magnitude = np.sqrt(Gx**2 + Gy**2)
angle = (np.arctan2(Gy, Gx) * (180.0 / np.pi)) % 180.0

print("Gradient Magnitude (Gx horizontal response at vertical edge):")
print(np.round(magnitude, 1))

# 4. Non-Maximum Suppression (thinning to 1-pixel ridge)
nms = np.zeros_like(magnitude)
mH, mW = magnitude.shape

for r in range(1, mH - 1):
    for c in range(1, mW - 1):
        mag = magnitude[r, c]
        ang = angle[r, c]

        # Determine neighbours along gradient normal (0, 45, 90, 135 deg)
        if (ang < 22.5) or (ang >= 157.5):
            q, p = magnitude[r, c+1], magnitude[r, c-1]
        elif 22.5 <= ang < 67.5:
            q, p = magnitude[r-1, c+1], magnitude[r+1, c-1]
        elif 67.5 <= ang < 112.5:
            q, p = magnitude[r-1, c], magnitude[r+1, c]
        else:
            q, p = magnitude[r-1, c-1], magnitude[r+1, c+1]

        if mag >= q and mag >= p:
            nms[r, c] = mag

print("\nAfter Non-Maximum Suppression (thinned 1-pixel edge):")
print(np.round(nms, 1))

# 5. Dual thresholding and hysteresis
T_high = 200.0
T_low = 80.0
strong = nms >= T_high
weak = (nms >= T_low) & (~strong)

print(f"\nStrong edge pixels (>= {T_high}): {np.sum(strong)}")
print(f"Weak edge pixels ({T_low} to {T_high}): {np.sum(weak)}")`,
  quiz: [
    {
      q: r`Why does the Sobel operator incorporate a binomial kernel $[1, 2, 1]^T$ perpendicular to the finite difference direction?`,
      o: [
        r`To smooth and dampen high-frequency image noise along the orthogonal dimension while computing spatial differences`,
        r`To invert negative pixel intensities back to positive ranges`,
        r`To rotate the image by 90 degrees before convolving`,
        r`To compress 8-bit integers into 4-bit floating point representations`,
      ],
      a: 0,
      why: r`Pure finite differences amplify high-frequency noise. The Sobel operator pairs differentiation in one direction with smoothing ($[1, 2, 1]$) in the orthogonal direction, mitigating sensor noise.`,
    },
    {
      q: r`What is the geometric relationship between the spatial gradient vector $\nabla I = [G_x, G_y]^T$ and the edge boundary contour?`,
      o: [
        r`The gradient vector points parallel to and along the edge contour`,
        r`The gradient vector is strictly perpendicular (orthogonal) to the edge contour, pointing in the direction of steepest intensity increase`,
        r`The gradient vector always points toward the centre of the image`,
        r`The gradient vector points in random directions unrelated to edge orientation`,
      ],
      a: 1,
      why: r`The gradient vector points in the direction of maximal brightness change, which is normal (perpendicular) to the edge tangent contour.`,
    },
    {
      q: r`What is the primary function of Non-Maximum Suppression (NMS) in the Canny edge detector?`,
      o: [
        r`To remove all colour information from multi-channel images`,
        r`To thin wide, blurry gradient response ridges down to crisp 1-pixel-wide edge candidates by comparing pixels against neighbours along the gradient normal`,
        r`To compute the Fast Fourier Transform of spatial frequencies`,
        r`To invert the brightness histogram for contrast normalisation`,
      ],
      a: 1,
      why: r`Gradient filters produce wide ridges of high response across boundaries. Non-Maximum Suppression suppresses any pixel that is not a local maximum along its gradient normal vector, thinning edges to a 1-pixel width.`,
    },
    {
      q: r`In Canny edge detection, how does hysteresis thresholding prevent edge fragmentation while rejecting noise?`,
      o: [
        r`It uses two thresholds: pixels above $T_{\text{high}}$ are strong edges, and pixels between $T_{\text{low}}$ and $T_{\text{high}}$ are retained only if topologically connected to a strong edge`,
        r`It averages all pixels within a $5 \times 5$ window before thresholding`,
        r`It discards all edges that are shorter than 100 pixels in length`,
        r`It adjusts the camera exposure dynamically during frame capture`,
      ],
      a: 0,
      why: r`A single threshold creates either noise specks or broken edges. Hysteresis establishes confident strong edges with $T_{\text{high}}$ and traces contiguous boundaries through weaker candidate pixels above $T_{\text{low}}$.`,
    },
  ],
  usedBy: [],
  prereq: ['pixels-channels-and-colour-spaces', 'convolutional_neural_networks'],
  related: ['thresholding-histograms-and-morphology', 'gradient-descent'],
  keywords: 'edge detection sobel canny non maximum suppression hysteresis gradient magnitude orientation derivative convolution image processing opencv',
},

  // ------------------------------------------------------------------ Lesson 3
  {
  id: 'thresholding-histograms-and-morphology',
  short: 'Thresholds & Morphology',
  title: 'Thresholding, histograms and morphology',
  task: 'concepts',
  module: 'Image basics',
  level: 1,
  minutes: 15,
  noLab: true,
  summary: r`Binarising grayscale images into foreground and background masks is the foundational step in document processing, medical cell segmentation, and industrial inspection. Intensity histograms reveal pixel frequency distributions, guiding automated global threshold selection via Otsu's variance-maximising algorithm. Mathematical morphology then cleans and refines the resulting binary masks through non-linear geometric set operations—erosion, dilation, opening, and closing—governed by structured probe elements.`,
  lead: r`Before deep neural networks achieved widespread adoption in computer vision, industrial inspection systems sorted manufactured components, read dot-peen serial barcodes, and extracted medical cell boundaries using a two-stage paradigm: thresholding and mathematical morphology. By converting continuous grayscale intensities into discrete binary masks and probing their spatial geometry with structuring elements, vision practitioners eliminate sensor speckles, bridge hairline fractures, and separate touching objects with determinism and sub-millisecond execution.`,
  intuition: [
    r`The image histogram as an empirical probability density: An intensity histogram tallies the frequency count $n_k$ of each grayscale intensity level $k \in \{0, 1, \dots, L-1\}$. Normalising the histogram by the total pixel count $N = H \times W$ yields an empirical probability mass function $p(k) = n_k / N$. When an image contains a dark object on a bright background (or vice versa), its histogram displays a bimodal profile: two prominent probability peaks separated by a deep valley representing the boundary transition.`,
    r`Otsu's automated variance criterion: How can an algorithm choose an optimal threshold $t^*$ without manual human tuning? In 1979, Nobuyuki Otsu demonstrated that the optimal global threshold maximises between-class variance $\sigma_B^2(t)$ between foreground and background (which is mathematically equivalent to minimising within-class variance $\sigma_W^2(t)$). By treating threshold selection as an optimal one-dimensional clustering problem over the histogram, Otsu's method pinpoints the exact valley floor separating the two statistical populations.`,
    r`Limitations of global thresholds and the necessity of adaptive methods: Under uniform studio illumination, a single global cutoff works reliably. However, in real-world scenes with spatial lighting gradients, cast shadows, or lens vignetting, global thresholding fails catastrophically: the bright background on the shadowed side of a page may have lower intensity than the dark foreground on the sunlit side. Adaptive (local) thresholding resolves this by calculating dynamic thresholds within a sliding neighbourhood window.`,
    r`Mathematical morphology as geometric probing: Once an image is binarised into Boolean sets (0s and 1s), linear convolution filters no longer apply. Mathematical morphology replaces linear arithmetic with set theory and order statistics. By translating a small geometric probe called a structuring element (such as a $3 \times 3$ cross, rectangle, or disc) across the binary mask, morphological operators measure how the probe interacts with foreground shapes.`,
    r`Filtering via opening and closing: Composing the two primary morphological primitives—erosion (which shrinks foreground shapes by requiring the structuring element to fit entirely inside) and dilation (which expands foreground shapes whenever the structuring element touches)—creates powerful geometric filters. Opening (erosion followed by dilation) removes isolated background noise specks and thin protrusions without altering the macro dimensions of large objects. Closing (dilation followed by erosion) bridges narrow hairline gaps, welds broken stroke contours, and seals internal pinhole voids.`,
  ],
  analogy: r`Imagine clearing a manicured lawn strewn with leaves, fallen twigs, and children's toy building blocks. Otsu's thresholding is like an automated metal detector that calibrates its sensitivity knob to find the sharpest mathematical separation between heavy metallic objects and light organic debris. Morphological erosion is like sweeping the lawn with a rigid rotary brush whose bristles have a radius of three centimetres: any leaf or twig narrower than three centimetres is swept away, and the edges of larger toys are slightly pared back. Morphological dilation is like rolling a sticky paint roller over the lawn: it expands the perimeter of every remaining toy outwards by three centimetres. Composing both into an opening operation sweeps away all tiny organic specks while restoring genuine large toys to their original dimensions.`,
  steps: [
    {
      title: r`Compute normalised intensity histogram`,
      desc: r`Construct the discrete probability distribution of grayscale pixel intensities.`,
      detail: r`For an 8-bit grayscale image of shape $H \times W$, compute the frequency histogram across 256 bins. Normalise bin counts by the total number of pixels to produce the empirical probability distribution $p_k = n_k / (H \times W)$, satisfying $\sum_{k=0}^{255} p_k = 1$.`,
    },
    {
      title: r`Evaluate Otsu's between-class variance`,
      desc: r`Sweep all possible threshold levels to find the threshold that maximises inter-class variance.`,
      detail: r`For each candidate threshold $t \in [0, 255]$, partition the histogram into background class $C_0$ ($0 \le k \le t$) and foreground class $C_1$ ($t < k \le 255$). Compute cumulative class weights $\omega_0(t), \omega_1(t)$ and class means $\mu_0(t), \mu_1(t)$. Identify the threshold $t^*$ that maximises between-class variance $\sigma_B^2(t) = \omega_0(t) \omega_1(t) (\mu_0(t) - \mu_1(t))^2$.`,
    },
    {
      title: r`Generate binary foreground mask`,
      desc: r`Map continuous pixel intensities to a discrete Boolean representation.`,
      detail: r`Assign each pixel $I(r, c)$ to $1$ if $I(r, c) \ge t^*$ and $0$ otherwise. When segmenting dark text on bright paper, invert the inequality so foreground characters correspond to binary $1$s.`,
    },
    {
      title: r`Apply morphological erosion and dilation`,
      desc: r`Probe the binary mask with a defined structuring element.`,
      detail: r`Erosion tests where the structuring element $B$ fits completely inside the foreground mask: $(A \ominus B)(r, c) = \min_{(i, j) \in B} A(r+i, c+j)$. Dilation tests where the structuring element touches any foreground pixel: $(A \oplus B)(r, c) = \max_{(i, j) \in B} A(r-i, c-j)$.`,
    },
    {
      title: r`Chain opening and closing for structural cleanup`,
      desc: r`Eliminate spurious noise specks or seal hairline cracks in binary contours.`,
      detail: r`Apply opening $A \circ B = (A \ominus B) \oplus B$ to eliminate small isolated noise specks and sever thin filaments connecting adjacent objects. Apply closing $A \bullet B = (A \oplus B) \ominus B$ to seal small internal voids and bridge narrow cracks in continuous strokes.`,
    },
  ],
  math: [
    {
      h: r`Otsu's between-class variance formulation`,
      tex: r`\sigma_B^2(t) = \omega_0(t) \omega_1(t) \left(\mu_0(t) - \mu_1(t)\right)^2`,
      p: r`Here $\omega_0(t) = \sum_{i=0}^t p_i$ is the cumulative probability of class $C_0$, $\omega_1(t) = 1 - \omega_0(t)$ is the probability of class $C_1$, $\mu_0(t) = \frac{1}{\omega_0(t)} \sum_{i=0}^t i\,p_i$ is the mean intensity of class $C_0$, and $\mu_1(t) = \frac{1}{\omega_1(t)} \sum_{i=t+1}^{L-1} i\,p_i$ is the mean intensity of class $C_1$. Maximising $\sigma_B^2(t)$ is equivalent to minimising within-class variance $\sigma_W^2(t)$.`,
    },
    {
      h: r`Morphological erosion and dilation`,
      tex: r`(A \ominus B)(x) = \min_{y \in B} A(x + y), \quad (A \oplus B)(x) = \max_{y \in B} A(x - y)`,
      p: r`For binary images, erosion corresponds to a spatial local minimum (Boolean AND over structuring element support $B$), shrinking foreground boundaries. Dilation corresponds to a spatial local maximum (Boolean OR over structuring element support $B$), expanding foreground boundaries.`,
    },
    {
      h: r`Morphological opening and closing`,
      tex: r`A \circ B = (A \ominus B) \oplus B, \quad A \bullet B = (A \oplus B) \ominus B`,
      p: r`Opening is anti-extensive ($A \circ B \subseteq A$) and idempotent ($(A \circ B) \circ B = A \circ B$), filtering out isolated foreground specks. Closing is extensive ($A \subseteq A \bullet B$) and idempotent, bridging hairline gaps and filling internal pinhole voids.`,
    },
  ],
  keyPoints: [
    r`Intensity histograms quantify grayscale distribution profiles and expose bimodal contrast separations.`,
    r`Otsu's algorithm automatically determines the optimal global binarisation threshold by maximising inter-class variance.`,
    r`Adaptive thresholding computes localized cutoffs within sliding windows to overcome non-uniform illumination and shadow gradients.`,
    r`Erosion shrinks foreground shapes and destroys small specks; dilation expands foreground perimeters and fills voids.`,
    r`Opening (erosion then dilation) removes background noise without shrinking large shapes; closing (dilation then erosion) bridges cracks and seals holes.`,
  ],
  pitfalls: [
    r`Applying Otsu's method to unimodal or multimodal histograms: If an image lacks clear foreground-background contrast separation, Otsu artificially forces a cut through a continuous unimodal distribution, corrupting uniform textures.`,
    r`Relying on global thresholding across non-uniform lighting: In scenes with directional shadows or vignetting, global thresholding fails; local adaptive thresholding (such as Gaussian or mean adaptive thresholding) is required.`,
    r`Inverting binary polarity: Optical character recognition pipelines expect foreground character glyphs to be represented by binary 1s; thresholding black text on white paper requires inverting polarity (using cv2.THRESH_BINARY_INV).`,
    r`Selecting an oversized structuring element: Using an excessively large structuring element during morphological opening will obliterate fine structural features, such as the crossbars on letters 'e' and 't'.`,
    r`Confusing opening with closing: Opening removes isolated foreground specks; closing fills isolated holes. Inverting their sequence in noise removal pipelines leads to either dilated noise blobs or fragmented shapes.`,
  ],
  code: r`import numpy as np

# Create an 8x8 synthetic image with bimodal histogram (dark background, bright object)
np.random.seed(42)
img = np.random.randint(20, 60, size=(8, 8)).astype(np.uint8)   # background ~ 40
img[2:6, 2:6] = np.random.randint(180, 220, size=(4, 4))       # square object ~ 200
img[3, 3] = 45                                                  # interior hole
img[0, 0] = 210                                                 # isolated noise speck

# 1. Normalised intensity histogram
hist, bin_edges = np.histogram(img, bins=256, range=(0, 256))
p = hist / float(img.size)

# 2. Otsu's thresholding: maximise between-class variance sigma_B^2(t)
total_mean = np.sum(np.arange(256) * p)
best_t = 0
max_var = -1.0

omega0 = 0.0
sum0 = 0.0

for t in range(256):
    omega0 += p[t]
    if omega0 == 0.0:
        continue
    omega1 = 1.0 - omega0
    if omega1 == 0.0:
        break

    sum0 += t * p[t]
    mu0 = sum0 / omega0
    mu1 = (total_mean - sum0) / omega1
    var_between = omega0 * omega1 * ((mu0 - mu1) ** 2)

    if var_between > max_var:
        max_var = var_between
        best_t = t

print(f"Optimal Otsu threshold: t* = {best_t} (between background ~40 and object ~200)")

# 3. Binary mask
binary = (img >= best_t).astype(np.uint8)
print("\nInitial Binary Mask (1 = foreground, contains speck at (0,0) and hole at (3,3)):")
print(binary)

# 4. Mathematical morphology with 3x3 structuring element
def erode(mask):
    H, W = mask.shape
    out = np.zeros_like(mask)
    for r in range(1, H - 1):
        for c in range(1, W - 1):
            out[r, c] = np.min(mask[r-1:r+2, c-1:c+2])
    return out

def dilate(mask):
    H, W = mask.shape
    out = np.zeros_like(mask)
    for r in range(1, H - 1):
        for c in range(1, W - 1):
            out[r, c] = np.max(mask[r-1:r+2, c-1:c+2])
    return out

# Opening = erode then dilate (removes small isolated foreground specks)
opening = dilate(erode(binary))

# Closing = dilate then erode (fills small interior holes)
closing = erode(dilate(binary))

print(f"\nNoise speck at (0,0) removed by Opening: {opening[0, 0] == 0}")
print(f"Hole at (3,3) filled by Closing:          {closing[3, 3] == 1}")`,
  quiz: [
    {
      q: r`What statistical objective does Otsu's thresholding algorithm maximise when selecting the optimal global cutoff $t^*$?`,
      o: [
        r`The between-class variance $\sigma_B^2(t)$ between foreground and background intensity distributions`,
        r`The sum of squared gradients across all image rows`,
        r`The entropy of the colour saturation histogram`,
        r`The dynamic range of the camera sensor exposure`,
      ],
      a: 0,
      why: r`Otsu's method searches for the threshold that maximises between-class variance $\sigma_B^2(t)$, which simultaneously minimises within-class variance $\sigma_W^2(t)$, finding the optimal statistical separation between foreground and background.`,
    },
    {
      q: r`Why does global thresholding fail on images of documents captured under uneven, directional lighting?`,
      o: [
        r`Because intensity histograms cannot be computed for non-square images`,
        r`Because shadows make the background on one side darker than the foreground text on the brightly illuminated side`,
        r`Because grayscale conversion inverts image orientations`,
        r`Because uint8 integers cannot store text representations`,
      ],
      a: 1,
      why: r`Under non-uniform illumination, absolute pixel brightness reflects lighting gradients rather than material reflectance. A single threshold cannot separate foreground from background globally; local adaptive thresholding is required.`,
    },
    {
      q: r`In mathematical morphology, what operation does an "opening" perform on a binary mask?`,
      o: [
        r`It performs erosion followed by dilation, eliminating small isolated noise specks without permanently shrinking large foreground shapes`,
        r`It performs dilation followed by erosion, sealing internal holes and cracks`,
        r`It rotates the structuring element by 180 degrees`,
        r`It inverts the Boolean state of all boundary pixels`,
      ],
      a: 0,
      why: r`Opening ($A \circ B = (A \ominus B) \oplus B$) erodes away small foreground specks that cannot contain the structuring element, and then dilates the surviving core shapes back to their original dimensions.`,
    },
    {
      q: r`What morphological filter is best suited to bridge small hairline fractures and fill tiny interior voids within a segmented object?`,
      o: [
        r`Opening ($A \circ B$)`,
        r`Closing ($A \bullet B$, dilation followed by erosion)`,
        r`Sobel filtering`,
        r`Canny non-maximum suppression`,
      ],
      a: 1,
      why: r`Closing ($A \bullet B = (A \oplus B) \ominus B$) first dilates the shape to seal small interior gaps and holes, and then erodes the outer perimeter back to its original size, preserving boundary closure.`,
    },
  ],
  usedBy: [],
  prereq: ['pixels-channels-and-colour-spaces', 'exploratory-data-analysis'],
  related: ['edge-detection-sobel-and-canny', 'convolutional_neural_networks'],
  keywords: 'thresholding otsu method image histogram mathematical morphology erosion dilation opening closing structuring element binary segmentation opencv',
},
];
