doc_ready(main);

function doc_ready(fn) {
    // see if DOM is already available
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

const _ = undefined;


// start from here
function main() { 
    let confirm_btn = document.querySelector("#confirm-btn");
    let scale = chroma.scale(['#d0e8f2', '#d0e8f2', '#e6e6e6', '#ff9b93']).mode('lch');
    let input_area = document.querySelector("#input-txt");
    let database = {"data": "", "updating": false};
    
    confirm_btn.addEventListener("click", ()=>{
        update_data(database);
        execute(input_area, scale, database);
    });

    document.getElementById("clear-btn").addEventListener("click", ()=>{
        input_area.innerHTML = input_area.innerText || input_area.textContent;
    })

    let threshold_slider = document.getElementById("threshold-slider"),
        threshold_value = document.getElementById("threshold-value");
    threshold_slider.addEventListener("input", ()=>{
        threshold_value.innerHTML = threshold_slider.value / 100;
        execute(input_area, scale, database);
    });
}

function execute(input_area, scale, database) {
    console.log(database.updating)
    if(database.updating == true) {
        setTimeout(() => { execute(input_area, scale, database); }, 100);
    }
    input_area.innerHTML = input_area.innerText || input_area.textContent;
    
    let threshold_slider = document.getElementById("threshold-slider");
    let threshold = threshold_slider.value / 100;

    let txt = input_area.innerText || input_area.textContent;
    let word_score = JSON.parse(database.data);
    let unique_words = txt.match(/\b(\w+)\b/g).filter(onlyUnique);
    unique_words.forEach((word) => {
        if(word_score[word.toLowerCase()] >= threshold) {
            let scale_ratio = word_score[word.toLowerCase()].toPrecision(2);
            // let scale_ratio = (word_score[word]-threshold)/(1-threshold);
            let color = scale(scale_ratio).hex();
            let re = new RegExp("([^a-zA-Z<>])(" + word + ")([^a-zA-Z<>])","g");
            input_area.innerHTML = input_area.innerHTML.replace(re, "\$1<span class='highlight' style='background:"+color+"'>\$2</span>\$3");
        }
    });

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
}

function update_data(database) {
    database.updating = true;
    let checkbox1 = document.getElementById("fakeandrealnews"),
        checkbox2 = document.getElementById("sourcebasedfakenews");
    if(checkbox1.checked) {
        read_file("data/Fake_and_real_news_dataset.json", (data)=>{
            database.data = data;
            database.updating = false;
        });
    }
    else if(checkbox2.checked) {
        read_file("data/Source_based_Fake_News_Classification.json", (data)=>{
            database.data = data;
            database.updating = false;
        })
    }
}


// read external files
function read_file(fpath, callback) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", fpath, true);
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status == "200") {
            callback(this.responseText);
        }
    };
    xmlhttp.send();
}