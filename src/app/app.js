import { select } from "d3-selection";
import { json } from "d3-fetch";
import localApiData from "../data/data";

import "./app.scss";

const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const fetchData = async () => {
  let res = null;

  try {
    res = await json(dataUrl);
    return res;
  } catch (e) {
    console.error(e.message);
  }

  return res;
};

const runApp = async () => {
  let dataset = await fetchData();
  if (!dataset) dataset = localApiData;

  console.log(dataset);

  select(".js-d3").html("");
};

export default runApp;
