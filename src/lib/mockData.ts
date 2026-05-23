// src/lib/mockData.ts

export const mockSubjects = [
  {
    id: "sub-math",
    name: "Mathematics",
    description: "Advanced mathematics and logic",
  },
  { id: "sub-phys", name: "Physics", description: "Calculus-based physics" },
  {
    id: "sub-eng",
    name: "English Proficiency",
    description: "Academic reading and grammar",
  },
  {
    id: "sub-log",
    name: "Logical Reasoning",
    description: "Analytical and spatial logic",
  },
  {
    id: "sub-chem",
    name: "Chemistry",
    description: "General chemistry principles",
  },
];

export const mockTopics = [
  // Mathematics
  { id: "top-math-1", subject_id: "sub-math", name: "Mathematical Logic" },
  { id: "top-math-2", subject_id: "sub-math", name: "Differential Calculus" },
  { id: "top-math-3", subject_id: "sub-math", name: "Matrix Algebra" },
  {
    id: "top-math-4",
    subject_id: "sub-math",
    name: "Probability & Statistics",
  },
  { id: "top-math-5", subject_id: "sub-math", name: "Vectors in 3D Space" },
  // Physics
  { id: "top-phys-1", subject_id: "sub-phys", name: "Kinematics" },
  { id: "top-phys-2", subject_id: "sub-phys", name: "Newtonian Dynamics" },
  { id: "top-phys-3", subject_id: "sub-phys", name: "Thermodynamics" },
  { id: "top-phys-4", subject_id: "sub-phys", name: "Electromagnetism" },
  { id: "top-phys-5", subject_id: "sub-phys", name: "Wave Optics" },
  // English Proficiency
  { id: "top-eng-1", subject_id: "sub-eng", name: "Reading Comprehension" },
  { id: "top-eng-2", subject_id: "sub-eng", name: "Vocabulary in Context" },
  { id: "top-eng-3", subject_id: "sub-eng", name: "Error Recognition" },
  { id: "top-eng-4", subject_id: "sub-eng", name: "Sentence Structure" },
  { id: "top-eng-5", subject_id: "sub-eng", name: "Paragraph Inference" },
  // Logical Reasoning
  { id: "top-log-1", subject_id: "sub-log", name: "Analytical Reasoning" },
  { id: "top-log-2", subject_id: "sub-log", name: "Syllogism" },
  { id: "top-log-3", subject_id: "sub-log", name: "Number Sequences" },
  { id: "top-log-4", subject_id: "sub-log", name: "Data Interpretation" },
  {
    id: "top-log-5",
    subject_id: "sub-log",
    name: "Spatial Pattern Recognition",
  },
  // Chemistry
  { id: "top-chem-1", subject_id: "sub-chem", name: "Stoichiometry" },
  { id: "top-chem-2", subject_id: "sub-chem", name: "Chemical Bonding" },
  { id: "top-chem-3", subject_id: "sub-chem", name: "Acid-Base Equilibrium" },
  { id: "top-chem-4", subject_id: "sub-chem", name: "Thermochemistry" },
  { id: "top-chem-5", subject_id: "sub-chem", name: "Reaction Kinetics" },
];

export const mockTryout = {
  id: "tryout-grand-01",
  title: "IUP International Class Grand Simulation - Batch 1",
  type: "simulation",
  duration_minutes: 120,
  max_attempts: 5,
  is_premium: true,
  is_published: true,
};

