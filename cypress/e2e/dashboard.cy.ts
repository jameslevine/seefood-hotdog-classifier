// E2E: the audit dashboard renders KPIs and the records table. Runs locally.
describe("Dashboard", () => {
  it("shows KPI tiles and the recent classifications table", () => {
    cy.visit("/dashboard");
    cy.contains("Classification Dashboard");
    cy.contains("Total classifications");
    cy.contains("Recent classifications");
    // At least the table header renders even with data.
    cy.contains("th", "Verdict");
    cy.contains("th", "Confidence");
  });
});
