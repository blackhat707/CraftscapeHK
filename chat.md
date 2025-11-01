# AI-Assisted Development Documentation

## Project: CraftscapeHK - Hong Kong Traditional Crafts Platform

---

## AI Interaction Overview

### AI Tools Used

**Primary Tool: Claude (Anthropic)**
- **Role**: Architecture planning, code generation, debugging, and UX consultation
- **Usage Scope**: Frontend component development, backend API design, multilingual implementation, and user experience optimization

**Secondary Tool: GitHub Copilot**
- **Role**: Code completion and inline suggestions
- **Usage Scope**: Repetitive code patterns, TypeScript type definitions, and boilerplate generation

### Overall Approach

Throughout the development of CraftscapeHK, AI tools served as collaborative partners in solving complex problems, particularly in areas requiring bilingual support (English/Traditional Chinese), responsive design patterns, and integration of modern React patterns with TypeScript. The AI assistance was most valuable in architectural decisions, component structure, and implementing best practices for internationalization.

---

## Prompting Details

### Prompt 1: Initial Architecture Design

**Prompt:**
```
I'm building a web platform called CraftscapeHK to promote Hong Kong traditional crafts. 
The app needs to support:
- English and Traditional Chinese (繁體中文) languages
- User roles: regular users and artisans
- Features: Explore crafts, Events, Marketplace, AI Studio for craft design
- Mobile-first responsive design
- React + TypeScript frontend with NestJS backend

Can you help me design the folder structure and recommend the tech stack?
```

**Response Summary:**
The AI suggested a modular architecture with clear separation of concerns:
- Component-based structure with `components/`, `pages/`, and `views/` directories
- Context API for global state (Theme, Language, App)
- Separate service layer for API calls (`services/`)
- Backend modules organized by domain (crafts, events, orders, products, messages)
- i18n implementation using context rather than heavy libraries

**Impact on Project:**
This response directly influenced the current project structure. The separation between reusable `components/` (like BottomNav, Icon), routed `pages/` (Events, Explore, Profile), and complex `views/` (AiStudio, CraftDetail) became the foundation of the codebase. The Context-based approach for theming and language switching proved lightweight and effective.

---

### Prompt 2: Bilingual Content Management

**Prompt:**
```
For the bilingual support in CraftscapeHK, I need to handle English and Traditional Chinese.
Some challenges:
- Craft names and descriptions need translation
- UI elements must switch seamlessly
- Some content comes from database (user-generated), some is static UI text
- Need to support right-to-left friendly layouts

What's the best pattern for managing this without using heavy i18n libraries?
```

**Response Summary:**
The AI recommended:
- Separate locale files (`locales/en.ts`, `locales/zh.ts`) for static UI text
- LanguageContext provider to manage current language state globally
- Database schema to include both `nameEn` and `nameZh` fields for user-generated content
- Translation service for AI-generated content using Google's Translation API
- Conditional rendering based on language state: `{language === 'en' ? nameEn : nameZh}`

**Impact on Project:**
Implemented the exact pattern suggested. Created `contexts/LanguageContext.tsx` that provides language state and toggle function throughout the app. The locale files export typed objects ensuring type safety. Database entities like Craft, Event, and Product include bilingual fields. The `services/translationService.ts` handles dynamic translation needs, particularly for AI-generated craft descriptions.

---

### Prompt 3: Onboarding User Experience

**Prompt:**
```
I need to create an onboarding guide for new users of CraftscapeHK. The guide should:
- Explain key features: Explore, Events, Marketplace, AI Studio
- Be dismissible and not shown again
- Work for both regular users and artisans (different nav items)
- Feel smooth and not intrusive
- Support both languages

Should I use a library like react-joyride or build custom?
```

**Response Summary:**
The AI suggested building a custom solution for better control and lighter bundle size:
- Use localStorage to track onboarding completion
- Create a swipeable card carousel for each feature
- Overlay with semi-transparent backdrop
- Include visual indicators (dots) for progress
- Keep it simple with "Skip" and "Next" buttons
- Render different content based on user role

