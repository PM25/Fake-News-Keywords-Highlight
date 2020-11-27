#%%
import pandas as pd

day = [6, 18]


def load_data(fname):
    data = pd.read_csv(fname)
    real_data = data[data["label"] == "Real"]
    fake_data = data[data["label"] == "Fake"]
    return (real_data, fake_data)


def categories_count(data):
    results = {}
    for category in data:
        results[category] = results.get(category, 0) + 1
    return results

def summary(data):
    authors = categories_count(data["author"])
    authors_sorted = sorted(authors.items(), key=lambda item: item[1], reverse=True)

    # data["published"] = data["published"].str.extract("(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})")
    # data["published"] = data["published"].str.replace("T", " ")
    data["time"] = data["published"].str.extract("T(\d{2}):\d{2}").dropna().astype(int)
    mask = (data["time"] >= 6) & (data["time"] <= 18)
    not_mask = (data["time"] < 6) | (data["time"] > 18)
    data["time"].loc[mask] = "day"
    data["time"].loc[not_mask] = "night"
    published = categories_count(data["time"])
    published_sorted = sorted(published.items(), key=lambda item: item[1], reverse=True)

    sites = categories_count(data["site_url"])
    sites_sorted = sorted(sites.items(), key=lambda item: item[1], reverse=True)
    
    return authors_sorted, published_sorted, sites_sorted


def save_all(data, fnames):
    for datum, fname in zip(data, fnames):
        with open(f"{fname}.txt", "w", encoding="utf-8") as out_file:
            for word, count in datum:
                out_file.write(f"{word}, {count}\n")


if __name__ == "__main__":
    real_data, fake_data = load_data("text.csv")
    authors, published, sites = summary(real_data)
    save_all(
        [authors, published, sites], ["real_authors", "real_published", "real_sites"]
    )
    authors, published, sites = summary(fake_data)
    save_all(
        [authors, published, sites], ["fake_authors", "fake_published", "fake_sites"]
    )

# %%
