var EMAIL_JSON = {
    token: "",
    customer_email: "",
    customer_name: "",
    email_content: ""
};

const LOGIN = {
    "username": "alpod-net",
    "password": "alpod-net-21"
}

const SUCCESS_TEXT = "Váš požadavek byl odeslán, brzy se mu bude někdo věnovat.";;
const SUCCESS_ICON = "<p><i class=\"fas fa-check-circle\" style=\"color: green;\"></i><strong> Děkujeme!</p>";

const VERIFY_FAIL_TEXT = "Google reCaptcha má problém s rozpoznáním. Omlouváme se, zkuste to prosím později nebo nás kontaktujte telefonem či emailem";;

const GLOBAL_ERROR_ICON = "<p><i class=\"fas fa-times-circle\" style=\"color: red;\"></i><strong> OOoops!</p>";

const ERROR_TEXT = "Máme problémy s ověřením, kontaktujte nás prosím emailem nebo telefonicky.";;


var RECAPTCHA_RESPONSE = ""

const DEV_API_EDNPOINT = "http://localhost:8080/alpodgroup_send";
const PROD_API_ENDPOINT = "https://rb-alpod-net.vm-01.alpod.net/alpodgroup_send"

function verifyCaptcha(token) {
    RECAPTCHA_RESPONSE = token;
    document.getElementById('g-recaptcha-error').innerHTML = '';

    EMAIL_JSON.token = token;
    return true
}


function fill_json(field_id) {
    // TADY SE VYPLNÍ JSON Z POLÍČEK PRO EMAIL
    switch (field_id) {
        case "emailInput":
            EMAIL_JSON.customer_email = document.getElementById("emailInput").value;

        case "nameInput":
            EMAIL_JSON.customer_name = document.getElementById("nameInput").value;

        case "textInput":
            EMAIL_JSON.email_content = document.getElementById("textInput").value;
    }
}


function submitUserForm() {
    if (RECAPTCHA_RESPONSE.length == 0) {
        document.getElementById('g-recaptcha-error').innerHTML = '<span style="color:red;">This field is required.</span>';
        return false;
    }
    return true;
}


document.getElementById("sendEmail").addEventListener("click", function(event) {
    // ZÁKAZ SUBMITU A PROVÉST VLASTNÍ AKCI
    event.preventDefault();

    // LOADER NEŽ PŘIJDE RESPONSE ZE SERVERU
    var fetch_preloader = document.getElementById("fetch-preloader");

    fetch_preloader.style.display = "block";

    fetch(PROD_API_ENDPOINT, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Authorization': 'Basic ' + btoa(LOGIN.username + ":" + LOGIN.password),
                'Content-Type': 'application/json',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(EMAIL_JSON) // body data type must match "Content-Type" header
        })
        .then(response => {

            if (response.status == 403) {
                console.log("Neni to ok")
                fetch_preloader.style.display = "none";
                fill_modal(VERIFY_FAIL_TEXT, GLOBAL_ERROR_ICON);
                return;
            }

            if (response.status == 422) {
                fetch_preloader.style.display = "none";
                response.json().then(data => response_check(data.detail));
                return;
            }

            if (response.ok) {
                fetch_preloader.style.display = "none";

                fill_modal(SUCCESS_TEXT, SUCCESS_ICON);
                reset_form();
            }

            return response.json()

        }).catch((error) => {

            console.log(error.status)

            fetch_preloader.style.display = "none";

            fill_modal(ERROR_TEXT, GLOBAL_ERROR_ICON);
            reset_form();
        });
});

function response_check(data) {

    document.getElementById("emailInput").style.boxShadow = "0px 0 25px 0 rgb(0 0 0 / 15%)"
    document.getElementById("nameInput").style.boxShadow = "0px 0 25px 0 rgb(0 0 0 / 15%)"
    document.getElementById("textInput").style.boxShadow = "0px 0 25px 0 rgb(0 0 0 / 15%)"

    const token_text = "Zaškrtněte, že nejste robot.";
    const name_text = "Musíte vyplnit jméno.";
    const email_empty = "Musíte vyplnit email.";
    const invalid_email = "Email není validní.";
    const content_empty = "Musíte vyplnit text, který chcete poslat.";

    var texts = [];

    for (var i = 0; i < data.length; i++) {
        if (data[i].msg == "Token is empty") {
            texts.push(token_text);
        } else if (data[i].msg == "Email address is not given!") {
            document.getElementById("emailInput").style.boxShadow = "0px 0 25px 0 rgb(225 0 0 / 45%)"
            texts.push(email_empty);
        } else if (data[i].msg == "Customer name is empty") {
            document.getElementById("nameInput").style.boxShadow = "0px 0 25px 0 rgb(225 0 0 / 45%)"
            texts.push(name_text);
        } else if (data[i].msg == "Email content is empty") {
            document.getElementById("textInput").style.boxShadow = "0px 0 25px 0 rgb(225 0 0 / 45%)"
            texts.push(content_empty);
        } else {
            document.getElementById("emailInput").style.boxShadow = "0px 0 25px 0 rgb(225 0 0 / 45%)"
            texts.push(invalid_email);
        }
    }

    fill_modal_422(texts);
}


const modal_button = document.getElementById("modal-launcher");
const modal_head = document.getElementsByClassName("modal-title")[0];
const modal_body = document.getElementsByClassName("modal-body")[0];

function fill_modal(text, icon) {

    modal_head.innerHTML = icon;
    modal_body.innerHTML = "<p><strong>" + text + "</p>";

    modal_button.click();
}

function fill_modal_422(texts) {
    var icon = "<p><i class=\"fas fa-times-circle\" style=\"color: red;\"></i><strong> Ooops!</p>";

    modal_head.innerHTML = icon;
    modal_body.innerHTML = "";

    for (var i = 0; i < texts.length; i++) {
        modal_body.innerHTML += "<p><strong>" + texts[i] + "</p>";
    }

    modal_button.click();
}

function reset_form() {
    EMAIL_JSON.token = "";
    EMAIL_JSON.customer_email = "";
    EMAIL_JSON.customer_name = "";
    EMAIL_JSON.email_content = "";

    document.getElementById("emailInput").value = "";
    document.getElementById("nameInput").value = "";
    document.getElementById("textInput").value = "";
    grecaptcha.reset();
}


document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", event => {

        var elements = document.querySelectorAll(".nav-item");

        [].forEach.call(elements, function(el) {
            el.classlList.remove("active");
        });

        item.classList.add("active");
    })
})

document.querySelectorAll(".test").forEach((element) => {
    element.addEventListener("click", function () {
        let icon = this.querySelector("i");
        
        if (this.classList.contains("open")) {
            this.classList.remove("open");

            icon.classList.remove("gg-math-minus");
            icon.classList.add("gg-math-plus");
        } else {
            this.classList.add("open");

            icon.classList.add("gg-math-minus");
            icon.classList.remove("gg-math-plus");
        }
    });
});
