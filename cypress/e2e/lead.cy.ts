// E2E: the contact/lead-capture flow. Runs locally against a live server.
describe("Lead capture", () => {
  it("submits the contact form and shows a success state", () => {
    cy.visit("/contact");
    cy.get('input[name="name"]').type("Cypress Tester");
    cy.get('input[name="email"]').type("cypress@example.com");
    cy.get('input[name="company"]').type("QA Corp");
    cy.get('textarea[name="message"]').type("Evaluating SeeFood for our team.");
    cy.contains("button", "Book a demo").click();
    cy.contains("we'll be in touch", { matchCase: false, timeout: 15000 });
  });

  it("validates a bad email", () => {
    cy.visit("/contact");
    cy.get('input[name="name"]').type("Bad Email");
    // Bypass native email validation to exercise the server-side check.
    cy.get('input[name="email"]').invoke("attr", "type", "text").type("nope");
    cy.contains("button", "Book a demo").click();
    cy.contains("valid work email", { timeout: 15000 });
  });
});
