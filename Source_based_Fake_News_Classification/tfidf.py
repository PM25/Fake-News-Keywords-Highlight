import sklearn.feature_extraction.text, sklearn.linear_model, sklearn.model_selection, pandas

data = pandas.read_csv('text.csv', dtype=str)[['text', 'label']].dropna()
data.label = data.label == 'Fake'
data.columns = ['text', 'labels']
text = data['text'].values.flatten().tolist()
ans = data['labels']
vec = sklearn.feature_extraction.text.TfidfVectorizer()
tfidf = vec.fit_transform(text)
train_x, test_x, train_y, test_y = sklearn.model_selection.train_test_split(tfidf, ans, test_size=0.4)

lr = sklearn.linear_model.LogisticRegression(C=1000).fit(train_x, train_y)

weight = list(vec.vocabulary_.items())
for i in range(len(weight)):
    weight[i] = (weight[i][0], lr.coef_[0][weight[i][1]])

for i in sorted(weight, key=lambda i: i[1], reverse=True):
    print('%s\t%f' % i)

#print(lr.score(train_x, train_y))
#print(lr.score(test_x, test_y))
