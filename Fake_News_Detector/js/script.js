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
    let checkbox1 = document.getElementById("fakeandrealnews"),
        checkbox2 = document.getElementById("sourcebasedfakenews");
    let scale = chroma.scale(['#eff8ff','#ff9b93']).mode('lch');
    let input_area = document.querySelector("#input-txt");
    
    confirm_btn.addEventListener("click", ()=>{
        execute([checkbox1, checkbox2], input_area, scale);
    });

    document.getElementById("clear-btn").addEventListener("click", ()=>{
        input_area.innerHTML = input_area.innerText || input_area.textContent;
    })

    let threshold_slider = document.getElementById("threshold-slider"),
        threshold_value = document.getElementById("threshold-value");
    threshold_slider.addEventListener("input", ()=>{
        threshold_value.innerHTML = threshold_slider.value / 100;
        execute([checkbox1, checkbox2], input_area, scale);
    });
}

function execute(checkboxs, input_area, scale) {
    input_area.innerHTML = input_area.innerText || input_area.textContent;
    if(checkboxs[0].checked) {
        tmp("data/Fake_and_real_news_dataset.json", input_area, scale);
    }
    if(checkboxs[0].checked) {
        tmp("data/Source_based_Fake_News_Classification.json", input_area, scale);
    }
}

function tmp(fname, input_area, scale) {
    let threshold_slider = document.getElementById("threshold-slider");
    let threshold = threshold_slider.value / 100;

    read_file(fname, (data)=>{
        let txt = input_area.innerHTML;
        let word_score = JSON.parse(data);
        let unique_words = txt.split(' ').filter(onlyUnique);
        unique_words.forEach((word) => {   
            if(word_score[word.toLowerCase()] > threshold) {
                // let scale_ratio = word_score[word];
                let scale_ratio = (word_score[word]-threshold)/(1-threshold);
                target_word = " " + word + " "
                replace_word = " <span class='highlight' style='background:" + scale(scale_ratio).hex() + "'>" + word + "</span> "
                input_area.innerHTML = input_area.innerHTML.replace(target_word, replace_word);
            }
        })
    });

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
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