import { ScrapedPageData } from './web-scraper';
import { heuristicsData } from '@/data/heuristics';

export interface HeuristicAnalysisResult {
  id: number;
  title: string;
  shortTitle: string;
  score: number;
  findings: string[];
  recommendations: string[];
}

/**
 * Analyze scraped web page data against Nielsen's 10 usability heuristics
 */
export const analyzeHeuristics = (data: ScrapedPageData): {
  results: HeuristicAnalysisResult[],
  overallScore: number
} => {
  // Generate heuristic results based on scraped data
  const results: HeuristicAnalysisResult[] = heuristicsData.heuristics.map(heuristic => {
    const analysis = analyzeHeuristic(heuristic.id, data);
    return {
      id: heuristic.id,
      title: heuristic.title,
      shortTitle: heuristic.shortTitle,
      score: analysis.score,
      findings: analysis.findings,
      recommendations: analysis.recommendations
    };
  });

  // Calculate overall score
  const overallScore = Math.round(
    results.reduce((sum, result) => sum + result.score, 0) / results.length
  );

  return { results, overallScore };
};

/**
 * Analyze a specific heuristic based on scraped data
 */
function analyzeHeuristic(heuristicId: number, data: ScrapedPageData): {
  score: number,
  findings: string[],
  recommendations: string[]
} {
  switch (heuristicId) {
    case 1:
      return analyzeVisibilityOfSystemStatus(data);
    case 2:
      return analyzeMatchBetweenSystemAndRealWorld(data);
    case 3:
      return analyzeUserControlAndFreedom(data);
    case 4:
      return analyzeConsistencyAndStandards(data);
    case 5:
      return analyzeErrorPrevention(data);
    case 6:
      return analyzeRecognitionRatherThanRecall(data);
    case 7:
      return analyzeFlexibilityAndEfficiency(data);
    case 8:
      return analyzeAestheticAndMinimalistDesign(data);
    case 9:
      return analyzeErrorRecovery(data);
    case 10:
      return analyzeHelpAndDocumentation(data);
    default:
      return {
        score: 50,
        findings: ["Unable to analyze this heuristic with available data"],
        recommendations: ["Conduct manual evaluation for this heuristic"]
      };
  }
}

/**
 * 1. Visibility of System Status
 */
