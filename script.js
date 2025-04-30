// script.js
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const contentInput = document.getElementById('contentInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultSection = document.getElementById('resultSection');
    const humanGauge = document.getElementById('humanGauge');
    const aiGauge = document.getElementById('aiGauge');
    const humanPercentage = document.getElementById('humanPercentage');
    const aiPercentage = document.getElementById('aiPercentage');
    const contentSummary = document.getElementById('contentSummary');
    
    // Model variables
    let model;
    let tokenizer;
    const maxSequenceLength = 128;
    const vocabularySize = 10000;
    
    // Features of AI-generated text (expanded dataset for better analysis)
    const aiPatterns = {
        phrases: [
            'in conclusion', 'to summarize', 'moreover', 'furthermore', 'nevertheless', 
            'in addition', 'consequently', 'in contrast', 'specifically', 'for instance',
            'as a result', 'in particular', 'in essence', 'in other words', 'to illustrate',
            'admittedly', 'undoubtedly', 'presumably', 'naturally', 'generally speaking'
        ],
        sentenceStarters: [
            'it is important to note that', 'it should be noted that', 'it is worth mentioning that',
            'it is essential to understand that', 'it is crucial to recognize that',
            'one might argue that', 'some would suggest that', 'many would agree that',
            'research indicates that', 'studies have shown that', 'evidence suggests that'
        ],
        structuralPatterns: [
            /firstly.*secondly.*finally/i,
            /first.*second.*third/i,
            /on one hand.*on the other hand/i,
            /not only.*but also/i,
            /while it is true that.*it is also important/i
        ]
    };
    
    // Human writing characteristics
    const humanPatterns = {
        informalExpressions: [
            'kind of', 'sort of', 'you know', 'I guess', 'I think', 'I feel like',
            'actually', 'basically', 'honestly', 'literally', 'just', 'pretty much',
            'anyway', 'so yeah', 'like', 'stuff', 'things', 'maybe', 'probably'
        ],
        contractions: [
            "don't", "can't", "won't", "shouldn't", "couldn't", "wouldn't", 
            "isn't", "aren't", "wasn't", "weren't", "haven't", "hasn't", 
            "it's", "that's", "there's", "here's", "who's", "what's",
            "I'm", "you're", "we're", "they're", "I'll", "you'll", "we'll"
        ],
        punctuationPatterns: [
            /\.\.\./g,            // Ellipsis
            /\?!/g,               // Interrobang
            /!{2,}/g,             // Multiple exclamation marks
            /\?{2,}/g,            // Multiple question marks
            /--/g,                // Em dash substitute
        ]
    };
    
    // Initialize TensorFlow.js model
    async function initModel() {
        try {
            // Create a vocabulary from common words + AI/human indicators
            tokenizer = createTokenizer();
            
            // Create the model architecture
            model = tf.sequential();
            
            // Embedding layer
            model.add(tf.layers.embedding({
                inputDim: vocabularySize,
                outputDim: 128,
                inputLength: maxSequenceLength
            }));
            
            // Convolutional layers for feature extraction
            model.add(tf.layers.conv1d({
                filters: 64,
                kernelSize: 5,
                padding: 'same',
                activation: 'relu'
            }));
            model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
            
            model.add(tf.layers.conv1d({
                filters: 128,
                kernelSize: 3,
                padding: 'same',
                activation: 'relu'
            }));
            model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
            
            // LSTM for sequential patterns
            model.add(tf.layers.bidirectional({
                layer: tf.layers.lstm({
                    units: 64,
                    returnSequences: false
                })
            }));
            
            // Dense layers for classification
            model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
            model.add(tf.layers.dropout({ rate: 0.5 }));
            model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
            model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
            
            // Compile the model
            model.compile({
                optimizer: tf.train.adam(0.001),
                loss: 'binaryCrossentropy',
                metrics: ['accuracy']
            });
            
            // We'd normally load pre-trained weights here
            // Since this is a demonstration, we'll use feature-based analysis instead
            
            return true;
        } catch (error) {
            console.error("Model initialization error:", error);
            return false;
        }
    }
    
    // Create a tokenizer with a vocabulary from common words
    function createTokenizer() {
        const commonWords = [
            // Top 200 English words
            "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", 
            "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
            "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
            "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
            "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
            "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
            "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
            "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
            "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
            "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
            "very", "important", "really", "world", "much", "should", "need", "try", "many", "may",
            "such", "able", "example", "help", "case", "different", "point", "right", "great", "where",
            "same", "those", "every", "through", "mean", "tell", "three", "state", "never", "leave",
            "own", "while", "high", "school", "find", "part", "place", "end", "number", "feel",
            "become", "put", "actually", "fact", "though", "less", "might", "system", "too", "set",
            "each", "question", "least", "still", "during", "ask", "change", "going", "problem", "call",
            "government", "life", "company", "group", "yes", "interest", "against", "thing", "provide", "however",
            "last", "include", "public", "without", "lead", "nothing", "long", "both", "often", "next",
            "possible", "level", "child", "form", "study", "turn", "few", "always", "second", "develop"
        ];
        
        // Add AI pattern words
        const aiWords = [].concat(
            ...aiPatterns.phrases.map(p => p.split(' ')),
            ...aiPatterns.sentenceStarters.map(p => p.split(' '))
        );
        
        // Add human pattern words
        const humanWords = [].concat(
            ...humanPatterns.informalExpressions.map(p => p.split(' ')),
            humanPatterns.contractions
        );
        
        // Create vocabulary mapping
        const vocabMap = {};
        const uniqueWords = [...new Set([...commonWords, ...aiWords, ...humanWords])];
        
        // Create vocabulary with common words first
        uniqueWords.slice(0, vocabularySize - 1).forEach((word, index) => {
            vocabMap[word.toLowerCase()] = index + 1; // 0 reserved for padding
        });
        
        return {
            word2index: vocabMap,
            tokenize: function(text) {
                // Simple tokenization by splitting on spaces and punctuation
                return text.toLowerCase()
                    .replace(/[^\w\s']/g, ' ')
                    .split(/\s+/)
                    .filter(t => t.length > 0);
            },
            textsToSequences: function(texts) {
                const sequences = [];
                for (const text of texts) {
                    const tokens = this.tokenize(text);
                    const sequence = tokens.map(token => 
                        this.word2index[token] || 0 // OOV (out of vocabulary) tokens get 0
                    );
                    sequences.push(sequence);
                }
                return sequences;
            },
            padSequences: function(sequences) {
                return sequences.map(seq => {
                    if (seq.length >= maxSequenceLength) {
                        return seq.slice(0, maxSequenceLength);
                    } else {
                        return [...seq, ...Array(maxSequenceLength - seq.length).fill(0)];
                    }
                });
            }
        };
    }
    
    // Extract linguistic features from text for analysis
    function extractFeatures(text) {
        // Normalize text for analysis
        const normalizedText = text.toLowerCase();
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        
        if (wordCount === 0) return null;
        
        // Basic text statistics
        const charCount = text.replace(/\s/g, '').length;
        const avgWordLength = charCount / wordCount;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const sentenceCount = sentences.length;
        const avgSentenceLength = wordCount / Math.max(1, sentenceCount);
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const avgParagraphLength = wordCount / Math.max(1, paragraphs.length);
        
        // Vocabulary diversity (unique words / total words)
        const uniqueWords = new Set(text.toLowerCase().match(/\b[a-z']+\b/g) || []);
        const lexicalDiversity = uniqueWords.size / Math.max(1, wordCount);
        
        // AI pattern detection
        const aiPhraseCount = aiPatterns.phrases.reduce((count, phrase) => {
            return count + (normalizedText.match(new RegExp(phrase, 'gi')) || []).length;
        }, 0);
        
        const aiStarterCount = aiPatterns.sentenceStarters.reduce((count, starter) => {
            return count + (normalizedText.match(new RegExp(starter, 'gi')) || []).length;
        }, 0);
        
        const aiStructureMatches = aiPatterns.structuralPatterns.reduce((count, pattern) => {
            return count + (pattern.test(normalizedText) ? 1 : 0);
        }, 0);
        
        // Human pattern detection
        const informalExprCount = humanPatterns.informalExpressions.reduce((count, expr) => {
            return count + (normalizedText.match(new RegExp('\\b' + expr + '\\b', 'gi')) || []).length;
        }, 0);
        
        const contractionCount = humanPatterns.contractions.reduce((count, contr) => {
            return count + (normalizedText.match(new RegExp('\\b' + contr + '\\b', 'gi')) || []).length;
        }, 0);
        
        const informalPunctCount = humanPatterns.punctuationPatterns.reduce((count, pattern) => {
            return count + (normalizedText.match(pattern) || []).length;
        }, 0);
        
        // Consistency analysis (consistent paragraph lengths may indicate AI)
        let paragraphLengths = paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
        let paragraphLengthVariance = 0;
        if (paragraphLengths.length > 1) {
            const mean = paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length;
            paragraphLengthVariance = Math.sqrt(
                paragraphLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / paragraphLengths.length
            ) / mean; // Normalized variance
        }
        
        // Repetition analysis (repeated phrases may indicate AI)
        const threeGrams = [];
        const tokens = normalizedText.split(/\s+/);
        for (let i = 0; i < tokens.length - 2; i++) {
            threeGrams.push(`${tokens[i]} ${tokens[i+1]} ${tokens[i+2]}`);
        }
        
        const uniqueThreeGrams = new Set(threeGrams);
        const threeGramRepetitionRatio = threeGrams.length > 0 ? 
            1 - (uniqueThreeGrams.size / threeGrams.length) : 0;
        
        // First-person usage (more common in human writing)
        const firstPersonCount = (normalizedText.match(/\b(i|me|my|mine|myself|we|us|our|ours|ourselves)\b/g) || []).length;
        const firstPersonRatio = firstPersonCount / wordCount;
        
        // Function words ratio (often more balanced in human text)
        const functionWords = (normalizedText.match(/\b(the|of|and|a|to|in|is|you|that|it|he|was|for|on|are|as|with|his|they|at|be|this|have|from|or|one|had|by|but|not|what|all|were|we|when|your|can|said|there|use|an|each|which|she|do|how|their|if|will|up|other|about|out|many|then|them|these|so|some|her|would|make|like|him|into|time|has|look|two|more|go|see|no|way|could|people|my|than|first|been|call|who|its|now|find|long|down|day|did|get|come|made|may|part)\b/g) || []).length;
        const functionWordsRatio = functionWords / wordCount;
        
        return {
            // Basic text statistics
            wordCount,
            sentenceCount,
            avgWordLength,
            avgSentenceLength,
            avgParagraphLength,
            lexicalDiversity,
            
            // AI pattern metrics
            aiPhraseRatio: aiPhraseCount / Math.max(1, sentenceCount),
            aiStarterRatio: aiStarterCount / Math.max(1, sentenceCount),
            aiStructureRatio: aiStructureMatches / Math.max(1, paragraphs.length),
            
            // Human pattern metrics
            informalExprRatio: informalExprCount / wordCount,
            contractionRatio: contractionCount / wordCount,
            informalPunctRatio: informalPunctCount / Math.max(1, sentenceCount),
            
            // Consistency and variation metrics
            paragraphLengthVariance,
            threeGramRepetitionRatio,
            
            // Personal voice metrics
            firstPersonRatio,
            functionWordsRatio
        };
    }
    
    // Calculate AI probability based on extracted features
    function calculateAIProbability(features) {
        // Weights for different features (would ideally be learned from training data)
        const weights = {
            // Text structure features (positive = more likely AI)
            avgSentenceLength: 0.015,         // Longer sentences → more AI-like
            avgParagraphLength: 0.005,        // Longer paragraphs → more AI-like
            paragraphLengthVariance: -0.8,    // More variance → more human-like
            
            // Vocabulary features
            lexicalDiversity: -0.4,           // More diverse vocabulary → more human-like
            threeGramRepetitionRatio: 1.2,    // More repetition → more AI-like
            
            // AI pattern metrics 
            aiPhraseRatio: 2.0,               // More AI phrases → more AI-like
            aiStarterRatio: 1.8,              // More AI sentence starters → more AI-like
            aiStructureRatio: 1.5,            // More AI structure patterns → more AI-like
            
            // Human pattern metrics
            informalExprRatio: -2.0,          // More informal expressions → more human-like
            contractionRatio: -1.5,           // More contractions → more human-like
            informalPunctRatio: -1.8,         // More informal punctuation → more human-like
            firstPersonRatio: -1.2,           // More first-person usage → more human-like
            functionWordsRatio: -0.5          // More balanced function words → more human-like
        };
        
        // Base score (calibration point)
        let score = 0.5;
        
        // Apply weighted features
        for (const [feature, weight] of Object.entries(weights)) {
            if (features[feature] !== undefined) {
                score += features[feature] * weight;
            }
        }
        
        // Text length adjustment: very short texts are harder to classify
        const lengthFactor = Math.min(1, features.wordCount / 100);
        
        // Adjust score based on text length
        score = (score * lengthFactor) + (0.5 * (1 - lengthFactor));
        
        // Constrain to [0, 1] range
        return Math.max(0, Math.min(1, score));
    }
    
    // Analyze text and determine AI vs. human probability
    async function analyzeText(text) {
        try {
            // Extract linguistic features
            const features = extractFeatures(text);
            
            if (!features) {
                return {
                    aiProbability: 0.5,
                    humanProbability: 0.5,
                    confidence: 0,
                    features: null,
                    error: "No valid text to analyze"
                };
            }
            
            // Calculate AI probability
            const aiProbability = calculateAIProbability(features);
            
            // Calculate confidence
            const confidence = Math.abs(aiProbability - 0.5) * 2; // 0-1 scale, where 1 is high confidence
            
            return {
                aiProbability,
                humanProbability: 1 - aiProbability,
                confidence,
                features,
                error: null
            };
        } catch (error) {
            console.error("Analysis error:", error);
            return {
                aiProbability: 0.5,
                humanProbability: 0.5,
                confidence: 0,
                features: null,
                error: error.message
            };
        }
    }
    
    // Generate detailed analysis explanation
    function generateAnalysisExplanation(result) {
        if (!result.features) return "Insufficient text for detailed analysis.";
        
        const f = result.features;
        const aiProb = result.aiProbability;
        
        let explanation = "";
        
        // Overall classification
        if (aiProb > 0.8) {
            explanation += "This content appears to be primarily AI-generated. ";
        } else if (aiProb > 0.6) {
            explanation += "This content shows strong indicators of AI generation, possibly with some human editing. ";
        } else if (aiProb > 0.4) {
            explanation += "This content shows mixed characteristics, making it difficult to determine if it's AI or human-written. ";
        } else if (aiProb > 0.2) {
            explanation += "This content appears to be primarily human-written, with possible AI assistance. ";
        } else {
            explanation += "This content shows strong indicators of human authorship. ";
        }
        
        // Statistics summary
        explanation += `The text contains ${f.wordCount} words across ${f.sentenceCount} sentences`;
        
        if (f.sentenceCount > 0) {
            explanation += ` with an average of ${Math.round(f.avgSentenceLength)} words per sentence. `;
        } else {
            explanation += ". ";
        }
        
        // Top indicators for classification
        explanation += "Key indicators: ";
        
        const indicators = [];
        
        // AI indicators
        if (f.aiPhraseRatio > 0.1) {
            indicators.push(`frequent use of formal transition phrases (${Math.round(f.aiPhraseRatio * 100)}% of sentences)`);
        }
        
        if (f.aiStarterRatio > 0.1) {
            indicators.push(`formulaic sentence starters (${Math.round(f.aiStarterRatio * 100)}% of sentences)`);
        }
        
        if (f.avgSentenceLength > 25) {
            indicators.push(`unusually long sentences (avg ${Math.round(f.avgSentenceLength)} words)`);
        }
        
        if (f.threeGramRepetitionRatio > 0.2) {
            indicators.push("repetitive phrasing patterns");
        }
        
        if (f.paragraphLengthVariance < 0.3 && f.wordCount > 200) {
            indicators.push("unusually consistent paragraph structure");
        }
        
        // Human indicators
        if (f.contractionRatio > 0.05) {
            indicators.push(`frequent use of contractions (${Math.round(f.contractionRatio * 100)}% of words)`);
        }
        
        if (f.informalExprRatio > 0.01) {
            indicators.push("casual/conversational language markers");
        }
        
        if (f.informalPunctRatio > 0.1) {
            indicators.push("varied/informal punctuation patterns");
        }
        
        if (f.firstPersonRatio > 0.05) {
            indicators.push("significant first-person perspective");
        }
        
        if (indicators.length === 0) {
            explanation += "balanced text features without strong indicators in either direction.";
        } else {
            explanation += indicators.join(", ") + ".";
        }
        
        return explanation;
    }
    
    // Format percentage for display
    function formatPercentage(value) {
        return Math.round(value * 100) + '%';
    }
    
    // Handle the analysis when the button is clicked
    analyzeBtn.addEventListener('click', async function() {
        const text = contentInput.value.trim();
        
        if (text.length < 50) {
            alert("Please enter at least 50 characters for accurate analysis.");
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        resultSection.style.display = 'none';
        
        // Initialize the model if not already done
        if (!model) {
            await initModel();
        }
        
        // Simulate loading/processing delay for larger texts
        setTimeout(async function() {
            // Get analysis results
            const result = await analyzeText(text);
            
            // Update the UI with results
            humanGauge.style.width = formatPercentage(result.humanProbability);
            aiGauge.style.width = formatPercentage(result.aiProbability);
            humanPercentage.textContent = formatPercentage(result.humanProbability);
            aiPercentage.textContent = formatPercentage(result.aiProbability);
            
            // Generate content summary
            contentSummary.textContent = generateAnalysisExplanation(result);
            
            // Hide loading and show results
            loadingIndicator.style.display = 'none';
            resultSection.style.display = 'block';
        }, Math.min(1500, Math.max(500, text.length / 10))); // Simulate processing time based on text length
    });
    
    // Initialize on page load
    initModel();
});
