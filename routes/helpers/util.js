const Report = require("../../models/reports");
const tf_use = require("@tensorflow-models/universal-sentence-encoder");
const tf = require("@tensorflow/tfjs-node");

module.exports = {
  findSimilarReports: async (report) => {
    const { title, description, reportType } = report;

    // Load the Universal Sentence Encoder model
    const model = await tf_use.load();

    // Encode the input report's title and description
    const inputTitle = await model.embed([title]);
    const inputDescription = await model.embed([description]);

    // Find all reports of the same type
    const reports = await Report.find({ reportType });

    // Encode the titles and descriptions of all reports
    const titles = await model.embed(reports.map((r) => r.title));
    const descriptions = await model.embed(reports.map((r) => r.description));

    // Compute the cosine similarity between the input report and all reports
    const titleSimilarities = await cosineSimilarity(inputTitle, titles);
    const descriptionSimilarities = await cosineSimilarity(
      inputDescription,
      descriptions
    );

    // Combine the similarities and filter reports above the threshold
    const similarityThreshold = 0.8;
    const similarReports = reports.filter((_, i) => {
      const titleSimilarity = titleSimilarities[i];
      const descriptionSimilarity = descriptionSimilarities[i];
      return (
        titleSimilarity > similarityThreshold ||
        descriptionSimilarity > similarityThreshold
      );
    });

    return similarReports;
  },
};

// Helper function to compute cosine similarity between two tensors
async function cosineSimilarity(tensor1, tensor2) {
  const normalized1 = tf.l2Normalize(tensor1, 1);
  const normalized2 = tf.l2Normalize(tensor2, 1);
  const dotProduct = tf.matMul(normalized1, normalized2, false, true);
  const similarities = await dotProduct.data();
  return Array.from(similarities);
}
