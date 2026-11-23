import type { SubjectModule } from "./types";

export const science: SubjectModule = {
  slug: "science",
  title: "Science",
  theme: "science",
  tagline: "Stay curious. Ask why.",
  description: "Follow your questions and discover how our amazing planet works.",
  lessons: [{
    slug: "water-on-the-move",
    title: "Water on the move",
    durationMinutes: 12,
    introduction: "The water in your glass might once have been in an ocean, a cloud, or a dinosaur's drinking puddle. Water keeps moving through the water cycle!",
    sections: [
      { heading: "Up into the air: evaporation", body: "Energy from the Sun warms water in oceans, lakes, and puddles. Some liquid water becomes water vapor, an invisible gas, and enters the air. This is evaporation. Water can evaporate without boiling." },
      { heading: "Cloud clues: condensation", body: "When water vapor cools, it can turn into tiny liquid droplets. This is condensation. Clouds contain tiny water droplets or ice crystals, not just invisible vapor. Droplets on the outside of a cold glass also form by condensation." },
      { heading: "Back to Earth: precipitation", body: "Water falls from clouds as rain, snow, sleet, or hail. We call this precipitation. Water then collects in rivers, lakes, oceans, or the ground. The cycle has no single starting point: water keeps moving between places and forms." },
    ],
    questions: [
      { id: "evaporation", prompt: "What happens during evaporation?", options: ["Water vapor turns into liquid", "Liquid water turns into water vapor", "Snow falls from a cloud"], answerIndex: 1, explanation: "Evaporation changes liquid water into water vapor. Energy from the Sun helps drive it." },
      { id: "glass", prompt: "Droplets form on the outside of a cold glass. What caused them?", options: ["Condensation of water vapor in the air", "Water leaking through the glass", "Precipitation from the ceiling"], answerIndex: 0, explanation: "Water vapor in the surrounding air cools near the glass and condenses into droplets." },
      { id: "precipitation", prompt: "Which is an example of precipitation?", options: ["A puddle drying up", "A cloud forming", "Snow falling to the ground"], answerIndex: 2, explanation: "Precipitation is water falling from clouds, including rain, snow, sleet, and hail." },
    ],
  }],
};
