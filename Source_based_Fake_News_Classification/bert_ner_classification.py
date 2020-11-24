from transformers import pipeline, logging, AutoTokenizer, AutoModelForTokenClassification
from simpletransformers.classification import ClassificationModel
import pandas, sklearn, sklearn.model_selection, torch, warnings
from tqdm import tqdm

'''
tokenizer = AutoTokenizer.from_pretrained("dslim/bert-base-NER")
model = AutoModelForTokenClassification.from_pretrained("dslim/bert-base-NER")
nlp = pipeline("ner", model=model, tokenizer=tokenizer)
'''

warnings.filterwarnings("ignore")
logging.set_verbosity_error()
torch.multiprocessing.set_sharing_strategy('file_system')

data = pandas.read_csv('text.csv', dtype=str)[['text', 'label']]

'''
for i in tqdm(range(len(data['text']))):
    if type(data['text'][i]) == float:
        data['text'][i] = ''
    ner_results = nlp(data['text'][i])
    loc_per = [i['word'] for i in ner_results]
    for k in loc_per:
        data['text'][i] = data['text'][i].replace(k, '')
'''

data.label = data.label == 'Fake'
data.columns = ['text', 'labels']

for rate in [0.2, 0.3, 0.4]:
    train, test = sklearn.model_selection.train_test_split(data, test_size=rate)

    model = ClassificationModel('bert', 'bert-base-uncased', use_cuda=True, cuda_device=1,
            args={'fp16': False, 'overwrite_output_dir': True, 'num_train_epochs': 5, 'silent': False, 'output_dir': 'bert'})
    model.train_model(train, acc=sklearn.metrics.accuracy_score)
    print(model.eval_model(train, acc=sklearn.metrics.accuracy_score)[0])
    print(model.eval_model(test, acc=sklearn.metrics.accuracy_score)[0])
