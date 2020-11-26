#%%
import nltk
import pandas as pd

nltk.download("punkt")
nltk.download("averaged_perceptron_tagger")
nltk.download("universal_tagset")

#%%
def load_data(fname):
    data = pd.read_csv(fname)

    titles_df = data["title"].dropna()
    titles = " ".join(list(titles_df))

    text_df = data["text"].dropna()
    contents = " ".join(list(text_df))

    return (titles, contents)


#%%
def filtered_tag(text, tag):
    tokenize_text = nltk.word_tokenize(text)
    tagged_text = nltk.pos_tag(tokenize_text, tagset="universal")
    word_tag_fd = nltk.FreqDist(tagged_text)
    word_tag_fd_filtered = [
        (w_tag[0], count)
        for w_tag, count in word_tag_fd.most_common()
        if w_tag[1] == tag
    ]
    return word_tag_fd_filtered


def save_all(data, fnames):
    for datum, fname in zip(data, fnames):
        with open(f"{fname}.txt", "w", encoding="utf-8") as out_file:
            for word, count in datum:
                out_file.write(f"{word}, {count}\n")


#%%
if __name__ == "__main__":
    for fname in ["Fake.csv", "True.csv"]:
        titles, contents = load_data(fname)
        title_verbs = filtered_tag(titles, "VERB")
        title_nouns = filtered_tag(titles, "NOUN")
        title_adjs = filtered_tag(titles, "ADJ")

        content_verbs = filtered_tag(contents, "VERB")
        content_nouns = filtered_tag(contents, "NOUN")
        content_adjs = filtered_tag(contents, "ADJ")

        save_all(
            [ title_verbs, title_nouns, title_adjs, content_verbs, content_nouns, content_adjs ],
            [ fname+"_title_verbs", fname+"_title_nouns", fname+"_title_adjs", fname+"_content_verbs", fname+"_content_nouns", fname+"_content_adjs" ]
        )

# %%