function analyzeVisibilityOfSystemStatus(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for page title
  if (data.title && data.title.length > 5) {
    score += 5;
    findings.push(`Page has a clear title: "${data.title}"`);
  } else {
    score -= 5;
    findings.push("Page is missing a clear title");
    recommendations.push("Add a descriptive page title");
  }

  // Check for forms with feedback mechanisms
  if (data.formCount > 0) {
    if (data.rawHtml.includes('required') || data.rawHtml.includes('aria-required')) {
      score += 5;
      findings.push("Forms indicate required fields to users");
    } else {
      score -= 3;
      recommendations.push("Add clear indicators for required form fields");
    }
    
    if (data.rawHtml.includes('placeholder')) {
      score += 3;
      findings.push("Input fields use placeholders to guide users");
    }
  }

  // Check for feedback elements
  const feedbackIndicators = [
    'loading', 'progress', 'spinner', 'animation', 'fade', 'alert', 'notification',
    'toast', 'status', 'success', 'error', 'warning', 'info'
  ];
  
  let feedbackCount = 0;
  feedbackIndicators.forEach(term => {
    if (data.rawHtml.toLowerCase().includes(term)) {
      feedbackCount++;
    }
  });

  if (feedbackCount >= 3) {
    score += 10;
    findings.push("Multiple feedback mechanisms detected for system status");
  } else if (feedbackCount > 0) {
    score += 5;
    findings.push("Some feedback mechanisms for system status detected");
  } else {
    score -= 10;
    findings.push("Limited visual feedback for system status");
    recommendations.push("Add loading indicators and status updates for user actions");
  }

  // Check for HTTPS (secure connection indicator)
  if (data.hasHttpsProtocol) {
    score += 5;
    findings.push("Uses HTTPS protocol for security status indication");
  } else {
    score -= 5;
    findings.push("Not using HTTPS protocol");
    recommendations.push("Implement HTTPS to improve security status visibility");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  // Add default recommendations if score is low
  if (score < 30 && recommendations.length === 0) {
    recommendations.push("Add visible loading indicators for system operations");
    recommendations.push("Implement real-time status updates for user actions");
  }

  return { score, findings, recommendations };
}

/**
 * 2. Match Between System and the Real World
 */
function analyzeMatchBetweenSystemAndRealWorld(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for technical jargon
  const technicalTerms = [
    'api', 'backend', 'frontend', 'sql', 'json', 'xml', 'http', 'ftp', 
    'sdk', 'ajax', 'algorithm', 'runtime', 'localhost', 'compiler'
  ];
  
  let jargonCount = 0;
  technicalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = data.textContent.match(regex);
    if (matches) {
      jargonCount += matches.length;
    }
  });

  if (jargonCount > 5) {
    score -= 15;
    findings.push(`High amount of technical jargon detected (${jargonCount} instances)`);
    recommendations.push("Replace technical terms with everyday language");
  } else if (jargonCount > 0) {
    score -= 5;
    findings.push(`Some technical jargon detected (${jargonCount} instances)`);
    recommendations.push("Consider simplifying technical language for general users");
  } else {
    score += 10;
    findings.push("Content uses clear, non-technical language");
  }

  // Check for familiar metaphors
  const commonMetaphors = [
    'cart', 'shopping', 'checkout', 'profile', 'dashboard', 'inbox', 
    'folder', 'file', 'trash', 'home', 'menu', 'search'
  ];
  
  let metaphorCount = 0;
  commonMetaphors.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (data.textContent.match(regex)) {
      metaphorCount++;
    }
  });

  if (metaphorCount >= 3) {
    score += 15;
    findings.push("Uses familiar metaphors and concepts from the real world");
  } else if (metaphorCount > 0) {
    score += 5;
    findings.push("Some use of familiar metaphors detected");
  } else {
    score -= 5;
    findings.push("Limited use of familiar real-world metaphors");
    recommendations.push("Incorporate familiar real-world metaphors for better understanding");
  }

  // Check for images with alt text
  if (data.imgCount > 0) {
    const altTextPercent = Math.round((data.imgWithAlt / data.imgCount) * 100);
    
    if (altTextPercent >= 80) {
      score += 10;
      findings.push(`Good use of alt text on images (${altTextPercent}%)`);
    } else if (altTextPercent >= 50) {
      score += 0;
      findings.push(`Moderate use of alt text on images (${altTextPercent}%)`);
      recommendations.push("Improve alt text coverage on images");
    } else {
      score -= 10;
      findings.push(`Poor use of alt text on images (${altTextPercent}%)`);
      recommendations.push("Add descriptive alt text to all images");
    }
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  return { score, findings, recommendations };
}

/**
 * 3. User Control and Freedom
 */
