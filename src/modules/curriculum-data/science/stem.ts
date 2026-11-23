import { section as s, type Topic, type Check } from "./build";

const investigations: Record<number, readonly [string, string, string, string, string]> = {
  1: ["paper shelters", "a paper roof", "dry paper beneath a model roof", "Roof width", "Wide roofs may keep more of the model space dry."],
  2: ["ramp movement", "a toy on a low cardboard ramp", "the distance the toy rolls", "Ramp height", "A greater height can change the distance, but floor texture also matters."],
  3: ["paper bridge strength", "a folded paper bridge", "the number of identical counters supported", "Number of folds", "Folds change the shape and stiffness of paper without changing its substance."],
  5: ["structure bracing", "a card frame with a diagonal brace", "the sideways displacement under an equal gentle push", "Presence of a brace", "A brace redirects forces through the frame and can reduce sideways deformation."],
  6: ["glider wings", "a paper glider released without throwing", "the horizontal distance travelled", "Wing width", "Wing area affects lift and drag; a larger wing is not automatically a longer-flying wing."],
  7: ["structure stability", "a card tower", "whether it tips under an equal gentle push", "Base width", "A wider base helps keep the centre of gravity above the supporting area."],
  8: ["fluid flow", "room-temperature water in a shallow tilted tray", "the time to cross a marked distance", "Tray slope", "Slope affects the driving force, while surface roughness also influences flow."],
};
const coding: Record<number, readonly [string, string, string]> = {
  1: ["Precise instructions", "Start at square A. Move one square toward B. Stop beneath the roof. Each instruction specifies direction and distance. Execute this algorithm with a paper token, not a person near obstacles. 'Go over there' is not executable because the destination is unclear. A program follows the instructions it receives, not the ones its author intended. The shelter map is a model: a token cannot test waterproofing.", "A2.1"],
  2: ["Decompose a water-cycle model", "Break the model into four small procedures: move water to air, form droplets, return water to land, and collect it. Run each procedure with blue counters, then connect them. This decomposition makes it easier to find a missing step. Counters are symbols for water, not actual particles. A cloud drawing cannot prove the air temperature or whether real rain will fall tomorrow.", "A2.1"],
  3: ["Debug a plant-needs model", "Use the algorithm: if the soil card says dry, display 'ask an adult to check water'; otherwise display 'observe'. Test dry and moist inputs. A faulty program that always displays 'water' can encourage overwatering, reducing air around roots. Trace the condition, change the faulty branch, and rerun both test cases. A soil label alone cannot diagnose every problem; light, roots, and temperature also matter.", "A2.1"],
  5: ["Store and process energy data", "Represent fictional daily lamp use as a list [2, 3, 1] of hours. Set total to zero; for each value, add it to total; display total, which is six hours. Keep the unit with the values. A second method stores a day and its value in a table; that makes missing days visible. Hours are not energy unless lamp power is also known. A program that adds a text label instead of a number should flag the input.", "A2.1"],
  6: ["Obtain flight-model input", "A keyboard can enter wing length, a slider can choose a launch setting, and a sensor can supply a measured time. Begin with a paper input card and manually run: read time; if time is missing, display 'measure again'; otherwise store it with units. Different inputs need validation. A sensor can be wrong or poorly placed. Changing a slider in a simulation changes a model parameter, not the real weather.", "A2.1"],
  7: ["Plan a heat-loss program", "Before coding, write the program purpose, inputs, output, and tests. Read initial and final temperatures from a fictional table; calculate initial minus final; display temperature decrease. A condition rejects a missing reading. Draw a flowchart, execute the steps by hand, and test equal readings and a cooler final reading. Temperature decrease alone does not measure all energy transferred; mass and material also matter.", "A2.1"],
  8: ["Automate a water-system model", "Model a tank with an integer waterLevel and a pumpOn variable. Repeat: read level; if it is below three units, turn the model pump on; if it reaches five, turn it off; record the output. Execute with paper cards, not a powered pump. This feedback controls a system using measured output. Add a missing-sensor branch that stops the pump and alerts an operator; an uncontrolled loop could overflow a real tank.", "A2.1"],
};
function check(prompt: string, answer: string, wrong1: string, wrong2: string, explanation: string): Check {
  return [prompt, answer, wrong1, wrong2, explanation];
}
export function stemTopics(grade: number): readonly Topic[] {
  const [context, model, result, variable, mechanism] = investigations[grade];
  const [heading, codeBody, id] = coding[grade];
  return [{
    slug: "evidence-and-safe-design", title: `Evidence and safe design: ${context}`, strand: "A",
    sections: [
      s("A question that can be investigated", "A1.1 A1.2 A1.4",
        `Investigate ${context} by comparing ${model} with one changed version. State a question before choosing materials. Change ${variable.toLowerCase()} while keeping the other materials, test position, and measurement method alike. Measure ${result}, repeat the comparison, and record all trials, not only the best. ${mechanism} Research an adult-approved source to help interpret the result; record its author and distinguish its claim from your own observation.`,
        `Draw the two versions and mark the changed feature. With adult-selected lightweight materials, run three gentle trials. Make a labelled table recording ${result}; stop if any material is damaged.`),
      s("Build, test, and improve", "A1.3 A1.5",
        `A design needs a purpose, a measurable success criterion, and constraints. For ${context}, set a criterion related to ${result} and a limit on material use. Sketch ${model}, assemble a prototype, and test it using the agreed method. A prototype is a learning tool, not a finished product. A failed trial can reveal a loose join or an unsuitable shape. Change one feature, retest, and explain which evidence supports the revision in a drawing or short report.`,
        "Write a success criterion and a material limit before building. Show an adult where forces or water will act. After testing, label one revision and explain the before-and-after evidence."),
      s("Applications and contributions", "A3.1 A3.2 A3.3",
        `Builders and designers use observations of materials and forces to solve problems involving ${context}. Mathematics helps compare trials; drawing communicates dimensions; writing explains an evidence-based choice. Solutions depend on access, costs, and people's needs, not science alone. With an adult, select a named community-authored public resource describing a technology or design contribution. Record the creator, community, purpose, and evidence. Do not assign one practice to all Indigenous communities or invent cultural accounts.`,
        `Prepare a labelled design poster for ${context}. Include numerical evidence and a short caption for younger readers. Add an adult-approved, attributed community example; compare its purpose with your model without claiming they are identical.`),
    ],
    practice: check(`Which feature will you deliberately change in this ${context} test?`, variable, "Every material at once", "The result after recording it",
      `Changing ${variable.toLowerCase()} alone makes the comparison easier to interpret.`),
    finals: [
      check(`Two ${context} trials used different surfaces and different models. What limits the conclusion?`, "More than one condition changed", "The observations were written down", "The adult supervised",
        `When several conditions change, the measured difference cannot confidently be attributed to one feature. A fair comparison holds the other relevant conditions alike and records repeated trials.`),
      check(`A third ${context} trial disagrees with the first two. What should the investigator do?`, "Record it and check the procedure", "Erase it because it is inconvenient", "Claim there was no variation",
        `Repeating a measurement helps reveal variation, but does not guarantee identical results. Keep the unexpected trial, check the setup, and report the spread rather than selecting only a preferred outcome.`),
      check(`A prototype for ${context} misses its stated criterion. Which next step uses design evidence?`, "Revise one feature and retest the criterion", "Rename it a success", "Stop recording measurements",
        `Design is iterative: an unsuccessful prototype supplies information. Comparing the same criterion before and after a controlled revision shows whether the change improves the intended function.`),
      check(`How should a report compare a community design contribution with ${model}?`, "Name its source, purpose, and relevant evidence", "Invent a traditional practice", "Treat every community as identical",
        `Contributions have specific creators, contexts, and purposes. Attribution and community-authored resources make a comparison accountable; a classroom model does not give permission to generalize or reproduce restricted knowledge.`),
    ],
    matches: [["Prediction", "An expected result stated before testing"], ["Observation", `A recorded example of ${result}`], ["Criterion", "A defined measure of design success"]],
    steps: ["State a question and choose one changed feature.", "Run and record repeated safe comparisons.", "Use the results to revise the model and retest."],
    blank: ["A first model used to learn from testing is a", "prototype", "A prototype is revised using evidence against defined design criteria."],
  }, {
    slug: "coding-a-science-model", title: `Coding a science model: ${heading.toLowerCase()}`, strand: "A",
    sections: [
      s(heading, id, codeBody,
        "Use cards, counters, and a pencil to execute the algorithm exactly as written. Record the input, each decision or movement, and the output. Ask an adult to check that the trace follows the instructions."),
      s("Test the model against evidence", "A1.2 A1.5",
        "A program is a set of instructions; a scientific model adds assumptions about how the world works. Test an ordinary input and an unusual input, then compare the output with the rule and with available observations. A correct calculation can still represent an incomplete model. Keep a trace showing each intermediate step. When a result seems wrong, check the data first, then the instructions, then the scientific assumptions. Explain which of these needed revision and why.",
        "Create two normal test cards and one missing or unclear input card. Trace all three without skipping a step. Write a caption distinguishing an instruction error from a limitation of the scientific model."),
      s("Useful technology, human responsibility", "A2.2 A3.1 A3.2",
        "Digital tools can organize measurements and make repeated decisions quickly. Their benefits depend on correct input and thoughtful human oversight. In skilled trades, a sensor can warn an operator about a problem, but maintenance and judgement remain important. Artificial intelligence can identify patterns while still producing incorrect or biased outputs. Compare a paper method with a digital method by accuracy, access, energy use, privacy, and effort. Never provide personal information to test a model.",
        "Make a two-column comparison of running your science model on paper and on an adult-approved device. Include one advantage and one limitation of each. Explain how a human checks questionable output."),
    ],
    practice: check("What should be recorded when executing this science algorithm?", "The input and each instruction followed", "Only the desired answer", "A guess without a trace",
      "A trace links an output to the actual instructions and input."),
    finals: [
      check("The instructions are followed accurately, but the real observation differs. What can explain this?", "The model omitted an important condition", "Real evidence must always be wrong", "Every program contains all scientific knowledge",
        "Models simplify reality. A correct trace proves that instructions were followed, not that all relevant conditions were included. Compare the assumptions with observations before revising the scientific representation."),
      check("A science instruction says 'move a little' or 'use some data'. What is the main problem?", "It does not define an executable operation", "It has too many exact units", "It is automatically a measurement",
        "Executable steps need defined actions, values, directions, or conditions. Replacing vague wording with a precise instruction allows different people to reproduce the same model trace."),
      check("A test gives no input value. What is a responsible program response?", "Flag the missing value rather than invent one", "Silently choose a convenient result", "Treat a blank as reliable evidence",
        "Input validation prevents a missing value from becoming an apparently valid observation. A flagged input asks the investigator to obtain evidence rather than hiding uncertainty in a made-up number."),
      check("Why is human oversight still needed when a sensor makes repeated decisions?", "Sensors and programs can fail or use unsuitable assumptions", "Sensors never need maintenance", "Fast output is always correct",
        "A fast automated response can repeatedly amplify a faulty reading. Operators need access to the recorded input and decision, a safe stop procedure, and a way to review unusual results."),
    ],
    matches: [["Input", "Information supplied to a model"], ["Algorithm", "Defined executable instructions"], ["Output", "The result of running the instructions"]],
    steps: ["Choose a test input with its unit or meaning.", "Trace the instructions and record decisions.", "Compare the output with the expected rule and evidence."],
    sort: [["Reproducible instruction", "Unclear instruction"], [["Move one grid square right", 0], ["Go somewhere", 1], ["Record three trials in a table", 0], ["Use some numbers somehow", 1]]],
    blank: ["Information supplied before the program makes a decision is its", "input", "Input must have a defined meaning and be checked before processing."],
  }];
}