**Code Example Provided:**
```typescript
const [currentStep, setCurrentStep] = useState(0);
const [showOnboarding, setShowOnboarding] = useState(
  !localStorage.getItem('onboardingCompleted')
);

const handleComplete = () => {
  localStorage.setItem('onboardingCompleted', 'true');
  setShowOnboarding(false);
};
```

**Impact on Project:**
Created `components/OnboardingGuide.tsx` following this pattern. The component renders different onboarding flows for regular users vs artisans, with smooth transitions between steps. The implementation is fully bilingual and integrates seamlessly with the app's design system. This approach avoided adding unnecessary dependencies while providing a polished UX.

---

### Prompt 4: Carousel Component with Swipe Gestures

**Prompt:**
```
For the Explore page, I want to build a carousel that displays featured crafts. Requirements:
- Touch-friendly swipe gestures on mobile
- Smooth animations
- Auto-play with pause on hover
- Dots indicator
- Works with dynamic content from API
- Accessible keyboard navigation

How should I implement this in React + TypeScript without using a heavy library?
```

**Response Summary:**
The AI provided a detailed implementation strategy:
- Use React's `useRef` for the carousel container
- Track touch events with `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Calculate swipe distance and velocity to determine intent
- Implement `setInterval` for auto-play with cleanup
- Use CSS transforms for smooth hardware-accelerated transitions
- Add keyboard event listeners for arrow key navigation
- TypeScript interfaces for touch tracking state

**Sample Code Structure:**
```typescript
interface TouchState {
  startX: number;
  currentX: number;
  isDragging: boolean;
}

const handleTouchMove = (e: TouchEvent) => {
  if (!touchState.isDragging) return;
  const diff = e.touches[0].clientX - touchState.startX;
  // Apply transform with threshold
};
```

**Impact on Project:**
The `components/ExploreCarousel.tsx` was built based on this guidance. Implemented custom swipe detection logic that feels native on mobile devices. Added momentum-based swiping where quick flicks advance slides even with small distances. The carousel auto-advances every 5 seconds but pauses when user interacts. Accessibility was enhanced with ARIA labels and keyboard support.

---

### Prompt 5: AI Studio Integration and Image Generation

**Prompt:**
```
The AI Studio feature lets users design custom crafts:
1. Enter text description (e.g., "dragon knotting pattern in red and gold")
2. AI generates a reference image
3. User can refine with additional prompts
4. Final design can be saved and shared with artisans

I need help with:
- Managing multi-step workflow state
- Calling AI image generation API (using Google Gemini)
- Handling loading states and errors gracefully
- Bilingual prompt handling

What's a clean architecture for this feature?
```

**Response Summary:**
The AI recommended:
- Separate view component (`views/AiStudio.tsx`) for the complex workflow
- Backend service (`server/src/ai/`) to handle API calls securely (never expose keys to frontend)
- Multi-stage state management: prompt input → generating → result display → refinement
- Translation service to convert Chinese prompts to English before sending to AI
- Error boundaries and fallback UI for API failures
- Loading spinners with estimated time feedback

**Architectural Pattern Suggested:**
```typescript
// Frontend: views/AiStudio.tsx
const [stage, setStage] = useState<'input' | 'generating' | 'result'>('input');
const [generatedImage, setGeneratedImage] = useState<string | null>(null);

const handleGenerate = async (prompt: string) => {
  setStage('generating');
  const result = await apiService.generateCraftImage(prompt);
  setGeneratedImage(result.imageUrl);
  setStage('result');
};

