import { fill, pairs, search, sequence, sort, type ActivityBank } from "./builders";
import type { Problem } from "../problems";

const chain: Problem = { id: "chain", type: "diagram", prompt: "Label the feeding roles in this grass → rabbit → fox chain.", explanation: "Grass produces food using light. The rabbit eats plants and the fox eats animals.",
  image: "/images/food-chain.svg", description: "Grass, a rabbit, and a fox connected by arrows from grass to rabbit and from rabbit to fox.",
  labels: [{ id: "carnivore", text: "Carnivore" }, { id: "producer", text: "Producer" }, { id: "herbivore", text: "Herbivore" }],
  targets: [{ id: "grass", x: 17, y: 75, labelId: "producer" }, { id: "rabbit", x: 50, y: 75, labelId: "herbivore" }, { id: "fox", x: 83, y: 75, labelId: "carnivore" }] };

export const scienceActivities: ActivityBank = {
  "habitat-investigators-habitats": [
    pairs("Match each habitat resource to an example.", [["Food", "Berries eaten by a bird"], ["Shelter", "Cover where an animal hides"], ["Water", "A pond used for drinking"]], "Habitats supply food, water, shelter and space."),
    fill("A group of the same species in one area is a", "population", "A community contains different populations."),
    sort("Sort these examples.", ["Body structure", "Behaviour"], [["Webbed feet", 0], ["Moving into shade", 1], ["A bird migrating", 1], ["A thick coat of fur", 0]], "Structural adaptations are features; behaviours are actions."),
  ],
  "habitat-investigators-food-webs": [
    sort("Sort the organisms by how they obtain food.", ["Producer", "Consumer"], [["Grass", 0], ["Rabbit", 1], ["Algae", 0], ["Fox", 1]], "Producers make food using light; consumers eat other organisms."),
    fill("Many fungi break down dead material and act as", "decomposers", "Decomposers return nutrients to the environment."),
    chain,
  ],
  "habitat-investigators-habitat-protection": [
    pairs("Match each term.", [["Depletion", "A population becomes smaller"], ["Extinction", "A species no longer exists anywhere"], ["Restoration", "Work to improve a damaged habitat"]], "These terms describe different changes and actions."),
    fill("Recorded observations supporting a habitat claim are", "evidence", "A claim should be supported by observations or reliable sources."),
    sort("Sort these proposed habitat actions.", ["Can support habitat protection", "Can harm a habitat"], [["Keep waste out of a stream", 0], ["Release an unfamiliar pet into a pond", 1], ["Protect nesting cover", 0]], "Choose actions that fit local evidence and do not introduce organisms."),
  ],
  "light-and-sound-lab-light": [
    pairs("Match each light process.", [["Reflection", "Light changes direction at a surface"], ["Refraction", "Light changes direction between materials"], ["Shadow", "An area where an object blocks light"]], "Reflection and refraction change light's direction in different situations."),
    fill("A clear material that lets you see through it is", "transparent", "Transparent materials transmit light with a clear view."),
    sort("Sort these objects.", ["Emits its own visible light", "Reflects light"], [["Switched-on lamp", 0], ["Mirror", 1], ["Moon", 1]], "The Moon and mirrors reflect light rather than emitting their own visible light."),
  ],
  "light-and-sound-lab-sound": [
    pairs("Match sound terms.", [["Pitch", "How high or low a sound seems"], ["Loudness", "How strong a sound seems"], ["Echo", "Reflected sound"]], "Pitch, loudness and reflection describe different features."),
    fill("Sound begins when an object", "vibrates", "Vibrations can make nearby material vibrate too."),
    sort("Sort places where ordinary sound can travel.", ["Can carry sound", "Cannot carry sound"], [["Air", 0], ["Water", 0], ["Empty space with no matter", 1]], "Sound needs a material medium."),
  ],
  "light-and-sound-lab-energy-and-pollution": [
    sort("Sort these actions.", ["Reduces unnecessary light or noise", "Adds unnecessary light or noise"], [["Turn off an unused lamp", 0], ["Shout beside resting wildlife", 1], ["Aim outdoor lights only where needed", 0]], "Unnecessary light and noise can affect people and other organisms."),
    fill("Unwanted or harmful sound in an environment is noise", "pollution", "Noise pollution can disturb health, communication and wildlife."),
    pairs("Match each technology to its energy output.", [["Lamp", "Light"], ["Speaker", "Sound"], ["Solar panel", "Electrical energy from light"]], "Technologies transfer or transform energy."),
  ],
  "mechanism-makers-force-and-distance": [
    pairs("Match each simple-machine example.", [["Pulley", "A rope running over a wheel"], ["Lever", "A bar turning about a pivot"], ["Gear", "A toothed rotating wheel"]], "Simple machines change how forces are applied."),
    fill("A push or pull is a", "force", "Forces can change motion."),
    sort("Sort these actions.", ["Push", "Pull"], [["Press a door away from you", 0], ["Tug a rope toward you", 1], ["Push a cart forward", 0]], "A push acts away; a pull draws toward."),
  ],
  "mechanism-makers-motion-connections": [
    pairs("Match motions.", [["Rotation", "Turning about an axis"], ["Linear motion", "Moving along a straight line"], ["Reciprocating motion", "Moving back and forth"]], "Mechanisms can connect different kinds of motion."),
    fill("Two directly meshed gears turn in", "opposite", "One gear's teeth push the other in the opposite direction.", " directions."),
    sequence("Order this cause-and-effect chain in directly meshed gears.", ["A hand turns the first gear.", "Its teeth push the second gear.", "The second gear turns the other way."], "Contact between teeth transfers motion."),
  ],
  "mechanism-makers-engineering-design": [
    sequence("Order a design cycle for a new prototype.", ["Identify the problem and criteria.", "Build a first prototype.", "Test it against the criteria.", "Revise the design."], "Testing informs improvements."),
    fill("A first model built for testing is a", "prototype", "A prototype helps you learn before producing a final design."),
    sort("Sort statements about a bridge design.", ["Testable criterion", "Preference without a defined test"], [["Supports five identical toy cars", 0], ["Looks really amazing", 1], ["Spans a 20 cm gap", 0]], "A clear criterion can be checked."),
  ],
  "rock-detectives-rock-properties": [
    search(["ROCK", "LUSTRE", "STREAK"], "Lustre describes appearance in reflected light; streak is the colour of a mineral's powder."),
    fill("The colour of a mineral's powder is its", "streak", "Streak can differ from the mineral's surface colour."),
    pairs("Match observable properties.", [["Hardness", "Resistance to scratching"], ["Lustre", "Appearance in reflected light"], ["Texture", "Arrangement or feel of grains"]], "Use more than colour when describing a sample."),
  ],
  "rock-detectives-rock-cycle": [
    pairs("Match each rock type to its formation.", [["Igneous", "Molten rock cools"], ["Sedimentary", "Sediments become compacted and cemented"], ["Metamorphic", "Existing rock changes under heat and pressure without melting"]], "Different processes form the three broad rock types."),
    fill("Molten rock below Earth's surface is called", "magma", "Magma that reaches the surface is called lava."),
    sort("Sort changes.", ["Includes melting", "Does not require melting"], [["Rock becomes magma", 0], ["Sediment is compacted", 1], ["Heat and pressure change rock without melting", 1]], "Metamorphism does not mean the rock melts."),
  ],
  "rock-detectives-mineral-resources": [
    sort("Sort resource actions.", ["Reduces the need for new extraction", "Increases discarded material"], [["Reuse a metal object", 0], ["Recycle suitable metal", 0], ["Throw away a usable tool", 1]], "Reuse and recycling can reduce demand, though they do not remove all impacts."),
    fill("Removing useful minerals from the ground is called", "mining", "Mining supplies materials but can affect habitats and communities."),
    pairs("Match each decision factor.", [["Benefit", "Useful materials supplied"], ["Environmental cost", "Disturbance of land or water"], ["Community perspective", "Views of people affected"]], "Evaluate several effects and perspectives instead of only one benefit."),
  ],
  "stem-and-code-scientific-investigation": [
    sequence("Order a fair investigation.", ["Ask a testable question.", "Plan a controlled comparison.", "Collect observations.", "Explain results using the evidence."], "A fair comparison changes one intended factor."),
    fill("The factor intentionally changed in a fair test is the", "variable", "Keep other relevant conditions the same."),
    sort("Sort statements.", ["Observation", "Inference"], [["The water level is 4 cm.", 0], ["The plant might lack water.", 1], ["The object made a tapping sound.", 0]], "An observation records what is detected; an inference interprets it."),
  ],
  "stem-and-code-coding-models": [
    pairs("Match coding ideas to their use.", [["Loop", "Repeat a process"], ["Condition", "Choose according to a test"], ["Debugging", "Find and fix an error"]], "Code models processes through ordered instructions and decisions."),
    fill("Finding and fixing mistakes in code is", "debugging", "Use a test case to check the change."),
    sequence("Order a response to a coding error.", ["Run a small test case.", "Locate the incorrect command.", "Change the command.", "Run the test again."], "Retesting checks whether a fix works."),
  ],
  "stem-and-code-science-contributions": [
    sort("Sort statements about scientific contributions.", ["Needs a named source or evidence", "Unfair generalization"], [["This named researcher developed a tested device.", 0], ["Only one kind of person can do science.", 1], ["This community's public resource explains its local observations.", 0]], "Scientific contributions come from diverse people; credit specific sources."),
    fill("Naming the creator of an idea gives them", "credit", "Credit recognizes a specific contribution."),
    pairs("Match good research practices.", [["Attribution", "Name the person or source"], ["Verification", "Check a claim against reliable evidence"], ["Respect for context", "Do not present one community as representing all"]], "Evidence and respectful attribution matter together."),
  ],
  "water-on-the-move": [
    pairs("Match water-cycle processes.", [["Evaporation", "Liquid becomes water vapour"], ["Condensation", "Water vapour becomes liquid"], ["Precipitation", "Water falls from clouds"]], "Water changes state and location in the cycle."),
    fill("Tiny droplets form as water vapour cools through", "condensation", "Cooling can change water vapour to liquid."),
    sort("Sort examples.", ["Precipitation", "Not precipitation"], [["Rain falling", 0], ["Snow falling", 0], ["A puddle drying", 1]], "Precipitation falls from clouds; evaporation does not."),
  ],
};
