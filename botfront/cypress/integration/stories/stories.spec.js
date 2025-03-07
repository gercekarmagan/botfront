/* eslint-disable no-undef */

const storyGroupOne = 'storyGroupOne';
const storyGroupTwo = 'storyGroupTwo';
const initialText = '## storyGroupOne';
const testText = '## 1234567890 mais alors je ne comprend pas';

describe('stories', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    it('should be able to add and delete stories', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.get('[data-cy=add-item]').click();
        cy.get('[data-cy=add-item] input').type(`${storyGroupOne}{enter}`);
        cy.dataCy('story-editor').get('textarea');
        cy.dataCy('add-story').click();
        cy.dataCy('story-editor').should('have.lengthOf', 2);
        cy.get('[data-cy=delete-story]')
            .first()
            .click();
        cy.dataCy('confirm-yes').click();
        cy.get('[data-cy=delete-story]').click();
        cy.dataCy('confirm-yes').click();
        cy.contains(storyGroupTwo).should('not.exist');
    });

    it('should autosave stories as you edit them', function() {
        cy.visit(`/project/${this.bf_project_id}/stories`);
        cy.get('[data-cy=add-item]').click();
        cy.get('[data-cy=add-item] input').type(`${storyGroupOne}{enter}`);
        cy.get('[data-cy=add-item]').click();
        cy.get('[data-cy=add-item] input').type(`${storyGroupTwo}{enter}`);
        cy.contains(storyGroupOne).click();
        cy.dataCy('story-editor')
            .contains(initialText);
        cy.dataCy('story-editor')
            .get('textarea')
            .type(`{selectall}{backspace}${testText}`, { force: true });
        cy.wait(500);
        cy.contains(storyGroupTwo).click();
        cy.contains(storyGroupOne).click();
        cy.contains(initialText).should('not.exist');
        cy.get('[data-cy=delete-story]').click();
        cy.dataCy('confirm-yes').click();
        cy.contains(storyGroupTwo).click();
        cy.get('[data-cy=delete-story]').click();
        cy.dataCy('confirm-yes').click();
    });
});
