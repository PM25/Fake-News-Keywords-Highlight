from transformers import logging
from simpletransformers.classification import ClassificationModel
import pandas, sklearn, sklearn.model_selection, torch, warnings

warnings.filterwarnings("ignore")
logging.set_verbosity_error()
torch.multiprocessing.set_sharing_strategy('file_system')

data = pandas.read_csv('text.csv', dtype=str)[['text', 'label']]
data.label = data.label == 'Fake'
data.columns = ['text', 'labels']
train, test = sklearn.model_selection.train_test_split(data, test_size=0.4)

model = ClassificationModel('xlnet', 'xlnet-base-cased', use_cuda=True, cuda_device=0,
        args={'fp16': False, 'overwrite_output_dir': True, 'num_train_epochs': 25, 'silent': True, 'output_dir': 'xlnet'})
model.train_model(train, acc=sklearn.metrics.accuracy_score)
print(model.eval_model(train, acc=sklearn.metrics.accuracy_score)[0])
print(model.eval_model(test, acc=sklearn.metrics.accuracy_score)[0])
