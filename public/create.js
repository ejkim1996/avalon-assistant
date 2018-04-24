(function () {
    // These are the constraints used to validate the form
    const constraints = {
        gameID: {
            //gameID is required
            presence: true
        },
        characters: {
            presence: true,
            length: {
                minimum: 1
            }
        }
        // numChars: {
        //     numericality: {
        //         onlyInteger: true,
        //         greaterThan: 5,
        //         lessThanOrEqualTo: 10,
        //     }
        // },
        // duration: {
        //     numericality: {
        //         onlyInteger: true,
        //         greaterThan: 0,
        //         lessThanOrEqualTo: 30,
        //         even: true,
        //         notEven: "must be evenly divisible by two"
        //     }
        // },
        // email: {
        //     // Email is required
        //     presence: true,
        //     // and must be an email (duh)
        //     email: true
        // },
        // password: {
        //     // Password is also required
        //     presence: true,
        //     // And must be at least 5 characters long
        //     length: {
        //         minimum: 5
        //     }
        // },
        // "confirm-password": {
        //     // You need to confirm your password
        //     presence: true,
        //     // and it needs to be equal to the other password
        //     equality: {
        //         attribute: "password",
        //         message: "^The passwords does not match"
        //     }
        // }
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
        // _.each(formGroup.querySelectorAll(".help-block.error"), function (el) {
        //     el.parentNode.removeChild(el);
        // });
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

    function showSuccess() {
        // We made it \:D/
        alert("Success!");
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

    // Hook up the form so we can prevent it from being posted
    const form = document.querySelector("form");

    const inputs = document.querySelectorAll("input, textarea, select");

    // Updates the inputs with the validation errors
    function showErrors(form, errors) {
        console.log(form.querySelectorAll("input[name], select[name]"));
        
        form.querySelectorAll("input[name], select[name]").forEach(input => {
            showErrorsForInput(input, errors && errors[input.name]);
            
        });
        // // We loop through all the inputs and show the errors for that input
        // _.each(form.querySelectorAll("input[name], select[name]"), function (input) {
        //     // Since the errors can be null if no errors were found we need to handle
        //     // that
        //     showErrorsForInput(input, errors && errors[input.name]);
        // });
    }
    
    function handleFormSubmit(form, input) {
        // validate the form against the constraints
        const errors = validate(form, constraints);
        console.log(errors);
        
        // then we update the form to reflect the results
        showErrors(form, errors || {});
        if (!errors) {
            showSuccess();
        }
    }

    form.addEventListener("submit", function (ev) {
        ev.preventDefault();
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