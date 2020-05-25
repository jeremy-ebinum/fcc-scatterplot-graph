import "./styles/main.scss";
import runApp from "./app/app";

// Freecodecamp Test Script
localStorage.setItem("project_selector", "scatter-plot");

runApp();

if (module.hot) {
  module.hot.accept("./app/app", () => {
    runApp();
  });
}
