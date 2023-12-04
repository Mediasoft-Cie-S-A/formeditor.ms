x

document.getElementById('formDataForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("submit");

    var formId = document.getElementById('formId').value;
    var formName = document.getElementById('formName').value;
    var formPath = document.getElementById('formPath').value;
    var userCreated = document.getElementById('userCreated').value;
    var userModified = document.getElementById('userModified').value;

    var formContainer = document.getElementById('formContainer');
    var jsonData = domToJson(formContainer);
    console.log(jsonData);

    const formData = {
        formId: formId,
        formName: formName,
        formPath: formPath,
        userCreated: userCreated,
        userModified: userModified,
        modificationDate: new Date(),
        creationDate: new Date(),
        formData: jsonData // Assuming formDataJson is a valid JSON string
    };

    // Check if form exists
    fetch(`/get-form/${formId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Form does not exist');
            }
        })
        .then(existingForm => {
            // If form exists, update it
            return fetch(`/update-form/${formId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
        })
        .catch(error => {
            // If form does not exist, store it
            return fetch('/store-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
        })
        .then(response => response.json())
        .then(data => {
            showToast('Success!', 5000); // Show toast for 5 seconds
            console.log('Success:', data);
        })
        .catch((error) => {
            showToast('Error! ' + error, 5000); // Show toast for 5 seconds
            console.error('Error:', error);
        });
});


function showToast(message, duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('toast-message');
    toast.textContent = message;

    // Add the toast to the container
    toastContainer.appendChild(toast);

    // Make the toast visible
    setTimeout(() => {
        toast.style.opacity = 1;
    }, 100);

    // Hide and remove the toast after 'duration'
    setTimeout(() => {
        toast.style.opacity = 0;
        toast.addEventListener('transitionend', () => toast.remove());
    }, duration);
}