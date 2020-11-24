from transformers import logging
from simpletransformers.classification import ClassificationModel
import nltk, pandas, sklearn, sklearn.model_selection, torch, warnings, tqdm

warnings.filterwarnings("ignore")
logging.set_verbosity_error()
torch.multiprocessing.set_sharing_strategy('file_system')

data = pandas.read_csv('text.csv', dtype=str)[['text', 'label']]

for i in tqdm.tqdm(range(len(data['text']))):
    loc_per = []
    if type(data['text'][i]) == float:
        data['text'][i] = ''
    token = nltk.word_tokenize(data['text'][i])
    tagged = nltk.pos_tag(token)
    chunked = nltk.ne_chunk(tagged)
    for j in chunked:
        if hasattr(j, 'label') and (j.label() == 'PERSON' or j.label() == 'GPE'):
            loc_per.append(j[0][0])

    for k in loc_per:
        data['text'][i] = data['text'][i].replace(k, '')

data.label = data.label == 'Fake'
data.columns = ['text', 'labels']
train, test = sklearn.model_selection.train_test_split(data, test_size=0.4)

model = ClassificationModel('bert', 'bert-base-cased', use_cuda=True, cuda_device=1,
        args={'fp16': False, 'overwrite_output_dir': True, 'num_train_epochs': 25, 'output_dir': 'bert'})
model.train_model(train, acc=sklearn.metrics.accuracy_score)
print(model.eval_model(train, acc=sklearn.metrics.accuracy_score)[0])
print(model.eval_model(test, acc=sklearn.metrics.accuracy_score)[0])