// Backend: server/src/ai/ai.service.ts
async generateImage(prompt: string, language: string) {
  // Translate if needed
  const englishPrompt = await this.translatePrompt(prompt, language);
  // Call Gemini API
  const result = await this.geminiClient.generateImage(englishPrompt);
  return result;
}
```

**Impact on Project:**
Implemented the AI Studio following this multi-layer architecture. The frontend focuses on UX and state management while the backend handles all AI API interactions securely. Added the `services/geminiService.ts` and `server/src/ai/ai.service.ts` to separate concerns. The bilingual support works seamlessly by detecting input language and translating when necessary. Error handling includes user-friendly messages in both languages with retry functionality.

---

## Project Evolution

### Phase 1: Foundation
**AI Contribution:** Architecture and scaffolding
- Started with AI-suggested folder structure and tech stack
- Set up TypeScript configs, ESLint, and build tools with AI guidance
- Established Context patterns for global state management

**Breakthrough:** The decision to use Context API instead of Redux or other state management libraries simplified the architecture significantly. The AI's reasoning about bundle size and unnecessary complexity for this project's scale was spot-on.

### Phase 2: Core Features
**AI Contribution:** Component development and API integration
- Built navigation components with role-based rendering
- Implemented bilingual content system
- Created service layer for backend communication
- Developed event listing and craft exploration features

**Breakthrough:** The pattern of separating concerns between `pages/` (route-level components) and `views/` (complex feature components) emerged from AI suggestions. This made the codebase more maintainable and testable.

### Phase 3: User Experience
**AI Contribution:** UX refinements and interactions
- Custom carousel with gesture support
- Onboarding guide implementation
- Theme toggle (light/dark mode)
- Loading states and error handling improvements

**Breakthrough:** Building custom interactive components instead of relying on heavy libraries reduced bundle size by ~200KB and gave us complete control over styling and behavior. The AI's cost-benefit analysis of library vs. custom implementation was invaluable.

### Phase 4: AI Integration
**AI Contribution:** Advanced feature implementation
- AI Studio workflow design
- Integration with Google Gemini for image generation
- Translation service for bilingual AI interactions
- Secure API key management patterns

**Breakthrough:** The AI suggested separating the translation service into both frontend and backend components. This allowed real-time translation for UI feedback while keeping API costs down by doing batch translations server-side. This architectural decision improved both performance and cost efficiency.

### Phase 5: Polish and Optimization
**AI Contribution:** Code review and refinements
- TypeScript type safety improvements
- Accessibility enhancements (ARIA labels, keyboard navigation)
- Performance optimization (lazy loading, code splitting)
- Mobile responsiveness fine-tuning

**Refinement:** AI code review caught several subtle bugs, including race conditions in async state updates and missing error boundaries. The suggestion to use TypeScript's strict mode caught type errors that would have been runtime bugs.

---

## Key Learnings

### What Worked Well
1. **Iterative Prompting**: Starting with high-level architecture questions and drilling down into specific implementations was more effective than asking for complete solutions.

2. **Context Sharing**: Providing the AI with project constraints (bilingual, mobile-first, specific APIs) led to more relevant suggestions.

3. **Code Review**: Using AI to review completed code helped catch edge cases and suggest optimizations.

### What Required Adjustment
1. **AI Suggestions Needed Adaptation**: Some suggested patterns were overly complex for our use case. Critical thinking was essential to simplify while retaining benefits.

2. **Library Recommendations**: AI sometimes suggested popular libraries that were overkill. We learned to question whether custom implementations would be simpler.

3. **Business Logic**: AI excelled at technical implementation but needed guidance on Hong Kong-specific cultural considerations and craft terminology.

---

## Conclusion

Generative AI served as a knowledgeable pair programmer throughout the CraftscapeHK development process. The most valuable aspects were:
- Rapid prototyping of architectural patterns
- TypeScript type safety guidance
- Bilingual implementation strategies
- UX best practices and accessibility considerations

The AI accelerated development significantly, particularly in areas outside my expertise (i18n, gesture handling, AI API integration). However, human judgment remained essential for making final decisions about architecture, user experience, and cultural appropriateness.

The resulting platform successfully combines modern web technologies with a focus on preserving and promoting Hong Kong's traditional crafts, made possible through thoughtful human-AI collaboration.

---

**Document Version:** 1.0  
**Last Updated:** November 1, 2025  
**Project Repository:** [CraftscapeHK](https://github.com/gracetyy/CraftscapeHK)

