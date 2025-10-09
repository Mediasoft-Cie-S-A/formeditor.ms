/*
 * Placeholder workflow component implementation.
 * The component currently renders a minimal container so the editor
 * can add workflow blocks once the feature is implemented.
 */

function createElementWorkflow(type) {
  const container = document.createElement('div');
  container.className = 'form-container workflow-component';
  container.id = `${type}${Date.now()}`;
  container.draggable = true;
  container.setAttribute('tagName', type);

  const placeholder = document.createElement('div');
  placeholder.className = 'workflow-component__placeholder';
  placeholder.textContent = 'Workflow component placeholder';

  container.appendChild(placeholder);
  return container;
}

function editElementWorkflow(type, element, content) {
  const message = document.createElement('p');
  message.className = 'workflow-component__editor-message';
  message.textContent = 'No workflow properties are available for editing yet.';
  content.appendChild(message);
}
