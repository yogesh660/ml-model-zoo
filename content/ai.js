// Lessons for this track. Conventions: see regression.js and CLAUDE.md.
const r = String.raw;
module.exports = [
{
    id: 'intelligent-agents-and-environments',
    short: 'Agents & Environments',
    title: 'Intelligent agents and environments',
    task: 'concepts',
    module: 'Classical AI',
    level: 1,
    minutes: 15,
    noLab: true,
    summary: r`An intelligent agent is an autonomous entity that perceives its environment through sensors and acts upon it through actuators to achieve specified goals. Russell and Norvig's foundational framework categorises agents through PEAS specifications (Performance measure, Environment, Actuators, Sensors) and environmental dimensions (observable, deterministic, episodic, static, discrete, multi-agent). Agents progress across an architectural hierarchy: from simple condition-action reflex systems to model-based, goal-directed, and utility-maximising learning agents.`,
    lead: r`What distinguishes an intelligent AI agent from a simple calculator or static script? A calculator executes a deterministic arithmetic formula blindly. An intelligent agent operates within an external, often uncertain world: it perceives changes, maintains beliefs about hidden states, plans sequences of actions towards objectives, and adapts its future behaviour based on feedback. Understanding the formal agent-environment boundary is the essential cornerstone of classical AI, reinforcement learning, and modern autonomous LLM systems.`,
    intuition: [
      r`The Agent-Environment duality: Formally, an agent is defined by an agent function f: P* -> A that maps any sequence of perceptual histories P* into an action a in A. The environment is everything external to the agent that reacts to the agent's actions and produces fresh percepts. The boundary between agent and environment is defined not by physical anatomy, but by control: anything that the agent cannot arbitrarily control is part of the environment.`,
      r`The PEAS Specification: When designing any AI system, engineers must first formalise its PEAS criteria:
- Performance Measure: The objective numerical criterion used to evaluate the agent's success (e.g. passenger safety, travel time, fuel efficiency for an autonomous vehicle).
- Environment: The external arena in which the agent operates (e.g. city streets, pedestrians, weather).
- Actuators: The mechanism by which the agent exerts physical or digital action (e.g. accelerator, steering wheel, brakes).
- Sensors: The intake hardware or data feeds through which the agent gathers observations (e.g. LiDAR, cameras, GPS).`,
      r`The Agent Architectural Hierarchy: Agents evolve through increasing degrees of cognitive sophistication:
1. Simple Reflex Agents: Select actions based strictly on current percepts using condition-action rules (if car_in_front_braking then brake).
2. Model-Based Reflex Agents: Maintain an internal state to track aspects of the partially observable world that cannot be seen right now.
3. Goal-Based Agents: Combine internal state with explicit goal descriptions, using search and planning to evaluate which actions achieve the goal.
4. Utility-Based Agents: Weigh trade-offs using a continuous utility function U(s) to make rational decisions when goals conflict or outcomes are uncertain.
5. Learning Agents: Separate performance elements from learning elements, using an internal critic to adapt behaviour towards higher rewards.`,
    ],
    analogy: r`Think of an automated thermostat compared to an autonomous robotic vacuum cleaner. A simple thermostat is a simple reflex agent: if temperature < 19°C, turn on heating; if temperature > 22°C, turn off. It has no memory and no goals. An autonomous robotic vacuum is a model-based goal-directed agent: it cannot see through walls (partially observable), so it builds an internal occupancy grid map as it moves (internal state), plans paths to vacuum unvisited rooms (goal-based planning), and navigates around moving pets (dynamic environment) while avoiding battery exhaustion (utility management).`,
    steps: [
      {
        title: r`Define PEAS criteria for target domain`,
        desc: r`Specify performance measure, operational environment, actuators, and sensor modalities.`,
        detail: r`Formalise the objective metric for success. Catalogue the sensor inputs (cameras, sensors, text streams) and actionable outputs (motors, API calls, keyboard events).`,
      },
      {
        title: r`Classify environmental properties`,
        desc: r`Analyse observability, determinism, episodic nature, dynamism, and agent cardinality.`,
        detail: r`Determine if the environment is fully vs partially observable, deterministic vs stochastic, episodic vs sequential, static vs dynamic, and single vs multi-agent. This dictates necessary agent memory and search algorithms.`,
      },
      {
        title: r`Implement internal world model for partial observability`,
        desc: r`Maintain state tracking beliefs across hidden environmental variables.`,
        detail: r`If the environment is partially observable, construct an internal state representation. Update the state at each step using transition physics: state_{t} = update(state_{t-1}, action_{t-1}, percept_t).`,
      },
      {
        title: r`Integrate goal or utility evaluation function`,
        desc: r`Evaluate candidate action paths against objective utility metrics.`,
        detail: r`Define utility function U(s) that quantifies desirability of world states. Use search algorithms (A*, minimax, or MDP value iteration) to select the action sequence that maximises expected utility.`,
      },
      {
        title: r`Deploy learning and critic components for self-adaptation`,
        desc: r`Evaluate performance outcomes against goals and update decision policy.`,
        detail: r`Incorporate a learning element that compares observed environmental outcomes against critic expectations. Update internal rules or policy weights to improve long-term utility.`,
      },
    ],
    math: [
      {
        h: r`Mathematical definition of an agent function`,
        tex: r`f: \mathcal{P}^* \to \mathcal{A}`,
        p: r`Here $\mathcal{P}^*$ represents the set of all possible historical percept sequences up to the current time step, and $\mathcal{A}$ is the discrete or continuous action space. An agent program implements function $f$ on physical hardware.`,
      },
      {
        h: r`Principle of Maximum Expected Utility (Rationality)`,
        tex: r`a^* = \arg\max_{a \in \mathcal{A}} \sum_{s'} P(s' \mid s, a) \, U(s')`,
        p: r`A rational agent selects an action that maximises expected utility, where $P(s' \mid s, a)$ is the probability that action $a$ in state $s$ leads to outcome state $s'$, and $U(s')$ is the utility of that state. Rationality evaluates expected success given current information, distinct from omniscience.`,
      },
      {
        h: r`Model-based state update recurrence`,
        tex: r`s_t = g(s_{t-1}, a_{t-1}, p_t)`,
        p: r`Under partial observability, the agent's estimated internal state $s_t$ is updated recursively by function $g$ combining the previous state estimate $s_{t-1}$, the last action executed $a_{t-1}$, and the new incoming sensory percept $p_t$.`,
      },
    ],
    keyPoints: [
      r`An intelligent agent perceives its environment through sensors and acts upon it via actuators to maximise a performance measure.`,
      r`Rationality is defined by expected success based on current knowledge and percept history, distinct from perfection or omniscience.`,
      r`PEAS specifications (Performance, Environment, Actuators, Sensors) formalise the requirements for any AI agent.`,
      r`Task environments are classified along key axes: observable, deterministic, episodic, static, discrete, and multi-agent.`,
      r`Agent architectures scale from simple reflex and model-based systems to goal-directed, utility-maximising, and learning agents.`,
    ],
    pitfalls: [
      r`Confusing rationality with omniscience: An omniscient agent knows the actual outcome of its actions and is impossible in the real world. A rational agent makes the best possible decision given its current percepts and uncertainty.`,
      r`Designing myopic performance measures: Rewarding an agent for sub-goals (e.g. rewarding a cleaning robot for sweeping dirt) can cause degenerate reward hacking (the robot repeatedly dumps dirt on the carpet to sweep it again). Measure desired end states.`,
      r`Assuming fully observable environments: Designing an agent assuming complete state visibility causes catastrophic failure when sensors suffer occlusions, noise, or communication delays. Always incorporate belief states for partial observability.`,
      r`Neglecting environmental dynamism: Assuming the environment remains frozen while the agent computes a plan fails in dynamic worlds where other agents move during planning. Bound planning latency.`,
    ],
    code: r`class Environment:
    """A simple 1D discrete environment with two rooms: A and B."""
    def __init__(self):
        self.locations = {"A": "Dirty", "B": "Dirty"}
        self.agent_location = "A"

    def get_percept(self):
        """Returns (current_location, current_dirt_status)."""
        return (self.agent_location, self.locations[self.agent_location])

    def step(self, action):
        """Execute action: 'Suck', 'Right', 'Left', 'NoOp'."""
        if action == "Suck":
            self.locations[self.agent_location] = "Clean"
        elif action == "Right":
            self.agent_location = "B"
        elif action == "Left":
            self.agent_location = "A"

class ModelBasedReflexVacuumAgent:
    """
    Model-based reflex agent that maintains an internal belief state
    tracking the cleanliness of both rooms.
    """
    def __init__(self):
        self.model = {"A": "Unknown", "B": "Unknown"}
        self.history = []

    def select_action(self, percept):
        loc, status = percept
        # Update internal model with incoming percept
        self.model[loc] = status

        # Decision logic based on model state
        if status == "Dirty":
            action = "Suck"
        elif loc == "A" and self.model["B"] != "Clean":
            action = "Right"
        elif loc == "B" and self.model["A"] != "Clean":
            action = "Left"
        else:
            action = "NoOp"  # Both rooms known to be clean

        self.history.append((loc, status, action))
        return action

# Simulate Agent-Environment interaction loop
env = Environment()
agent = ModelBasedReflexVacuumAgent()

print("Initial Environment State:", env.locations)
print("Agent starts at location:", env.agent_location)
print("\nSimulation Steps:")

for step in range(1, 6):
    percept = env.get_percept()
    action = agent.select_action(percept)
    print(f"  Step {step}: Percept={percept} -> Internal Model={agent.model} -> Action='{action}'")
    env.step(action)
    if action == "NoOp":
        print("  Goal achieved: All rooms are clean. Agent halts.")
        break

print("\nFinal Environment State:", env.locations)
`,
    quiz: [
      {
        q: r`In Russell and Norvig's agent framework, what does the PEAS acronym stand for?`,
        o: [
          r`Performance measure, Environment, Actuators, Sensors`,
          r`Probability, Entropy, Accuracy, Specificity`,
          r`Parsing, Encoding, Attention, Softmax`,
          r`Planning, Execution, Action, Strategy`,
        ],
        a: 0,
        why: r`PEAS formalises the complete problem specification for an intelligent agent: the numerical Performance measure to evaluate success, the external Environment, the physical Actuators for action, and the sensory Sensors for observation.`,
      },
      {
        q: r`What is the critical capability that distinguishes a Model-Based Reflex Agent from a Simple Reflex Agent?`,
        o: [
          r`A Model-Based agent maintains an internal state representation to track aspects of the unobserved world in partially observable environments`,
          r`A Model-Based agent runs on GPU while a Simple Reflex agent runs on CPU`,
          r`A Model-Based agent does not require sensors`,
          r`A Model-Based agent always makes random decisions`,
        ],
        a: 0,
        why: r`Simple reflex agents look only at the current percept, failing when the world is partially observable. Model-based agents maintain an internal state tracking past history and unobserved dynamics.`,
      },
      {
        q: r`How does a rational agent differ from an omniscient agent?`,
        o: [
          r`A rational agent selects actions that maximise expected performance given its available percept history and knowledge, whereas an omniscient agent knows the actual future outcome with 100% certainty`,
          r`A rational agent never makes mistakes in the physical world`,
          r`An omniscient agent is achievable through standard reinforcement learning`,
          r`A rational agent only works in deterministic environments`,
        ],
        a: 0,
        why: r`Omniscience requires impossible foreknowledge of all future events. Rationality requires making the mathematically optimal choice that maximises expected utility given available sensory evidence and uncertainty.`,
      },
    ],
    usedBy: [],
    prereq: [],
    related: ['machine-translation', 'bert-and-masked-language-models'],
    keywords: 'intelligent agents environments peas russell norvig reflex model-based utility rationality partial observability sensors actuators',
  },

  // ------------------------------------------------------------------ 4. MDPs and Bellman equations (ai)
  {
    id: 'mdps-and-bellman-equations',
    short: 'MDPs & Bellman Equations',
    title: 'MDPs and Bellman equations',
    task: 'concepts',
    module: 'Reinforcement learning',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Markov Decision Processes (MDPs) provide the foundational mathematical framework for reinforcement learning and sequential decision-making under uncertainty. Defined by states, actions, transition probabilities, rewards, and a temporal discount factor, an MDP formalises how an agent's choices influence both immediate gains and future trajectories. The Bellman Expectation and Optimality equations decompose value functions into recursive relationships, enabling exact policy evaluation and optimal control via dynamic programming.`,
    lead: r`Should an autonomous robot pick up an immediate small reward right now, or invest time navigating a dangerous maze to unlock a massive treasure later? Sequential decision-making requires balancing immediate gratification against long-term consequences under environmental uncertainty. Markov Decision Processes and the Bellman equations turn this philosophical dilemma into precise recursive linear algebra.`,
    intuition: [
      r`The Markov Property: "The future is independent of the past given the present." Formally, the transition probability P(S_{t+1} = s' | S_t = s, A_t = a, S_{t-1}, ...) depends strictly on the current state s and action a. You do not need to know the entire historical route the agent took to arrive at state s; all relevant predictive information is compressed into the current state description.`,
      r`Discounted returns and temporal patience: The total return G_t is the sum of discounted future rewards: G_t = sum_{k=0}^inf gamma^k R_{t+k+1}. The discount factor gamma in [0, 1) serves three roles: mathematically, it bounds infinite sums so infinite-horizon returns converge; economically, it reflects preference for immediate returns; and practically, it models environmental risk (the future may terminate at rate 1 - gamma).`,
      r`The recursive beauty of the Bellman decomposition: How much is being in a state worth? Richard Bellman realised that the value of state s can be decomposed into two clean parts: the immediate reward expected from the next step, plus the discounted value of wherever you land next: V(s) = Reward + gamma * V(s'). This recursive decomposition turns an intractable infinite-horizon summation into local one-step expectations.`,
    ],
    analogy: r`Think of planning your retirement investments. If you evaluate your net worth at age 65 by simulating every single daily coffee purchase for the next forty years, the combinatorial calculation is overwhelming. Bellman's insight is the recursive budget equation: your net worth at the end of this year is simply your savings earned this year (immediate reward), plus your net worth at the start of next year compounded by market interest (gamma * V(s')). By planning one year at a time backwards from retirement, you solve the entire forty-year financial plan effortlessly.`,
    steps: [
      {
        title: r`Define states, actions, and environmental transition dynamics`,
        desc: r`Formalise state space S, action space A, and transition probability tensor P(s' | s, a).`,
        detail: r`Enumerate all possible environment states s in S and executable actions a in A. Specify transition matrix P(s' | s, a) defining the probability of transitioning to state s' when action a is taken in state s.`,
      },
      {
        title: r`Specify reward function and discount factor`,
        desc: r`Assign numerical rewards R(s, a, s') and calibrate temporal discount factor gamma.`,
        detail: r`Define reward function R(s, a, s') that delivers scalar reinforcement. Set discount factor gamma in [0, 1) (typically gamma = 0.9 to 0.99) to establish agent horizon patience.`,
      },
      {
        title: r`Formulate Bellman Expectation Equations for a fixed policy`,
        desc: r`Express value function V^pi(s) recursively under policy pi(a | s).`,
        detail: r`For a specified policy pi, write the linear system V^pi(s) = sum_a pi(a | s) sum_s' P(s' | s, a) [ R(s, a, s') + gamma V^pi(s') ]. This forms a system of |S| linear equations in |S| unknowns.`,
      },
      {
        title: r`Formulate Bellman Optimality Equations`,
        desc: r`Decompose optimal value V*(s) through the non-linear max operator.`,
        detail: r`The optimal value V*(s) is the maximum expected return achievable by any policy: V*(s) = max_a sum_s' P(s' | s, a) [ R(s, a, s') + gamma V*(s') ]. The presence of max makes the system non-linear, resolved via value iteration.`,
      },
      {
        title: r`Extract optimal greedy policy from value function`,
        desc: r`Derive optimal action mapping pi*(s) by acting greedily with respect to Q*(s, a).`,
        detail: r`Once V*(s) is computed, the optimal policy is recovered by taking the argmax over action values: pi*(s) = argmax_a sum_s' P(s' | s, a) [ R(s, a, s') + gamma V*(s') ].`,
      },
    ],
    math: [
      {
        h: r`The Markov property condition`,
        tex: r`\mathbb{P}(S_{t+1} = s', R_{t+1} = r \mid S_t, A_t, S_{t-1}, A_{t-1}, \dots, S_0, A_0) = \mathbb{P}(S_{t+1} = s', R_{t+1} = r \mid S_t, A_t)`,
        p: r`The future dynamics depend solely on current state $S_t$ and action $A_t$, establishing the state as a sufficient statistic for decision-making.`,
      },
      {
        h: r`Bellman Expectation Equation for V^pi`,
        tex: r`V^\pi(s) = \sum_{a \in \mathcal{A}} \pi(a \mid s) \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma V^\pi(s') \right]`,
        p: r`The value of state $s$ under policy $\pi$ equals the expected immediate reward plus the discounted expected value of the successor state $s'$, averaged across policy action choices and environmental transitions.`,
      },
      {
        h: r`Bellman Optimality Equations for V* and Q*`,
        tex: r`\begin{aligned} V^*(s) &= \max_{a \in \mathcal{A}} \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma V^*(s') \right] \\ Q^*(s, a) &= \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma \max_{a' \in \mathcal{A}} Q^*(s', a') \right] \end{aligned}`,
        p: r`The optimal state value $V^*(s)$ selects the action that achieves maximum expected return. The Bellman optimality operator $T^*$ is a $\gamma$-contraction mapping in the infinity norm, guaranteeing convergence to a unique optimal fixed point.`,
      },
    ],
    keyPoints: [
      r`A Markov Decision Process formalises decision-making via states S, actions A, transitions P, rewards R, and discount gamma.`,
      r`The Markov property asserts that future transitions depend strictly on current state and action, independent of history.`,
      r`Bellman equations decompose value functions into immediate reward plus discounted downstream successor values.`,
      r`Bellman expectation equations are linear systems for fixed policies; Bellman optimality equations are non-linear systems solved via dynamic programming.`,
      r`The contraction mapping theorem guarantees that value iteration converges to a unique optimal value function V* and optimal policy pi*.`,
    ],
    pitfalls: [
      r`Violating the Markov property: If a state representation omits velocity in a physics simulator, the state is non-Markovian because future positions depend on unobserved speed. Always ensure states contain sufficient information.`,
      r`Setting gamma = 1 in continuing tasks: In non-terminating environments without absorbing states, setting gamma = 1 causes returns to diverge to infinity, breaking dynamic programming convergence.`,
      r`Conflating V(s) and Q(s, a): V(s) measures the value of being in a state before choosing an action; Q(s, a) measures the value of executing specific action a from state s. Q-values allow direct policy extraction without transition model P.`,
      r`Curse of dimensionality in tabular MDPs: Tabular Bellman equations require iterating over all |S| states. For complex problems with continuous or high-dimensional states (e.g. Atari video frames), tabular methods must be replaced by deep Q-networks (DQN).`,
    ],
    code: r`import numpy as np

class SimpleGridworldMDP:
    """
    3-state linear MDP: State 0 <-> State 1 <-> State 2 (Terminal Goal).
    Demonstrates Bellman Expectation and Optimality evaluation.
    """
    def __init__(self, gamma=0.9):
        self.num_states = 3
        self.gamma = gamma
        self.actions = ["Left", "Right"]
        
    def step(self, state, action):
        """Returns (next_state, reward, is_terminal)."""
        if state == 2:
            return 2, 0.0, True  # Goal state
            
        if action == "Right":
            next_state = min(2, state + 1)
            reward = 10.0 if next_state == 2 else 0.0
        elif action == "Left":
            next_state = max(0, state - 1)
            reward = 0.0
            
        return next_state, reward, (next_state == 2)

    def value_iteration(self, theta=1e-4):
        """Solve Bellman Optimality Equation via Value Iteration."""
        V = np.zeros(self.num_states)
        
        while True:
            delta = 0.0
            V_new = np.copy(V)
            
            for s in range(self.num_states - 1):  # Skip terminal state 2
                q_values = []
                for a in self.actions:
                    s_prime, r, _ = self.step(s, a)
                    # Bellman Optimality update: r + gamma * V(s')
                    q_val = r + self.gamma * V[s_prime]
                    q_values.append(q_val)
                    
                # V*(s) = max_a Q*(s, a)
                V_new[s] = max(q_values)
                delta = max(delta, abs(V_new[s] - V[s]))
                
            V = V_new
            if delta < theta:
                break
                
        return V

    def extract_policy(self, V):
        """Extract optimal greedy policy pi*(s) from V*."""
        policy = {}
        for s in range(self.num_states - 1):
            best_action = None
            best_q = -float('inf')
            for a in self.actions:
                s_prime, r, _ = self.step(s, a)
                q = r + self.gamma * V[s_prime]
                if q > best_q:
                    best_q = q
                    best_action = a
            policy[s] = best_action
        return policy

mdp = SimpleGridworldMDP(gamma=0.9)
optimal_V = mdp.value_iteration()
optimal_pi = mdp.extract_policy(optimal_V)

print(f"MDP Discount factor gamma: {mdp.gamma}")
print("Solved Bellman Optimality Values V*(s):")
for s in range(mdp.num_states):
    print(f"  State {s}: V*(s) = {optimal_V[s]:.2f}")

print("\nExtracted Optimal Policy pi*(s):")
for s, act in optimal_pi.items():
    print(f"  State {s} -> Action: '{act}' (moves towards Goal at State 2)")
`,
    quiz: [
      {
        q: r`What does the Markov property formally state regarding an environment's state transition dynamics?`,
        o: [
          r`The probability distribution over future states depends strictly on the current state and chosen action, independent of the historical path taken to reach the state`,
          r`The environment must always be deterministic`,
          r`Rewards can only be granted at the terminal state`,
          r`The discount factor gamma must be equal to 1.0`,
        ],
        a: 0,
        why: r`The Markov property asserts that current state S_t contains all necessary information to predict the next state S_{t+1}. The historical trajectory is irrelevant given current state and action.`,
      },
      {
        q: r`What role does the discount factor gamma in [0, 1) play in infinite-horizon Markov Decision Processes?`,
        o: [
          r`It mathematically bounds the infinite summation of future rewards, guaranteeing that expected returns converge to finite values while modelling preference for earlier rewards`,
          r`It increases the number of available actions exponentially`,
          r`It converts continuous state spaces into discrete grids`,
          r`It forces all rewards to be negative numbers`,
        ],
        a: 0,
        why: r`In non-terminating tasks, summing unweighted rewards yields infinite returns. The discount factor gamma < 1 ensures that the geometric series sum_{k=0}^inf gamma^k R converges to a finite bound.`,
      },
      {
        q: r`Why does Value Iteration converge to the unique optimal value function V*?`,
        o: [
          r`Because the Bellman optimality operator is a gamma-contraction mapping in the infinity norm, guaranteeing a unique fixed point via Banach's fixed-point theorem`,
          r`Because computers use 64-bit floating point arithmetic`,
          r`Because state transitions are always symmetric`,
          r`Because rewards are strictly positive integers`,
        ],
        a: 0,
        why: r`The Bellman optimality operator T* satisfies ||T* V - T* U||_inf <= gamma ||V - U||_inf. Since gamma < 1, T* is a contraction mapping. By Banach's fixed-point theorem, repeated application converges to the unique fixed point V*.`,
      },
    ],
    usedBy: [],
    prereq: [],
    related: ['intelligent-agents-and-environments'],
    keywords: 'mdp markov decision process bellman equations reinforcement learning value iteration q-value discount factor contraction mapping dynamic programming',
  },

// ------------------------------------------------------------------ 1. Dynamic programming: value and policy iteration (ai)
  {
    id: 'dynamic-programming-value-and-policy-iteration',
    short: 'Value & Policy Iteration',
    title: 'Dynamic programming: value and policy iteration',
    task: 'concepts',
    module: 'Reinforcement learning',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Dynamic programming provides exact mathematical algorithms for solving Markov Decision Processes when the environmental dynamics (transition probabilities and reward functions) are fully known. Policy Iteration decomposes control into alternating stages of Policy Evaluation (computing true state values via the Bellman Expectation equation) and Policy Improvement (acting greedily with respect to evaluated values). Value Iteration condenses this into a single Bellman Optimality backup per sweep, iteratively propagating optimal values until convergence under the contraction mapping theorem.`,
    lead: r`If you possess a complete map of a maze—knowing every corridor, trap, and prize with exact probabilistic certainty—how should you compute the optimal navigation path? When an agent has complete knowledge of environmental physics, trial-and-error exploration is unnecessary. Dynamic programming applies Bellman's principle of optimality to compute the exact value of every state and extract the mathematically optimal policy without taking a single physical step.`,
    intuition: [
      r`Policy Evaluation as fixed-point relaxation: Given an arbitrary policy pi (for instance, walking in random directions), how good is it? Policy evaluation repeatedly applies the Bellman expectation backup across all states: V_{k+1}(s) = sum_a pi(a | s) sum_s' P(s' | s, a) [ R(s, a, s') + gamma V_k(s') ]. Because the Bellman operator is a contraction mapping, starting from any arbitrary initial vector (even all zeros), repeated sweeps converge monotonically to the true state values V^pi.`,
      r`The Policy Improvement Theorem: Once state values V^pi are known, can we construct a better policy? The Policy Improvement Theorem proves that if an agent chooses an action greedily with respect to downstream values—selecting pi'(s) = argmax_a sum_s' P(s' | s, a) [ R(s, a, s') + gamma V^pi(s') ]—the new policy pi' is guaranteed to be strictly better than or equal to pi in every single state. Repeating this cycle guarantees reaching the globally optimal policy in finite steps.`,
      r`Value Iteration: Truncating policy evaluation: Full policy iteration requires waiting for policy evaluation to converge completely before updating the policy. Value Iteration observes that complete evaluation is redundant: by immediately updating each state with the maximum possible action value—V_{k+1}(s) = max_a sum_s' P(s' | s, a) [ R(s, a, s') + gamma V_k(s') ]—it combines evaluation and improvement into a single unified sweep, dramatically reducing total computation.`,
    ],
    analogy: r`Think of planning a train network across an entire country. Policy Iteration is like designing a fixed train timetable, running passenger simulations for six months until ticket revenues stabilise completely (policy evaluation), and then asking station masters for improvements (policy improvement), repeating this slow cycle. Value Iteration is like a dynamic traffic computer that looks at the current travel times between adjacent cities and immediately updates the fastest route across every station simultaneously every evening. Both methods arrive at the identical optimal railway schedule, but Value Iteration avoids waiting for stagnant simulations.`,
    steps: [
      {
        title: r`Initialise state value vector and arbitrary policy`,
        desc: r`Set V(s) = 0 for all non-terminal states and pick random or uniform initial policy pi.`,
        detail: r`Create array V of size |S| initialised to zero (terminal states anchored permanently to 0). In Policy Iteration, initialise policy mapping pi(s) to arbitrary legal actions for each state.`,
      },
      {
        title: r`Execute Policy Evaluation sweeps`,
        desc: r`Iteratively update V(s) using the Bellman Expectation equation under current policy pi.`,
        detail: r`In Policy Iteration, update state values: V_{k+1}(s) = sum_s' P(s' | s, pi(s)) [ R(s, pi(s), s') + gamma V_k(s') ]. Repeat until the maximum state delta drops below threshold theta = 1e-6.`,
      },
      {
        title: r`Execute Policy Improvement step`,
        desc: r`Extract greedy action choices with respect to updated state values.`,
        detail: r`For each state s, evaluate Q(s, a) across all legal actions and set pi'(s) = argmax_a Q(s, a). If pi'(s) == pi(s) across all states, the policy is stable and globally optimal; terminate. Otherwise, set pi = pi' and return to evaluation.`,
      },
      {
        title: r`Alternatively, execute Value Iteration sweeps`,
        desc: r`Update states directly using the Bellman Optimality operator without tracking explicit policy.`,
        detail: r`In Value Iteration, compute V_{k+1}(s) = max_a sum_s' P(s' | s, a) [ R(s, a, s') + gamma V_k(s') ]. Repeat sweeps across the state space until max_s |V_{k+1}(s) - V_k(s)| < theta.`,
      },
      {
        title: r`Extract optimal deterministic policy from converged values`,
        desc: r`Act greedily with respect to final converged value function V*.`,
        detail: r`Once V* has converged, extract the final optimal policy pi*(s) = argmax_a sum_s' P(s' | s, a) [ R(s, a, s') + gamma V*(s') ].`,
      },
    ],
    math: [
      {
        h: r`Policy Improvement Theorem guarantee`,
        tex: r`q_\pi(s, \pi'(s)) \ge v_\pi(s) \implies v_{\pi'}(s) \ge v_\pi(s), \quad \forall s \in \mathcal{S}`,
        p: r`If selecting action $\pi'(s)$ greedily yields an expected return at least as high as current policy $\pi$, then following $\pi'$ thereafter guarantees equal or strictly superior state values across the entire state space.`,
      },
      {
        h: r`Value Iteration Bellman Optimality backup`,
        tex: r`V_{k+1}(s) = \max_{a \in \mathcal{A}} \sum_{s' \in \mathcal{S}} P(s' \mid s, a) \left[ R(s, a, s') + \gamma V_k(s') \right]`,
        p: r`The Value Iteration update combines policy evaluation and greedy improvement in a single step. By Banach's fixed-point theorem, $V_k$ converges to unique optimal value $V^*$ at geometric rate $\gamma^k$.`,
      },
      {
        h: r`Value Iteration error bound and stopping condition`,
        tex: r`\|V_{k+1} - V_k\|_\infty < \theta \implies \|V_{k+1} - V^*\|_\infty < \frac{2 \theta \gamma}{1 - \gamma}`,
        p: r`When the maximum change in state values across a sweep drops below $\theta$, the distance between the current estimate and the true optimal value $V^*$ is bounded by $\frac{2 \theta \gamma}{1 - \gamma}$, ensuring controlled error tolerance.`,
      },
    ],
    keyPoints: [
      r`Dynamic programming computes exact optimal policies in Markov Decision Processes with known transition and reward models.`,
      r`Policy Iteration alternates between complete policy evaluation and greedy policy improvement until the policy stabilises.`,
      r`The Policy Improvement Theorem guarantees that greedy action selection produces monotonically improving policies.`,
      r`Value Iteration truncates policy evaluation to a single sweep, updating states directly via the Bellman Optimality operator.`,
      r`Both methods converge to the identical optimal policy pi* and optimal value function V*.`,
    ],
    pitfalls: [
      r`Asynchronous state overwriting bugs: When implementing Value Iteration, updating state values in-place (Gauss-Seidel style) converges faster, but must be implemented deliberately; mixing old and new values in synchronous updates causes subtle mathematical divergence.`,
      r`Assuming dynamic programming scales to high-dimensional continuous domains: Full DP requires iterating over all |S| states and |A| actions at every sweep. For problems with continuous states (such as robotics), tabular DP suffers from the curse of dimensionality and requires function approximation.`,
      r`Failing to anchor terminal state values: If terminal absorbing states are not clamped permanently to zero reward and zero value, discount loops accumulate infinitely, corrupting surrounding states.`,
      r`Setting stopping threshold theta too loose: Terminating value iteration when theta is large produces sub-optimal policy extraction, particularly when discount factor gamma is close to 1.`,
    ],
    code: r`import numpy as np

class GridworldDP:
    """
    Comparison of Policy Iteration vs Value Iteration
    on a 4-state linear gridworld: [0] <-> [1] <-> [2] <-> [3 (Goal)]
    """
    def __init__(self, gamma=0.9):
        self.num_states = 4
        self.gamma = gamma
        self.actions = [0, 1]  # 0: Left, 1: Right
        
    def step(self, s, a):
        if s == 3:
            return 3, 0.0, True
        if a == 1:  # Right
            s_next = min(3, s + 1)
            reward = 10.0 if s_next == 3 else 0.0
        else:       # Left
            s_next = max(0, s - 1)
            reward = 0.0
        return s_next, reward, (s_next == 3)

    def policy_iteration(self, theta=1e-6):
        # Initialize random policy (all Left) and zero values
        policy = np.zeros(self.num_states - 1, dtype=int)
        V = np.zeros(self.num_states)
        eval_sweeps = 0
        policy_steps = 0
        
        while True:
            policy_steps += 1
            # 1. Policy Evaluation
            while True:
                delta = 0.0
                eval_sweeps += 1
                V_new = np.copy(V)
                for s in range(self.num_states - 1):
                    a = policy[s]
                    s_prime, r, _ = self.step(s, a)
                    V_new[s] = r + self.gamma * V[s_prime]
                    delta = max(delta, abs(V_new[s] - V[s]))
                V = V_new
                if delta < theta:
                    break
                    
            # 2. Policy Improvement
            policy_stable = True
            for s in range(self.num_states - 1):
                old_action = policy[s]
                # Find best action
                action_values = []
                for a in self.actions:
                    s_prime, r, _ = self.step(s, a)
                    action_values.append(r + self.gamma * V[s_prime])
                best_action = int(np.argmax(action_values))
                if best_action != old_action:
                    policy_stable = False
                policy[s] = best_action
                
            if policy_stable:
                break
                
        return V, policy, policy_steps, eval_sweeps

    def value_iteration(self, theta=1e-6):
        V = np.zeros(self.num_states)
        sweeps = 0
        while True:
            sweeps += 1
            delta = 0.0
            V_new = np.copy(V)
            for s in range(self.num_states - 1):
                q_vals = [self.step(s, a)[1] + self.gamma * V[self.step(s, a)[0]] for a in self.actions]
                V_new[s] = max(q_vals)
                delta = max(delta, abs(V_new[s] - V[s]))
            V = V_new
            if delta < theta:
                break
                
        # Extract policy
        policy = np.zeros(self.num_states - 1, dtype=int)
        for s in range(self.num_states - 1):
            q_vals = [self.step(s, a)[1] + self.gamma * V[self.step(s, a)[0]] for a in self.actions]
            policy[s] = int(np.argmax(q_vals))
            
        return V, policy, sweeps

dp = GridworldDP(gamma=0.9)
v_pi, pi_pi, p_steps, e_sweeps = dp.policy_iteration()
v_vi, pi_vi, vi_sweeps = dp.value_iteration()

print("1. Policy Iteration Results:")
print(f"  Converged in {p_steps} policy improvement steps ({e_sweeps} total evaluation sweeps)")
print(f"  Values: {[round(x, 2) for x in v_pi]}")
print(f"  Policy: {['Left' if a == 0 else 'Right' for a in pi_pi]}")

print("\n2. Value Iteration Results:")
print(f"  Converged in {vi_sweeps} total sweeps")
print(f"  Values: {[round(x, 2) for x in v_vi]}")
print(f"  Policy: {['Left' if a == 0 else 'Right' for a in pi_vi]}")

print("\nNotice: Both algorithms produce mathematically identical optimal values and policies!")
`,
    quiz: [
      {
        q: r`What does the Policy Improvement Theorem guarantee when constructing an updated policy pi' that acts greedily with respect to V^pi?`,
        o: [
          r`The updated policy pi' is guaranteed to achieve expected state values greater than or equal to pi across every state in the state space`,
          r`The environment transition matrix becomes deterministic`,
          r`The discount factor gamma increases to 1.0`,
          r`All negative rewards are permanently removed from the MDP`,
        ],
        a: 0,
        why: r`The Policy Improvement Theorem proves that acting greedily with respect to the value function of policy pi produces a new policy pi' whose expected return V^{pi'}(s) >= V^{pi}(s) for all states s, guaranteeing monotonic convergence toward the optimal policy.`,
      },
      {
        q: r`How does Value Iteration differ operationally from Policy Iteration?`,
        o: [
          r`Value Iteration applies the Bellman Optimality operator directly to update state values in a single sweep without waiting for policy evaluation to converge`,
          r`Value Iteration requires an exploration epsilon parameter while Policy Iteration does not`,
          r`Value Iteration only works on continuous states`,
          r`Value Iteration updates policies using Monte Carlo sampling`,
        ],
        a: 0,
        why: r`Policy Iteration runs iterative policy evaluation to full convergence between policy improvements. Value Iteration truncates evaluation to a single sweep, updating each state directly with the max over actions (Bellman optimality).`,
      },
      {
        q: r`Why is dynamic programming incapable of solving complex real-world control tasks like autonomous driving directly in tabular form?`,
        o: [
          r`Because tabular dynamic programming suffers from the curse of dimensionality, requiring sweeps over the entire state space which is infinitely large in continuous real-world environments`,
          r`Because dynamic programming can only run on quantum computers`,
          r`Because Bellman equations only apply to game playing tasks like chess`,
          r`Because dynamic programming cannot handle positive rewards`,
        ],
        a: 0,
        why: r`Tabular DP requires enumerating all states in S. In real-world environments like driving, state variables (positions, velocities, angles) are continuous and high-dimensional, resulting in an infinite state space that cannot be indexed in a table.`,
      },
    ],
    usedBy: [],
    prereq: ['mdps-and-bellman-equations'],
    related: ['mdps-and-bellman-equations', 'intelligent-agents-and-environments'],
    keywords: 'dynamic programming value iteration policy iteration policy evaluation bellman optimality reinforcement learning contraction mapping mdp',
  },

  // ------------------------------------------------------------------ 2. Policy gradient: REINFORCE (ai)
  {
    id: 'policy-gradient-reinforce',
    short: 'Policy Gradient & REINFORCE',
    title: 'Policy gradient: REINFORCE',
    task: 'concepts',
    module: 'Reinforcement learning',
    level: 2,
    minutes: 18,
    noLab: true,
    summary: r`Policy gradient methods directly parameterise and optimise a stochastic policy without requiring an intermediate value function or environmental transition dynamics. Grounded in the Policy Gradient Theorem, REINFORCE (Monte Carlo policy gradient) uses sampled episode returns to adjust policy parameters, increasing the probability of actions that yield high cumulative rewards. By introducing baseline subtraction to reduce variance without introducing bias, policy gradients enable stable learning in high-dimensional and continuous action spaces.`,
    lead: r`In complex robotics and video games, mapping every possible state to a Q-table or finding the argmax over millions of continuous actuator voltages is practically impossible. What if, instead of estimating values and acting greedily, we parameterised the policy directly as a neural network that outputs action probabilities? Policy gradient methods optimise the policy directly: if an action led to great returns, increase its probability; if it led to disaster, decrease its probability.`,
    intuition: [
      r`Model-free control without transition dynamics: Traditional dynamic programming requires knowing the transition probability tensor P(s' | s, a). In the real world, physics are complex and unmodelled. The remarkable magic of the Policy Gradient Theorem is that the gradient of expected cumulative return with respect to policy parameters theta does NOT depend on the gradient of environmental transition dynamics: nabla_theta J(theta) = E [ nabla_theta log pi_theta(a | s) * Q(s, a) ]. We can optimise the policy purely by sampling trajectories.`,
      r`The log-derivative trick and the intuition of REINFORCE: The term nabla_theta log pi_theta(a | s) = (nabla_theta pi_theta(a | s)) / pi_theta(a | s) acts as a normalising score function. Multiplying by return G_t scales the parameter update: actions followed by large positive returns receive positive gradient steps (increasing their likelihood in that state), while actions followed by negative or sub-optimal returns have their likelihood suppressed.`,
      r`The curse of high variance and baseline subtraction: Because REINFORCE samples complete Monte Carlo returns G_t = sum_{k=0}^inf gamma^k R_{t+k+1}, random environmental noise cascades over long episodes, causing massive variance in gradient estimates. Subtracting a state-dependent baseline b(s)—typically an estimate of state value V(s)—drastically reduces variance. Crucially, because sum_a nabla_theta pi(a | s) * b(s) = b(s) * nabla (1) = 0, baseline subtraction introduces zero mathematical bias!`,
    ],
    analogy: r`Think of learning to shoot basketball free-throws with your eyes closed, guided only by a coach's whistle. You adjust your shooting posture (policy parameters theta) and take shots (sample actions). If the ball swishes through the hoop, the coach shouts praise (high return G_t), and your brain reinforces the neuromuscular motor commands you just fired (positive gradient update). If the ball clangs off the rim, the coach expresses disappointment, and your brain dampens those specific muscle firings. Over thousands of shots, your shooting posture converges to near-perfection without you ever calculating the differential equations of aerodynamic ballistics.`,
    steps: [
      {
        title: r`Initialise parameterised stochastic policy`,
        desc: r`Construct a neural network or linear model that outputs action probability distribution pi_theta(a | s).`,
        detail: r`For discrete actions: project state features to logits and apply softmax. For continuous actions: output Gaussian distribution parameters (mean mu_theta(s) and standard deviation sigma_theta(s)).`,
      },
      {
        title: r`Sample complete trajectory episode`,
        desc: r`Execute actions sampled from pi_theta until environment terminates.`,
        detail: r`Run the policy in the environment, collecting sequence of states, actions, and rewards: tau = (s_0, a_0, r_1, s_1, a_1, r_2, ..., s_T).`,
      },
      {
        title: r`Calculate discounted returns-to-go for every time step`,
        desc: r`Compute cumulative discounted reward G_t backwards from sequence termination.`,
        detail: r`Iterate backwards from t = T-1 down to 0: G_t = r_{t+1} + gamma * G_{t+1}. The return-to-go G_t accounts strictly for rewards received after action a_t, eliminating past noise.`,
      },
      {
        title: r`Subtract baseline to compute policy advantage`,
        desc: r`Deduct state baseline b(s_t) from return G_t to reduce gradient variance.`,
        detail: r`Compute advantage estimate A_t = G_t - b(s_t), where b(s_t) is either a running average of returns or an auxiliary state-value critic V_phi(s_t).`,
      },
      {
        title: r`Update policy parameters via stochastic gradient ascent`,
        desc: r`Perform gradient update along direction of log-policy scaled by advantage.`,
        detail: r`Accumulate policy gradient delta = sum_t nabla_theta log pi_theta(a_t | s_t) * A_t. Update parameters with learning rate alpha: theta = theta + alpha * delta using Adam optimiser.`,
      },
    ],
    math: [
      {
        h: r`The Policy Gradient Theorem (Sutton et al., 1999)`,
        tex: r`\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^T \nabla_\theta \ln \pi_\theta(a_t \mid s_t) \, Q^{\pi_\theta}(s_t, a_t) \right]`,
        p: r`The expected gradient of performance $J(\theta)$ depends strictly on the gradient of the log-policy weighted by action values, completely bypassing the unknown transition dynamics $\nabla_\theta P(s' \mid s, a)$ of the environment.`,
      },
      {
        h: r`REINFORCE parameter update with baseline subtraction`,
        tex: r`\theta \leftarrow \theta + \alpha \sum_{t=0}^T \nabla_\theta \ln \pi_\theta(a_t \mid s_t) \left( G_t - b(s_t) \right)`,
        p: r`Here $G_t = \sum_{k=t}^T \gamma^{k-t} R_{k+1}$ is the empirical return-to-go. Subtracting baseline $b(s_t)$ preserves an unbiased expectation ($\mathbb{E}[\nabla_\theta \ln \pi \cdot b] = 0$) while drastically reducing variance.`,
      },
      {
        h: r`Softmax policy score function derivative`,
        tex: r`\nabla_\theta \ln \pi_\theta(a \mid s) = \mathbf{\phi}(s, a) - \sum_{a' \in \mathcal{A}} \pi_\theta(a' \mid s) \mathbf{\phi}(s, a')`,
        p: r`For a linear softmax policy $\pi_\theta(a \mid s) \propto \exp(\theta^T \mathbf{\phi}(s, a))$, the score function gradient is the difference between the observed feature vector and the expected feature vector under current policy probabilities.`,
      },
    ],
    keyPoints: [
      r`Policy gradient methods directly parameterise and optimise the policy pi_theta(a | s) using gradient ascent.`,
      r`The Policy Gradient Theorem enables model-free learning without requiring knowledge of environmental transition dynamics.`,
      r`REINFORCE uses full Monte Carlo returns G_t as unbiased estimators of action values Q(s, a).`,
      r`Subtracting a state-dependent baseline b(s) reduces gradient variance without introducing mathematical bias.`,
      r`Policy gradients naturally handle continuous action spaces, stochastic policies, and partial observability.`,
    ],
    pitfalls: [
      r`High variance of Monte Carlo returns: Because REINFORCE evaluates full trajectories, returns fluctuate wildly based on downstream randomness. Baseline subtraction and actor-critic methods are essential to prevent slow or unstable convergence.`,
      r`Sample inefficiency: REINFORCE is an on-policy algorithm: every parameter update requires generating fresh trajectory samples from the updated policy. Discarding past data limits sample efficiency.`,
      r`Premature policy collapse / entropy collapse: If the policy becomes deterministic too early in training (probabilities collapse to 1.0 on sub-optimal actions), exploration ceases and the agent becomes permanently stuck in local optima. Add an entropy bonus to encourage exploration.`,
      r`Learning rate sensitivity: Unlike supervised learning where mistakes can be corrected by subsequent batches, a bad policy gradient step can destroy policy performance, making it impossible to sample good trajectories again. Keep learning rates small.`,
    ],
    code: r`import numpy as np

class REINFORCESimulator:
    """
    Simulation of the REINFORCE (Monte Carlo Policy Gradient) algorithm
    with softmax policy parameterization and baseline subtraction.
    """
    def __init__(self, num_states=2, num_actions=2, lr=0.1, gamma=0.95):
        self.num_states = num_states
        self.num_actions = num_actions
        self.lr = lr
        self.gamma = gamma
        # Policy parameter weights: (num_states x num_actions)
        self.theta = np.zeros((num_states, num_actions))

    def get_action_probs(self, state):
        logits = self.theta[state]
        exp_logits = np.exp(logits - np.max(logits))
        return exp_logits / np.sum(exp_logits)

    def sample_action(self, state):
        probs = self.get_action_probs(state)
        return np.random.choice(self.num_actions, p=probs)

    def compute_returns_to_go(self, rewards):
        """Compute discounted returns G_t = sum_k gamma^k R_{t+k+1} backwards."""
        T = len(rewards)
        returns = np.zeros(T)
        G = 0.0
        for t in reversed(range(T)):
            G = rewards[t] + self.gamma * G
            returns[t] = G
        return returns

    def update_policy(self, states, actions, rewards, use_baseline=True):
        returns = self.compute_returns_to_go(rewards)
        baseline = np.mean(returns) if use_baseline else 0.0
        advantages = returns - baseline
        
        # Accumulate gradients
        grad = np.zeros_like(self.theta)
        for t in range(len(states)):
            s = states[t]
            a = actions[t]
            adv = advantages[t]
            probs = self.get_action_probs(s)
            
            # nabla_theta log pi(a|s) for softmax: e_a - probs
            dlog_pi = -probs
            dlog_pi[a] += 1.0
            
            grad[s] += dlog_pi * adv
            
        # Gradient ascent update
        self.theta += self.lr * grad

# Simulated training on a 2-state MDP:
# State 0: Action 1 is rewarded (+10), Action 0 is penalized (-1)
np.random.seed(42)
agent = REINFORCESimulator(num_states=2, num_actions=2, lr=0.05, gamma=0.90)

print("Initial Action Probabilities in State 0:", agent.get_action_probs(0))

# Simulate 50 training episodes
for ep in range(50):
    states, actions, rewards = [], [], []
    s = 0
    # Single-step episode
    a = agent.sample_action(s)
    r = 10.0 if a == 1 else -1.0
    
    states.append(s)
    actions.append(a)
    rewards.append(r)
    
    agent.update_policy(states, actions, rewards, use_baseline=True)

print("\nTrained Action Probabilities in State 0 (after REINFORCE):")
final_probs = agent.get_action_probs(0)
print(f"  P(Action 0 [Penalized]): {final_probs[0]:.4f}")
print(f"  P(Action 1 [Rewarded]):  {final_probs[1]:.4f}")
print("Notice how policy gradient successfully shifted probability mass to Action 1!")
`,
    quiz: [
      {
        q: r`Why does the Policy Gradient Theorem represent a profound breakthrough for model-free reinforcement learning?`,
        o: [
          r`Because it proves that the gradient of expected performance with respect to policy parameters does not depend on the unknown environmental transition dynamics`,
          r`Because it guarantees that policy training never requires random exploration`,
          r`Because it proves that all neural networks can be replaced by lookup tables`,
          r`Because it eliminates the need for calculating rewards`,
        ],
        a: 0,
        why: r`In real-world environments, transition physics P(s' | s, a) are unknown. The Policy Gradient Theorem proves that nabla_theta J(theta) depends only on the gradient of the known policy nabla log pi_theta and sampled returns, enabling model-free learning.`,
      },
      {
        q: r`Why does subtracting a state-dependent baseline b(s) from Monte Carlo returns reduce variance without introducing bias?`,
        o: [
          r`Because the expected value of the gradient of the log-policy multiplied by any state-dependent baseline is mathematically equal to zero`,
          r`Because the baseline converts all rewards into prime numbers`,
          r`Because the baseline forces the discount factor to zero`,
          r`Because the baseline makes all episodes have identical length`,
        ],
        a: 0,
        why: r`Mathematically, E[nabla log pi(a|s) * b(s)] = sum_a nabla pi(a|s) * b(s) = b(s) * nabla (1) = 0. Because the expected baseline gradient is zero, subtracting b(s) does not change the expected gradient, but drastically reduces sample variance.`,
      },
      {
        q: r`What is a major practical drawback of the REINFORCE algorithm compared to Actor-Critic methods?`,
        o: [
          r`High variance in Monte Carlo returns causes slow and unstable convergence, and on-policy learning requires discarding trajectory data after each update`,
          r`REINFORCE can only be applied to board games like Tic-Tac-Toe`,
          r`REINFORCE cannot be trained using gradient ascent`,
          r`REINFORCE only works when the state space contains exactly one state`,
        ],
        a: 0,
        why: r`Because REINFORCE samples full-episode returns, stochastic environmental noise over long trajectories causes extreme gradient variance. Actor-Critic methods resolve this by bootstrapping value estimates at each step.`,
      },
    ],
    usedBy: [],
    prereq: ['mdps-and-bellman-equations', 'dynamic-programming-value-and-policy-iteration'],
    related: ['mdps-and-bellman-equations', 'dynamic-programming-value-and-policy-iteration'],
    keywords: 'policy gradient reinforce williams sutton sarsa actor critic variance reduction baseline policy gradient theorem',
  },

  // ------------------------------------------------------------------ 3. Prompting and in-context learning (ai)
  {
    id: 'prompting-and-in-context-learning',
    short: 'Prompting & In-Context Learning',
    title: 'Prompting and in-context learning',
    task: 'concepts',
    module: 'LLM foundations',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Prompting and In-Context Learning (ICL) are the defining operational paradigms of modern Large Language Models (LLMs). Rather than updating neural network parameters via gradient descent, in-context learning enables models to infer novel tasks, adapt outputs, and execute complex reasoning purely by conditioning on natural language instructions and demonstration exemplars supplied in the input context window. Methods like Chain-of-Thought (CoT) and Self-Consistency unlock multi-step cognitive reasoning without parameter modifications.`,
    lead: r`To teach a machine learning model to classify legal contracts in 2018, you needed to annotate thousands of documents and execute hours of backpropagation on a GPU cluster. Today, you simply prepend three example contracts and their corresponding classifications into the prompt of a Large Language Model. The model immediately mimics the pattern, generalising to unseen contracts on the fly. How does an autoregressive next-token predictor perform task adaptation without updating a single weight?`,
    intuition: [
      r`The Prompting Continuum: From Zero-Shot to Few-Shot:
- Zero-Shot Prompting: Providing explicit task instructions directly ("Classify the sentiment of the following review: ..."). Relies entirely on pre-trained semantic knowledge.
- Few-Shot Prompting: Prepending k demonstration pairs (Input: X, Output: Y) before the test query. Demonstrations communicate expected formatting, stylistic tone, edge cases, and output schema.
- Chain-of-Thought (CoT): Encouraging the model to generate intermediate reasoning steps ("Let's think step by step") before outputting the final answer. This decomposes complex multi-hop problems into simple linear steps.`,
      r`Mechanisms of In-Context Learning: Why does ICL work? Mechanistic interpretability research (such as Anthropic's induction heads) reveals that Transformer attention layers form specialized circuits that perform pattern completion:
1. Induction Heads: Detect previous occurrences of tokens and copy subsequent tokens, effectively performing algorithmic copying and associative retrieval.
2. Implicit Meta-Gradients: Mathematical analysis shows that forward passes through self-attention layers implement an implicit form of meta-gradient descent, optimising temporary internal representation states within the context window without updating persistent weights.`,
      r`Prompt Sensitivity and Biases: ICL is notoriously sensitive to superficial prompt variations:
- Recency Bias: Models disproportionately favor repeating classes or patterns demonstrated in the final few-shot example.
- Format Bias: Inconsistent delimiters or whitespace significantly alter output quality.
- Hallucinated Reasoning: Models may produce fluent rationales that sound convincing but contain factual errors (rationalization rather than reasoning).`,
    ],
    analogy: r`Think of an experienced human actor preparing for an audition. Traditional fine-tuning is like sending the actor to drama school for four years to permanently rewire their personality. In-context learning is handing the actor a three-page script backstage and saying: "You are playing a 19th-century British detective; here are two lines of dialogue to show your accent and cadence; now walk onto stage and deliver the scene." The actor does not permanently change who they are; they temporarily inhabit the persona defined by the prompt script.`,
    steps: [
      {
        title: r`Define clear system role and task instructions`,
        desc: r`Establish explicit persona, constraints, and deterministic output schema.`,
        detail: r`Formulate a system prompt defining the model's role, behavioural boundaries, and exact formatting requirements (such as strict JSON or XML tags).`,
      },
      {
        title: r`Curate diverse, representative few-shot exemplars`,
        desc: r`Select k balanced demonstration pairs illustrating typical cases and edge conditions.`,
        detail: r`Choose 3 to 5 balanced examples covering all target classes. Ensure demonstrations use uniform formatting, clear input-output delimiters, and unambiguous answers.`,
      },
      {
        title: r`Incorporate Chain-of-Thought reasoning steps`,
        desc: r`Provide step-by-step rationales in few-shot demonstrations to unlock multi-hop logic.`,
        detail: r`In few-shot examples, insert explicit reasoning paths between input and answer. For zero-shot prompts, append trigger phrases such as 'Let us think step by step' to allocate reasoning tokens.`,
      },
      {
        title: r`Deploy Self-Consistency majority voting`,
        desc: r`Sample multiple diverse reasoning paths and aggregate the modal answer.`,
        detail: r`Sample N independent responses (e.g. N = 10) at non-zero temperature (e.g. tau = 0.7). Parse the final answer from each reasoning chain and take the majority vote to eliminate individual path errors.`,
      },
      {
        title: r`Validate output structure and handle retries`,
        desc: r`Parse generated outputs against expected schema and trigger fallback prompts on error.`,
        detail: r`Validate model responses using JSON schema validators. If parsing fails, re-prompt the model with the error message for self-correction.`,
      },
    ],
    math: [
      {
        h: r`In-Context Learning conditional probability formulation`,
        tex: r`P(y \mid x, \mathcal{D}_{\text{prompt}}) = \prod_{i=1}^{|y|} P(y_i \mid x_1, \dots, x_{|x|}, y_1, \dots, y_{i-1}, \, \mathcal{D}_{\text{prompt}})`,
        p: r`Here $\mathcal{D}_{\text{prompt}} = \{(x_1, y_1), (x_2, y_2), \dots, (x_k, y_k)\}$ represents the set of $k$ few-shot demonstration exemplars provided in the prompt context window. The model generates output $y$ by conditioning on both the query $x$ and demonstration history $\mathcal{D}_{\text{prompt}}$.`,
      },
      {
        h: r`Self-Consistency majority voting consensus`,
        tex: r`\hat{y} = \arg\max_{c \in \mathcal{C}} \sum_{i=1}^N \mathbb{I}\left( \operatorname{extract}(r_i) = c \right)`,
        p: r`Here $r_1, \dots, r_N$ are independent stochastic reasoning chains sampled from the model at non-zero temperature, and $\operatorname{extract}(r_i)$ extracts the final categorical answer from reasoning chain $r_i$. The consensus answer $\hat{y}$ is selected via modal majority vote.`,
      },
      {
        h: r`Attention-based induction head operation`,
        tex: r`\operatorname{Attn}(A \dots B \dots A \to B): \quad Q_i \approx K_{j+1} \implies \text{Copy token } B`,
        p: r`Induction heads detect recurring prefix patterns ($A$) and shift attention to attend to the token that followed $A$ in previous occurrences ($B$), enabling autoregressive copying and sequence continuation in-context.`,
      },
    ],
    keyPoints: [
      r`In-Context Learning (ICL) enables Large Language Models to adapt to new tasks purely by conditioning on prompt context without weight updates.`,
      r`Few-shot prompting provides input-output demonstration pairs that establish task formatting, tone, and decision boundaries.`,
      r`Chain-of-Thought (CoT) prompting elicits step-by-step reasoning tokens, dramatically boosting performance on arithmetic and logic tasks.`,
      r`Self-consistency aggregates multiple sampled reasoning paths via majority voting to filter out isolated reasoning errors.`,
      r`ICL is governed by specialized attention circuits (such as induction heads) that perform algorithmic copying and implicit gradient descent.`,
    ],
    pitfalls: [
      r`Class imbalance in few-shot demonstrations: If your five-shot prompt contains four positive examples and one negative example, the model exhibits strong majority class bias, predicting positive regardless of input text. Maintain balanced demonstration distributions.`,
      r`Recency bias in exemplar ordering: The final example in a prompt exerts disproportionate influence on the generated output format and classification decision. Permute example orders to check stability.`,
      r`Assuming Chain-of-Thought guarantees factual correctness: A model can produce a beautifully structured, logically coherent chain of reasoning that is based on a completely fabricated premise. Always ground reasoning in verifiable retrieval context.`,
      r`Exceeding context token limits: Stuffing too many long demonstrations into the prompt degrades attention resolution and risks truncation; 3 to 5 concise, well-chosen exemplars consistently outperform 20 verbose examples.`,
    ],
    code: r`from collections import Counter

class FewShotPromptBuilder:
    """
    Structured prompt builder supporting zero-shot, few-shot,
    and Chain-of-Thought (CoT) prompt construction.
    """
    def __init__(self, system_instruction):
        self.system = system_instruction
        self.examples = []

    def add_example(self, input_text, output_text, reasoning=None):
        self.examples.append({
            "input": input_text,
            "output": output_text,
            "reasoning": reasoning
        })

    def build_prompt(self, test_input, cot=False):
        prompt_parts = [f"System: {self.system}\n"]
        
        # Add few-shot exemplars
        for i, ex in enumerate(self.examples, 1):
            prompt_parts.append(f"Example {i}:")
            prompt_parts.append(f"Input: {ex['input']}")
            if cot and ex['reasoning']:
                prompt_parts.append(f"Reasoning: {ex['reasoning']}")
            prompt_parts.append(f"Output: {ex['output']}\n")
            
        # Add test query
        prompt_parts.append("Test Query:")
        prompt_parts.append(f"Input: {test_input}")
        if cot:
            prompt_parts.append("Reasoning: Let's think step by step.")
        prompt_parts.append("Output:")
        
        return "\n".join(prompt_parts)

def self_consistency_vote(sampled_answers):
    """Aggregate multiple sampled outputs via majority voting."""
    counts = Counter(sampled_answers)
    winner, top_votes = counts.most_common(1)[0]
    confidence = top_votes / len(sampled_answers)
    return winner, confidence, counts

# Build Math Word Problem Few-Shot Chain-of-Thought Prompt
system_msg = "You are an expert mathematical assistant. Solve word problems with clear reasoning."
builder = FewShotPromptBuilder(system_msg)

builder.add_example(
    input_text="A bakery had 24 cupcakes. They sold 3/4 of them, then baked 10 more. How many cupcakes do they have now?",
    reasoning="They started with 24 cupcakes. Sold 3/4 of 24 = 18 cupcakes. Remaining: 24 - 18 = 6. Then baked 10 more: 6 + 10 = 16.",
    output="16"
)

test_problem = "A farmer has 40 sheep. 1/4 of them run away, and then 5 sheep are returned. How many sheep are there now?"
formatted_prompt = builder.build_prompt(test_problem, cot=True)

print("Generated Few-Shot Chain-of-Thought Prompt:")
print("-" * 65)
print(formatted_prompt)
print("-" * 65)

# Simulate Self-Consistency Voting across 5 sampled reasoning paths
mock_sampled_outputs = ["35", "35", "30", "35", "35"]
winner, conf, vote_breakdown = self_consistency_vote(mock_sampled_outputs)

print(f"\nSelf-Consistency Aggregation across {len(mock_sampled_outputs)} sampled paths:")
print(f"  Vote Breakdown: {dict(vote_breakdown)}")
print(f"  Consensus Answer: '{winner}' (Confidence: {conf * 100:.1f}%)")
`,
    quiz: [
      {
        q: r`How does In-Context Learning (ICL) in Large Language Models achieve task adaptation without updating model parameters?`,
        o: [
          r`The model conditions on task descriptions and few-shot exemplars provided in the context window, using attention mechanisms (like induction heads) to complete the demonstrated pattern`,
          r`The model automatically updates its bias vectors using backpropagation at test time`,
          r`The model loads specialized weights from a remote server for each prompt`,
          r`The model converts all tokens into ASCII numbers and executes Python scripts internally`,
        ],
        a: 0,
        why: r`In-context learning is entirely gradient-free at inference time. The model relies on internal attention circuits developed during pre-training to recognize the structure of input-output demonstrations and continue the pattern.`,
      },
      {
        q: r`Why does Chain-of-Thought (CoT) prompting substantially improve performance on complex multi-step reasoning tasks?`,
        o: [
          r`Because generating intermediate reasoning steps allocates additional computational tokens for the model to decompose complex problems, rather than forcing a direct jump to the final answer`,
          r`Because CoT increases the learning rate of the model during inference`,
          r`Because CoT disables the softmax function`,
          r`Because CoT compresses the prompt to zero tokens`,
        ],
        a: 0,
        why: r`In autoregressive Transformers, each output token represents a fixed budget of computation. Forcing an immediate final answer requires solving complex math in a single forward pass. CoT spreads the calculation over intermediate reasoning tokens.`,
      },
      {
        q: r`What is the purpose of the Self-Consistency decoding strategy in prompt engineering?`,
        o: [
          r`To sample multiple independent reasoning paths at non-zero temperature and take the majority vote of the final answers, filtering out isolated reasoning errors`,
          r`To force the model to generate the exact same sentence twenty times`,
          r`To guarantee that output tokens are alphabetically sorted`,
          r`To reduce GPU memory usage to zero`,
        ],
        a: 0,
        why: r`Wang et al. showed that correct reasoning paths tend to converge on the same correct answer even if the intermediate wording differs, whereas erroneous reasoning produces divergent answers. Majority voting across diverse paths boosts accuracy.`,
      },
    ],
    usedBy: [],
    prereq: ['gpt-and-decoder-only-models'],
    related: ['gpt-and-decoder-only-models', 'bert-and-masked-language-models'],
    keywords: 'prompting in-context learning icl few-shot zero-shot chain of thought cot self-consistency reasoning induction heads prompt engineering',
  },

  // ------------------------------------------------------------------ 4. Tool use and function calling (ai)
  {
    id: 'tool-use-and-function-calling',
    short: 'Tool Use & Function Calling',
    title: 'Tool use and function calling',
    task: 'concepts',
    module: 'LLM foundations',
    level: 2,
    minutes: 16,
    noLab: true,
    summary: r`Tool use and function calling extend Large Language Models beyond closed-world text generation by connecting them to external APIs, calculators, databases, and code execution environments. Rather than relying on memorised weights for complex arithmetic, real-time data, or system actions, tool-augmented models emit structured function call invocations (typically adhering to strict JSON Schema specifications). The host runtime executes the tool and injects the output back into the message history, enabling reliable agentic workflows.`,
    lead: r`Ask a pure Large Language Model to calculate 347,291 multiplied by 984,123, and it will confidently guess a plausible-looking but completely incorrect number. Ask it what the weather is in Tokyo right now, and it will hallucinate a forecast based on training data from two years ago. Pure language models are closed worlds. Function calling gives models hands and eyes: when arithmetic is needed, the model calls a calculator; when live data is needed, it calls a weather API; when action is required, it calls a database mutation.`,
    intuition: [
      r`The limits of closed-world parametric memory: Neural network weights represent static parametric memory frozen at training time. They suffer from three fundamental limitations:
1. Knowledge Cutoff: Inability to access live or real-time information (e.g. stock prices, news, flight status).
2. Calculation Inaccuracy: Large numbers and multi-digit arithmetic fail because tokenisers fragment numbers unpredictably.
3. Inability to Act: Pure text generation cannot execute database writes, book appointments, or send emails.
Tools decouple reasoning from execution: the model serves as the cognitive orchestrator, delegating specialised operations to external software tools.`,
      r`The Function Calling Protocol: How does an LLM invoke an external tool?
1. Tool Definition: Developers register tool definitions in the system prompt using JSON Schema, specifying the tool name, description, parameters, and required fields.
2. Model Decision & Tool Call Emission: When a user query requires a tool, the model pauses natural prose generation and outputs a structured tool invocation object: { "name": "get_weather", "arguments": { "city": "Tokyo" } }.
3. Client Runtime Execution: The host client receives the tool call, executes the actual Python function or REST API, and captures the result.
4. Continuation: The client appends the tool output to the message transcript with role: "tool". The model ingests the real-world result and continues generating its response.`,
      r`Multi-step tool chaining and error handling: Sophisticated agentic workflows require chaining multiple tools sequentially. For example, to answer "How much did our top customer spend last month?", the model first calls a SQL tool to look up the top customer's ID, inspects the returned ID, calls a second tool to fetch their transaction records, and finally computes the summary. If a tool call fails (e.g. invalid arguments or API timeout), the error message is fed back into the context, allowing the model to self-correct its arguments.`,
    ],
    analogy: r`Think of a brilliant business executive who does not know how to fly a Boeing 777 or write raw SQL database queries. When the executive needs to travel to a conference in Geneva, they do not attempt to construct an aeroplane out of sheet metal. They summon their administrative travel assistant (a specialized tool), state their objective, and let the booking system execute the flight reservation. The executive remains the high-level decision-maker, delegating technical mechanics to specialised tools.`,
    steps: [
      {
        title: r`Define tool specifications via JSON Schema`,
        desc: r`Specify tool names, descriptive briefs, and typed argument schemas.`,
        detail: r`Formulate tool declarations using standard JSON Schema. Include clear parameter descriptions and strict typing (string, integer, boolean, enum) to guide model parameter extraction.`,
      },
      {
        title: r`Inject tool definitions into model context`,
        desc: r`Pass tool schemas to the model API in the tools parameter or system prompt.`,
        detail: r`Supply registered tool definitions to the LLM. The model's fine-tuned function-calling head evaluates user prompts against available tool capabilities.`,
      },
      {
        title: r`Detect tool invocation and parse structured arguments`,
        desc: r`Check if the model emitted a tool_calls payload instead of text content.`,
        detail: r`If the model generates a function call, halt text streaming. Parse the emitted JSON arguments and validate them against the declared schema using pydantic or jsonschema.`,
      },
      {
        title: r`Execute local function or remote API`,
        desc: r`Dispatch validated arguments to client-side implementation and catch runtime exceptions.`,
        detail: r`Route tool name and arguments to the appropriate local function, database connection, or external HTTP service. If an error occurs, catch the exception and format it into a descriptive error string.`,
      },
      {
        title: r`Return tool output to conversation history`,
        desc: r`Append tool result as a role: tool message and request model continuation.`,
        detail: r`Add the tool response payload back to the conversation thread. Invoke the model again so it can synthesize the returned real-world data into a coherent final answer for the user.`,
      },
    ],
    math: [
      {
        h: r`Tool Augmented Language Model objective`,
        tex: r`P(y \mid x, \mathcal{T}) = \sum_{a \in \mathcal{A}_{\mathcal{T}}} P(\text{Call}(a) \mid x) \cdot P(y \mid x, a, \operatorname{Exec}(a))`,
        p: r`Here $\mathcal{T}$ is the set of available tools, $\text{Call}(a)$ represents generating a structured tool invocation with arguments $a$, $\operatorname{Exec}(a)$ is the external runtime execution result, and $y$ is the final synthesized natural language response.`,
      },
      {
        h: r`Structured JSON Schema validation predicate`,
        tex: r`\operatorname{Valid}(\mathbf{a}, \mathcal{S}) = \begin{cases} 1 & \text{if } \forall k \in \mathcal{S}_{\text{req}}: k \in \mathbf{a} \land \operatorname{type}(\mathbf{a}[k]) = \mathcal{S}_{\text{type}}[k] \\ 0 & \text{otherwise} \end{cases}`,
        p: r`A tool argument payload $\mathbf{a}$ emitted by the model is valid if and only if all mandatory schema fields $\mathcal{S}_{\text{req}}$ are present and their types match declared specifications $\mathcal{S}_{\text{type}}$.`,
      },
      {
        h: r`Tool invocation decision threshold`,
        tex: r`\text{Decision} = \begin{cases} \text{Invoke Tool } t^* & \text{if } \max_{t \in \mathcal{T}} P(t \mid x) > \gamma_{\text{threshold}} \\ \text{Generate Direct Response} & \text{otherwise} \end{cases}`,
        p: r`Function-calling models learn a calibrated binary decision boundary to determine whether a user query requires external tool assistance or can be answered directly from parametric memory.`,
      },
    ],
    keyPoints: [
      r`Tool use connects Large Language Models to external APIs, databases, code interpreters, and real-time data sources.`,
      r`Function calling protocols use JSON Schema to specify tool names, descriptions, and strongly typed parameter definitions.`,
      r`The model acts as a reasoning orchestrator: it outputs structured JSON function calls, pausing generation until the host runtime returns execution results.`,
      r`Tool execution occurs client-side in the host runtime, maintaining security and sandboxing boundaries outside the neural model.`,
      r`Multi-turn tool chaining enables complex agentic workflows: models inspect intermediate outputs and iteratively invoke subsequent tools.`,
    ],
    pitfalls: [
      r`Ambiguous tool descriptions: If tool descriptions are vague (e.g. 'searches for stuff'), the model will misidentify when to invoke the tool. Descriptions must clearly state intent, preconditions, and return format.`,
      r`Unsandboxed code execution: Executing code emitted by an LLM without strict containerisation (e.g. Docker, gVisor, WebAssembly) introduces catastrophic security vulnerabilities (arbitrary command execution). Always sandbox tool runners.`,
      r`Failing to feed tool error messages back to the model: If an API throws a 400 Bad Request and your client simply crashes, the agent fails. Feeding the error message back as a tool response allows the model to self-correct its parameters.`,
      r`Infinite tool-calling loops: If a tool repeatedly fails or returns empty results, an agent may loop indefinitely calling the same tool. Always enforce a hard ceiling on maximum sequential tool calls (e.g. max 5 iterations).`,
    ],
    code: r`import json

class ToolCallingEngine:
    """
    Simulation of an LLM tool calling dispatch engine with schema validation,
    execution dispatch, and response formatting.
    """
    def __init__(self):
        self.tools = {}
        self.schemas = {}

    def register_tool(self, name, description, schema, func):
        self.tools[name] = func
        self.schemas[name] = {
            "name": name,
            "description": description,
            "parameters": schema
        }

    def validate_and_execute(self, tool_call_json):
        """Validate JSON tool call against schema and execute."""
        try:
            call = json.loads(tool_call_json)
            tool_name = call.get("name")
            args = call.get("arguments", {})
            
            if tool_name not in self.tools:
                return {"status": "error", "message": f"Unknown tool '{tool_name}'"}
                
            schema = self.schemas[tool_name]["parameters"]
            # Validate required fields
            for req in schema.get("required", []):
                if req not in args:
                    return {"status": "error", "message": f"Missing required parameter: '{req}'"}
                    
            # Execute function
            result = self.tools[tool_name](**args)
            return {"status": "success", "result": result}
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Define tool implementations
def calculate_mortgage(principal, rate, years):
    """Compute monthly mortgage payment: P * (r(1+r)^n) / ((1+r)^n - 1)"""
    r = rate / 100.0 / 12.0
    n = years * 12
    monthly = principal * (r * (1 + r)**n) / ((1 + r)**n - 1)
    return round(monthly, 2)

def get_exchange_rate(source_curr, target_curr):
    """Mock currency exchange rate API."""
    rates = {("GBP", "USD"): 1.30, ("EUR", "USD"): 1.08, ("USD", "JPY"): 152.0}
    return rates.get((source_curr.upper(), target_curr.upper()), 1.0)

# Initialize Engine and register tools
engine = ToolCallingEngine()

engine.register_tool(
    name="calculate_mortgage",
    description="Calculate monthly mortgage repayment amount for a property loan.",
    schema={
        "type": "object",
        "properties": {
            "principal": {"type": "number", "description": "Loan amount"},
            "rate": {"type": "number", "description": "Annual interest rate percentage (e.g. 4.5)"},
            "years": {"type": "integer", "description": "Loan term duration in years"}
        },
        "required": ["principal", "rate", "years"]
    },
    func=calculate_mortgage
)

engine.register_tool(
    name="get_exchange_rate",
    description="Get live currency exchange rate between source and target currency codes.",
    schema={
        "type": "object",
        "properties": {
            "source_curr": {"type": "string", "description": "3-letter source currency (e.g. GBP)"},
            "target_curr": {"type": "string", "description": "3-letter target currency (e.g. USD)"}
        },
        "required": ["source_curr", "target_curr"]
    },
    func=get_exchange_rate
)

# Simulate LLM Emitting a Tool Call Payload
simulated_model_call = json.dumps({
    "name": "calculate_mortgage",
    "arguments": {
        "principal": 350000,
        "rate": 4.5,
        "years": 25
    }
})

print("1. Simulated Model Output (Emitted JSON Tool Call):")
print(simulated_model_call)

# Dispatch and Execute in Client Runtime
execution_response = engine.validate_and_execute(simulated_model_call)
print("\n2. Runtime Tool Execution Result:")
print(json.dumps(execution_response, indent=2))

# Continuation message injected back to LLM
tool_role_message = {
    "role": "tool",
    "name": "calculate_mortgage",
    "content": json.dumps(execution_response)
}
print("\n3. Formatted Message Injected Back to Model History:")
print(json.dumps(tool_role_message, indent=2))
`,
    quiz: [
      {
        q: r`Why are external tools and function calling necessary for Large Language Models?`,
        o: [
          r`Because pure language models have static knowledge cutoffs, hallucinate multi-digit arithmetic, and cannot perform external actions like database writes or API queries`,
          r`Because function calling reduces the cost of electricity on CPU chips`,
          r`Because Transformers cannot generate JSON without external software`,
          r`Because function calling deletes all past tokens from context`,
        ],
        a: 0,
        why: r`Language models are frozen in static weights and lack calculators, real-time data access, and execution engines. Function calling allows the model to act as a reasoning orchestrator, delegating math, retrieval, and actions to verified tools.`,
      },
      {
        q: r`In standard function calling architectures, where does the actual tool execution occur?`,
        o: [
          r`Client-side in the host runtime application outside the neural network, which catches results and injects them back as tool messages`,
          r`Inside the GPU matrix multiplication kernels of the Transformer`,
          r`On the model training server during backpropagation`,
          r`Inside the embedding layer lookup table`,
        ],
        a: 0,
        why: r`The neural model only generates text representing the function name and JSON arguments. The host client application receives this payload, executes the actual code/API in a sandboxed runtime, and returns the result to the model.`,
      },
      {
        q: r`How should a robust agentic tool-calling system handle runtime exceptions (such as an API returning a 400 Bad Request)?`,
        o: [
          r`Format the error message as a descriptive string and feed it back to the model as the tool response, allowing the model to analyse the error and self-correct its arguments`,
          r`Immediately shut down the entire server and delete the model`,
          r`Ignore the error and output random letters to the user`,
          r`Re-train the model from scratch on the failed API response`,
        ],
        a: 0,
        why: r`Feeding structured error messages back to the model context turns errors into informative feedback. The model can diagnose missing parameters, incorrect types, or invalid formats and generate a corrected tool call.`,
      },
    ],
    usedBy: [],
    prereq: ['prompting-and-in-context-learning'],
    related: ['prompting-and-in-context-learning', 'gpt-and-decoder-only-models'],
    keywords: 'tool use function calling json schema apis agents toolformer tool augmented language models execution runtime pydantic',
  },
];
