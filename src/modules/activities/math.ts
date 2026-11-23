import { fill, pairs, sequence, sort, type ActivityBank } from "./builders";
import type { Problem } from "../problems";

const fractionDiagram: Problem = { id: "fraction-diagram", type: "diagram", prompt: "Label the two numbers in 3/5.", explanation: "The numerator counts selected parts; the denominator counts equal parts in one whole.",
  image: "/images/fraction-parts.svg", description: "The fraction three fifths: a 3 above a fraction bar and a 5 below it.",
  labels: [{ id: "denominator", text: "Denominator" }, { id: "numerator", text: "Numerator" }],
  targets: [{ id: "top", x: 60, y: 25, labelId: "numerator" }, { id: "bottom", x: 60, y: 75, labelId: "denominator" }] };

export const mathActivities: ActivityBank = {
  "number-builders-place-value": [
    pairs("Match each digit in 6,482 to its value.", [["6", "6,000"], ["4", "400"], ["8", "80"]], "A digit's position determines its value."),
    fill("In 7,305, the digit 3 has a value of", "300", "The 3 is in the hundreds place.", ""),
    sequence("Order these numbers from least to greatest.", ["2,045", "2,405", "2,450"], "Compare thousands, then hundreds, then tens."),
  ],
  "number-builders-fractions": [
    fractionDiagram,
    fill("Three quarters written as a fraction is", "3/4", "Three selected parts out of four equal parts is 3/4.", ""),
    pairs("Match equivalent fractions.", [["1/2", "4/8"], ["1/4", "2/8"], ["3/4", "6/8"]], "Multiplying both numbers by the same number preserves a fraction's value."),
  ],
  "number-builders-decimals": [
    pairs("Match each decimal to its place-value description.", [["0.4", "Four tenths"], ["0.04", "Four hundredths"], ["1.4", "One and four tenths"]], "Tenths and hundredths occupy different positions."),
    fill("Write seven hundredths as a decimal:", "0.07", "The 7 belongs in the hundredths position.", ""),
    sequence("Order the decimals from least to greatest.", ["0.08", "0.3", "0.75"], "Compare hundredths: 8, 30, and 75 hundredths."),
  ],
  "operation-strategies-mental-strategies": [
    pairs("Match each expression to its result.", [["49 + 21", "70"], ["25 + 25", "50"], ["100 - 39", "61"]], "Friendly numbers and compensation can simplify mental calculations."),
    fill("Using compensation, 59 + 31 =", "90", "Move one from 31 to 59 to make 60 + 30.", ""),
    sequence("Order this compensation strategy for 38 + 22.", ["Move 2 from 22 to 38.", "Calculate 40 + 20.", "Report 60."], "Compensation changes the parts but preserves their sum."),
  ],
  "operation-strategies-addition-subtraction": [
    pairs("Match each calculation to its answer.", [["342 + 125", "467"], ["600 - 250", "350"], ["480 + 20", "500"]], "Add or subtract corresponding place values."),
    fill("725 - 300 =", "425", "Subtract three hundreds from seven hundreds.", ""),
    sequence("Order the steps for checking 458 + 127.", ["Estimate 460 + 130.", "Calculate the exact sum, 585.", "Compare 585 with the estimate, 590."], "An estimate helps detect an unreasonable exact answer."),
  ],
  "operation-strategies-multiplication-division": [
    sort("Sort the expressions by their result.", ["24", "36"], [["6 × 4", 0], ["9 × 4", 1], ["72 ÷ 3", 0], ["6 × 6", 1]], "Multiplication and division can produce the same value."),
    fill("84 ÷ 7 =", "12", "Twelve groups of seven make 84.", ""),
    pairs("Match each multiplication to its related division.", [["8 × 5 = 40", "40 ÷ 5 = 8"], ["7 × 6 = 42", "42 ÷ 6 = 7"], ["9 × 3 = 27", "27 ÷ 3 = 9"]], "Multiplication and division are inverse operations."),
  ],
  "operation-strategies-fractions-and-proportion": [
    pairs("Match each fraction of a set to its value.", [["1/2 of 12", "6"], ["1/3 of 12", "4"], ["1/4 of 12", "3"]], "Divide the whole set into equal groups."),
    fill("One quarter of 20 counters is", "5", "Four equal groups of five make 20.", ""),
    sort("Sort the amounts by whether they equal one half of 16.", ["Equals 8", "Does not equal 8"], [["2 × 4", 0], ["16 ÷ 2", 0], ["16 ÷ 4", 1], ["3 + 4", 1]], "One half of sixteen is eight."),
  ],
  "patterns-and-code-patterns": [
    sequence("Order these terms in the increasing pattern.", ["6", "12", "18", "24"], "Each term increases by six."),
    fill("The next term in 5, 10, 15, 20 is", "25", "Add five to each previous term.", ""),
    pairs("Match the pattern to its rule.", [["3, 7, 11, 15", "Add 4"], ["20, 17, 14, 11", "Subtract 3"], ["2, 4, 8, 16", "Multiply by 2"]], "A rule explains the relationship between successive terms."),
  ],
  "patterns-and-code-equations": [
    pairs("Match each missing number.", [["□ + 9 = 20", "11"], ["4 × □ = 28", "7"], ["□ - 6 = 12", "18"]], "Both sides of an equation must have the same value."),
    fill("If n + 8 = 25, n =", "17", "Subtract eight from both sides.", ""),
    sort("Sort the equations by whether n = 6 makes them true.", ["True for n = 6", "False for n = 6"], [["n + 4 = 10", 0], ["2 × n = 12", 0], ["n - 1 = 7", 1]], "Substitute six and compare both sides."),
  ],
  "patterns-and-code-coding-events": [
    sequence("Order commands that make a character walk twice after Start is clicked.", ["When Start is clicked", "Move one step", "Move one more step"], "An event starts the ordered commands."),
    fill("A command that repeats instructions is a", "loop", "A loop repeats its body instead of duplicating every command."),
    pairs("Match each coding idea to its role.", [["Event", "Starts a response"], ["Loop", "Repeats commands"], ["Sequence", "Sets command order"]], "Order, repetition, and events have different roles."),
  ],
  "patterns-and-code-modelling": [
    pairs("Match each modelling step to its example.", [["Assumption", "Each guest eats two slices"], ["Calculation", "6 guests × 2 slices"], ["Check", "Ask whether two slices is enough"]], "A model depends on assumptions that should be checked."),
    fill("At 3 pencils per child, 8 children need", "24", "Multiply three pencils by eight children.", ""),
    sequence("Order a simple modelling process.", ["State the question and assumptions.", "Use a calculation or diagram.", "Check the model against the situation."], "A model should be checked, not treated as automatically correct."),
  ],
  "data-and-chance-data-displays": [
    pairs("Match each display feature to its job.", [["Title", "States the topic"], ["Axis label", "Names what is measured"], ["Scale", "Shows numerical intervals"]], "Readers need labels and an appropriate scale."),
    fill("A bar showing 5 votes and another showing 7 votes represent a total of", "12", "The combined vote count is five plus seven, or twelve.", ""),
    sort("Sort these graph scales.", ["Equal intervals", "Unequal intervals"], [["0, 2, 4, 6", 0], ["0, 5, 10, 15", 0], ["0, 1, 5, 20", 1]], "A regular numerical scale uses equal intervals."),
  ],
  "data-and-chance-averages": [
    pairs("Match the measure to its meaning.", [["Mean", "Sum divided by number of values"], ["Median", "Middle of ordered values"], ["Mode", "Most frequent value"]], "Different averages describe a data set in different ways."),
    fill("The mean of 2, 4 and 6 is", "4", "The sum is twelve and there are three values.", ""),
    sequence("Order these values before finding the median.", ["3", "5", "8", "10", "12"], "The middle value of this ordered set is eight."),
  ],
  "data-and-chance-chance": [
    sort("Sort these events for one roll of a standard six-sided die.", ["Possible", "Impossible"], [["Roll a 3", 0], ["Roll a 6", 0], ["Roll a 9", 1]], "A standard die has faces numbered one through six."),
    fill("A fair coin has", "2", "Heads and tails are the two possible outcomes.", " possible outcomes."),
    pairs("Match each probability description.", [["Certain", "Must happen"], ["Impossible", "Cannot happen"], ["Equally likely", "Outcomes have the same chance"]], "Chance describes possibilities, not a guarantee of a particular next result."),
  ],
  "data-and-chance-comparing-group-averages": [
    pairs("Match each group to its mean.", [["Group A: 2, 4, 6", "4"], ["Group B: 4, 6, 8", "6"], ["Group C: 6, 8, 10", "8"]], "Calculate each group's mean using its own values."),
    fill("Group means of 7 and 10 differ by", "3", "Subtract seven from ten.", ""),
    sort("Sort claims about groups with means 4 and 6.", ["Supported by the means", "Not established by the means"], [["The second mean is larger.", 0], ["Every person in the second group has a larger value.", 1], ["The means differ by two.", 0]], "A mean describes a group, not every individual in it."),
  ],
  "shape-and-measure-shape-properties": [
    sort("Sort these shapes by number of sides.", ["Three sides", "Four sides"], [["Triangle", 0], ["Square", 1], ["Rectangle", 1]], "Triangles have three sides; quadrilaterals have four."),
    fill("A right angle measures", "90", "A quarter-turn is ninety degrees.", " degrees."),
    pairs("Match each shape property.", [["Parallel lines", "Stay the same distance apart"], ["Perpendicular lines", "Meet at a right angle"], ["Line of symmetry", "Divides a shape into mirror halves"]], "These properties help describe and classify shapes."),
  ],
  "shape-and-measure-maps": [
    pairs("Match the direction to its opposite.", [["North", "South"], ["East", "West"]], "Opposite directions point away from each other."),
    fill("Moving 3 squares east, then 2 more east, moves you", "5", "Add distances in the same direction.", " squares east."),
    sequence("Order the route described: first north, then east, then south.", ["Move two squares north.", "Move one square east.", "Move one square south."], "Follow directions in the order given."),
  ],
  "shape-and-measure-units-and-time": [
    pairs("Match each quantity.", [["1 metre", "100 centimetres"], ["1 hour", "60 minutes"], ["1 kilogram", "1,000 grams"]], "Unit conversions express the same quantity differently."),
    fill("A trip starts at 2:10 and lasts 25 minutes. It ends at", "2:35", "Add twenty-five minutes to ten minutes past two.", ""),
    sort("Choose units suitable for each measurement.", ["Centimetres", "Kilometres"], [["Length of a pencil", 0], ["Distance between cities", 1], ["Width of a notebook", 0]], "Choose a unit suited to the scale of the measurement."),
  ],
  "shape-and-measure-area-and-perimeter": [
    pairs("Match each measurement for a 4 cm by 3 cm rectangle.", [["Area", "12 square centimetres"], ["Perimeter", "14 centimetres"]], "Area measures the inside; perimeter measures the boundary."),
    fill("The area of a rectangle 5 cm long and 2 cm wide is", "10", "Multiply length by width.", " square centimetres."),
    sort("Sort the tasks by the measurement needed.", ["Area", "Perimeter"], [["Cover a floor with tiles", 0], ["Fence a rectangular garden", 1], ["Paint a flat wall", 0]], "Covering uses area; measuring around an edge uses perimeter."),
  ],
  "money-decisions-payments-and-change": [
    pairs("Match each purchase to its change from $10.", [["Cost: $7", "$3"], ["Cost: $4", "$6"], ["Cost: $9", "$1"]], "Subtract cost from the amount paid."),
    fill("Paying $20 for an item costing $13 gives change of $", "7", "Twenty minus thirteen equals seven.", ""),
    sequence("Order these prices from lowest to highest.", ["$2.50", "$4.25", "$7.00"], "Compare dollars and then cents."),
  ],
  "money-decisions-financial-decisions": [
    sort("Sort purchases for a school day.", ["Need", "Want"], [["Basic lunch food", 0], ["Optional collectible toy", 1], ["Required school supplies", 0]], "Needs are essential in this stated situation; wants are optional."),
    fill("Saving $4 each week for 5 weeks gives $", "20", "Multiply four by five.", ""),
    pairs("Match each financial term.", [["Budget", "Plan for income and spending"], ["Saving", "Keep money for later"], ["Cost", "Amount paid for something"]], "A budget helps compare available money with expenses."),
  ],
  "mathematical-thinking-learning-strategies": [
    pairs("Match each strategy to its purpose.", [["Draw a model", "Make relationships visible"], ["Estimate", "Check whether an answer is reasonable"], ["Ask a question", "Clarify something unclear"]], "Different strategies help with different learning needs."),
    fill("A rough calculation used to check reasonableness is an", "estimate", "An estimate is approximate, not an exact calculation."),
    sequence("Order a useful response to being stuck.", ["Identify the step that is unclear.", "Try a model or ask a specific question.", "Check the new reasoning."], "Reflect and choose a strategy instead of giving up."),
  ],
  "mathematical-thinking-mathematical-communication": [
    sort("Sort mathematical statements.", ["Includes reasoning", "Only states an answer"], [["12, because 3 groups of 4 make 12.", 0], ["The answer is 12.", 1], ["24, because doubling 12 gives 24.", 0]], "An explanation shows why the result follows."),
    fill("The symbol = means both sides have the same", "value", "Equality compares values rather than simply marking where an answer goes."),
    pairs("Match each representation.", [["Array", "Rows and columns of objects"], ["Number line", "Values marked along a line"], ["Equation", "Two equal expressions"]], "Representations communicate relationships in different ways."),
  ],
  "fraction-detectives": [
    fractionDiagram,
    fill("1/6 + 3/6 =", ["4/6", "2/3"], "Add the numerators when the parts are the same size. Four sixths also simplifies to two thirds.", ""),
    pairs("Match equal amounts.", [["1/2", "5/10"], ["1/3", "3/9"], ["2/3", "6/9"]], "Scale both parts of a fraction by the same factor."),
  ],
};
