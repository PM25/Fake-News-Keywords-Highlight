#py extract_voc.py tfidf.txt verb.txt adj.txt > output.json
import sys, pandas, json

data = pandas.read_csv(sys.argv[1], sep="\t", header=None).set_index(0)
data[1] = (data[1] - data[1].min()) / (data[1].max() - data[1].min())
verb = pandas.read_csv(sys.argv[2], sep=", ", header=None, engine='python')[0].dropna()
adj  = pandas.read_csv(sys.argv[3], sep=", ", header=None, engine='python')[0].dropna()

output = pandas.concat([data.loc[data.index.intersection(verb)], data.loc[data.index.intersection(adj)]])
print(json.dumps(output.to_dict()[1]))
