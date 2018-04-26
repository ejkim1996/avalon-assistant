(function () {
    // These are the constraints used to validate the form
    const constraints = {
        gameID: {
            //gameID is required
            presence: true
        },
        // characters: {
        //     presence: true,
        //     length: {
        //         minimum: 1
        //     }
        // },
        numberOfCharacters: {
            numericality: {
                onlyInteger: true,
                greaterThanOrEqualTo: 5,
                lessThanOrEqualTo: 10,
            }
        }
    };

    // Recusively finds the closest parent that has the specified class
    function closestParent(child, className) {
        if (!child || child === document) {
            return null;
        }
        if (child.classList.contains(className)) {
            return child;
        } else {
            return closestParent(child.parentNode, className);
        }
    }

    function resetFormGroup(formGroup) {
        // Remove the success and error classes
        formGroup.classList.remove("has-error");
        formGroup.classList.remove("has-success");
        // and remove any old messages
        formGroup.querySelectorAll(".help-block.error").forEach(el => {
            el.parentNode.removeChild(el);
        });
    }

    // Adds the specified error with the following markup
    // <p class="help-block error">[message]</p>
    function addError(messages, error) {
        const block = document.createElement("p");
        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;

        messages.appendChild(block);
    }

    // Shows the errors for a specific input
    function showErrorsForInput(input, errors) {
        // This is the root of the input
        const formGroup = closestParent(input.parentNode, "form-group")
            // Find where the error messages will be insert into
            , messages = formGroup.querySelector(".messages");
        // First we remove any old messages and resets the classes
        resetFormGroup(formGroup);
        // If we have errors
        if (errors) {
            // we first mark the group has having errors
            formGroup.classList.add("has-error");
            // then we append all the errors
            errors.forEach(error => {
                addError(messages, error);
            });
            // _.each(errors, function (error) {
            //     addError(messages, error);
            // });
        } else {
            // otherwise we simply mark it as success
            formGroup.classList.add("has-success");
        }
    }

    function addNumCharsToForm(form) {
        let numChars = 0;
        numChars = numChars + form.querySelectorAll('.active').length;
        numChars = numChars + +form.querySelector('#numberOfServants').value;
        numChars = numChars + +form.querySelector('#numberOfMinions').value;
        const numCharsInput = form.querySelector('#numberOfCharacters');

        numCharsInput.value = numChars;
    }

    // Hook up the form so we can prevent it from being posted
    const form = document.querySelector("form");

    const inputs = document.querySelectorAll("input, textarea, select");

    // Updates the inputs with the validation errors
    function showErrors(form, errors) {
        console.log(form.querySelectorAll("input[name], select[name]"));

        // // We loop through all the inputs and show the errors for that input
        form.querySelectorAll("input[name], select[name]").forEach(input => {
            showErrorsForInput(input, errors && errors[input.name]);

        });
    }

    function handleFormSubmit(form, input) {
        // validate the form against the constraints
        const errors = validate(form, constraints);
        console.log(errors);

        // then we update the form to reflect the results
        showErrors(form, errors || {});
        if (!errors) {
            form.submit();
        }
    }

    form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        addNumCharsToForm(form);
        form.querySelector('.gameIDError').textContent = '';
        handleFormSubmit(form);
    });

    // Hook up the inputs to validate on the fly
    for (let i = 0; i < inputs.length; ++i) {
        inputs.item(i).addEventListener("change", function (/* ev */) {
            const errors = validate(form, constraints) || {};
            showErrorsForInput(this, errors[this.name]);
        });
    }
})();