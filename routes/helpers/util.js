const Report = require("../../models/reports");
const tf_use = require("@tensorflow-models/universal-sentence-encoder");
const tf = require("@tensorflow/tfjs-node");

let model;

async function loadModel() {
  model = await tf_use.load();
}

module.exports = {
  findSimilarReports: async (report) => {
    try {
      const { title, description, reportType } = report;

      // Encode the input report's title and description
      const inputTitle = await model.embed([title]);
      const inputDescription = await model.embed([description]);

      // Find all reports of the same type, and fetch only the titles and descriptions
      const reports = await Report.find({ reportType });

      // Extract the titles and descriptions from the reports
      const titles = reports.map((report) => report.titleEmbedding);
      const descriptions = reports.map((report) => report.descriptionEmbedding);

      // Compute the cosine similarity between the input report and all reports
      const titleSimilarities = await cosineSimilarity(
        inputTitle,
        tf.tensor(titles)
      );
      const descriptionSimilarities = await cosineSimilarity(
        inputDescription,
        tf.tensor(descriptions)
      );

      console.log("titleSimilarities: ", titleSimilarities);
      console.log("descriptionSimilarities: ", descriptionSimilarities);

      // Combine the similarities and filter reports above the threshold
      const similarReports = reports.filter((_, i) => {
        const titleSimilarity = titleSimilarities[i];
        const descriptionSimilarity = descriptionSimilarities[i];
        return (
          titleSimilarity > 0.8 /* High for title */ ||
          descriptionSimilarity > 0.7 /* Low for description */
        );
      });

      return similarReports.map((report) => {
        const { titleEmbedding, descriptionEmbedding, ...rest } =
          report.toObject();
        return rest;
      });
    } catch (error) {
      console.error(error);
      return {
        title: "Error",
        description:
          "An error occurred while finding similar reports: " + error,
      };
    }
  },
  loadModel,
  getModel: () => model,
};

// Helper function to compute cosine similarity between two tensors
async function cosineSimilarity(tensor1, tensor2) {
  // Normalize the tensors
  const norm1 = tf.norm(tensor1, 2, -1, true);
  const norm2 = tf.norm(tensor2, 2, -1, true);
  const normalized1 = tensor1.div(norm1);
  const normalized2 = tensor2.div(norm2);

  // Compute the dot product
  const dotProduct = tf.matMul(normalized1, normalized2, false, true);
  const similarities = await dotProduct.array();

  return similarities[0];
}
