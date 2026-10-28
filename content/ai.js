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
  }
];
