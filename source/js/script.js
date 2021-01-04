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
    wrap_text(input_area);
    
    let switchbtnstatus = false;
    let switchbtn = document.getElementById("switchbtn");
    switchbtn.addEventListener("click", ()=>{
        switchbtn.classList.toggle("active-btn");
        if(switchbtn.classList.contains("active-btn")) {
            execute(input_area, scale, database);
        } else {
            input_area.innerHTML = input_area.innerText || input_area.textContent;
            wrap_text(input_area);
        }
    });

    let wordcloud = document.getElementById("wordcloud");
    wordcloud.addEventListener("click", ()=>{
        let text = input_area.innerText || input_area.textContent;
        text = text.replace(/[\W_]+/g, " ");
        let words = text.split(' ');
        let word_counts = {}
        words.forEach((word) => {
            if(word.length > 0) {
                word_counts[word] = (word_counts[word] || 0) + 1
            }
        });
        
        let link = "http://docusky.org.tw/DocuSky/docuTools/WordCloudLite/WordCloudLite.html?data="
        for (let [k, v] of Object.entries(word_counts)) {
            link += k + "," + v + ";"
        }
        window.open(link, '_blank');
    });

    input_area.addEventListener("input", ()=>{
        if(switchbtn.classList.contains("active-btn")) {
            execute(input_area, scale, database);
        }
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
            if(switchbtn.classList.contains("active-btn")) {
                execute(input_area, scale, database);
            }
        });
    });

    let threshold_slider = document.getElementById("threshold-slider"),
        threshold_value = document.getElementById("threshold-value"), 
        last_value = (threshold_slider.value / 20);
    threshold_slider.addEventListener("input", ()=>{
        let value = (threshold_slider.value / 20)
        threshold_value.innerHTML = value.toFixed(2);
        if(switchbtn.classList.contains("active-btn") && value != last_value) {
            execute(input_area, scale, database);
            last_value = value;
        }
    });
}

function wrap_text(input_area) {
    let text = input_area.innerText || input_area.textContent;
    input_area.innerHTML = text.replace(/(\w+)/g, "<span class='\$1 word-span'>\$1</span>");
}

function execute(input_area, scale, database) {
    // console.log(database.updating);
    if(database.updating == true) {
        setTimeout(() => { execute(input_area, scale, database); }, 50);
    } else {
        // input_area.innerHTML = input_area.innerText || input_area.textContent;
        let all_words = document.querySelectorAll(".word-span");
        all_words.forEach((word)=>{ 
            word.style.backgroundColor = "";
        });
    
        let threshold_slider = document.getElementById("threshold-slider");
        let threshold = threshold_slider.value / 20;

        let txt = input_area.innerText || input_area.textContent;
        let word_score = database.data;
        let unique_words = txt.match(/\b(\w+)\b/g).filter(onlyUnique);
        unique_words.forEach((word) => {
            if(word_score[word.toLowerCase()] >= threshold) {
                let scale_ratio = word_score[word.toLowerCase()].toPrecision(2);
                let color = scale(scale_ratio).hex();
                // the match word can't have any character next to it
                let selected_words = document.querySelectorAll("#input-txt ." + word);
                selected_words.forEach((word)=>{
                    word.style.backgroundColor = color;
                });
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