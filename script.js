document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const contentInput = document.getElementById('contentInput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultSection = document.getElementById('resultSection');
    const humanGauge = document.getElementById('humanGauge');
    const aiGauge = document.getElementById('aiGauge');
    const humanPercentage = document.getElementById('humanPercentage');
    const aiPercentage = document.getElementById('aiPercentage');
    const analysisText = document.getElementById('analysisText');

    // Subtle parallax effect
    document.addEventListener('mousemove', function(e) {
        const cards = document.querySelectorAll('.glass-card');
        const mouseX = e.clientX / window.innerWidth - 0.5;
        const mouseY = e.clientY / window.innerHeight - 0.5;
        
        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            const distanceX = (e.clientX - cardCenterX) / (window.innerWidth / 2) * 5;
            const distanceY = (e.clientY - cardCenterY) / (window.innerHeight / 2) * 5;
            
            const rotateX = -distanceY;
            const rotateY = distanceX;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`;
        });
        
        // Move blobs slightly based on mouse position
        const blob1 = document.querySelector('.blob-1');
        const blob2 = document.querySelector('.blob-2');
        
        blob1.style.transform = `translate(${mouseX * 40}px, ${mouseY * 40}px)`;
        blob2.style.transform = `translate(${-mouseX * 40}px, ${-mouseY * 40}px)`;
    });
    
    // Reset card transform when mouse leaves the window
    document.addEventListener('mouseleave', function() {
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach(card => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });

    // Pre-trained model data
    // This simulates a trained model's weights for various linguistic features
    const modelWeights = {
        // Lexical features
        avgWordLength: { weight: 0.12, aiThreshold: 5.2 },
        uniqueWordRatio: { weight: 0.15, aiThreshold: 0.45 },
        rarityScore: { weight: 0.18, aiThreshold: 0.35 },
        
        // Syntactic features
        avgSentenceLength: { weight: 0.08, aiThreshold: 18 },
        syntaxComplexity: { weight: 0.14, aiThreshold: 0.4 },
        punctuationRatio: { weight: 0.07, aiThreshold: 0.11 },
        
        // Structural features
        paragraphConsistency: { weight: 0.13, aiThreshold: 0.8 },
        transitionDiversity: { weight: 0.11, aiThreshold: 0.38 },
        
        // Stylistic features
        burstiness: { weight: 0.17, aiThreshold: 0.32 },
        entropyScore: { weight: 0.16, aiThreshold: 0.7 },
        perplexityEstimate: { weight: 0.19, aiThreshold: 65 }
    };
    
    // AI model feature detection patterns (simulated dataset patterns)
    const aiPatterns = {
        repetitivePatterns: [
            /(?:\b\w+\b)(?:\s+\w+){0,5}\s+\1(?:\s+\w+){0,5}\s+\1/gi,
            /(?:\b\w+\s+\w+\b)(?:\s+\w+){0,10}\s+\1/gi
        ],
        commonPhrases: [
            /it is important to note that/i,
            /in conclusion,/i,
            /on the one hand.*?on the other hand/i,
            /this raises the question/i,
            /needless to say/i
        ],
        predictableStructures: [
            /firstly.*?secondly.*?finally/i,
            /in summary/i,
            /to summarize/i
        ],
        wordChoicePatterns: {
            formalityMarkers: ['therefore', 'thus', 'hence', 'consequently', 'subsequently'],
            hedgingTerms: ['relatively', 'generally', 'typically', 'usually', 'often', 'sometimes']
        }
    };
    
    // Human writing feature detection (simulated dataset patterns)
    const humanPatterns = {
        informalMarkers: [
            /(?:!|\?){2,}/,  // Multiple exclamation or question marks
            /\bi('m| am)\b/i,  // First person usage
            /\byou know\b/i,
            /\bkinda\b/i,
            /\bsort of\b/i
        ],
        inconsistentPunctuation: /([.!?])\s+\w+([,.!?;:])/,
        sentenceLengthVariation: true,  // Analyzed in code
        colloquialisms: ['gonna', 'wanna', 'sorta', 'kinda', 'stuff', 'thing', 'basically'],
        subjectivityMarkers: ['think', 'feel', 'believe', 'opinion', 'seems', 'appears']
    };
    
    // Database of rare words (abbreviated example)
    const rareWords = new Set([
        'abstruse', 'acumen', 'adumbrate', 'ameliorate', 'apocryphal', 'apotheosis', 'archetype',
        'beguile', 'bereft', 'blandishment', 'bombastic', 'bucolic', 'cacophony', 'capricious', 
        'denouement', 'derivative', 'didactic', 'disparate', 'ebullient', 'efficacious', 'effrontery', 
        'egregious', 'ephemeral', 'equivocate', 'ersatz', 'erudite', 'esoteric', 'fastidious',
        'garrulous', 'grandiloquent', 'hackneyed', 'hegemony', 'hermeneutic', 'iconoclast',
        'idiosyncratic', 'inculcate', 'inimitable', 'insipid', 'intransigent', 'inveterate',
        'juxtaposition', 'loquacious', 'mellifluous', 'mendacious', 'meretricious', 'munificent',
        'nebulous', 'obstreperous', 'parsimonious', 'pedantic', 'perfunctory', 'pernicious',
        'perspicacious', 'prescient', 'propitious', 'puerile', 'querulous', 'quixotic',
        'recalcitrant', 'redoubtable', 'sagacious', 'sedulous', 'solipsistic', 'sophomoric',
        'sycophantic', 'tautological', 'tenuous', 'truculent', 'ubiquitous', 'verisimilitude',
        'vituperate', 'vociferous', 'winsome', 'zealous'
    ]);
    
    // Common transition words to measure diversity
    const transitionWords = [
        'however', 'therefore', 'consequently', 'furthermore', 'moreover', 'nevertheless',
        'nonetheless', 'similarly', 'conversely', 'meanwhile', 'subsequently', 'specifically',
        'notably', 'indeed', 'additionally', 'likewise', 'instead', 'thus', 'still', 'besides',
        'accordingly', 'certainly', 'hence', 'alternatively', 'otherwise', 'ultimately'
    ];

    // Run the analysis when the button is clicked
    analyzeBtn.addEventListener('click', function() {
        const text = contentInput.value.trim();
        
        if (text.length < 100) {
            alert('Please enter at least 100 characters for accurate analysis.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        resultSection.style.display = 'none';
        
        // Simulate loading delay
        setTimeout(() => {
            analyzeContent(text);
            loadingIndicator.style.display = 'none';
            resultSection.style.display = 'block';
        }, 1500);
    });
    
    // Advanced content analysis function using simulated dataset patterns
    function analyzeContent(text) {
        // Extract text features
        const features = extractTextFeatures(text);
        
        // Calculate AI score based on model weights and extracted features
        let aiScore = calculateAIScore(features);
        
        // Ensure score is within bounds
        aiScore = Math.max(5, Math.min(95, aiScore));
        const humanScore = 100 - aiScore;
        
        // Update the gauges
        updateGauges(humanScore, aiScore);
        
        // Update analysis text with detailed breakdown
        updateAnalysisText(features, aiScore);
    }
    
    function extractTextFeatures(text) {
        // Prepare text for analysis
        const words = text.match(/\b\w+\b/g) || [];
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/).filter(p => p.trim().length > 0);
        const characters = text.replace(/\s/g, '').length;
        
        // Calculate lexical features
        const avgWordLength = characters / words.length;
        const uniqueWordRatio = uniqueWords.size / words.length;
        
        // Calculate rarity score
        let rareWordCount = 0;
        words.forEach(word => {
            if (rareWords.has(word.toLowerCase())) rareWordCount++;
        });
        const rarityScore = rareWordCount / words.length;
        
        // Calculate syntactic features
        const avgSentenceLength = words.length / sentences.length;
        const punctuationCount = (text.match(/[.!?,;:]/g) || []).length;
        const punctuationRatio = punctuationCount / words.length;
        
        // Calculate syntactic complexity (simple approximation)
        const complexSentences = sentences.filter(s => 
            s.includes(',') || s.includes(';') || s.includes(':') || 
            /\b(although|however|therefore|nevertheless|despite|while|whereas)\b/i.test(s)
        ).length;
        const syntaxComplexity = complexSentences / sentences.length;
        
        // Calculate paragraph consistency
        const paragraphLengths = paragraphs.map(p => p.split(/\s+/).length);
        const paragraphMean = paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length;
        const paragraphVariance = paragraphLengths.reduce((sum, len) => sum + Math.pow(len - paragraphMean, 2), 0) / paragraphLengths.length;
        const paragraphConsistency = 1 - (Math.sqrt(paragraphVariance) / paragraphMean);
        
        // Calculate transition word diversity
        let transitionCount = 0;
        let uniqueTransitions = new Set();
        transitionWords.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            const matches = text.match(regex) || [];
            transitionCount += matches.length;
            if (matches.length > 0) uniqueTransitions.add(word.toLowerCase());
        });
        const transitionDiversity = transitionCount > 0 ? uniqueTransitions.size / transitionCount : 0;
        
        // Calculate burstiness (variation in word usage)
        const wordFreq = {};
        words.forEach(word => {
            const lword = word.toLowerCase();
            wordFreq[lword] = (wordFreq[lword] || 0) + 1;
        });
        const wordFreqValues = Object.values(wordFreq);
        const freqMean = wordFreqValues.reduce((sum, freq) => sum + freq, 0) / wordFreqValues.length;
        const freqVariance = wordFreqValues.reduce((sum, freq) => sum + Math.pow(freq - freqMean, 2), 0) / wordFreqValues.length;
        const burstiness = Math.sqrt(freqVariance) / freqMean;
        
        // Calculate entropy (approximation)
        const wordProbs = wordFreqValues.map(freq => freq / words.length);
        const entropy = wordProbs.reduce((sum, prob) => sum - (prob * Math.log2(prob)), 0);
        const maxEntropy = Math.log2(uniqueWords.size);
        const entropyScore = entropy / maxEntropy;
        
        // AI pattern detection
        let aiPatternMatches = 0;
        
        // Check for repetitive patterns
        aiPatterns.repetitivePatterns.forEach(pattern => {
            const matches = text.match(pattern) || [];
            aiPatternMatches += matches.length;
        });
        
        // Check for common AI phrases
        aiPatterns.commonPhrases.forEach(pattern => {
            if (pattern.test(text)) aiPatternMatches++;
        });
        
        // Check for predictable structures
        aiPatterns.predictableStructures.forEach(pattern => {
            if (pattern.test(text)) aiPatternMatches++;
        });
        
        // Check for formal/hedging word choices
        let formalityCount = 0;
        aiPatterns.wordChoicePatterns.formalityMarkers.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            formalityCount += (text.match(regex) || []).length;
        });
        
        let hedgingCount = 0;
        aiPatterns.wordChoicePatterns.hedgingTerms.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            hedgingCount += (text.match(regex) || []).length;
        });
        
        // Human pattern detection
        let humanPatternMatches = 0;
        
        // Check for informal markers
        humanPatterns.informalMarkers.forEach(pattern => {
            if (pattern.test(text)) humanPatternMatches++;
        });
        
        // Check for inconsistent punctuation
        if (humanPatterns.inconsistentPunctuation.test(text)) humanPatternMatches++;
        
        // Check for sentence length variation
        const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
        const sentenceMean = sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length;
        const sentenceVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - sentenceMean, 2), 0) / sentenceLengths.length;
        const sentenceLengthVariation = Math.sqrt(sentenceVariance) / sentenceMean;
        if (sentenceLengthVariation > 0.5) humanPatternMatches++;
        
        // Check for colloquialisms
        let colloquialismCount = 0;
        humanPatterns.colloquialisms.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            colloquialismCount += (text.match(regex) || []).length;
        });
        if (colloquialismCount > 0) humanPatternMatches++;
        
        // Check for subjectivity markers
        let subjectivityCount = 0;
        humanPatterns.subjectivityMarkers.forEach(word => {
            const regex = new RegExp('\\b' + word + '\\b', 'gi');
            subjectivityCount += (text.match(regex) || []).length;
        });
        if (subjectivityCount > 0) humanPatternMatches++;
        
        // Calculate perplexity estimate (simplified approximation)
        // In a real implementation, this would use an actual language model
        const wordBigramMap = new Map();
        for (let i = 0; i < words.length - 1; i++) {
            const bigram = `${words[i].toLowerCase()} ${words[i + 1].toLowerCase()}`;
            wordBigramMap.set(bigram, (wordBigramMap.get(bigram) || 0) + 1);
        }
        
        const bigramProbs = Array.from(wordBigramMap.values()).map(count => count / (words.length - 1));
        const bigramEntropy = bigramProbs.reduce((sum, prob) => sum - (prob * Math.log2(prob)), 0);
        const perplexityEstimate = Math.pow(2, bigramEntropy);
        
        return {
            // Lexical features
            avgWordLength,
            uniqueWordRatio,
            rarityScore,
            
            // Syntactic features
            avgSentenceLength,
            syntaxComplexity,
            punctuationRatio,
            
            // Structural features
            paragraphConsistency,
            transitionDiversity,
            
            // Stylistic features
            burstiness,
            entropyScore,
            perplexityEstimate,
            
            // Pattern matches
            aiPatternMatches,
            humanPatternMatches,
            formalityCount: formalityCount / words.length,
            hedgingCount: hedgingCount / words.length,
            colloquialismCount: colloquialismCount / words.length,
            subjectivityCount: subjectivityCount / words.length,
            sentenceLengthVariation,
            
            // Raw counts for reporting
            wordCount: words.length,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            uniqueWordCount: uniqueWords.size
        };
    }
    
    function calculateAIScore(features) {
        let score = 50; // Start with neutral
        
        // Apply model weights to features
        Object.keys(modelWeights).forEach(feature => {
            if (feature in features) {
                const { weight, aiThreshold } = modelWeights[feature];
                const featureValue = features[feature];
                
                // Higher score means more likely AI
                if (feature === 'uniqueWordRatio' || feature === 'burstiness' || 
                    feature === 'entropyScore' || feature === 'transitionDiversity' || 
                    feature === 'rarityScore') {
                    // For these features, lower values suggest AI
                    score += (featureValue < aiThreshold) ? weight * 100 : -weight * 100;
                } else if (feature === 'perplexityEstimate') {
                    // Lower perplexity suggests AI (more predictable text)
                    score += (featureValue < aiThreshold) ? weight * 100 : -weight * 100;
                } else {
                    // For other features, higher values suggest AI
                    score += (featureValue > aiThreshold) ? weight * 100 : -weight * 100;
                }
            }
        });
        
        // Adjust for pattern matches
        score += features.aiPatternMatches * 2;
        score -= features.humanPatternMatches * 2;
        
        // Final adjustments based on other indicators
        if (features.formalityCount > 0.05) score += 5;
        if (features.hedgingCount > 0.03) score += 5;
        if (features.colloquialismCount > 0.01) score -= 8;
        if (features.subjectivityCount > 0.02) score -= 8;
        if (features.sentenceLengthVariation > 0.6) score -= 10;
        
        return score;
    }
    
    function updateAnalysisText(features, aiScore) {
        // Determine primary classification
        let classification, confidence;
        
        if (aiScore > 75) {
            classification = "Highly likely AI-generated";
            confidence = "high";
        } else if (aiScore > 60) {
            classification = "Likely AI-generated";
            confidence = "moderate";
        } else if (aiScore > 40) {
            classification = "Mixed or uncertain";
            confidence = "low";
        } else if (aiScore > 25) {
            classification = "Likely human-written";
            confidence = "moderate";
        } else {
            classification = "Highly likely human-written";
            confidence = "high";
        }
        
        // Create detailed analysis
        let keyIndicators = [];
        
        // Add indicators based on features
        if (features.paragraphConsistency > 0.85) 
            keyIndicators.push("Unusually consistent paragraph structure");
        if (features.uniqueWordRatio < 0.4) 
            keyIndicators.push("Low lexical diversity");
        if (features.sentenceLengthVariation < 0.3) 
            keyIndicators.push("Highly consistent sentence lengths");
        if (features.burstiness < 0.25) 
            keyIndicators.push("Lack of natural word usage variation");
        if (features.aiPatternMatches > 3) 
            keyIndicators.push("Contains multiple AI-typical phrases or patterns");
        if (features.rarityScore < 0.01) 
            keyIndicators.push("Absence of rare or unusual vocabulary");
        if (features.formalityCount > 0.05) 
            keyIndicators.push("Heavy use of formal transition words");
        if (features.hedgingCount > 0.04) 
            keyIndicators.push("Frequent hedging language");
        
        // Add human indicators
        if (features.humanPatternMatches > 3) 
            keyIndicators.push("Contains multiple human-typical writing patterns");
        if (features.colloquialismCount > 0.01) 
            keyIndicators.push("Uses casual language and colloquialisms");
        if (features.subjectivityCount > 0.03) 
            keyIndicators.push("Contains subjective expressions and opinions");
        if (features.sentenceLengthVariation > 0.7) 
            keyIndicators.push("Highly varied sentence structures");
        
        // Set HTML with detailed analysis
        analysisText.innerHTML = `
            <h3>${classification} (${confidence} confidence)</h3>
            <p><b>Analysis based on multiple linguistic features extracted from the text:</b></p>
            <ul>
                <li>Word count: ${features.wordCount}</li>
                <li>Unique words: ${features.uniqueWordCount} (${(features.uniqueWordRatio * 100).toFixed(1)}% unique)</li>
                <li>Avg. word length: ${features.avgWordLength.toFixed(2)} characters</li>
                <li>Vocabulary diversity: ${features.entropyScore.toFixed(2)}</li>
                <li>Structural consistency: ${features.paragraphConsistency.toFixed(2)}</li>
            </ul>
            ${keyIndicators.length > 0 ? `
                <p><strong>Key indicators:</strong></p>
                <ul>
                    ${keyIndicators.map(indicator => `<li>${indicator}</li>`).join('')}
                </ul>
            ` : ''}
        `;
    }
    
    // Update the gauge visuals based on scores
    function updateGauges(humanScore, aiScore) {
        // Animate the gauges
        setTimeout(() => {
            humanGauge.style.width = `${humanScore}%`;
            aiGauge.style.width = `${aiScore}%`;
        }, 100);
        
        // Update percentage text with animation
        animateCounter(humanPercentage, 0, Math.round(humanScore));
        animateCounter(aiPercentage, 0, Math.round(aiScore));
    }
    
    // Animate counter from start to end value
    function animateCounter(element, start, end) {
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = 1000 / Math.abs(end - start);
        
        const timer = setInterval(() => {
            current += increment;
            element.textContent = `${current}%`;
            
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                clearInterval(timer);
                element.textContent = `${end}%`;
            }
        }, stepTime);
    }
});