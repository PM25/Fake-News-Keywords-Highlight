from transformers import logging
from simpletransformers.classification import ClassificationModel
import pandas, sklearn, sklearn.model_selection, torch, warnings

warnings.filterwarnings("ignore")
logging.set_verbosity_error()
torch.multiprocessing.set_sharing_strategy('file_system')

fake = pandas.read_csv('Fake.csv')[['text']]
fake['labels'] = True
real = pandas.read_csv('Real.csv')[['text']]
real['labels'] = False
data = pandas.concat([fake, real])
train, test = sklearn.model_selection.train_test_split(data, test_size=0.4)

model = ClassificationModel('bert', 'bert-base-cased', use_cuda=True, cuda_device=1,
        args={'fp16': False, 'overwrite_output_dir': True, 'num_train_epochs': 25, 'silent': False, 'output_dir': '/tmp'})
model.train_model(train, acc=sklearn.metrics.accuracy_score)
print(model.eval_model(train, acc=sklearn.metrics.accuracy_score)[0])
print(model.eval_model(test, acc=sklearn.metrics.accuracy_score)[0])