function analyzeUserControlAndFreedom(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for navigation options
  if (data.hasNavigation) {
    score += 10;
    findings.push("Page has navigation menu for freedom of movement");
  } else if (data.linkCount > 5) {
    score -= 5;
    findings.push("Multiple links without clear navigation structure");
    recommendations.push("Implement consistent navigation structure");
  }

  // Check for undo/back functionality
  const controlTerms = ['back', 'previous', 'cancel', 'return', 'undo'];
  let controlCount = 0;
  
  controlTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (data.rawHtml.match(regex)) {
      controlCount++;
    }
  });

  if (controlCount >= 2) {
    score += 15;
    findings.push("Provides user control options (back, cancel, undo)");
  } else if (data.formCount > 0) {
    score -= 10;
    findings.push("Forms may lack clear exit or cancel options");
    recommendations.push("Add cancel/exit options for forms and processes");
  }

  // Check for forms with clear submission and reset options
  if (data.formCount > 0) {
    if (data.rawHtml.includes('type="reset"') || data.rawHtml.includes('clear')) {
      score += 10;
      findings.push("Forms provide reset options for user control");
    } else {
      score -= 5;
      findings.push("Forms may lack reset functionality");
      recommendations.push("Add reset options to forms");
    }
  }

  // Check for confirmation on important actions
  if (data.rawHtml.includes('confirm') || data.rawHtml.includes('are you sure')) {
    score += 10;
    findings.push("Uses confirmation dialogs for important actions");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  if (score < 30 && recommendations.length === 0) {
    recommendations.push("Add clear exit points for multi-step processes");
    recommendations.push("Implement back/cancel functionality");
  }

  return { score, findings, recommendations };
}

/**
 * 4. Consistency and Standards
 */
