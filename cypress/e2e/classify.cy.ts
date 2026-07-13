// E2E: the core flow — land on marketing, go to the classifier, upload a hot
// dog, and confirm the verdict renders. Runs locally against a live server
// (real Bedrock/AWS), not in CI.
describe("Classify flow", () => {
  it("navigates from marketing to the classifier", () => {
    cy.visit("/");
    cy.contains("Know for certain.");
    cy.contains("a", "Start classifying").click();
    cy.location("pathname").should("eq", "/app");
  });

  it("classifies a hot dog image and shows the verdict", () => {
    cy.visit("/app");
    cy.get('input[type="file"]').selectFile("cypress/fixtures/hotdog.jpg", {
      force: true,
    });
    // Bedrock inference can take a couple of seconds.
    cy.contains("Classification result", { timeout: 30000 });
    cy.contains("Hot Dog");
    cy.contains("Model confidence");
  });
});
