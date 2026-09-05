// Mock Executions Data

export const EXECUTIONS = [
  {
    id: 'ex-001',
    submissionId: 'SUB-2024-001',
    student: 'w-001',
    project: 'p-001',
    task: 't-001',
    commit: 'a3f9c1d',
    commitMessage: 'Add CLAHE contrast enhancement to preprocessing pipeline',
    executionTime: '3m 42s',
    startTime: '2024-02-12T10:30:00Z',
    endTime: '2024-02-12T10:33:42Z',
    status: 'passed',
    testsPassed: 8,
    testsFailed: 0,
    totalTests: 8,
    consoleOutput: `Loading dataset from /data/medical_images...
Dataset loaded: 10,234 images
Running preprocessing pipeline...
  ✓ Image resizing: 10,234/10,234
  ✓ CLAHE enhancement: 10,234/10,234  
  ✓ Normalization: 10,234/10,234
  ✓ Train/Val/Test split: 8187/1024/1023
Saving preprocessed dataset...
Pipeline complete. Output saved to /output/preprocessed_data/
`,
    errorOutput: '',
    testCases: [
      { name: 'Test dataset loading', status: 'passed', duration: '0.23s' },
      { name: 'Test image resizing (224x224)', status: 'passed', duration: '45.12s' },
      { name: 'Test CLAHE enhancement', status: 'passed', duration: '38.91s' },
      { name: 'Test normalization (mean/std)', status: 'passed', duration: '12.44s' },
      { name: 'Test train/val/test split ratios', status: 'passed', duration: '0.11s' },
      { name: 'Test output file structure', status: 'passed', duration: '0.32s' },
      { name: 'Test data augmentation', status: 'passed', duration: '22.18s' },
      { name: 'Test memory usage < 8GB', status: 'passed', duration: '3.71s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-002',
    submissionId: 'SUB-2024-002',
    student: 'w-001',
    project: 'p-001',
    task: 't-002',
    commit: 'b2e8d4f',
    commitMessage: 'Implement ResNet-50 with transfer learning',
    executionTime: '12m 15s',
    startTime: '2024-03-28T14:00:00Z',
    endTime: '2024-03-28T14:12:15Z',
    status: 'passed',
    testsPassed: 6,
    testsFailed: 0,
    totalTests: 6,
    consoleOutput: `Loading pretrained ResNet-50 weights...
Weights loaded from ImageNet checkpoint
Building custom classification head...
  Output classes: 14
  Dropout: 0.5
Model summary:
  Total parameters: 24,341,294
  Trainable parameters: 8,192,014
Running architecture validation tests...
All tests passed.
`,
    errorOutput: '',
    testCases: [
      { name: 'Test model instantiation', status: 'passed', duration: '2.11s' },
      { name: 'Test input shape (batch, 3, 224, 224)', status: 'passed', duration: '0.44s' },
      { name: 'Test output shape (batch, 14)', status: 'passed', duration: '0.38s' },
      { name: 'Test pretrained weights loaded', status: 'passed', duration: '8.92s' },
      { name: 'Test gradient flow', status: 'passed', duration: '1.23s' },
      { name: 'Test forward pass on sample batch', status: 'passed', duration: '0.87s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-003',
    submissionId: 'SUB-2024-003',
    student: 'w-002',
    project: 'p-002',
    task: 't-005',
    commit: 'c7a1e9b',
    commitMessage: 'Data collection pipeline complete',
    executionTime: '8m 02s',
    startTime: '2024-04-13T09:00:00Z',
    endTime: '2024-04-13T09:08:02Z',
    status: 'passed',
    testsPassed: 5,
    testsFailed: 0,
    totalTests: 5,
    consoleOutput: `Loading Twitter dataset...
Records loaded: 102,341
Running text cleaning pipeline...
  ✓ HTML removal
  ✓ URL removal
  ✓ Mention normalization
  ✓ Language detection
Final dataset: 98,712 valid records
`,
    errorOutput: '',
    testCases: [
      { name: 'Test data loading', status: 'passed', duration: '12.3s' },
      { name: 'Test text cleaning functions', status: 'passed', duration: '45.2s' },
      { name: 'Test language distribution', status: 'passed', duration: '3.1s' },
      { name: 'Test label distribution', status: 'passed', duration: '0.4s' },
      { name: 'Test output CSV structure', status: 'passed', duration: '1.2s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-004',
    submissionId: 'SUB-2023-001',
    student: 'w-006',
    project: 'p-003',
    task: 't-008',
    commit: 'd4b2f7a',
    commitMessage: 'YOLOv8 initial setup',
    executionTime: '5m 33s',
    startTime: '2023-10-10T11:00:00Z',
    endTime: '2023-10-10T11:05:33Z',
    status: 'passed',
    testsPassed: 4,
    testsFailed: 0,
    totalTests: 4,
    consoleOutput: `Checking YOLOv8 installation...
YOLOv8n model loaded successfully
Running sample inference...
Inference time: 18ms per frame
FPS: 55.6
All setup tests passed.
`,
    errorOutput: '',
    testCases: [
      { name: 'Test YOLOv8 import', status: 'passed', duration: '2.1s' },
      { name: 'Test model loading', status: 'passed', duration: '4.3s' },
      { name: 'Test inference on sample image', status: 'passed', duration: '0.02s' },
      { name: 'Test FPS >= 30', status: 'passed', duration: '15.2s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-005',
    submissionId: 'SUB-2024-004',
    student: 'w-006',
    project: 'p-003',
    task: 't-009',
    commit: 'e1c5b8d',
    commitMessage: 'Training complete, mAP 0.873',
    executionTime: '2h 14m 22s',
    startTime: '2024-02-25T06:00:00Z',
    endTime: '2024-02-25T08:14:22Z',
    status: 'passed',
    testsPassed: 5,
    testsFailed: 0,
    totalTests: 5,
    consoleOutput: `Loading training configuration...
Dataset: 5,234 annotated images
Training YOLOv8 model...
Epoch 100/100: mAP50=0.873, mAP50-95=0.621
Training complete.
`,
    errorOutput: '',
    testCases: [
      { name: 'Test dataset annotation format', status: 'passed', duration: '3.2s' },
      { name: 'Test training convergence', status: 'passed', duration: '8054s' },
      { name: 'Test mAP50 >= 0.85', status: 'passed', duration: '45.1s' },
      { name: 'Test model serialization', status: 'passed', duration: '1.2s' },
      { name: 'Test inference on test set', status: 'passed', duration: '12.3s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-006',
    submissionId: 'SUB-2024-005',
    student: 'w-008',
    project: 'p-004',
    task: 't-011',
    commit: 'f6d3c9e',
    commitMessage: 'Spark cluster config complete',
    executionTime: '2m 11s',
    startTime: '2024-05-12T14:00:00Z',
    endTime: '2024-05-12T14:02:11Z',
    status: 'passed',
    testsPassed: 3,
    testsFailed: 0,
    totalTests: 3,
    consoleOutput: `Testing Spark cluster connection...
Master: spark://cluster-master:7077
Workers: 4 nodes available
SparkContext created successfully
All configuration tests passed.
`,
    errorOutput: '',
    testCases: [
      { name: 'Test cluster connectivity', status: 'passed', duration: '5.1s' },
      { name: 'Test resource allocation', status: 'passed', duration: '2.3s' },
      { name: 'Test sample Spark job', status: 'passed', duration: '23.4s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-007',
    submissionId: 'SUB-2024-006',
    student: 'w-003',
    project: 'p-005',
    task: 't-013',
    commit: 'a9e4f1b',
    commitMessage: 'Genomic preprocessing pipeline complete',
    executionTime: '6m 48s',
    startTime: '2024-03-28T10:00:00Z',
    endTime: '2024-03-28T10:06:48Z',
    status: 'passed',
    testsPassed: 6,
    testsFailed: 0,
    totalTests: 6,
    consoleOutput: `Loading genomic sequences...
Sequences loaded: 45,234
Running QC pipeline...
  ✓ Quality score filtering: 44,891 passed
  ✓ Length filtering: 44,218 passed
  ✓ Adapter trimming complete
Output saved to /output/clean_sequences/
`,
    errorOutput: '',
    testCases: [
      { name: 'Test FASTQ parsing', status: 'passed', duration: '15.2s' },
      { name: 'Test quality score filtering', status: 'passed', duration: '45.3s' },
      { name: 'Test length filtering', status: 'passed', duration: '12.1s' },
      { name: 'Test adapter trimming', status: 'passed', duration: '88.4s' },
      { name: 'Test output format (FASTA)', status: 'passed', duration: '2.3s' },
      { name: 'Test QC report generation', status: 'passed', duration: '1.1s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-008',
    submissionId: 'SUB-2024-007',
    student: 'w-007',
    project: 'p-007',
    task: 't-017',
    commit: 'b3f8e2c',
    commitMessage: 'Multi-agent environment v1.0',
    executionTime: '4m 23s',
    startTime: '2024-06-28T15:00:00Z',
    endTime: '2024-06-28T15:04:23Z',
    status: 'passed',
    testsPassed: 5,
    testsFailed: 0,
    totalTests: 5,
    consoleOutput: `Initializing multi-agent environment...
Agents: 4
Environment: Grid World 20x20
Running environment tests...
All tests passed.
`,
    errorOutput: '',
    testCases: [
      { name: 'Test environment initialization', status: 'passed', duration: '0.8s' },
      { name: 'Test agent action space', status: 'passed', duration: '0.2s' },
      { name: 'Test observation space', status: 'passed', duration: '0.3s' },
      { name: 'Test reward function', status: 'passed', duration: '12.4s' },
      { name: 'Test episode reset', status: 'passed', duration: '0.1s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-009',
    submissionId: 'SUB-2024-008',
    student: 'w-009',
    project: 'p-008',
    task: 't-020',
    commit: 'c7a1e9b',
    commitMessage: 'GNN model training complete AUC 0.912',
    executionTime: '1h 32m 11s',
    startTime: '2024-01-28T08:00:00Z',
    endTime: '2024-01-28T09:32:11Z',
    status: 'passed',
    testsPassed: 7,
    testsFailed: 0,
    totalTests: 7,
    consoleOutput: `Loading molecular graph dataset...
Molecules: 32,847
Drug-target pairs: 8,912
Training GNN model...
Epoch 200/200: Loss=0.182, AUC=0.912
Training complete. Model saved.
`,
    errorOutput: '',
    testCases: [
      { name: 'Test molecular graph construction', status: 'passed', duration: '45.2s' },
      { name: 'Test GNN forward pass', status: 'passed', duration: '2.3s' },
      { name: 'Test training convergence', status: 'passed', duration: '5523s' },
      { name: 'Test AUC >= 0.90', status: 'passed', duration: '12.3s' },
      { name: 'Test precision/recall', status: 'passed', duration: '8.1s' },
      { name: 'Test model serialization', status: 'passed', duration: '3.4s' },
      { name: 'Test inference on new molecules', status: 'passed', duration: '1.2s' },
    ],
    finalResult: 'PASS',
  },
  {
    id: 'ex-010',
    submissionId: 'SUB-2024-009',
    student: 'w-007',
    project: 'p-002',
    task: 't-006',
    commit: 'c7a1e9b',
    commitMessage: 'Add weighted loss for class imbalance handling',
    executionTime: '4m 05s',
    startTime: '2024-09-01T16:31:00Z',
    endTime: '2024-09-01T16:35:05Z',
    status: 'failed',
    testsPassed: 2,
    testsFailed: 1,
    totalTests: 3,
    consoleOutput: `Loading BERT tokenizer...
Tokenizer loaded: bert-base-multilingual-cased
Loading training dataset...
Dataset loaded: 98,712 samples
Starting fine-tuning...
`,
    errorOutput: `Traceback (most recent call last):
  File "train.py", line 45, in <module>
    from models.bert_classifier import BertSentimentClassifier
  File "models/bert_classifier.py", line 12, in <module>
    from transformers import BertForSequenceClassification
ImportError: cannot import name 'BertForSequenceClassification' from 'transformers'
Execution failed.`,
    testCases: [
      { name: 'Test tokenizer loading', status: 'passed', duration: '3.2s' },
      { name: 'Test dataset loading', status: 'passed', duration: '12.1s' },
      { name: 'Test model import', status: 'failed', duration: '0.1s' },
    ],
    finalResult: 'FAIL',
  },
];

export const EXECUTION_STATUSES = ['queued', 'running', 'passed', 'failed', 'timeout'];