function analyzeConsistencyAndStandards(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for consistent HTML structure with standard elements
  if (data.hasNavigation && data.hasFooter) {
    score += 10;
    findings.push("Follows standard web layout patterns with header and footer");
  } else {
    score -= 5;
    findings.push("May not follow standard web layout patterns");
    recommendations.push("Implement standard layout with proper header and footer");
  }

  // Check for heading hierarchy
  if (data.h1Count === 1) {
    score += 10;
    findings.push("Proper use of single H1 heading");
  } else if (data.h1Count > 1) {
    score -= 5;
    findings.push(`Multiple H1 headings (${data.h1Count}) create inconsistent structure`);
    recommendations.push("Use only one H1 heading per page");
  } else if (data.h1Count === 0 && data.textContent.length > 500) {
    score -= 10;
    findings.push("Missing main H1 heading on content page");
    recommendations.push("Add a proper H1 heading");
  }

  // Check for form labeling
  if (data.formCount > 0 && data.inputFieldCount > 0) {
    if (data.rawHtml.includes('label') && data.rawHtml.includes('for=')) {
      score += 10;
      findings.push("Form inputs have proper labels");
    } else {
      score -= 10;
      findings.push("Form inputs may lack proper labels");
      recommendations.push("Add labels to all form inputs");
    }
  }

  // Check for consistent terminology
  const inconsistentPairs = [
    ['login', 'sign in'], 
    ['signup', 'register'],
    ['delete', 'remove']
  ];

  let inconsistencies = 0;
  inconsistentPairs.forEach(pair => {
    const [term1, term2] = pair;
    const regex1 = new RegExp(`\\b${term1}\\b`, 'gi');
    const regex2 = new RegExp(`\\b${term2}\\b`, 'gi');
    
    if (data.textContent.match(regex1) && data.textContent.match(regex2)) {
      inconsistencies++;
    }
  });

  if (inconsistencies > 0) {
    score -= 10;
    findings.push("Inconsistent terminology detected");
    recommendations.push("Standardize terminology across the interface");
  } else {
    score += 10;
    findings.push("Consistent terminology throughout content");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  return { score, findings, recommendations };
}

/**
 * 5. Error Prevention
 */
function analyzeErrorPrevention(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for form validation
  if (data.formCount > 0) {
    const validationTerms = ['required', 'pattern', 'minlength', 'maxlength', 'min', 'max', 'validate', 'validation'];
    let validationCount = 0;
    
    validationTerms.forEach(term => {
      if (data.rawHtml.includes(term)) {
        validationCount++;
      }
    });

    if (validationCount >= 3) {
      score += 15;
      findings.push("Strong form validation for error prevention");
    } else if (validationCount > 0) {
      score += 5;
      findings.push("Some form validation detected");
      recommendations.push("Enhance form validation for better error prevention");
    } else {
      score -= 15;
      findings.push("Limited evidence of form validation");
      recommendations.push("Implement form validation with real-time feedback");
    }
  }

  // Check for proper input types
  if (data.inputFieldCount > 0) {
    const specialInputTypes = ['email', 'date', 'number', 'tel', 'url', 'password', 'search'];
    let specialTypeCount = 0;
    
    specialInputTypes.forEach(type => {
      if (data.rawHtml.includes(`type="${type}"`)) {
        specialTypeCount++;
      }
    });

    if (specialTypeCount > 0) {
      score += 10;
      findings.push("Uses appropriate input types for data entry");
    } else {
      score -= 5;
      recommendations.push("Use specialized HTML5 input types");
    }
  }

  // Check for confirmation on destructive actions
  const destructiveTerms = ['delete', 'remove', 'clear', 'reset', 'cancel'];
  const confirmationTerms = ['confirm', 'sure', 'warning', 'caution', 'verify'];
  
  let hasDestructiveActions = false;
  destructiveTerms.forEach(term => {
    if (data.rawHtml.toLowerCase().includes(term)) {
      hasDestructiveActions = true;
    }
  });
  
  let hasConfirmations = false;
  confirmationTerms.forEach(term => {
    if (data.rawHtml.toLowerCase().includes(term)) {
      hasConfirmations = true;
    }
  });
  
  if (hasDestructiveActions && hasConfirmations) {
    score += 10;
    findings.push("Confirmation for destructive actions detected");
  } else if (hasDestructiveActions && !hasConfirmations) {
    score -= 15;
    findings.push("Destructive actions without confirmation dialogs");
    recommendations.push("Add confirmation dialogs for irreversible actions");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  return { score, findings, recommendations };
}

/**
 * 6. Recognition Rather Than Recall
 */
function analyzeRecognitionRatherThanRecall(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for visible navigation
  if (data.hasNavigation) {
    score += 10;
    findings.push("Navigation options are visible rather than hidden");
  }

  // Check for placeholders in form inputs
  if (data.inputFieldCount > 0) {
    if (data.rawHtml.includes('placeholder=')) {
      score += 10;
      findings.push("Input fields use placeholders to reduce memory load");
    } else {
      score -= 5;
      findings.push("Input fields may lack placeholders or hints");
      recommendations.push("Add placeholders to input fields");
    }
  }

  // Check for visible labels on form elements
  if (data.formCount > 0) {
    if (data.rawHtml.includes('<label')) {
      score += 10;
      findings.push("Form elements have visible labels");
    } else {
      score -= 10;
      findings.push("Form elements may lack visible labels");
      recommendations.push("Add visible labels to all form elements");
    }
  }

  // Check for autocomplete functionality
  if (data.inputFieldCount > 0) {
    if (data.rawHtml.includes('autocomplete=') || data.rawHtml.includes('<datalist')) {
      score += 10;
      findings.push("Uses autocomplete to minimize recall");
    } else {
      score -= 5;
      recommendations.push("Add autocomplete functionality to common fields");
    }
  }

  // Check for clear iconography
  if (data.rawHtml.includes('icon') || data.rawHtml.includes('svg')) {
    score += 5;
    findings.push("Uses icons to aid recognition");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  if (score < 30 && recommendations.length === 0) {
    recommendations.push("Make options visible instead of requiring recall");
    recommendations.push("Use recognition-based interface elements");
  }

  return { score, findings, recommendations };
}

/**
 * 7. Flexibility and Efficiency of Use
 */
function analyzeFlexibilityAndEfficiency(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for keyboard shortcuts
  if (data.rawHtml.includes('accesskey=') || 
      data.rawHtml.includes('keyboard') || 
      data.rawHtml.includes('shortcut') ||
      data.rawHtml.includes('keydown') ||
      data.rawHtml.includes('keyup')) {
    score += 15;
    findings.push("Provides keyboard shortcuts for efficiency");
  } else {
    score -= 5;
    recommendations.push("Implement keyboard shortcuts for common actions");
  }

  // Check for search functionality
  if (data.rawHtml.includes('search') || 
      data.rawHtml.includes('type="search"') ||
      data.rawHtml.includes('query')) {
    score += 10;
    findings.push("Offers search functionality for efficient access");
  } else if (data.textContent.length > 2000) {
    score -= 5;
    findings.push("Content-heavy page without apparent search functionality");
    recommendations.push("Add search functionality for content-heavy pages");
  }

  // Check for filters or sorting options
  if (data.rawHtml.includes('filter') || 
      data.rawHtml.includes('sort') ||
      data.rawHtml.includes('order')) {
    score += 10;
    findings.push("Provides filtering or sorting options for efficiency");
  }

  // Check for pagination or infinite scroll
  if (data.rawHtml.includes('pagination') || 
      data.rawHtml.includes('page=') ||
      data.rawHtml.includes('infinite scroll') ||
      data.rawHtml.includes('load more')) {
    score += 10;
    findings.push("Implements pagination or infinite scroll for large content sets");
  }

  // Check for responsive design
  if (data.rawHtml.includes('media') ||
      data.rawHtml.includes('@media') ||
      data.rawHtml.includes('responsive') ||
      data.rawHtml.includes('viewport')) {
    score += 5;
    findings.push("Uses responsive design for different devices");
  } else {
    score -= 5;
    recommendations.push("Implement responsive design for different devices");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  return { score, findings, recommendations };
}

/**
 * 8. Aesthetic and Minimalist Design
 */
function analyzeAestheticAndMinimalistDesign(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Analyze text content length relative to page purpose
  const textLength = data.textContent.length;
  if (textLength > 10000) {
    score -= 10;
    findings.push("Large amount of text content may overwhelm users");
    recommendations.push("Consider breaking content into smaller, focused sections");
  } else if (textLength < 1000 && data.linkCount < 5) {
    score += 10;
    findings.push("Concise content approach");
  }

  // Check for excessive use of images
  if (data.imgCount > 20) {
    score -= 10;
    findings.push(`High number of images (${data.imgCount}) may create visual clutter`);
    recommendations.push("Reduce the number of images to focus on essential content");
  }

  // Check for consistent spacing
  if (data.rawHtml.includes('margin') && data.rawHtml.includes('padding')) {
    score += 5;
    findings.push("Uses CSS spacing for visual organization");
  }

  // Check for use of whitespace
  if (data.rawHtml.includes('space') || 
      data.rawHtml.includes('gap') || 
      data.rawHtml.includes('grid') ||
      data.rawHtml.includes('flex')) {
    score += 10;
    findings.push("Layout suggests use of whitespace and modern layout techniques");
  }

  // Check for consistent typography
  if (data.rawHtml.includes('font-family') || 
      data.rawHtml.includes('typography') || 
      data.rawHtml.includes('text-')) {
    score += 5;
    findings.push("Attention to typography detected");
  }

  // Check for color consistency
  if (data.rawHtml.includes('color:') || 
      data.rawHtml.includes('background-color')) {
    // Rough estimate - more sophisticated analysis would require parsing CSS
    const colorMatches = data.rawHtml.match(/color:\s*#[0-9a-f]{3,6}/gi) || [];
    if (colorMatches.length > 15) {
      score -= 5;
      findings.push("Potentially too many different colors used");
      recommendations.push("Reduce color palette for more cohesive design");
    } else {
      score += 5;
      findings.push("Appears to use a controlled color palette");
    }
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  if (score < 30 && recommendations.length === 0) {
    recommendations.push("Simplify the interface by removing unnecessary elements");
    recommendations.push("Focus on essential content and functionality");
  }

  return { score, findings, recommendations };
}

/**
 * 9. Help Users Recognize, Diagnose, and Recover from Errors
 */
function analyzeErrorRecovery(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for error message terms
  const errorTerms = ['error', 'invalid', 'failed', 'wrong', 'incorrect'];
  let errorMessageCount = 0;
  
  errorTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = data.rawHtml.match(regex);
    if (matches) {
      errorMessageCount += matches.length;
    }
  });

  if (errorMessageCount > 0) {
    score += 5;
    findings.push("Error messaging detected in the interface");
    
    // Check for helpful error messages
    const helpfulErrorTerms = ['try', 'help', 'suggestion', 'recommend', 'please', 'fix'];
    let helpfulCount = 0;
    
    helpfulErrorTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (data.rawHtml.match(regex)) {
        helpfulCount++;
      }
    });
    
    if (helpfulCount >= 2) {
      score += 10;
      findings.push("Error messages appear to provide helpful guidance");
    } else {
      score -= 5;
      findings.push("Error messages may not provide adequate recovery help");
      recommendations.push("Enhance error messages with specific recovery instructions");
    }
  }

  // Check for validation feedback
  if (data.formCount > 0) {
    if (data.rawHtml.includes('invalid') || 
        data.rawHtml.includes('valid') || 
        data.rawHtml.includes('error')) {
      score += 10;
      findings.push("Form validation with feedback detected");
    } else {
      score -= 5;
      findings.push("Forms may lack clear validation feedback");
      recommendations.push("Add clear validation feedback to forms");
    }
  }

  // Check for visual error indicators
  if (data.rawHtml.includes('alert') || 
      data.rawHtml.includes('error') && data.rawHtml.includes('class')) {
    score += 10;
    findings.push("Visual error indicators likely present");
  }

  // Check for form field-level error handling
  if (data.formCount > 0 && data.rawHtml.includes('aria-invalid')) {
    score += 15;
    findings.push("Accessibility-focused form error handling detected");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  if (score < 30 && recommendations.length === 0) {
    recommendations.push("Implement clear, human-readable error messages");
    recommendations.push("Add specific guidance on how to recover from errors");
  }

  return { score, findings, recommendations };
}

/**
 * 10. Help and Documentation
 */
function analyzeHelpAndDocumentation(data: ScrapedPageData) {
  let score = 50;
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Check for help section
  const helpTerms = ['help', 'faq', 'support', 'guide', 'tutorial', 'documentation', 'instructions'];
  let helpSectionPresent = false;
  
  helpTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (data.rawHtml.match(regex)) {
      helpSectionPresent = true;
    }
  });

  if (helpSectionPresent) {
    score += 15;
    findings.push("Help section or documentation detected");
  } else {
    score -= 10;
    findings.push("No obvious help or documentation section");
    recommendations.push("Add a help or FAQ section");
  }

  // Check for contextual help
  if (data.rawHtml.includes('tooltip') || 
      data.rawHtml.includes('title=') || 
      data.rawHtml.includes('aria-describedby')) {
    score += 10;
    findings.push("Contextual help likely available via tooltips or descriptions");
  } else {
    score -= 5;
    recommendations.push("Add tooltips or contextual help for complex features");
  }

  // Check for contact or support options
  if (data.rawHtml.includes('contact') || 
      data.rawHtml.includes('support') || 
      data.rawHtml.includes('email us')) {
    score += 10;
    findings.push("Contact or support options available");
  } else {
    score -= 5;
    findings.push("Limited contact or support options");
    recommendations.push("Add clear contact or support information");
  }

  // Check for search functionality for help content
  if ((data.rawHtml.includes('search') || data.rawHtml.includes('find')) && 
      helpSectionPresent) {
    score += 10;
    findings.push("Search functionality for help content detected");
  }

  // Cap score between 1-100
  score = Math.max(1, Math.min(100, score));
  
  if (score < 30 && recommendations.length === 0) {
    recommendations.push("Create searchable help documentation");
    recommendations.push("Add contextual help for complex features");
  }

  return { score, findings, recommendations };
}