export const mockQuestions = [
  // --- MATHEMATICS ---
  {
    id: "q-math-1",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-math",
    topic_id: "top-math-1",
    sequence_number: 1,
    text: "Consider the statement: 'If the matrix is invertible, then its determinant is non-zero.' Which of the following is the contrapositive of this statement?",
    image_url: null,
    explanation:
      "The contrapositive of 'If P, then Q' is 'If not Q, then not P'. Here, P = 'matrix is invertible' and Q = 'determinant is non-zero'. Thus, 'If the determinant is zero, then the matrix is not invertible.'",
    options: [
      {
        id: "opt-m1-a",
        sequence_number: 1,
        text: "If the determinant is zero, then the matrix is not invertible.",
        is_correct: true,
      },
      {
        id: "opt-m1-b",
        sequence_number: 2,
        text: "If the determinant is non-zero, then the matrix is invertible.",
        is_correct: false,
      },
      {
        id: "opt-m1-c",
        sequence_number: 3,
        text: "If the matrix is not invertible, then its determinant is zero.",
        is_correct: false,
      },
      {
        id: "opt-m1-d",
        sequence_number: 4,
        text: "The matrix is invertible if and only if its determinant is non-zero.",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-math-2",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-math",
    topic_id: "top-math-2",
    sequence_number: 2,
    text: "Let f(x) = x^3 - 3x^2 + 2. At which values of x does the function have local extrema?",
    image_url: null,
    explanation:
      "Find the first derivative: f'(x) = 3x^2 - 6x. Set to zero: 3x(x - 2) = 0. The critical points are x = 0 and x = 2.",
    options: [
      {
        id: "opt-m2-a",
        sequence_number: 1,
        text: "x = -1 and x = 3",
        is_correct: false,
      },
      {
        id: "opt-m2-b",
        sequence_number: 2,
        text: "x = 0 and x = 2",
        is_correct: true,
      },
      {
        id: "opt-m2-c",
        sequence_number: 3,
        text: "x = 1 and x = -2",
        is_correct: false,
      },
      {
        id: "opt-m2-d",
        sequence_number: 4,
        text: "x = 0 only",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-math-3",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-math",
    topic_id: "top-math-3",
    sequence_number: 3,
    text: "If A is a 2x2 matrix such that A^2 = I (where I is the identity matrix), and A is not equal to I or -I, what is the determinant of A?",
    image_url: null,
    explanation:
      "Since A^2 = I, det(A^2) = det(I) = 1. So, (det(A))^2 = 1, meaning det(A) = 1 or -1. However, since A represents a reflection (not purely identity or inversion), its determinant must be -1.",
    options: [
      { id: "opt-m3-a", sequence_number: 1, text: "0", is_correct: false },
      { id: "opt-m3-b", sequence_number: 2, text: "1", is_correct: false },
      { id: "opt-m3-c", sequence_number: 3, text: "-1", is_correct: true },
      {
        id: "opt-m3-d",
        sequence_number: 4,
        text: "Cannot be determined",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-math-4",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-math",
    topic_id: "top-math-4",
    sequence_number: 4,
    text: "A biased coin has a 60% chance of landing heads. If flipped 3 times, what is the probability of getting exactly 2 heads?",
    image_url: null,
    explanation:
      "Using binomial probability: P(X=2) = C(3,2) * (0.6)^2 * (0.4)^1 = 3 * 0.36 * 0.4 = 0.432, which is 43.2%.",
    options: [
      { id: "opt-m4-a", sequence_number: 1, text: "28.8%", is_correct: false },
      { id: "opt-m4-b", sequence_number: 2, text: "36.0%", is_correct: false },
      { id: "opt-m4-c", sequence_number: 3, text: "43.2%", is_correct: true },
      { id: "opt-m4-d", sequence_number: 4, text: "60.0%", is_correct: false },
    ],
  },
  {
    id: "q-math-5",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-math",
    topic_id: "top-math-5",
    sequence_number: 5,
    text: "Find the dot product of vector u = 2i - j + 3k and vector v = 4i + 5j - k.",
    image_url: null,
    explanation:
      "Dot product = (2*4) + (-1*5) + (3*-1) = 8 - 5 - 3 = 0. The vectors are orthogonal.",
    options: [
      { id: "opt-m5-a", sequence_number: 1, text: "0", is_correct: true },
      { id: "opt-m5-b", sequence_number: 2, text: "1", is_correct: false },
      { id: "opt-m5-c", sequence_number: 3, text: "10", is_correct: false },
      { id: "opt-m5-d", sequence_number: 4, text: "-2", is_correct: false },
    ],
  },

  // --- PHYSICS ---
  {
    id: "q-phys-1",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-phys",
    topic_id: "top-phys-1",
    sequence_number: 6,
    text: "A projectile is launched from the ground at an angle of 45 degrees with an initial velocity of 20 m/s. Assuming g = 10 m/s^2, what is the maximum height reached?",
    image_url: null,
    explanation:
      "Max height H = (v^2 * sin^2(theta)) / 2g = (400 * 0.5) / 20 = 200 / 20 = 10 meters.",
    options: [
      {
        id: "opt-p1-a",
        sequence_number: 1,
        text: "10 meters",
        is_correct: true,
      },
      {
        id: "opt-p1-b",
        sequence_number: 2,
        text: "20 meters",
        is_correct: false,
      },
      {
        id: "opt-p1-c",
        sequence_number: 3,
        text: "40 meters",
        is_correct: false,
      },
      {
        id: "opt-p1-d",
        sequence_number: 4,
        text: "5 meters",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-phys-2",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-phys",
    topic_id: "top-phys-2",
    sequence_number: 7,
    text: "An elevator is accelerating upwards at 2 m/s^2. If a person inside has a mass of 60 kg, what is the normal force exerted by the floor on the person? (g = 10 m/s^2)",
    image_url: null,
    explanation:
      "F_net = N - mg = ma. Therefore, N = m(g + a) = 60(10 + 2) = 60 * 12 = 720 Newtons.",
    options: [
      { id: "opt-p2-a", sequence_number: 1, text: "600 N", is_correct: false },
      { id: "opt-p2-b", sequence_number: 2, text: "480 N", is_correct: false },
      { id: "opt-p2-c", sequence_number: 3, text: "720 N", is_correct: true },
      { id: "opt-p2-d", sequence_number: 4, text: "120 N", is_correct: false },
    ],
  },
  {
    id: "q-phys-3",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-phys",
    topic_id: "top-phys-3",
    sequence_number: 8,
    text: "An ideal gas undergoes an isothermal expansion. Which of the following statements is true regarding the internal energy of the system?",
    image_url: null,
    explanation:
      "In an isothermal process, the temperature remains constant. For an ideal gas, internal energy relies entirely on temperature, so the change in internal energy is zero.",
    options: [
      {
        id: "opt-p3-a",
        sequence_number: 1,
        text: "It increases.",
        is_correct: false,
      },
      {
        id: "opt-p3-b",
        sequence_number: 2,
        text: "It decreases.",
        is_correct: false,
      },
      {
        id: "opt-p3-c",
        sequence_number: 3,
        text: "It remains constant.",
        is_correct: true,
      },
      {
        id: "opt-p3-d",
        sequence_number: 4,
        text: "It depends on the volume change.",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-phys-4",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-phys",
    topic_id: "top-phys-4",
    sequence_number: 9,
    text: "A wire carrying a steady current is placed in a uniform magnetic field. If the angle between the wire and the field is doubled from 30 to 60 degrees, the magnetic force on the wire will...",
    image_url: null,
    explanation:
      "Force F = ILB sin(theta). sin(30) = 0.5. sin(60) = \u221a3 / 2 (approx 0.866). The force increases by a factor of \u221a3.",
    options: [
      {
        id: "opt-p4-a",
        sequence_number: 1,
        text: "Double.",
        is_correct: false,
      },
      {
        id: "opt-p4-b",
        sequence_number: 2,
        text: "Increase by a factor of \u221a3.",
        is_correct: true,
      },
      {
        id: "opt-p4-c",
        sequence_number: 3,
        text: "Remain the same.",
        is_correct: false,
      },
      {
        id: "opt-p4-d",
        sequence_number: 4,
        text: "Decrease.",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-phys-5",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-phys",
    topic_id: "top-phys-5",
    sequence_number: 10,
    text: "In Young's double-slit experiment, if the distance between the slits is halved, what happens to the fringe width on the screen?",
    image_url: null,
    explanation:
      "Fringe width W = (lambda * L) / d. If d (slit distance) is halved, the width W is doubled.",
    options: [
      {
        id: "opt-p5-a",
        sequence_number: 1,
        text: "It is halved.",
        is_correct: false,
      },
      {
        id: "opt-p5-b",
        sequence_number: 2,
        text: "It is doubled.",
        is_correct: true,
      },
      {
        id: "opt-p5-c",
        sequence_number: 3,
        text: "It is quadrupled.",
        is_correct: false,
      },
      {
        id: "opt-p5-d",
        sequence_number: 4,
        text: "It remains unchanged.",
        is_correct: false,
      },
    ],
  },

  // --- ENGLISH PROFICIENCY ---
  {
    id: "q-eng-1",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-eng",
    topic_id: "top-eng-1",
    sequence_number: 11,
    text: "Passage: 'Despite the proliferation of digital reading mediums, the cognitive absorption experienced with physical books remains unparalleled.' What is the primary focus of the sentence?",
    image_url: null,
    explanation:
      "The sentence contrasts digital and physical mediums, highlighting that physical books offer a superior level of deep mental engagement (cognitive absorption).",
    options: [
      {
        id: "opt-e1-a",
        sequence_number: 1,
        text: "Digital reading is replacing physical books.",
        is_correct: false,
      },
      {
        id: "opt-e1-b",
        sequence_number: 2,
        text: "Physical books provide superior mental engagement.",
        is_correct: true,
      },
      {
        id: "opt-e1-c",
        sequence_number: 3,
        text: "Cognitive absorption is difficult to achieve today.",
        is_correct: false,
      },
      {
        id: "opt-e1-d",
        sequence_number: 4,
        text: "Digital mediums are unparalleled in their reach.",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-eng-2",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-eng",
    topic_id: "top-eng-2",
    sequence_number: 12,
    text: "In the context of the sentence 'The committee voted to RESCIND the controversial policy,' the word RESCIND most nearly means:",
    image_url: null,
    explanation:
      "To rescind means to revoke, cancel, or repeal a law, order, or agreement.",
    options: [
      { id: "opt-e2-a", sequence_number: 1, text: "Amend", is_correct: false },
      {
        id: "opt-e2-b",
        sequence_number: 2,
        text: "Enforce",
        is_correct: false,
      },
      { id: "opt-e2-c", sequence_number: 3, text: "Revoke", is_correct: true },
      {
        id: "opt-e2-d",
        sequence_number: 4,
        text: "Evaluate",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-eng-3",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-eng",
    topic_id: "top-eng-3",
    sequence_number: 13,
    text: "Identify the grammatical error: 'Neither the manager nor the employees was aware of the impending audit schedule.'",
    image_url: null,
    explanation:
      "In 'Neither/Nor' constructs, the verb must agree with the noun closest to it. Since 'employees' is plural, the verb should be 'were', not 'was'.",
    options: [
      {
        id: "opt-e3-a",
        sequence_number: 1,
        text: "Neither",
        is_correct: false,
      },
      { id: "opt-e3-b", sequence_number: 2, text: "nor", is_correct: false },
      { id: "opt-e3-c", sequence_number: 3, text: "was", is_correct: true },
      {
        id: "opt-e3-d",
        sequence_number: 4,
        text: "impending",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-eng-4",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-eng",
    topic_id: "top-eng-4",
    sequence_number: 14,
    text: "Choose the correct completion: 'Had the engineers implemented the fail-safe protocol, the systemic collapse _____ avoided.'",
    image_url: null,
    explanation:
      "This is a Type 3 conditional (past unreal). The structure requires 'had + past participle' in the if-clause, and 'would have been + past participle' in the main clause.",
    options: [
      {
        id: "opt-e4-a",
        sequence_number: 1,
        text: "will be",
        is_correct: false,
      },
      {
        id: "opt-e4-b",
        sequence_number: 2,
        text: "would be",
        is_correct: false,
      },
      {
        id: "opt-e4-c",
        sequence_number: 3,
        text: "would have been",
        is_correct: true,
      },
      {
        id: "opt-e4-d",
        sequence_number: 4,
        text: "could be",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-eng-5",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-eng",
    topic_id: "top-eng-5",
    sequence_number: 15,
    text: "What can be inferred from this statement? 'The CEO's praise of the new marketing strategy was noticeably tepid.'",
    image_url: null,
    explanation:
      "'Tepid' means showing little enthusiasm. If the praise was tepid, the CEO is not fully convinced or enthusiastic about the strategy.",
    options: [
      {
        id: "opt-e5-a",
        sequence_number: 1,
        text: "The CEO was highly enthusiastic.",
        is_correct: false,
      },
      {
        id: "opt-e5-b",
        sequence_number: 2,
        text: "The CEO was unenthusiastic and somewhat skeptical.",
        is_correct: true,
      },
      {
        id: "opt-e5-c",
        sequence_number: 3,
        text: "The CEO rejected the strategy completely.",
        is_correct: false,
      },
      {
        id: "opt-e5-d",
        sequence_number: 4,
        text: "The CEO was confused by the strategy.",
        is_correct: false,
      },
    ],
  },

  // --- LOGICAL REASONING ---
  {
    id: "q-log-1",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-log",
    topic_id: "top-log-1",
    sequence_number: 16,
    text: "Five friends (A, B, C, D, E) sit in a row. C is directly between A and B. E is at the far right end. D is to the immediate left of A. Who is sitting in the middle?",
    image_url: null,
    explanation:
      "Let's arrange them. E is at the far right: _ _ _ _ E. D is left of A: D A _ _ E. C is between A and B: D A C B E. The middle position (3rd) is occupied by C.",
    options: [
      { id: "opt-l1-a", sequence_number: 1, text: "A", is_correct: false },
      { id: "opt-l1-b", sequence_number: 2, text: "B", is_correct: false },
      { id: "opt-l1-c", sequence_number: 3, text: "C", is_correct: true },
      { id: "opt-l1-d", sequence_number: 4, text: "D", is_correct: false },
    ],
  },
  {
    id: "q-log-2",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-log",
    topic_id: "top-log-2",
    sequence_number: 17,
    text: "Premise 1: All engineers are analytical. Premise 2: Some artists are engineers. Conclusion: Therefore, some artists are analytical. Is this logical?",
    image_url: null,
    explanation:
      "Yes, this is a valid categorical syllogism. If the artists who are engineers share the trait of all engineers (being analytical), then those specific artists are analytical.",
    options: [
      { id: "opt-l2-a", sequence_number: 1, text: "Valid", is_correct: true },
      {
        id: "opt-l2-b",
        sequence_number: 2,
        text: "Invalid",
        is_correct: false,
      },
      {
        id: "opt-l2-c",
        sequence_number: 3,
        text: "Cannot be determined",
        is_correct: false,
      },
      {
        id: "opt-l2-d",
        sequence_number: 4,
        text: "True, but logically flawed",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-log-3",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-log",
    topic_id: "top-log-3",
    sequence_number: 18,
    text: "Find the next number in the sequence: 2, 6, 12, 20, 30, ...",
    image_url: null,
    explanation:
      "The differences between terms are: +4, +6, +8, +10. The next difference should be +12. 30 + 12 = 42.",
    options: [
      { id: "opt-l3-a", sequence_number: 1, text: "40", is_correct: false },
      { id: "opt-l3-b", sequence_number: 2, text: "42", is_correct: true },
      { id: "opt-l3-c", sequence_number: 3, text: "44", is_correct: false },
      { id: "opt-l3-d", sequence_number: 4, text: "48", is_correct: false },
    ],
  },
  {
    id: "q-log-4",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-log",
    topic_id: "top-log-4",
    sequence_number: 19,
    text: "If a machine produces 40 units in 5 hours, how many units will 3 such machines produce in 8 hours?",
    image_url: null,
    explanation:
      "One machine produces 40/5 = 8 units per hour. Three machines produce 3 * 8 = 24 units per hour. In 8 hours, they produce 24 * 8 = 192 units.",
    options: [
      { id: "opt-l4-a", sequence_number: 1, text: "120", is_correct: false },
      { id: "opt-l4-b", sequence_number: 2, text: "160", is_correct: false },
      { id: "opt-l4-c", sequence_number: 3, text: "192", is_correct: true },
      { id: "opt-l4-d", sequence_number: 4, text: "240", is_correct: false },
    ],
  },
  {
    id: "q-log-5",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-log",
    topic_id: "top-log-5",
    sequence_number: 20,
    text: "If 'ALGORITHM' is coded as 'BKHPSJSIO', how is 'NETWORK' coded?",
    image_url: null,
    explanation:
      "The pattern alternates between +1 and -1 in the alphabet. A(+1)=B, L(-1)=K, G(+1)=H, O(-1)=N (Wait, checking logic: A(+1)=B, L(-1)=K, G(+1)=H, O(-1)=N. Let's do NETWORK: N(+1)=O, E(-1)=D, T(+1)=U, W(-1)=V, O(+1)=P, R(-1)=Q, K(+1)=L => ODUVPQL).",
    options: [
      {
        id: "opt-l5-a",
        sequence_number: 1,
        text: "MDUSXQJ",
        is_correct: false,
      },
      { id: "opt-l5-b", sequence_number: 2, text: "ODUVPQL", is_correct: true },
      {
        id: "opt-l5-c",
        sequence_number: 3,
        text: "OFUXPSL",
        is_correct: false,
      },
      {
        id: "opt-l5-d",
        sequence_number: 4,
        text: "MFUVPQJ",
        is_correct: false,
      },
    ],
  },

  // --- CHEMISTRY ---
  {
    id: "q-chem-1",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-chem",
    topic_id: "top-chem-1",
    sequence_number: 21,
    text: "How many moles of CO2 are produced when 2 moles of C2H6 (ethane) are completely combusted?",
    image_url: null,
    explanation:
      "The balanced equation is 2 C2H6 + 7 O2 -> 4 CO2 + 6 H2O. From the equation, 2 moles of ethane produce 4 moles of CO2.",
    options: [
      {
        id: "opt-c1-a",
        sequence_number: 1,
        text: "2 moles",
        is_correct: false,
      },
      {
        id: "opt-c1-b",
        sequence_number: 2,
        text: "3 moles",
        is_correct: false,
      },
      { id: "opt-c1-c", sequence_number: 3, text: "4 moles", is_correct: true },
      {
        id: "opt-c1-d",
        sequence_number: 4,
        text: "6 moles",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-chem-2",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-chem",
    topic_id: "top-chem-2",
    sequence_number: 22,
    text: "Which of the following molecules has a tetrahedral geometry?",
    image_url: null,
    explanation:
      "CH4 (Methane) has 4 bonding pairs and 0 lone pairs around the central Carbon atom, resulting in a tetrahedral geometry.",
    options: [
      { id: "opt-c2-a", sequence_number: 1, text: "H2O", is_correct: false },
      { id: "opt-c2-b", sequence_number: 2, text: "NH3", is_correct: false },
      { id: "opt-c2-c", sequence_number: 3, text: "CH4", is_correct: true },
      { id: "opt-c2-d", sequence_number: 4, text: "CO2", is_correct: false },
    ],
  },
  {
    id: "q-chem-3",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-chem",
    topic_id: "top-chem-3",
    sequence_number: 23,
    text: "If the pH of a solution is 3, what is the concentration of hydroxide ions [OH-] in the solution at 25°C?",
    image_url: null,
    explanation:
      "pH = 3 means [H+] = 10^-3 M. Since [H+][OH-] = 10^-14 at 25°C, [OH-] = 10^-14 / 10^-3 = 10^-11 M.",
    options: [
      {
        id: "opt-c3-a",
        sequence_number: 1,
        text: "10^-3 M",
        is_correct: false,
      },
      {
        id: "opt-c3-b",
        sequence_number: 2,
        text: "10^-7 M",
        is_correct: false,
      },
      {
        id: "opt-c3-c",
        sequence_number: 3,
        text: "10^-11 M",
        is_correct: true,
      },
      {
        id: "opt-c3-d",
        sequence_number: 4,
        text: "10^-14 M",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-chem-4",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-chem",
    topic_id: "top-chem-4",
    sequence_number: 24,
    text: "An endothermic reaction is characterized by...",
    image_url: null,
    explanation:
      "Endothermic reactions absorb heat from their surroundings, resulting in a positive change in enthalpy (\u0394H > 0).",
    options: [
      {
        id: "opt-c4-a",
        sequence_number: 1,
        text: "Releasing heat, \u0394H < 0",
        is_correct: false,
      },
      {
        id: "opt-c4-b",
        sequence_number: 2,
        text: "Absorbing heat, \u0394H < 0",
        is_correct: false,
      },
      {
        id: "opt-c4-c",
        sequence_number: 3,
        text: "Absorbing heat, \u0394H > 0",
        is_correct: true,
      },
      {
        id: "opt-c4-d",
        sequence_number: 4,
        text: "Releasing heat, \u0394H > 0",
        is_correct: false,
      },
    ],
  },
  {
    id: "q-chem-5",
    tryout_id: "tryout-grand-01",
    subject_id: "sub-chem",
    topic_id: "top-chem-5",
    sequence_number: 25,
    text: "Which factor does NOT affect the rate of a chemical reaction?",
    image_url: null,
    explanation:
      "The rate of reaction is affected by temperature, concentration, surface area, and catalysts. The molar mass of the products does not dictate the kinetic rate.",
    options: [
      {
        id: "opt-c5-a",
        sequence_number: 1,
        text: "Temperature",
        is_correct: false,
      },
      {
        id: "opt-c5-b",
        sequence_number: 2,
        text: "Presence of a catalyst",
        is_correct: false,
      },
      {
        id: "opt-c5-c",
        sequence_number: 3,
        text: "Concentration of reactants",
        is_correct: false,
      },
      {
        id: "opt-c5-d",
        sequence_number: 4,
        text: "Molar mass of the products",
        is_correct: true,
      },
    ],
  },
];
