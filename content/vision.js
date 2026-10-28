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

  // ------------------------------------------------------------------ Lesson 4
{
  id: 'corners-and-keypoints-harris-fast',
  short: 'Harris & FAST',
  title: 'Corners and keypoints: Harris, FAST',
  task: 'concepts',
  module: 'Classical features',
  level: 2,
  minutes: 16,
  noLab: true,
  summary: r`Corners and keypoints are salient two-dimensional image interest points where intensity changes abruptly across multiple directions, providing stable spatial landmarks for tracking, visual odometry, and image alignment. The Harris corner detector evaluates the local structure tensor (second-moment matrix), classifying local patches via eigenvalues: two large eigenvalues indicate a corner, one large eigenvalue denotes an edge, and two small eigenvalues reflect a flat uniform region. The FAST (Features from Accelerated Segment Test) algorithm delivers ultra-fast keypoint detection for real-time mobile robotics by evaluating a 16-pixel Bresenham circle around candidate pixels using high-speed decision trees.`,
  lead: r`If you attempt to track a featureless white wall across video frames, every pixel appears identical, creating total motion ambiguity. If you track a straight horizontal edge, you can measure vertical movement accurately, but horizontal motion remains undetectable—the classical "aperture problem." Only at corners, junctions, and textured keypoints does image intensity vary in all spatial directions, fixing a unique, unambiguous point in two-dimensional space. From Chris Harris and Mike Stephens's second-moment matrix in 1988 to Edward Rosten and Tom Drummond's microsecond FAST detector, corner detection forms the foundation of classical geometric vision and visual SLAM.`,
  intuition: [
    r`The aperture problem and corner uniqueness: Consider shifting a small inspection window by a displacement $(\Delta x, \Delta y)$. Over a flat surface, the window contents do not change regardless of direction. Over a straight edge, shifting the window parallel to the edge produces zero change, whereas shifting perpendicular produces large changes. Only over a corner does shifting the window in any spatial direction cause a steep increase in squared intensity difference. Corners therefore resolve the aperture problem completely.`,
    r`The structure tensor and eigenvalue geometry: The Harris detector formalises this directional variation by taking a first-order Taylor expansion of the windowed squared difference. This yields a quadratic form governed by the $2 \times 2$ second-moment matrix (structure tensor) $M = \sum w(x, y) \begin{bmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{bmatrix}$, where $I_x, I_y$ are spatial image gradients and $w(x, y)$ is a Gaussian weighting window. The two eigenvalues $\lambda_1, \lambda_2$ of $M$ characterize the principal curvatures of the local auto-correlation surface: if both eigenvalues are large and of similar magnitude, the patch is an unambiguous corner.`,
    r`The Harris response shortcut: Computing explicit eigenvalues for every single pixel in an image requires expensive matrix square roots. Harris and Stephens proposed an algebraic shortcut: $R = \det(M) - k\,(\operatorname{tr}(M))^2 = (\lambda_1 \lambda_2) - k\,(\lambda_1 + \lambda_2)^2$, where $k$ is an empirical tuning parameter (typically $k \in [0.04, 0.06]$). A large positive response $R$ signifies a corner, a negative response indicates an edge, and an absolute value near zero denotes a flat region.`,
    r`The need for speed: FAST and circular segment tests: While Harris detection is rotationally invariant and mathematically elegant, computing Gaussian-weighted tensor products across millions of pixels consumes valuable frame time in real-time robotic systems. In 2006, FAST revolutionised real-time tracking by abandoning gradients altogether. FAST inspects a Bresenham circle of 16 pixels surrounding candidate pixel $p$. If a contiguous arc of $N$ pixels (typically $N=9$ or $12$) are all significantly brighter or all significantly darker than $p$ by a threshold $\tau$, $p$ is flagged as a corner candidate. By testing pixels 1, 9, 5, and 13 first, non-corner candidates are rejected in three to four machine instructions.`,
  ],
  analogy: r`Imagine looking at a blueprint through a tiny circular magnifying peephole. If you look at the middle of a blank plaster wall, sliding your peephole in any direction reveals only uniform white paper: you have no idea where you are. If you look at a straight black boundary line, sliding the peephole along the line looks identical: you cannot tell whether the blueprint is sliding left or right. But if you position the peephole directly over an intersecting corner where two walls meet, any nudge in any direction immediately alters the pattern of lines within the glass. You are anchored to a singular, trackable coordinate. Harris acts like a mathematical sensor measuring the resistance to sliding in all directions; FAST acts like a guard checking whether the boundary cuts a wide continuous arc around the perimeter of the circle.`,
  steps: [
    {
      title: r`Compute spatial image derivatives`,
      desc: r`Convolve the grayscale image with Sobel or central difference filters to obtain $I_x$ and $I_y$.`,
      detail: r`Evaluate horizontal gradient $I_x = K_x * I$ and vertical gradient $I_y = K_y * I$. These capture the instantaneous directional rates of intensity change across the pixel grid.`,
    },
    {
      title: r`Form gradient products and apply Gaussian smoothing`,
      desc: r`Construct the components of the structure tensor $M$ across local neighbourhoods.`,
      detail: r`Compute pixel-wise products $I_x^2$, $I_y^2$, and $I_x I_y$. Convolve each product map with an isotropic circular Gaussian kernel $w_\sigma$: $A = w_\sigma * I_x^2$, $B = w_\sigma * I_y^2$, and $C = w_\sigma * (I_x I_y)$. Gaussian weighting gives central pixels greater influence, providing rotational invariance that rectangular box windows lack.`,
    },
    {
      title: r`Calculate Harris corner response map`,
      desc: r`Compute the algebraic scalar response metric $R$ for every pixel without explicit eigenvalue decomposition.`,
      detail: r`At each pixel $(r, c)$, the structure tensor is $M = \begin{bmatrix} A & C \\ C & B \end{bmatrix}$. Compute $\det(M) = A B - C^2$ and $\operatorname{tr}(M) = A + B$. Evaluate the Harris response $R = \det(M) - k\,(\operatorname{tr}(M))^2$, using tuning constant $k \approx 0.04$.`,
    },
    {
      title: r`Apply thresholding and non-maximum suppression`,
      desc: r`Filter out weak candidates and thin clusters of responses down to isolated peak coordinates.`,
      detail: r`Discard pixels where $R < T_{\text{threshold}}$ (where $T_{\text{threshold}}$ is a fraction of the maximum response). Within a $3 \times 3$ or $5 \times 5$ window, retain only those pixels whose response is strictly greater than all neighbours, ensuring exactly one distinct keypoint per physical corner.`,
    },
    {
      title: r`High-speed alternative: FAST Bresenham circle test`,
      desc: r`Deploy FAST for real-time applications by testing pixel intensity differences along a circular perimeter.`,
      detail: r`For a candidate pixel $p$ with intensity $I_p$, examine the 16 pixels on a Bresenham circle of radius 3. For ultra-fast rejection, first test the four cardinal pixels $(1, 9, 5, 13)$. If at least three of these four are not simultaneously brighter than $I_p + \tau$ or darker than $I_p - \tau$, candidate $p$ cannot be a corner and is instantly discarded. Surviving candidates undergo the full 16-pixel contiguous arc test.`,
    },
  ],
  math: [
    {
      h: r`Autocorrelation error surface and structure tensor`,
      tex: r`E(\Delta x, \Delta y) \approx [\Delta x, \Delta y]\, M \begin{bmatrix} \Delta x \\ \Delta y \end{bmatrix}, \quad M = \sum_{(x, y) \in W} w(x, y) \begin{bmatrix} I_x^2 & I_x I_y \\ I_x I_y & I_y^2 \end{bmatrix}`,
      p: r`A second-order Taylor series approximates the change in squared intensity difference $E(\Delta x, \Delta y)$ for a small shift. The second-moment matrix $M$ encapsulates the local gradient distribution inside window $W$.`,
    },
    {
      h: r`Harris corner response function`,
      tex: r`R = \det(M) - k\,(\operatorname{tr}(M))^2 = (\lambda_1 \lambda_2) - k\,(\lambda_1 + \lambda_2)^2`,
      p: r`Here $\det(M) = \lambda_1 \lambda_2$ and $\operatorname{tr}(M) = \lambda_1 + \lambda_2$. If both eigenvalues are large ($\lambda_1 \approx \lambda_2 \gg 0$), $\det(M)$ dominates and $R > 0$ (corner). If one eigenvalue dominates ($\lambda_1 \gg \lambda_2$), $(\operatorname{tr}(M))^2$ dominates and $R < 0$ (edge). If both are small, $R \approx 0$ (flat region). Parameter $k$ is usually set to $0.04$ to $0.06$.`,
    },
    {
      h: r`FAST contiguous arc criterion`,
      tex: r`\exists \text{ contiguous arc of } N \text{ pixels on circle } C_{16} \text{ such that } \forall i, \; I_i > I_p + \tau \quad \text{or} \quad \forall i, \; I_i < I_p - \tau`,
      p: r`Here $C_{16}$ is the 16-pixel perimeter of radius 3 centred on pixel $p$, $\tau$ is an intensity threshold, and $N$ is typically chosen as $9$ or $12$. Decision trees trained via ID3 can classify candidate pixels in very few CPU instructions per location.`,
    },
  ],
  keyPoints: [
    r`Corners resolve the aperture problem by exhibiting intense gradient variation in all spatial directions.`,
    r`The Harris structure tensor $M$ summarises local directional gradient energy via its eigenvalues $\lambda_1, \lambda_2$.`,
    r`The Harris response $R = \det(M) - k\,(\operatorname{tr}(M))^2$ classifies corners ($R > 0$), edges ($R < 0$), and flat regions ($R \approx 0$) without computing matrix square roots.`,
    r`Harris corners are invariant to 2D image rotation and affine intensity shifts, but are NOT invariant to significant changes in image scale.`,
    r`FAST accelerates corner detection for real-time mobile robotics and SLAM by inspecting a 16-pixel Bresenham circle and using early-rejection tests.`,
  ],
  pitfalls: [
    r`Scale sensitivity: Harris corners are not scale-invariant; zooming into an image causes a sharp corner to become a smooth, rounded edge at a larger scale, causing Harris detection to fail unless paired with scale-space pyramids.`,
    r`Choosing an un-tuned parameter $k$: Setting $k$ too small ($<0.02$) causes false positive edge detections to be misclassified as corners; setting $k$ too large ($>0.10$) rejects genuine dull corners.`,
    r`Using rectangular box windows instead of Gaussian weights: Box filter windows introduce artificial directional bias along the horizontal and vertical axes; isotropic Gaussian smoothing ensures true rotational invariance.`,
    r`Omitting non-maximum suppression: Without non-maximum suppression, strong corners generate clusters of 10 to 20 adjacent redundant detections around a single physical junction.`,
    r`FAST sensitivity to high-frequency image noise: Because FAST tests individual raw pixel intensities on a circular perimeter without pre-smoothing, electronic sensor noise can trigger spurious corner detections; applying mild Gaussian blur beforehand is recommended in low-light conditions.`,
  ],
  code: r`import numpy as np

# Create a synthetic 16x16 image containing an L-shaped corner
img = np.zeros((16, 16), dtype=np.float32)
img[4:12, 4:12] = 200.0  # Bright square on dark background
img[8:12, 8:12] = 0.0    # Carve out bottom-right to create inner & outer corners

# 1. Compute spatial derivatives using Sobel filters
Kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
Ky = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)

H, W = img.shape
Ix = np.zeros((H-2, W-2), dtype=np.float32)
Iy = np.zeros((H-2, W-2), dtype=np.float32)

for r in range(H-2):
    for c in range(W-2):
        patch = img[r:r+3, c:c+3]
        Ix[r, c] = np.sum(patch * Kx)
        Iy[r, c] = np.sum(patch * Ky)

# 2. Structure tensor components: Ix^2, Iy^2, Ix*Iy with local 3x3 window smoothing
Ix2 = Ix * Ix
Iy2 = Iy * Iy
Ixy = Ix * Iy

# Box smoothing kernel (approximating local window w)
kernel = np.ones((3, 3), dtype=np.float32) / 9.0
sH, sW = Ix.shape
A = np.zeros((sH-2, sW-2), dtype=np.float32)
B = np.zeros((sH-2, sW-2), dtype=np.float32)
C = np.zeros((sH-2, sW-2), dtype=np.float32)

for r in range(sH-2):
    for c in range(sW-2):
        A[r, c] = np.sum(Ix2[r:r+3, c:c+3] * kernel)
        B[r, c] = np.sum(Iy2[r:r+3, c:c+3] * kernel)
        C[r, c] = np.sum(Ixy[r:r+3, c:c+3] * kernel)

# 3. Compute Harris response: R = det(M) - k * (trace(M))^2
k = 0.04
det_M = (A * B) - (C * C)
trace_M = A + B
harris_R = det_M - k * (trace_M ** 2)

# 4. Thresholding and peak extraction
threshold = 0.05 * np.max(harris_R)
corners = harris_R > threshold

print(f"Max Harris response: {np.max(harris_R):.1f}")
print(f"Number of corner response peaks found: {np.sum(corners)}")

# 5. FAST candidate logic check on a single 16-pixel circular perimeter
# Circle radius 3 offsets (16 pixels)
p_center = 200.0  # Candidate corner pixel intensity
# Synthetic perimeter: 9 contiguous pixels are dark (intensity ~ 0)
circle_16 = np.array([200, 200, 200, 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 200, 200], dtype=np.float32)
tau = 50.0

is_darker = circle_16 < (p_center - tau)
# Check circular contiguous run of 9
extended = np.concatenate([is_darker, is_darker[:8]])
max_run = max(len(s) for s in "".join(extended.astype(int).astype(str)).split("0"))

print(f"FAST longest contiguous dark arc: {max_run} pixels (threshold N=9)")
print(f"FAST corner confirmed: {max_run >= 9}")`,
  quiz: [
    {
      q: r`What does a large positive value ($R > 0$) of the Harris corner response function signify about the underlying image patch?`,
      o: [
        r`Both eigenvalues of the structure tensor are large and positive ($\lambda_1 \approx \lambda_2 \gg 0$), indicating a distinctive two-dimensional corner`,
        r`The patch contains a straight edge with gradient variation in only one direction`,
        r`The patch is completely flat and contains uniform pixel intensities`,
        r`The patch has suffered from severe sensor saturation and lens flare`,
      ],
      a: 0,
      why: r`When both eigenvalues of the structure tensor $M$ are large, $\det(M) = \lambda_1 \lambda_2$ dominates the trace penalty $k(\lambda_1 + \lambda_2)^2$, yielding a large positive response $R > 0$ that signals an unambiguous corner.`,
    },
    {
      q: r`Why is the Harris corner detector invariant to 2D image rotation but sensitive to significant changes in image scale?`,
      o: [
        r`Eigenvalues of symmetric matrices are invariant under orthogonal rotation transformations, but zooming alters the apparent spatial radius of a corner relative to the fixed filter window`,
        r`Because the Sobel operator can only be evaluated at 45-degree angles`,
        r`Because rotation preserves colour saturation, whereas scaling alters bit depth`,
        r`Because Gaussian blur cannot be evaluated on rotated coordinate grids`,
      ],
      a: 0,
      why: r`The eigenvalues of the structure tensor describe the ellipse of the autocorrelation surface, which rotates with the image without changing size. However, the smoothing window has a fixed spatial size: zooming into a sharp corner widens it into a gradual edge, causing detection failure.`,
    },
    {
      q: r`How does the FAST corner detector achieve ultra-fast execution speeds suitable for real-time robotic SLAM?`,
      o: [
        r`By inspecting pixel intensities on a 16-pixel Bresenham circle and using a 4-pixel cardinal test to discard non-corners in a few machine instructions`,
        r`By downsampling all video frames to $16 \times 16$ pixels`,
        r`By computing Fast Fourier Transforms across the entire image on specialised DSP hardware`,
        r`By calculating 3D camera depth maps using stereo triangulation`,
      ],
      a: 0,
      why: r`FAST avoids computing floating-point image derivatives. Instead, it tests the 4 cardinal pixels (1, 5, 9, 13) on a 16-pixel circular perimeter, rejecting up to 90% of non-corner pixels with minimal CPU instructions.`,
    },
    {
      q: r`What occurs in optical flow and feature tracking if one attempts to track points located along straight edges rather than at corners (the aperture problem)?`,
      o: [
        r`Motion parallel to the edge is unobservable, leading to a mathematically ill-conditioned tracking system with an underdetermined degree of freedom`,
        r`The camera sensor immediately clips all pixel values to 255`,
        r`The frame rate of the tracking algorithm drops to zero`,
        r`Gradients across the edge cancel out, producing an imaginary number response`,
      ],
      a: 0,
      why: r`Along a straight edge, spatial gradients exist only perpendicular to the boundary. Any motion parallel to the edge leaves the local window unchanged, preventing the recovery of full 2D velocity (the classical aperture problem).`,
    },
  ],
  usedBy: ['sift-orb-and-feature-matching', 'geometric-transforms-and-homography'],
  prereq: ['edge-detection-sobel-and-canny', 'pixels-channels-and-colour-spaces'],
  related: ['sift-orb-and-feature-matching', 'geometric-transforms-and-homography', 'ransac'],
  keywords: 'harris corner detector fast features accelerated segment test structure tensor second moment matrix keypoints interest points aperture problem visual slam tracking',
},

  // ------------------------------------------------------------------ Lesson 5
{
  id: 'sift-orb-and-feature-matching',
  short: 'SIFT & ORB',
  title: 'SIFT, ORB and feature matching',
  task: 'concepts',
  module: 'Classical features',
  level: 2,
  minutes: 18,
  noLab: true,
  summary: r`Local feature descriptors encode image keypoints into compact mathematical representations that remain invariant to scale, planar rotation, 3D viewpoint variation, and illumination changes. SIFT (Scale-Invariant Feature Transform) detects scale-space extrema across Difference-of-Gaussians (DoG) octaves, assigns canonical gradient orientations, and extracts 128-dimensional spatial gradient histograms. ORB (Oriented FAST and Rotated BRIEF) offers a patented-free, computationally efficient real-time alternative suited for mobile robotics and visual SLAM, combining oriented FAST keypoints with intensity-centroid rotation and 256-bit binary descriptors compared via ultra-fast Hamming distance.`,
  lead: r`Detecting where interesting points lie in an image is only half the battle. To stitch panoramas, track drone trajectories, or locate objects across different cameras, an algorithm must match keypoints between completely different viewpoints—where the target may have rotated, shrunk to half its size, or moved under harsh glare. Raw pixel patches fail immediately under the slightest rotation or zoom. SIFT and ORB solve this challenge by building invariant local descriptors: mathematical fingerprints tied to each keypoint that allow millions of visual features to be queried and matched with high fidelity.`,
  intuition: [
    r`Scale-space and the scale-invariance challenge: When an object moves further away from the camera, its image projection shrinks. A fine corner detected by a fixed $3 \times 3$ filter at close range disappears into a smooth blur at a distance. David Lowe solved this in SIFT using Gaussian scale-space: repeatedly blurring and subsampling the image into octaves, and computing Difference-of-Gaussians (DoG) pyramids ($D(x, y, \sigma) = L(x, y, k\sigma) - L(x, y, \sigma)$). Scale-space extrema—pixels that are simultaneously greater or smaller than all 26 neighbouring pixels in a $3 \times 3 \times 3$ spatial-scale volume—establish keypoint locations with an intrinsic, scale-invariant characteristic radius $\sigma$.`,
    r`Rotational canonicalisation: If a camera rotates by $45^\circ$, raw pixel neighbourhoods rotate along with it. To achieve rotation invariance, both SIFT and ORB assign a canonical orientation $\theta$ to each keypoint. In SIFT, local gradient orientations inside the keypoint's scale circle are accumulated into a 36-bin histogram; the dominant peak defines the keypoint's local coordinate system. All subsequent descriptor measurements are rotated relative to this canonical direction, rendering the descriptor rotation-invariant.`,
    r`SIFT's gradient histogram descriptor: SIFT defines a $16 \times 16$ sample region centred on the keypoint, aligned with its canonical orientation. This window is partitioned into a $4 \times 4$ grid of spatial sub-blocks. Inside each sub-block, gradient magnitudes are binned into an 8-direction orientation histogram. The resulting descriptor vector contains $4 \times 4 \times 8 = 128$ floating-point values. Normalising the vector to unit Euclidean length provides invariance to linear contrast changes, while thresholding large values at $0.2$ and re-normalising mitigates non-linear saturation effects.`,
    r`ORB's binary speed revolution: While SIFT's 128-dimensional floating-point vectors yield unmatched discriminative power, computing and matching them using Euclidean distances consumes prohibitive CPU cycles on embedded robotic platforms. Ethan Rublee et al. introduced ORB in 2011 as an open-source, ultra-fast alternative. ORB uses FAST for keypoint detection, computes an intensity centroid vector $C$ to measure local orientation $\theta = \arctan2(m_{01}, m_{10})$, and steers a pre-selected set of 256 pixel-pair intensity comparison tests (Rotated BRIEF). Each test yields a single Boolean bit ($I(x) < I(y)$), forming a 256-bit (32-byte) binary string. Matching two ORB descriptors requires only a bitwise XOR followed by a hardware population count (Hamming distance), executing in a single CPU cycle.`,
  ],
  analogy: r`Think of matching visual features like identifying suspects from security camera footage. Matching raw pixel patches is like comparing passport photos pixel-by-pixel: if a suspect turns their head by five degrees or steps into the sun, every single pixel value changes, and the computer declares no match. SIFT is like a forensic sketch artist: it measures invariant proportions—relative eye spacing, nose bridge angle, and cheekbone ratios—normalised so that distance from the camera and tilt of the head do not alter the measurements. It produces a detailed 128-point biometric dossier. ORB is like a rapid border-control checklist: it asks 256 quick yes/no questions ("Is point A darker than point B? Is point C brighter than point D?"), steering the questions to follow head tilt. Matching suspects is reduced to counting how many checkmarks disagree, allowing a smartphone to match thousands of faces per second.`,
  steps: [
    {
      title: r`Construct scale-space pyramid`,
      desc: r`Progressively filter the image across octaves to simulate viewing the scene at multiple distances.`,
      detail: r`In SIFT, the image is convolved with Gaussian kernels of increasing scale $\sigma, k\sigma, k^2\sigma$. Subtracting adjacent blurred images produces the Difference-of-Gaussians (DoG) pyramid, which closely approximates the scale-normalised Laplacian of Gaussian $\sigma^2 \nabla^2 G$ with high computational efficiency.`,
    },
    {
      title: r`Localise stable keypoints at scale-space extrema`,
      desc: r`Identify extrema across 26 spatial and scale neighbours and discard unstable edges.`,
      detail: r`Each sample point is compared against its 8 spatial neighbours at the current scale, plus 9 neighbours in the scale above and 9 in the scale below. Candidates located along one-dimensional edges or exhibiting low contrast are pruned using an eigenvalue ratio test on the 2D Hessian matrix, mirroring the Harris response criterion.`,
    },
    {
      title: r`Assign canonical keypoint orientation`,
      desc: r`Establish an intrinsic coordinate frame to achieve complete rotational invariance.`,
      detail: r`For SIFT, compute gradient magnitudes and orientations in a Gaussian-weighted window and construct a 36-bin orientation histogram. The dominant peak defines the canonical orientation. For ORB, compute spatial image moments $m_{00}, m_{10}, m_{01}$ over a patch of radius $r$; the intensity centroid offset vector from the geometric centre defines orientation $\theta = \arctan2(m_{01}, m_{10})$.`,
    },
    {
      title: r`Extract invariant descriptor vectors`,
      desc: r`Encode the oriented local neighbourhood into a floating-point or binary signature.`,
      detail: r`SIFT rotates coordinates by $-\theta$, calculates $4 \times 4$ spatial sub-grids of 8-bin gradient histograms, and normalises the resulting 128-dimensional vector to unit norm. ORB rotates 256 pre-learned pixel coordinate test pairs by $\theta$ and evaluates binary intensity comparisons, outputting a 256-bit string.`,
    },
    {
      title: r`Match feature descriptors with Lowe's ratio test`,
      desc: r`Pair descriptors across images and reject ambiguous false correspondences.`,
      detail: r`For each feature descriptor in image 1, find its nearest neighbour ($d_1$) and second-nearest neighbour ($d_2$) in image 2 (using Euclidean distance for SIFT or Hamming distance for ORB). Lowe's ratio test accepts the match only if $d_1 / d_2 < \tau$ (typically $\tau = 0.7$ to $0.8$). Ambiguous repetitive patterns (such as window panes or brickwork) produce $d_1 \approx d_2$ and are discarded.`,
    },
  ],
  math: [
    {
      h: r`Difference-of-Gaussians (DoG) scale-space`,
      tex: r`D(x, y, \sigma) = (G(x, y, k\sigma) - G(x, y, \sigma)) * I(x, y) = L(x, y, k\sigma) - L(x, y, \sigma)`,
      p: r`Here $G(x, y, \sigma) = \frac{1}{2\pi\sigma^2} e^{-(x^2 + y^2)/(2\sigma^2)}$. The difference between successive blurred scales $D(x, y, \sigma)$ provides an efficient $O(1)$ numerical approximation to the scale-normalised Laplacian of Gaussian $\sigma^2 \nabla^2 G$, whose zero-crossings and extrema denote stable multi-scale blob centres.`,
    },
    {
      h: r`Intensity centroid orientation (ORB)`,
      tex: r`m_{pq} = \sum_{x, y \in W} x^p y^q I(x, y), \quad C = \left(\frac{m_{10}}{m_{00}}, \frac{m_{01}}{m_{00}}\right), \quad \theta = \arctan2(m_{01}, m_{10})`,
      p: r`The moments $m_{10}$ and $m_{01}$ calculate the intensity-weighted centre of mass within circular window $W$. Because the intensity centroid $C$ shifts consistently with physical patch rotation, the angle $\theta$ provides an orientation anchor that can be computed using simple addition without gradient evaluation.`,
    },
    {
      h: r`Hamming distance and Lowe's ratio test`,
      tex: r`d_{\text{Hamming}}(u, v) = \sum_{i=1}^{B} (u_i \oplus v_i), \quad \text{Accept match if } \frac{\|f - g_1\|}{\|f - g_2\|} < \tau`,
      p: r`For binary descriptors $u, v \in \{0, 1\}^B$, Hamming distance counts differing bits via bitwise XOR ($\oplus$) and hardware population count (POPCNT). In Lowe's ratio test, $g_1$ is the best match and $g_2$ is the second-best match; threshold $\tau \approx 0.75$ eliminates over $90\%$ of false matches while retaining $85\%$ of correct matches.`,
    },
  ],
  keyPoints: [
    r`Local feature descriptors provide invariant representations that allow matching keypoints across rotation, scale, and lighting shifts.`,
    r`SIFT detects extrema in Difference-of-Gaussians (DoG) scale-space, assigning scale and canonical orientation to each keypoint.`,
    r`SIFT descriptors pool spatial gradients into a $4 \times 4$ grid of 8-bin histograms, forming a 128-dimensional floating-point vector.`,
    r`ORB achieves real-time speed on embedded devices by combining oriented FAST keypoints with 256-bit binary BRIEF descriptors matched via Hamming distance.`,
    r`Lowe's ratio test ($d_1 / d_2 < 0.75$) eliminates ambiguous false matches from repetitive textures by comparing nearest and second-nearest neighbour distances.`,
  ],
  pitfalls: [
    r`Using Euclidean distance to match binary descriptors: Applying Euclidean distance to binary ORB or BRIEF descriptors is mathematically incorrect and orders of magnitude slower than computing bitwise Hamming distance with popcount instructions.`,
    r`Skipping Lowe's ratio test: Matching keypoints based purely on minimum distance without comparing against the second-best match retains catastrophic false positives in regions with repetitive visual patterns (such as tiles or windows).`,
    r`Assuming 3D out-of-plane rotation invariance: SIFT and ORB are designed for 2D in-plane rotation and modest affine perspective changes; extreme viewpoint shifts (exceeding $50^\circ$ to $60^\circ$ tilt) require affine adaptations (ASIFT) or deep feature extractors.`,
    r`Ignoring image boundary margins: Keypoint descriptor extraction requires examining $16 \times 16$ or $31 \times 31$ pixel neighbourhoods; attempting to extract descriptors for keypoints situated along the image boundary causes array index out-of-bounds errors unless padded or pruned.`,
    r`Unnormalised SIFT descriptors: Failing to normalise the 128-dimensional SIFT vector to unit Euclidean norm destroys invariance to multiplicative illumination changes.`,
  ],
  code: r`import numpy as np

# Simulate keypoint orientation and binary descriptor extraction (ORB-style)
np.random.seed(42)

# 1. Create a synthetic circular patch (radius 7, diameter 15)
R = 7
y, x = np.ogrid[-R:R+1, -R:R+1]
mask = (x*x + y*y) <= R*R
patch = np.zeros((2*R+1, 2*R+1), dtype=np.float32)

# Create an asymmetric intensity pattern (e.g. brighter on one side)
patch[mask] = 50.0
patch[y > 0] += 100.0  # Bottom half is brighter

# 2. Compute intensity centroid orientation
m00 = np.sum(patch[mask])
m10 = np.sum(x * patch * mask)
m01 = np.sum(y * patch * mask)

# Orientation angle in radians and degrees
theta = np.arctan2(m01, m10)
print(f"Patch intensity moments: m00={m00:.1f}, m10={m10:.1f}, m01={m01:.1f}")
print(f"Canonical orientation angle: {np.degrees(theta):.1f} degrees")

# 3. Define 256 binary test pairs (pixel coordinates relative to center)
# In practice, these are pre-selected pairs learned by machine learning
num_tests = 256
test_x1 = np.random.randint(-5, 6, size=num_tests)
test_y1 = np.random.randint(-5, 6, size=num_tests)
test_x2 = np.random.randint(-5, 6, size=num_tests)
test_y2 = np.random.randint(-5, 6, size=num_tests)

def extract_oriented_brief(img_patch, angle):
    # Rotate test point coordinates by canonical angle theta
    cos_t = np.cos(angle)
    sin_t = np.sin(angle)
    
    rx1 = np.round(test_x1 * cos_t - test_y1 * sin_t).astype(int) + R
    ry1 = np.round(test_x1 * sin_t + test_y1 * cos_t).astype(int) + R
    rx2 = np.round(test_x2 * cos_t - test_y2 * sin_t).astype(int) + R
    ry2 = np.round(test_x2 * sin_t + test_y2 * cos_t).astype(int) + R
    
    # Binary intensity comparison test: bit is 1 if I(p1) < I(p2) else 0
    bits = img_patch[ry1, rx1] < img_patch[ry2, rx2]
    # Pack 256 boolean bits into 32 uint8 bytes
    return np.packbits(bits)

desc1 = extract_oriented_brief(patch, theta)

# 4. Simulate a matched descriptor with 5% bit noise
noise_mask = np.random.rand(num_tests) < 0.05
bits_noisy = np.unpackbits(desc1) ^ noise_mask.astype(np.uint8)
desc2 = np.packbits(bits_noisy)

# 5. Fast Hamming distance via bitwise XOR and bit counting
def hamming_distance(d1, d2):
    xor_bytes = np.bitwise_xor(d1, d2)
    return np.sum(np.unpackbits(xor_bytes))

dist_match = hamming_distance(desc1, desc2)

# Unrelated random descriptor for ratio test comparison
desc_unrelated = np.random.randint(0, 256, size=32, dtype=np.uint8)
dist_unrelated = hamming_distance(desc1, desc_unrelated)

print(f"\nDescriptor size: {desc1.nbytes} bytes (256 bits)")
print(f"Hamming distance to true match:      {dist_match} bits (low distance = match)")
print(f"Hamming distance to unrelated point: {dist_unrelated} bits (chance level ~ 128)")
print(f"Lowe's ratio (d1 / d2):              {dist_match / dist_unrelated:.3f} (< 0.75 threshold: ACCEPTED)")`,
  quiz: [
    {
      q: r`Why does SIFT construct a Difference-of-Gaussians (DoG) scale-space pyramid?`,
      o: [
        r`To approximate the scale-normalised Laplacian of Gaussian efficiently, detecting blob-like keypoints with an intrinsic, scale-invariant spatial radius`,
        r`To compress high-resolution images for transmission over low-bandwidth networks`,
        r`To eliminate all colour channels from input video streams`,
        r`To compute optical flow vectors without calculating image gradients`,
      ],
      a: 0,
      why: r`Subtracting adjacent Gaussian blurred images ($L(x, y, k\sigma) - L(x, y, \sigma)$) computes the Difference-of-Gaussians, which provides a fast, scale-invariant approximation of the Laplacian of Gaussian operator $\sigma^2 \nabla^2 G$.`,
    },
    {
      q: r`How does SIFT achieve rotational invariance when extracting its 128-dimensional descriptor vector?`,
      o: [
        r`By aligning the local descriptor coordinate grid with the keypoint's canonical orientation (the dominant peak in the local gradient histogram)`,
        r`By discarding all vertical gradients during feature pooling`,
        r`By performing Discrete Cosine Transforms along the horizontal scan lines`,
        r`By training a multi-layer perceptron on rotated MNIST digits`,
      ],
      a: 0,
      why: r`By identifying the dominant gradient orientation $\theta$ inside the keypoint's neighbourhood and rotating the $16 \times 16$ descriptor grid by $-\theta$, all gradient measurements are recorded relative to the intrinsic orientation of the feature.`,
    },
    {
      q: r`What makes ORB descriptors significantly faster to match than standard SIFT descriptors in real-time robotics?`,
      o: [
        r`ORB descriptors are 256-bit binary strings compared via bitwise XOR and Hamming distance, which execute in single-cycle hardware popcount instructions`,
        r`ORB processes only one keypoint per frame`,
        r`ORB replaces floating-point numbers with complex numbers`,
        r`ORB evaluates keypoints using quantum computing registers`,
      ],
      a: 0,
      why: r`SIFT requires computing Euclidean distances across 128 floating-point numbers ($128$ multiplies and additions per pair). ORB matches 256-bit binary vectors using bitwise XOR and a CPU popcount instruction, executing orders of magnitude faster.`,
    },
    {
      q: r`In Lowe's ratio test, why is a feature match accepted only if the ratio of the nearest neighbour distance to the second-nearest neighbour distance ($d_1 / d_2$) is below a threshold (e.g. $0.75$)?`,
      o: [
        r`To reject false matches caused by ambiguous, repetitive background textures (where the best and second-best matches have nearly identical distances)`,
        r`To ensure the total number of matched keypoints is an even integer`,
        r`To calibrate the focal length of the camera lens automatically`,
        r`To prevent division by zero in matrix inversion routines`,
      ],
      a: 0,
      why: r`When matching points on repetitive textures (such as a brick wall or fence), many candidate points look equally plausible ($d_1 \approx d_2$, ratio near 1.0). Lowe's ratio test rejects these ambiguous candidates while accepting distinctive, unique matches.`,
    },
  ],
  usedBy: ['geometric-transforms-and-homography', 'ransac'],
  prereq: ['corners-and-keypoints-harris-fast', 'pixels-channels-and-colour-spaces'],
  related: ['corners-and-keypoints-harris-fast', 'geometric-transforms-and-homography', 'ransac'],
  keywords: 'sift orb feature matching scale invariant feature transform brief difference of gaussians dog hamming distance lowe ratio test visual slam computer vision',
},

  // ------------------------------------------------------------------ Lesson 6
{
  id: 'geometric-transforms-and-homography',
  short: 'Homography & Transforms',
  title: 'Geometric transforms and homography',
  task: 'concepts',
  module: 'Geometry',
  level: 2,
  minutes: 16,
  noLab: true,
  summary: r`Planar projective transformations (homographies) map points between different camera perspectives of a planar scene or across views captured by a camera rotating purely around its optical centre. Governed by a $3 \times 3$ invertible matrix $H$ with 8 degrees of freedom in homogeneous coordinates ($\mathbf{x}' \sim H \mathbf{x}$), homographies generalise translation, Euclidean rigid-body motion, similarity, and affine transformations. Estimating $H$ from four or more point correspondences via the Direct Linear Transformation (DLT) algorithm forms the mathematical engine for panoramic image stitching, document perspective rectification, and augmented reality planar tracking.`,
  lead: r`When you capture an angled photograph of a whiteboard or a receipt on a table, the rectangular surface appears distorted into an arbitrary quadrilateral: parallel lines converge toward vanishing points, and right angles shear. Yet because the physical surface is flat, that distortion is not arbitrary. A single linear transformation in projective space—a homography—completely maps any point on the world plane directly to your sensor plane. Understanding the geometric hierarchy of 2D transforms and solving for homographies from point matches is the gateway from 2D pixel processing to 3D spatial vision.`,
  intuition: [
    r`The geometric transformation hierarchy: 2D planar transformations form a strict nesting hierarchy based on preserved geometric invariants. Rigid (Euclidean) transforms preserve Euclidean distances and angles (3 degrees of freedom: 2 translation, 1 rotation). Similarity transforms add uniform scaling, preserving angles and length ratios (4 degrees of freedom). Affine transforms allow independent axis scaling and shear, mapping parallel lines to parallel lines but distorting angles (6 degrees of freedom). Projective transformations (homographies) represent the most general linear mapping in homogeneous coordinates: parallel lines intersect at vanishing lines, lengths and angles warp freely, but straight lines remain straight (8 degrees of freedom).`,
    r`Projective geometry and homogeneous coordinates: In standard Cartesian coordinates $(x, y)$, a projective warp is non-linear due to perspective division by depth: $x' = \frac{h_{11}x + h_{12}y + h_{13}}{h_{31}x + h_{32}y + h_{33}}$. By introducing homogeneous coordinates $\mathbf{x} = [x, y, 1]^T$ and $\mathbf{x}' = [x', y', 1]^T$, this non-linear perspective mapping becomes a strictly linear matrix multiplication $\mathbf{x}' \sim H \mathbf{x}$, where $\sim$ denotes equality up to an arbitrary non-zero global scale factor $\lambda$.`,
    r`When does a homography hold: A $3 \times 3$ homography accurately maps pixels between two cameras under two physical conditions: (1) all observed 3D points lie on a common flat physical plane in the scene (such as a floor, facade, or table surface), or (2) the camera rotates purely around its optical centre with zero baseline translation ($C_1 = C_2$). The second condition is why panoramic mobile apps can stitch 360-degree vistas of mountains and landscapes without needing 3D depth reconstructions.`,
    r`Solving for $H$ via Direct Linear Transformation (DLT): Because each 2D point correspondence $(x, y) \leftrightarrow (x', y')$ provides two independent linear constraints on $H$, a minimum of four non-collinear point pairs are required to constrain the 8 degrees of freedom of $H$ (up to scale). Rather than solving non-linear ratios directly, DLT exploits the vector cross-product identity $\mathbf{x}' \times (H \mathbf{x}) = \mathbf{0}$, rearranging the point constraints into a homogeneous linear system $A \mathbf{h} = \mathbf{0}$, where $A$ is an $2N \times 9$ coefficient matrix. The optimal solution in the presence of noise is the right singular vector of $A$ associated with its smallest singular value, computed via Singular Value Decomposition (SVD).`,
  ],
  analogy: r`Imagine holding a flat glass slide painted with a square grid in front of an overhead projector. If you slide the slide left or right, the projected shadow translates (Euclidean motion). If you spin the slide like a steering wheel, the projection rotates (Euclidean). If you move the projector closer or further, the shadow expands or contracts uniformly (similarity). If you pull the projector screen at an oblique angle, the shadow stretches into a parallelogram (affine transform). But if you tilt the glass slide itself relative to the light beam, the light rays travel different distances before striking the wall: the square grid warps into a trapezoid where parallel grid lines converge toward a horizon. That trapezoidal shadow is a homography. Reversing the homography is like positioning a virtual projector to un-tilt the shadow back into a perfect square.`,
  steps: [
    {
      title: r`Collect point correspondences across views`,
      desc: r`Establish matching feature coordinates between source and target planar coordinate systems.`,
      detail: r`Using feature detectors and descriptors (such as SIFT or ORB) combined with outlier rejection (RANSAC), extract $N \ge 4$ pairs of corresponding points $(x_i, y_i) \leftrightarrow (x'_i, y'_i)$. No three points in either set may be collinear.`,
    },
    {
      title: r`Normalise point coordinates (Hartley preconditioner)`,
      desc: r`Translate the centroid of points to the origin and scale average distance to $\sqrt{2}$.`,
      detail: r`Direct algebraic estimation on raw pixel coordinates ($x \sim 10^3$) creates severe numerical instability in matrix $A$, because coordinate product terms $x_i x'_i$ reach $10^6$ while constant terms equal $1$. Compute normalising similarity transformations $T$ and $T'$ such that $\tilde{\mathbf{x}}_i = T \mathbf{x}_i$ and $\tilde{\mathbf{x}}'_i = T' \mathbf{x}'_i$. Hartley normalisation prevents rank-deficient SVD solutions and dramatically boosts estimation accuracy.`,
    },
    {
      title: r`Construct the DLT linear constraint matrix $A$`,
      desc: r`Formulate two independent linear equations per point correspondence.`,
      detail: r`From $\mathbf{x}'_i \times (H \mathbf{x}_i) = \mathbf{0}$, the $i$-th correspondence contributes two rows to matrix $A \in \mathbb{R}^{2N \times 9}$: $\begin{bmatrix} -\mathbf{x}_i^T & \mathbf{0}^T & x'_i \mathbf{x}_i^T \\ \mathbf{0}^T & -\mathbf{x}_i^T & y'_i \mathbf{x}_i^T \end{bmatrix}$. Stacking $N \ge 4$ pairs creates system $A \mathbf{h} = \mathbf{0}$, where $\mathbf{h} = [h_{11}, h_{12}, \dots, h_{33}]^T$.`,
    },
    {
      title: r`Solve via Singular Value Decomposition (SVD)`,
      desc: r`Extract the eigenvector minimising algebraic reprojection error.`,
      detail: r`Compute the Singular Value Decomposition $A = U \Sigma V^T$. The vector $\mathbf{h}$ that minimises $\|A \mathbf{h}\|$ subject to $\|\mathbf{h}\| = 1$ is the last column of $V$ (corresponding to the smallest singular value in $\Sigma$). Reshape $\mathbf{h}$ into the $3 \times 3$ matrix $\tilde{H}$.`,
    },
    {
      title: r`Denormalise and scale the homography matrix`,
      desc: r`Map the normalised solution back to physical pixel coordinates.`,
      detail: r`Recover the true image homography via $H = (T')^{-1} \tilde{H} T$. Divide all elements by $H_{33}$ so that the bottom-right element equals $1$. Apply $H$ to warp images using bilinear interpolation or rectify planar objects into canonical bird's-eye perspectives.`,
    },
  ],
  math: [
    {
      h: r`Planar projective transformation in homogeneous coordinates`,
      tex: r`\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} \sim \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} = H \mathbf{x}`,
      p: r`The matrix $H \in \mathbb{R}^{3 \times 3}$ has 9 entries but only 8 independent degrees of freedom due to the arbitrary scale factor: multiplying $H$ by any non-zero scalar $c \neq 0$ leaves projected inhomogeneous coordinates $(x' = \frac{h_{11}x + h_{12}y + h_{13}}{h_{31}x + h_{32}y + h_{33}}, y' = \frac{h_{21}x + h_{22}y + h_{23}}{h_{31}x + h_{32}y + h_{33}})$ completely unchanged.`,
    },
    {
      h: r`Direct Linear Transformation (DLT) cross-product constraint`,
      tex: r`\mathbf{x}'_i \times (H \mathbf{x}_i) = \mathbf{0} \implies \begin{bmatrix} \mathbf{0}^T & -w'_i \mathbf{x}_i^T & y'_i \mathbf{x}_i^T \\ w'_i \mathbf{x}_i^T & \mathbf{0}^T & -x'_i \mathbf{x}_i^T \end{bmatrix} \begin{bmatrix} \mathbf{h}_1 \\ \mathbf{h}_2 \\ \mathbf{h}_3 \end{bmatrix} = \mathbf{0}`,
      p: r`Because the cross product of two collinear vectors is zero, expanding the vector product yields three equations, of which two are linearly independent. For $N$ point correspondences, stacking rows yields the $2N \times 9$ matrix $A$, solved via $\min_{\|\mathbf{h}\|=1} \|A \mathbf{h}\|^2$.`,
    },
    {
      h: r`Hartley coordinate normalisation transform`,
      tex: r`T = \begin{bmatrix} \frac{\sqrt{2}}{\bar{d}} & 0 & -\frac{\sqrt{2}\,\bar{x}}{\bar{d}} \\ 0 & \frac{\sqrt{2}}{\bar{d}} & -\frac{\sqrt{2}\,\bar{y}}{\bar{d}} \\ 0 & 0 & 1 \end{bmatrix}, \quad \bar{d} = \frac{1}{N} \sum_{i=1}^N \sqrt{(x_i - \bar{x})^2 + (y_i - \bar{y})^2}`,
      p: r`Translating coordinates so their centroid $(\bar{x}, \bar{y})$ lies at the origin and scaling average distance from the origin to $\sqrt{2}$ bounds the numerical entries of $A$, balancing condition numbers and preventing numerical overflow in SVD solvers.`,
    },
  ],
  keyPoints: [
    r`A homography is an invertible $3 \times 3$ projective matrix with 8 degrees of freedom relating two planar perspective views.`,
    r`Homographies hold whenever scenes are planar OR whenever the camera rotates purely around its optical centre with zero translation.`,
    r`Four non-collinear point correspondences are the minimum necessary to solve for $H$ (each pair provides 2 independent linear constraints).`,
    r`The Direct Linear Transformation (DLT) algorithm transforms the non-linear perspective mapping into an algebraic null-space problem $A\mathbf{h}=\mathbf{0}$, solved via SVD.`,
    r`Hartley coordinate normalisation (zero centroid, average radius $\sqrt{2}$) is essential to prevent numerical instability during algebraic estimation.`,
  ],
  pitfalls: [
    r`Applying homography to 3D scenes with translation: If the camera translates in a non-planar 3D scene, parallax causes points at different depths to shift at different rates; a single homography cannot model parallax and produces heavy double-vision ghosting artifacts.`,
    r`Collinear point sets: If three of the four selected calibration points lie along a single straight line, the DLT constraint matrix becomes rank-deficient, yielding an invalid or degenerate homography matrix.`,
    r`Omitting Hartley coordinate normalisation: Solving DLT directly on raw pixel coordinates ($x, y \approx 1000$) produces condition numbers on the order of $10^8$, corrupting the SVD solution with severe floating-point rounding errors.`,
    r`Inverting perspective division: Forgetting to divide by the homogeneous coordinate $w' = h_{31}x + h_{32}y + h_{33}$ when mapping back to Cartesian space produces unscaled projective coordinates that misplace warped points.`,
    r`Forward warping holes: Iterating through source image pixels and scattering them to target coordinates $(x', y') = H(x, y)$ leaves empty unpainted pixel gaps ("holes") in the target image due to rounding; always use inverse warping (iterating over target pixels and pulling from $H^{-1}$).`,
  ],
  code: r`import numpy as np

# Estimate a 3x3 homography matrix from 4 point correspondences via DLT
# Source coordinates (e.g. tilted document corners in an image)
pts_src = np.array([
    [100.0, 150.0],
    [400.0, 120.0],
    [380.0, 480.0],
    [80.0,  450.0]
], dtype=np.float32)

# Target coordinates (e.g. rectified rectangular document 300x400)
pts_dst = np.array([
    [0.0,   0.0],
    [300.0, 0.0],
    [300.0, 400.0],
    [0.0,   400.0]
], dtype=np.float32)

def compute_homography_dlt(src, dst):
    N = src.shape[0]
    A = []
    
    for i in range(N):
        x, y = src[i, 0], src[i, 1]
        u, v = dst[i, 0], dst[i, 1]
        
        # Two linear equations per point correspondence from cross product: x' x (H x) = 0
        A.append([-x, -y, -1.0,  0.0,  0.0,  0.0, u*x, u*y, u])
        A.append([ 0.0,  0.0,  0.0, -x, -y, -1.0, v*x, v*y, v])
        
    A = np.array(A, dtype=np.float64)
    
    # Solve A h = 0 via Singular Value Decomposition
    # Optimal solution h is the singular vector corresponding to smallest singular value
    U, S, Vt = np.linalg.svd(A)
    H = Vt[-1].reshape(3, 3)
    
    # Normalise so bottom-right element H[2, 2] == 1.0
    return H / H[2, 2]

H = compute_homography_dlt(pts_src, pts_dst)
print("Estimated 3x3 Homography Matrix H:")
print(np.round(H, 4))

# Verify forward projection on the 4 source points
ones = np.ones((4, 1), dtype=np.float32)
pts_src_homo = np.hstack([pts_src, ones])  # shape (4, 3)

# Project points: x' ~ H @ x
projected_homo = (H @ pts_src_homo.T).T
# Perform perspective division by w'
projected_cart = projected_homo[:, :2] / projected_homo[:, 2:3]

reprojection_error = np.linalg.norm(projected_cart - pts_dst, axis=1)
print("\nTarget coordinates:")
print(pts_dst)
print("\nReprojected coordinates:")
print(np.round(projected_cart, 2))
print(f"\nMax reprojection error: {np.max(reprojection_error):.2e} pixels")
assert np.max(reprojection_error) < 1e-3, "Homography DLT estimation error!"
print("Homography DLT algorithm successfully verified!")`,
  quiz: [
    {
      q: r`Under what physical camera conditions is a $3 \times 3$ planar homography mathematically valid to register images?`,
      o: [
        r`When the viewed scene surfaces are planar OR when the camera undergoes pure rotation around its optical centre with zero translation`,
        r`Only when the camera moves along a straight linear rail at constant velocity`,
        r`Whenever the scene contains more than 1,000 distinct colour shades`,
        r`Only when the image is captured using a fish-eye panoramic lens`,
      ],
      a: 0,
      why: r`A homography models perspective projections between planes. It holds strictly if all scene points lie on a single 3D plane, or if the camera rotates purely about its optical centre (eliminating depth parallax).`,
    },
    {
      q: r`How many non-collinear point correspondences are required as a mathematical minimum to estimate an 8-degree-of-freedom homography matrix?`,
      o: [
        r`4 point correspondences (each point provides 2 independent linear constraints, yielding 8 equations)`,
        r`3 point correspondences (yielding 6 equations)`,
        r`8 point correspondences (yielding 16 equations)`,
        r`2 point correspondences (yielding 4 equations)`,
      ],
      a: 0,
      why: r`Matrix $H$ has 9 elements with 8 degrees of freedom up to scale. Each 2D point correspondence provides two equations ($x'$ and $y'$), requiring at least $8 / 2 = 4$ non-collinear pairs.`,
    },
    {
      q: r`Why does the Direct Linear Transformation (DLT) algorithm require coordinate normalisation (Hartley normalisation) prior to running SVD?`,
      o: [
        r`Because raw pixel coordinates ($x \approx 10^3$) create massive numerical scale disparities between $x_i x'_i \sim 10^6$ and constant entries $1$, causing severe condition number inflation and rounding errors`,
        r`Because SVD cannot process positive coordinate values`,
        r`Because normalisation converts Cartesian coordinates into polar angles`,
        r`Because OpenCV requires all input tensors to have zero mean and unit variance`,
      ],
      a: 0,
      why: r`Without normalisation, matrix $A$ contains entries varying from $1$ to $10^6$, leading to numerical instability and poor SVD solutions. Translating coordinates to zero mean and scaling average radius to $\sqrt{2}$ balances condition numbers.`,
    },
    {
      q: r`When warping an image using an estimated homography $H$, why is inverse warping preferred over forward warping?`,
      o: [
        r`Inverse warping iterates over target grid coordinates and samples from $H^{-1}$, guaranteeing every output pixel is painted without leaving unmapped holes`,
        r`Forward warping requires twice as much memory storage`,
        r`Inverse warping runs only on specialised GPU tensor cores`,
        r`Forward warping cannot process images with even dimensions`,
      ],
      a: 0,
      why: r`Forward mapping maps source pixels to floating-point target coordinates, which round into clustered integer coordinates and leave vacant unpainted gaps ("holes"). Inverse mapping visits each target pixel and pulls values using bilinear interpolation.`,
    },
  ],
  usedBy: ['ransac'],
  prereq: ['corners-and-keypoints-harris-fast', 'sift-orb-and-feature-matching'],
  related: ['ransac', 'corners-and-keypoints-harris-fast', 'sift-orb-and-feature-matching'],
  keywords: 'homography geometric transforms projective geometry direct linear transformation dlt svd perspective rectification image stitching panorama planar tracking',
},

  // ------------------------------------------------------------------ Lesson 7
{
  id: 'ransac',
  short: 'RANSAC',
  title: 'RANSAC',
  task: 'concepts',
  module: 'Geometry',
  level: 2,
  minutes: 15,
  noLab: true,
  summary: r`RANdom SAmple Consensus (RANSAC) is a non-deterministic iterative framework designed to robustly estimate mathematical model parameters from data heavily corrupted by outliers. Where standard linear regression and ordinary least-squares estimators suffer catastrophic breakdown from even a single severe outlier, RANSAC handles contamination rates exceeding 50% to 80% by repeatedly sampling minimal random subsets, fitting candidate hypotheses, and scoring consensus based on inlier support. The required number of sample iterations $N = \frac{\ln(1 - p)}{\ln(1 - (1 - \epsilon)^s)}$ is derived from first principles to guarantee finding an outlier-free sample with specified statistical confidence $p$.`,
  lead: r`Feature matching across images is messy. In real-world visual SLAM, robotic navigation, and panorama stitching, matching keypoints using SIFT or ORB frequently yields datasets where over half the correspondences are completely spurious—caused by repetitive window patterns, moving foliage, specular reflections, or motion blur. Feeding these raw matches into ordinary least squares produces catastrophic failure: because least squares squares errors, a single wild outlier thousands of pixels away exerts infinite leverage, rotating the entire estimated transformation into nonsense. RANSAC prevents this by reversing the paradigm: rather than trying to fit all data and smoothing away errors, it assumes data is guilty until proven innocent, searching for the largest coherent consensus set.`,
  intuition: [
    r`The failure of least-squares and breakdown points: Classical statistical estimators minimise the sum of squared residuals $\sum_i r_i^2$. Because squaring magnifies large deviations quadratically, an arbitrary outlier with enormous residual pulls the regression hyperplane entirely toward itself. The "breakdown point"—the proportion of arbitrary incorrect observations an estimator can tolerate before returning an unbounded estimate—for ordinary least squares is exactly $0\%$. A single bad point destroys the result. Robust vision algorithms require estimators with breakdown points reaching $50\%$ or even $80\%$.`,
    r`The hypothesis-and-verify consensus loop: Martin Fischler and Robert Bolles proposed RANSAC in 1981 based on an elegant randomized hypothesis loop: (1) Randomly select the minimum number of data points $s$ required to define the mathematical model (e.g. $s=2$ points for a 2D line, $s=4$ point correspondences for a homography, $s=5$ points for an essential matrix). (2) Fit a candidate model hypothesis strictly to this minimal sample. (3) Count how many data points in the entire dataset agree with this model within an error tolerance $\tau$ (the "inlier set"). (4) Repeat for $N$ iterations, retaining the model with the largest consensus set. Finally, re-estimate model parameters using standard least squares over all identified inliers.`,
    r`How many iterations are sufficient: At first glance, random sampling might appear heuristic. However, the required number of trials $N$ is mathematically bounded. Let $\epsilon \in [0, 1)$ represent the outlier ratio (fraction of contaminated points). The probability that a single randomly drawn point is a true inlier is $(1 - \epsilon)$. The probability that a minimal sample of size $s$ consists entirely of pristine inliers is $(1 - \epsilon)^s$. The probability that at least one of the $s$ points is an outlier is $1 - (1 - \epsilon)^s$. After $N$ independent draws, the probability that every single trial fails to draw a pure inlier sample is $(1 - (1 - \epsilon)^s)^N$. Setting this failure probability to $1 - p$ (where $p$ is our desired confidence, e.g. $99\%$) yields a closed-form formula for $N$.`,
    r`Adaptive iteration termination: In real applications, the true outlier fraction $\epsilon$ is unknown beforehand. Practical RANSAC implementations estimate $\epsilon$ dynamically during execution. Whenever a newly sampled model discovers a consensus set larger than any seen previously, the empirical inlier ratio is updated: $1 - \hat{\epsilon} = \frac{|S_{\text{inliers}}|}{N_{\text{total}}}$. The required iteration budget $N$ is immediately recalculated downwards. If a dominant consensus is discovered early, the loop terminates within dozens of trials rather than running for thousands of redundant iterations.`,
  ],
  analogy: r`Imagine you are an archaeologist attempting to reconstruct an ancient Roman road that crosses a desert. Over two thousand years, storms, landslides, and careless travellers have strewn random stones everywhere: 70% of the stones on the ground are random boulders that have nothing to do with the road. If you average the coordinates of all stones using least squares, the result is a meaningless point in the middle of nowhere. RANSAC is like a surveyor who picks up a laser pointer, selects two random stones at a time, and shines a beam through them. Most pairs pick at least one random boulder, projecting a beam into empty desert where almost no other stones line up. But eventually, pure chance selects two authentic Roman paving stones: suddenly, seventy other stones across the valley illuminate along the laser beam. The surveyor recognizes the massive consensus line, discards all other scattered boulders as noise, and maps the true Roman highway with centimetre precision.`,
  steps: [
    {
      title: r`Define minimal sample size $s$ and error threshold $\tau$`,
      desc: r`Establish the mathematical degrees of freedom and spatial tolerance for inlier qualification.`,
      detail: r`Determine the minimum number of points $s$ needed to constrain the model: $s=2$ for a 2D line, $s=3$ for a 3D plane, $s=4$ for a 2D planar homography, and $s=8$ (or $5$) for epipolar fundamental matrices. Select residual threshold $\tau$ (e.g. $\tau \approx 1.5$ to $3.0$ pixels) based on sensor noise characteristics.`,
    },
    {
      title: r`Randomly draw minimal sample subset`,
      desc: r`Select $s$ data points uniformly at random without replacement from the total dataset.`,
      detail: r`Drawing strictly the minimal size $s$ is vital: every additional point included in the candidate fitting sample exponentially decreases the probability $(1 - \epsilon)^s$ of selecting an outlier-free set. Verify that the sample does not violate geometric constraints (such as collinearity in homography estimation).`,
    },
    {
      title: r`Fit candidate hypothesis model`,
      desc: r`Solve for model parameters using exclusively the $s$ sampled points.`,
      detail: r`Compute candidate parameters $\mathbf{\theta}_{\text{cand}}$ using an exact closed-form algebraic solver (such as two-point slope-intercept for lines or 4-point DLT for homographies).`,
    },
    {
      title: r`Evaluate consensus set against threshold $\tau$`,
      desc: r`Count how many observations in the full dataset agree with the candidate hypothesis.`,
      detail: r`For every data point $i \in \{1, \dots, N\}$, compute the geometric orthogonal residual $r_i = \operatorname{dist}(\mathbf{x}_i, \mathbf{\theta}_{\text{cand}})$. Points satisfying $r_i \le \tau$ are added to the candidate inlier set $S_{\text{cand}}$. If $|S_{\text{cand}}| > |S_{\text{best}}|$, update the best model and consensus set.`,
    },
    {
      title: r`Refine model parameters via least squares over inliers`,
      desc: r`Re-estimate the final model using all accepted consensus points.`,
      detail: r`Once the iteration loop terminates, discard all outliers permanently. Refit the final model using standard linear least squares or non-linear Levenberg-Marquardt optimisation over the complete pooled inlier set, eliminating sample variance from the minimal subset.`,
    },
  ],
  math: [
    {
      h: r`Required iteration bound for confidence $p$`,
      tex: r`N = \frac{\ln(1 - p)}{\ln\left(1 - (1 - \epsilon)^s\right)}`,
      p: r`Here $p$ is the desired probability of success (typically $p=0.99$), $s$ is the minimal sample size, and $\epsilon \in [0, 1)$ is the outlier ratio. For $s=4$ (homography) with $50\%$ outliers ($\epsilon=0.5$), the probability of a pure sample is $(0.5)^4 = 0.0625$, requiring $N = \frac{\ln(0.01)}{\ln(1 - 0.0625)} \approx 72$ iterations. For $80\%$ outliers ($\epsilon=0.8$), $N \approx 2,875$ iterations.`,
    },
    {
      h: r`Orthogonal line residual metric`,
      tex: r`r_i = \frac{|a x_i + b y_i + c|}{\sqrt{a^2 + b^2}} \le \tau`,
      p: r`When fitting geometric models, orthogonal geometric distance is preferred over vertical algebraic residuals ($|y_i - (mx_i+c)|$), because vertical residuals fail when lines approach vertical orientation. Points with orthogonal distance $r_i \le \tau$ are classified as inliers.`,
    },
    {
      h: r`Adaptive iteration update rule`,
      tex: r`\hat{\epsilon} = 1 - \frac{|S_{\text{best}}|}{N_{\text{total}}}, \quad N_{\text{new}} = \frac{\ln(1 - p)}{\ln\left(1 - (1 - \hat{\epsilon})^s\right)}`,
      p: r`Whenever an iteration yields a larger consensus set, $\hat{\epsilon}$ is updated with the observed inlier ratio. If $N_{\text{new}}$ is smaller than the remaining scheduled iterations, the search budget is dynamically reduced, ensuring rapid termination when strong consensus is established.`,
    },
  ],
  keyPoints: [
    r`RANSAC is a robust randomized consensus estimator capable of fitting models in the presence of extreme outlier ratios ($>50\%$).`,
    r`Ordinary least-squares estimators possess a $0\%$ breakdown point: a single wild outlier can corrupt the entire solution.`,
    r`RANSAC fits hypotheses strictly to minimal subsets of size $s$ to maximise the probability $(1 - \epsilon)^s$ of drawing a clean sample.`,
    r`The number of required iterations $N = \frac{\ln(1 - p)}{\ln(1 - (1 - \epsilon)^s)}$ is mathematically derived to guarantee confidence $p$.`,
    r`After finding the maximal consensus set, the final model is refined via least squares over all identified inliers.`,
  ],
  pitfalls: [
    r`Selecting sample sizes larger than minimal ($>s$): Drawing more than the minimum number of points causes the clean-sample probability $(1 - \epsilon)^k$ to plummet exponentially, requiring drastically more iterations to succeed.`,
    r`Setting threshold $\tau$ too tight or too loose: Setting $\tau$ too tight rejects true inliers with sensor noise, preventing consensus discovery; setting $\tau$ too loose allows spurious outliers into the consensus set, biasing the estimated model.`,
    r`Assuming RANSAC is fully deterministic: Because RANSAC relies on random pseudo-random number generator draws, two runs on identical noisy data may yield slightly different consensus sets unless a fixed seed is used.`,
    r`Failing to detect degenerate minimal samples: In homography estimation, if 3 of the 4 randomly drawn points happen to be collinear, the candidate model is mathematically degenerate and must be rejected before checking consensus.`,
    r`Omitting final least-squares refitting: A minimal sample of size $s$ fits the sampled points exactly but carries higher variance due to measurement noise; always refit over all inliers to produce the minimum-variance estimate.`,
  ],
  code: r`import numpy as np

# Simulate robust 2D line fitting in the presence of 60% outliers
np.random.seed(42)

# 1. Generate ground truth inliers along line: y = 2.0 * x + 5.0
num_inliers = 40
num_outliers = 60
num_total = num_inliers + num_outliers

x_inliers = np.linspace(-10.0, 10.0, num_inliers)
noise = np.random.normal(0.0, 0.4, size=num_inliers)
y_inliers = 2.0 * x_inliers + 5.0 + noise

# Generate wild outliers scattered across the domain
x_outliers = np.random.uniform(-10.0, 10.0, size=num_outliers)
y_outliers = np.random.uniform(-40.0, 40.0, size=num_outliers)

# Combine into dataset
X = np.concatenate([x_inliers, x_outliers])
Y = np.concatenate([y_inliers, y_outliers])
points = np.column_stack([X, Y])

# 2. RANSAC implementation for 2D line fitting (minimal sample s = 2)
s = 2
p_confidence = 0.99
outlier_ratio_est = 0.60  # initial conservative estimate
tau_threshold = 1.0       # orthogonal distance threshold

# Theoretical iterations needed: ln(1 - p) / ln(1 - (1 - eps)^s)
prob_clean = (1.0 - outlier_ratio_est) ** s
N_iterations = int(np.ceil(np.log(1.0 - p_confidence) / np.log(1.0 - prob_clean)))
print(f"Dataset: {num_total} points ({num_inliers} inliers, {num_outliers} outliers)")
print(f"Theoretical iterations for 99% confidence (s=2, eps=0.6): {N_iterations}")

best_inliers = None
max_inlier_count = 0
best_model = None

for trial in range(N_iterations):
    # Randomly draw 2 points
    sample_indices = np.random.choice(num_total, size=s, replace=False)
    p1, p2 = points[sample_indices[0]], points[sample_indices[1]]
    
    # Avoid degenerate vertical / identical points
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    if np.abs(dx) < 1e-6:
        continue
        
    # Line equation: a*x + b*y + c = 0
    # dy * x - dx * y + (dx * p1[1] - dy * p1[0]) = 0
    a = dy
    b = -dx
    c = dx * p1[1] - dy * p1[0]
    denom = np.sqrt(a*a + b*b)
    
    # Compute orthogonal distance for all points
    distances = np.abs(a * points[:, 0] + b * points[:, 1] + c) / denom
    inliers = np.where(distances <= tau_threshold)[0]
    
    if len(inliers) > max_inlier_count:
        max_inlier_count = len(inliers)
        best_inliers = inliers
        best_model = (a, b, c)

# 3. Final refinement: least squares over all identified inliers
inlier_x = points[best_inliers, 0]
inlier_y = points[best_inliers, 1]

# Fit y = m*x + b over inliers
A_matrix = np.column_stack([inlier_x, np.ones_like(inlier_x)])
m_ransac, b_ransac = np.linalg.lstsq(A_matrix, inlier_y, rcond=None)[0]

# Compare against non-robust ordinary least squares over all points
A_all = np.column_stack([points[:, 0], np.ones(num_total)])
m_ols, b_ols = np.linalg.lstsq(A_all, points[:, 1], rcond=None)[0]

print(f"\nRANSAC consensus inlier count: {max_inlier_count} / {num_total}")
print(f"Ground truth line:             y = 2.000 * x + 5.000")
print(f"RANSAC estimated line:         y = {m_ransac:.3f} * x + {b_ransac:.3f} (ROBUST)")
print(f"Ordinary Least Squares line:   y = {m_ols:.3f} * x + {b_ols:.3f} (BROKEN BY OUTLIERS)")`,
  quiz: [
    {
      q: r`Why does RANSAC deliberately restrict its candidate model fitting to minimal sample sizes (such as $s=2$ for lines or $s=4$ for homographies)?`,
      o: [
        r`Because the probability of drawing an all-inlier sample $(1 - \epsilon)^s$ decreases exponentially as sample size $s$ grows, requiring drastically more iterations to guarantee success`,
        r`Because matrix inversion cannot be evaluated for sets larger than 4 points`,
        r`Because computer vision datasets never contain more than 10 points`,
        r`To ensure all estimated parameters are positive numbers`,
      ],
      a: 0,
      why: r`If outlier ratio is $50\%$ ($\epsilon=0.5$), a sample of size $s=4$ has a $(0.5)^4 = 6.25\%$ chance of being clean, requiring 72 trials. A sample of size $s=8$ has only a $(0.5)^8 = 0.39\%$ chance, requiring 1,177 trials. Minimal samples maximise the chance of drawing pristine data.`,
    },
    {
      q: r`What is the theoretical breakdown point of classical ordinary least-squares estimators when fitting geometric models?`,
      o: [
        r`$0\%$ (a single extreme outlier can pull the least-squares estimate arbitrarily far from the true parameters)`,
        r`$50\%$ (it tolerates half the data being noise)`,
        r`$100\%$ (it is completely immune to noise)`,
        r`$25\%$ (one quarter of observations can be corrupted)`,
      ],
      a: 0,
      why: r`Because ordinary least squares squares residuals ($r_i^2$), an outlier situated far from the true line generates an unbounded penalty that pulls the entire fitted model towards itself, giving it a breakdown point of $0\%$.`,
    },
    {
      q: r`How does adaptive RANSAC terminate its iteration loop early when processing real image correspondences?`,
      o: [
        r`Whenever a candidate model discovers an inlier consensus larger than previously observed, it recalculates the outlier estimate $\hat{\epsilon}$ and reduces the required iteration budget $N$ dynamically`,
        r`It halts automatically after exactly 10 iterations regardless of inlier counts`,
        r`It stops whenever the camera sensor temperature exceeds 50 degrees Celsius`,
        r`It terminates when the sum of residuals evaluates to an exact integer`,
      ],
      a: 0,
      why: r`By updating the estimated outlier fraction $\hat{\epsilon} = 1 - (|S_{\text{best}}| / N_{\text{total}})$ each time a superior consensus is found, the formula for $N$ reveals whether current iterations already exceed the required confidence threshold, allowing early termination.`,
    },
    {
      q: r`Why is it essential to re-estimate model parameters using linear least squares over the entire inlier set after RANSAC finishes its consensus search?`,
      o: [
        r`Because a minimal sample of size $s$ fits the selected points exactly but carries higher estimation variance due to localized measurement noise; pooling all inliers produces a lower-variance, optimal estimate`,
        r`Because the RANSAC minimal sample solution produces imaginary numbers`,
        r`To convert the model parameters into integer coefficients`,
        r`Because OpenCV refuses to compile models fitted on fewer than 50 points`,
      ],
      a: 0,
      why: r`The minimal sample of $s$ points isolates the outlier-free consensus set, but fitting strictly to $s$ points is subject to local noise. Refitting over all dozens or hundreds of consensus inliers averages out zero-mean Gaussian measurement noise.`,
    },
  ],
  usedBy: [],
  prereq: ['geometric-transforms-and-homography', 'sift-orb-and-feature-matching'],
  related: ['geometric-transforms-and-homography', 'sift-orb-and-feature-matching', 'corners-and-keypoints-harris-fast'],
  keywords: 'ransac random sample consensus robust estimation outlier rejection breakdown point minimal sample consensus set inliers homography line fitting',
},
];
