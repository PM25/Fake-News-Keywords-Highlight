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
    let scale = chroma.scale(['#70a8ffaa', '#70a8ffaa', '#e6e6e6ff', '#ff6b63ff']).mode('lch');
    let input_area = document.querySelector("#input-txt");
    let database = {"data": "", "updating": false};
    
    let switchbtnstatus = false;
    let switchbtn = document.getElementById("switchbtn");
    switchbtn.addEventListener("click", ()=>{
        switchbtn.classList.toggle("active-btn");
        if(switchbtn.classList.contains("active-btn")) {
            execute(input_area, scale, database);
        } else {
            input_area.innerHTML = input_area.innerText || input_area.textContent;
        }
    });

    let wordcloud = document.getElementById("wordcloud");
    wordcloud.addEventListener("click", ()=>{
        text = input_area.innerText || input_area.textContent;
        text = text.replace(/[\W_]+/g, " ");
        words = text.split(' ');
        word_counts = {}
        words.forEach((word) => {
            if(word.length > 0) {
                word_counts[word] = (word_counts[word] || 0) + 1
            }
        });
        link = "http://docusky.org.tw/DocuSky/docuTools/WordCloudLite/WordCloudLite.html?data="
        for (let [k, v] of Object.entries(word_counts)) {
            link += k + "," + v + ";"
        }
        window.open(link, '_blank');
    });

    input_area.addEventListener("input", ()=>{
        // if(switchbtnstatus == true) {
        //     execute(input_area, scale, database);
        // }
    });

    let dataset_dropdown = document.querySelector("#dataset-dropdown");
    let dataset_dropdown_content = dataset_dropdown.querySelector("#dataset-dropdown .dropdown-content");
    dataset_dropdown.addEventListener("click", ()=>{
        dataset_dropdown_content.classList.toggle("active");
    });

    let first_li_text = dataset_dropdown_content.querySelector("li").innerText;
    dataset_dropdown.querySelector(".selected").innerText = first_li_text
    update_data(first_li_text, database);
    dataset_dropdown_content.querySelectorAll("li").forEach((li) => {
        li.addEventListener("click", ()=>{
            dataset_dropdown.querySelector(".selected").innerText = li.innerText;
            update_data(li.innerText, database);
            if(switchbtnstatus == true) {
                execute(input_area, scale, database);
            }
        });
    });

    let threshold_slider = document.getElementById("threshold-slider"),
        threshold_value = document.getElementById("threshold-value");
    threshold_slider.addEventListener("input", ()=>{
        threshold_value.innerHTML = threshold_slider.value / 100;
        if(switchbtnstatus == true) {
            execute(input_area, scale, database);
        }
    });
}

function execute(input_area, scale, database) {
    // console.log(database.updating);
    if(database.updating == true) {
        setTimeout(() => { execute(input_area, scale, database); }, 50);
    } else {
        input_area.innerHTML = input_area.innerText || input_area.textContent;
    
        let threshold_slider = document.getElementById("threshold-slider");
        let threshold = threshold_slider.value / 100;

        let txt = input_area.innerText || input_area.textContent;
        let word_score = database.data;
        let unique_words = txt.match(/\b(\w+)\b/g).filter(onlyUnique);
        unique_words.forEach((word) => {
            if(word_score[word.toLowerCase()] >= threshold) {
                let scale_ratio = word_score[word.toLowerCase()].toPrecision(2);
                let color = scale(scale_ratio).hex();
                // the match word can't have any character next to it
                let re = new RegExp("([^a-zA-Z<>])(" + word + ")([^a-zA-Z<>])","g");
                let text = " " + input_area.innerHTML + " ";
                input_area.innerHTML = text.replace(re, "\$1<span class='highlight' style='background:"+color+"'>\$2</span>\$3");
            }
        });
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
}

function update_data(fname, database) {
    database.updating = true;
    if(fname == "Fake and Real News") {
        read_file("source/data/Fake_and_real_news_dataset.json", (data)=>{
            database.data = JSON.parse(data);
            database.updating = false;
        });
    } else if(fname == "Source based Fake News") {
        read_file("source/data/Source_based_Fake_News_Classification.json", (data)=>{
            database.data = JSON.parse(data);
            database.updating = false;
        })
    } else {
        database.updating = false;
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