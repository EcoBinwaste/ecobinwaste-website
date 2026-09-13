/* ==========================================================
   Ecobin Waste — site behavior
   Each feature below is wrapped in its own try/catch so a
   failure in one (e.g. carousel) can never disable another
   (e.g. the chat bot). See config.js for the live business settings
   such as the WhatsApp number and analytics ID.
   ========================================================== */


  // ---- Loader ----
  try{
    window.addEventListener('load', function(){
      var l = document.getElementById('loader');
      if (l) l.classList.add('done');
    });
  }catch(e){ console.error('Loader init failed:', e); }



  // ---- Scroll progress + scroll-to-top + active nav ----
  try{
    var progressBar = document.getElementById('scrollProgress');
    var scrollTopBtn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', function(){
      try{
        var h = document.documentElement;
        var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        if (progressBar) progressBar.style.width = scrolled + '%';
        if (scrollTopBtn) scrollTopBtn.classList.toggle('show', h.scrollTop > 500);
      }catch(e){ console.error('Scroll handler failed:', e); }
    });
  }catch(e){ console.error('Scroll progress init failed:', e); }

  // ---- Scroll depth tracking ----
  try{
    var depthsFired = { 25:false, 50:false, 75:false, 100:false };
    window.addEventListener('scroll', function(){
      try{
        var h = document.documentElement;
        var pct = Math.round((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
        [25,50,75,100].forEach(function(mark){
          if (pct >= mark && !depthsFired[mark]){
            depthsFired[mark] = true;
            trackEvent('scroll_depth', { percent: mark });
          }
        });
      }catch(e){ console.error('Scroll depth handler failed:', e); }
    });
  }catch(e){ console.error('Scroll depth init failed:', e); }

  try{
    var navLinks = document.querySelectorAll('[data-nav]');
    var navSections = Array.prototype.map.call(navLinks, function(l){ return document.querySelector(l.getAttribute('href')); });
    if ('IntersectionObserver' in window){
      var navIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var id = '#' + entry.target.id;
          var link = document.querySelector('[data-nav][href="' + id + '"]');
          if (!link) return;
          if (entry.isIntersecting){
            navLinks.forEach(function(l){ l.classList.remove('active'); });
            link.classList.add('active');
          }
        });
      }, { rootMargin: '-40% 0px -50% 0px' });
      navSections.forEach(function(s){ if (s) navIO.observe(s); });
    }
  }catch(e){ console.error('Active-nav init failed:', e); }



  // ---- Theme toggle (light mode is default; dark mode is opt-in) ----
  var isDark = false;
  try{ isDark = localStorage.getItem('ecobin-theme') === 'dark'; }catch(e){}
  function applyTheme(){
  try{
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    );

    document.querySelectorAll('.theme-toggle, .mobile-theme-btn').forEach(function(btn){
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });

    // Keep the mobile menu label synchronized with the current theme.
    document.querySelectorAll('.mobile-theme-btn span').forEach(function(label){
      label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });

    // Keep the accessible label synchronized too.
    document.querySelectorAll('.mobile-theme-btn').forEach(function(btn){
      btn.setAttribute(
        'aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });

  }catch(e){
    console.error('Theme apply failed:', e);
  }
}
  applyTheme();
  function toggleTheme(){
  try{
    isDark = !isDark;

    try{
      localStorage.setItem(
        'ecobin-theme',
        isDark ? 'dark' : 'light'
      );
    }catch(storageErr){}

    applyTheme();

    trackEvent('theme_toggle', {
      theme: isDark ? 'dark' : 'light'
    });

    // Close mobile menu after changing theme
    try{
      var mobileNav = document.querySelector('nav.main-nav');
      var mobileMenuBtn = document.getElementById('menuToggle');

      if (mobileNav && mobileNav.classList.contains('mobile-open')){
        mobileNav.classList.remove('mobile-open');

        if (mobileMenuBtn){
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
          mobileMenuBtn.setAttribute('aria-label', 'Open menu');
        }
      }
    }catch(menuErr){
      console.error('Mobile menu close after theme toggle failed:', menuErr);
    }

  }catch(e){
    console.error('Theme toggle failed:', e);
  }
}
  // ---- Mobile menu ----
var toggleMobileMenu = function(){};

try{
  var mainNav = document.querySelector('nav.main-nav');
  var menuBtn = document.getElementById('menuToggle');

  if (mainNav && menuBtn){

    function closeMobileMenu(){
      mainNav.classList.remove('mobile-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    }

    toggleMobileMenu = function(){
      var isOpen = mainNav.classList.toggle('mobile-open');

      menuBtn.setAttribute(
        'aria-expanded',
        isOpen ? 'true' : 'false'
      );

      menuBtn.setAttribute(
        'aria-label',
        isOpen ? 'Close menu' : 'Open menu'
      );
    };

    // Clicking a navigation link closes the menu.
    mainNav.querySelectorAll('a[data-nav], .mobile-book-btn').forEach(function(link){
      link.addEventListener('click', function(){
        closeMobileMenu();
      });
    });

    // Clicking outside the mobile menu closes it.
    document.addEventListener('click', function(e){

      if (!mainNav.classList.contains('mobile-open')){
        return;
      }

      var clickedInsideMenu = mainNav.contains(e.target);
      var clickedMenuButton = menuBtn.contains(e.target);

      if (!clickedInsideMenu && !clickedMenuButton){
        closeMobileMenu();
      }

    });

    // Escape key closes the menu.
    document.addEventListener('keydown', function(e){
      if (
        e.key === 'Escape' &&
        mainNav.classList.contains('mobile-open')
      ){
        closeMobileMenu();
        menuBtn.focus();
      }
    });

  }

}catch(e){
  console.error('Mobile menu init failed:', e);
}


  // ---- Scroll reveal ----
  try{
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){ entry.target.classList.add('in-view'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function(el){ io.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add('in-view'); });
    }
  }catch(e){ console.error('Scroll reveal init failed:', e); }



  // ---- Hero carousel ----
  var goToSlide = function(){}, changeSlide = function(){};
  try{
    var slides = document.querySelectorAll('#carousel .slide');
    var dotsWrap = document.getElementById('carDots');
    var curSlide = 0, slideTimer;
    if (slides.length && dotsWrap){
      slides.forEach(function(s, i){
        var d = document.createElement('button');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        d.onclick = function(){ goToSlide(i); };
        dotsWrap.appendChild(d);
      });
      var dots = dotsWrap.querySelectorAll('.dot');
      goToSlide = function(i){
        try{
          slides[curSlide].classList.remove('active'); dots[curSlide].classList.remove('active');
          curSlide = (i + slides.length) % slides.length;
          slides[curSlide].classList.add('active'); dots[curSlide].classList.add('active');
          resetAutoplay();
        }catch(e){ console.error('goToSlide failed:', e); }
      };
      changeSlide = function(dir){ goToSlide(curSlide + dir); };
      var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var resetAutoplay = function(){
        clearInterval(slideTimer);
        // Respect reduced-motion: manual navigation (dots/arrows) still works below,
        // the carousel just doesn't auto-advance on its own.
        if (!prefersReducedMotion){
          slideTimer = setInterval(function(){ changeSlide(1); }, 4500);
        }
      };
      resetAutoplay();
    }
  }catch(e){ console.error('Carousel init failed:', e); }



    // ---- EcoBin Waste FAQ Chatbot ----
  // Safe intent-based matching.
  // IMPORTANT:
  // - EcoBin Waste is an e-waste-focused collection/aggregation business.
  // - EcoBin Waste is NOT currently presented as a recycler/certified recycler.
  // - Do NOT promise a disposal certificate.
  // - Unknown questions must use the safe fallback instead of guessing.

  var toggleChat = function(){ console.error('Chat not initialized.'); };
  var sendChatText = function(){};

  try{

    var FAQ = [

      /* =========================================================
         1. PICKUP COST
         ========================================================= */
      {
        id: 'pickup_cost',
        q: 'Is pickup free?',
        phrases: [
          'is pickup free',
          'is the pickup free',
          'do you charge for pickup',
          'do you charge for collection',
          'any pickup charge',
          'any collection charge',
          'free pickup',
          'free collection',
          'what is the pickup charge',
          'how much for pickup'
        ],
        keywords: [
          ['free', 'pickup'],
          ['free', 'collection'],
          ['charge', 'pickup'],
          ['cost', 'pickup']
        ],
        a: "For most e-waste pickups, we do not charge a pickup fee and there is no minimum quantity. For bulk or higher-value scrap, we may offer a purchase price instead. Share your items and quantity with us and we'll confirm what applies."
      },


      /* =========================================================
         2. SCRAP BUYING
         ========================================================= */
      {
        id: 'scrap_purchase',
        q: 'Do you buy scrap?',
        phrases: [
          'do you buy scrap',
          'can i sell scrap',
          'do you purchase scrap',
          'can you buy my scrap',
          'will you buy my scrap',
          'do you pay for scrap',
          'can i sell my old electronics',
          'do you buy old electronics'
        ],
        keywords: [
          ['buy', 'scrap'],
          ['sell', 'scrap'],
          ['purchase', 'scrap'],
          ['pay', 'scrap'],
          ['buy', 'electronics'],
          ['sell', 'electronics']
        ],
        a: "Yes. Depending on the material, condition and quantity, we may purchase valuable or bulk scrap instead of treating it as a free pickup. Send us the item details and quantity and we'll confirm."
      },


      /* =========================================================
         3. SERVICE AREAS
         ========================================================= */
      {
        id: 'service_area',
        q: 'Which areas do you cover?',
        phrases: [
          'which areas do you cover',
          'what areas do you cover',
          'where do you provide pickup',
          'where do you collect',
          'do you collect in kalyan',
          'do you collect in dombivali',
          'do you collect in ulhasnagar',
          'do you collect in navi mumbai',
          'are you available in my area'
        ],
        keywords: [
          ['area', 'cover'],
          ['service', 'area'],
          ['pickup', 'kalyan'],
          ['pickup', 'dombivali'],
          ['pickup', 'ulhasnagar'],
          ['pickup', 'navi', 'mumbai'],
          ['collect', 'kalyan'],
          ['collect', 'dombivali'],
          ['collect', 'ulhasnagar'],
          ['collect', 'navi', 'mumbai']
        ],
        a: "We currently focus on Kalyan, Dombivali, Ulhasnagar and Navi Mumbai. If you are just outside these areas, you can still contact us and we'll check whether pickup is possible."
      },


      /* =========================================================
         4. COLLECTION ACKNOWLEDGEMENT
         ========================================================= */
      {
        id: 'collection_acknowledgement',
        q: 'What do I get after a pickup?',
        phrases: [
          'what do i get after a pickup',
          'what do i get after collection',
          'do i get a receipt',
          'do you give a receipt',
          'do you provide acknowledgement',
          'do you provide collection acknowledgement',
          'what proof do i get after pickup',
          'do i get proof of collection'
        ],
        keywords: [
          ['collection', 'acknowledgement'],
          ['pickup', 'acknowledgement'],
          ['collection', 'receipt'],
          ['pickup', 'receipt'],
          ['proof', 'collection']
        ],
        a: "We can provide a Collection Acknowledgement confirming the items collected from you and the collection date. This is a collection record; it is not a disposal certificate."
      },


      /* =========================================================
         5. DISPOSAL CERTIFICATE
         ========================================================= */
      {
        id: 'disposal_certificate',
        q: 'Do you provide a disposal certificate?',
        phrases: [
          'do you provide a disposal certificate',
          'can you provide a disposal certificate',
          'do i get a disposal certificate',
          'can i get a disposal certificate',
          'where is my disposal certificate',
          'do you give disposal certificate',
          'do you issue disposal certificate',
          'what about disposal certificate',
          'certificate for disposal',
          'certificate of disposal',
          'e waste disposal certificate'
        ],
        keywords: [
          ['disposal', 'certificate'],
          ['disposal', 'certification'],
          ['certificate', 'disposal']
        ],
        a: "Currently, EcoBin Waste does not claim to provide a disposal certificate. We provide a Collection Acknowledgement for the collection record. If our future recycling/processing arrangements support a valid disposal certificate, we will update this service only after confirmation."
      },


      /* =========================================================
         6. WHAT WE COLLECT
         ========================================================= */
      {
        id: 'accepted_items',
        q: 'What do you collect?',
        phrases: [
          'what do you collect',
          'what items do you collect',
          'what e waste do you collect',
          'which e waste do you collect',
          'what electronics do you collect',
          'what can i give you',
          'what can you take',
          'which items do you accept'
        ],
        keywords: [
          ['what', 'collect'],
          ['what', 'e', 'waste'],
          ['electronics', 'collect'],
          ['items', 'accept']
        ],
        a: "Our main focus is e-waste such as laptops, desktops, CPUs, monitors, printers, phones, chargers, cables, batteries, ACs, refrigerators and other electronic or electrical items. We may also accept other scrap/materials depending on the item and quantity."
      },


      /* =========================================================
         7. E-WASTE FOCUS
         ========================================================= */
      {
        id: 'ewaste_focus',
        q: 'Do you mainly deal in e-waste?',
        phrases: [
          'do you mainly deal in e waste',
          'are you an e waste company',
          'is e waste your main focus',
          'do you focus on e waste',
          'what is your main business',
          'what type of waste is your focus'
        ],
        keywords: [
          ['main', 'focus', 'e', 'waste'],
          ['focus', 'e', 'waste'],
          ['main', 'business', 'e', 'waste']
        ],
        a: "Yes. E-waste is our main focus. We also consider other scrap/materials in suitable cases to make collection easier for customers, but our primary focus is e-waste."
      },


      /* =========================================================
         8. BUSINESS MODEL / AGGREGATOR
         ========================================================= */
      {
        id: 'business_model',
        q: 'Are you a recycler or an e-waste collection company?',
        phrases: [
          'are you a recycler',
          'are you a recycling company',
          'are you an authorised recycler',
          'are you an authorized recycler',
          'are you a certified recycler',
          'are you a collection company',
          'are you an aggregator',
          'are you a scrap aggregator',
          'are you a collection aggregator',
          'what kind of company are you',
          'what is your business model',
          'do you recycle the waste yourself',
          'do you recycle e waste yourself',
          'do you process the waste yourself'
        ],
        keywords: [
          ['recycler'],
          ['recycling', 'company'],
          ['authorised', 'recycler'],
          ['authorized', 'recycler'],
          ['certified', 'recycler'],
          ['aggregator'],
          ['collection', 'company'],
          ['business', 'model']
        ],
        a: "EcoBin Waste currently operates as an e-waste-focused collection and scrap aggregation business. We collect material from customers and coordinate its onward movement through appropriate buyers/recycling channels. We do not present ourselves as a recycler or claim recycling certification."
      },


      /* =========================================================
         9. WHAT HAPPENS AFTER COLLECTION
         ========================================================= */
      {
        id: 'after_collection',
        q: 'What happens after you collect the material?',
        phrases: [
          'what happens after you collect',
          'what happens after pickup',
          'where does the e waste go',
          'where does my e waste go',
          'what do you do with the e waste',
          'what happens to my scrap',
          'what happens to the material after pickup'
        ],
        keywords: [
          ['after', 'collection'],
          ['after', 'pickup'],
          ['where', 'waste', 'go'],
          ['what', 'happen', 'waste']
        ],
        a: "After collection, the material is sorted based on type and value and then moved through our buyer/recycling network as applicable. EcoBin Waste is focused on collection and aggregation; we do not claim that we personally recycle the material."
      },


      /* =========================================================
         10. SOCIETIES / BUILDINGS
         ========================================================= */
      {
        id: 'societies_buildings',
        q: 'Do you collect from housing societies and buildings?',
        phrases: [
          'do you collect from housing societies',
          'do you collect from societies',
          'do you collect from buildings',
          'can my society book a pickup',
          'can our society book a pickup',
          'can our building book a pickup',
          'do you work with residential societies',
          'do you provide pickup for societies'
        ],
        keywords: [
          ['society', 'pickup'],
          ['society', 'collect'],
          ['building', 'pickup'],
          ['building', 'collect'],
          ['residential', 'pickup']
        ],
        a: "Yes. Housing societies and residential buildings are an important customer group for us. A society can contact us with the approximate material and quantity, and we'll coordinate the pickup."
      },


      /* =========================================================
         11. COMPANIES / OFFICES
         ========================================================= */
      {
        id: 'companies_offices',
        q: 'Do you work with companies and offices?',
        phrases: [
          'do you work with companies',
          'do you work with offices',
          'do you collect from offices',
          'can my company book a pickup',
          'can our office book a pickup',
          'do you provide office pickup',
          'do you collect corporate e waste',
          'do you collect from corporates'
        ],
        keywords: [
          ['company', 'pickup'],
          ['office', 'pickup'],
          ['corporate', 'pickup'],
          ['company', 'collect'],
          ['office', 'collect'],
          ['corporate', 'collect']
        ],
        a: "Yes. We also target companies, offices, schools and other organisations for e-waste collection. If your organisation requires formal disposal/recycling documentation, please contact us first so we can confirm what documentation is currently available."
      },


      /* =========================================================
         12. BOOKING
         ========================================================= */
      {
        id: 'booking',
        q: 'How do I book a pickup?',
        phrases: [
          'how do i book a pickup',
          'how can i book a pickup',
          'how do i schedule a pickup',
          'how can i schedule a pickup',
          'i want to book a pickup',
          'i want to schedule a pickup',
          'how can i request a pickup',
          'how do i request a collection'
        ],
        keywords: [
          ['book', 'pickup'],
          ['schedule', 'pickup'],
          ['request', 'pickup'],
          ['book', 'collection'],
          ['schedule', 'collection']
        ],
        a: "You can use the booking form on this page or contact us on WhatsApp. Share your name, location, approximate items/quantity and preferred pickup details. We'll review the request and confirm the pickup."
      },


      /* =========================================================
         13. CONTACT
         ========================================================= */
      {
        id: 'contact',
        q: 'How do I contact you?',
        phrases: [
          'how do i contact you',
          'how can i contact you',
          'what is your phone number',
          'what is your contact number',
          'how do i call you',
          'what is your whatsapp number',
          'can i contact you on whatsapp'
        ],
        keywords: [
          ['contact', 'number'],
          ['phone', 'number'],
          ['whatsapp', 'number'],
          ['call', 'number']
        ],
        a: "You can call or WhatsApp EcoBin Waste at +91 87368 71481."
      },


      /* =========================================================
         14. QUANTITY
         ========================================================= */
      {
        id: 'quantity',
        q: 'Is there a minimum quantity for pickup?',
        phrases: [
          'is there a minimum quantity',
          'minimum quantity for pickup',
          'minimum quantity required',
          'how much e waste do i need',
          'how much waste is required',
          'do you have a minimum quantity',
          'can you collect one item'
        ],
        keywords: [
          ['minimum', 'quantity'],
          ['minimum', 'pickup'],
          ['one', 'item', 'pickup']
        ],
        a: "For most e-waste pickups, there is no minimum quantity. You can contact us even for a small quantity. For other scrap/materials, acceptance may depend on the item, quantity and pickup practicality."
      },


      /* =========================================================
         15. OTHER SCRAP / NON E-WASTE
         ========================================================= */
      {
        id: 'other_materials',
        q: 'Do you accept other types of scrap?',
        phrases: [
          'do you accept other scrap',
          'do you accept other materials',
          'do you collect other scrap',
          'do you take other scrap',
          'can i give you other scrap',
          'can you take metal scrap',
          'can you take copper',
          'can you take old cables',
          'do you accept non e waste'
        ],
        keywords: [
          ['other', 'scrap'],
          ['other', 'materials'],
          ['metal', 'scrap'],
          ['copper', 'scrap'],
          ['non', 'e', 'waste']
        ],
        a: "Our main focus is e-waste. We may also accept other scrap/materials depending on the type, quantity and pickup practicality. Send us the details or a photo and we'll confirm whether we can take it."
      },


      /* =========================================================
         16. RECYCLING / CERTIFICATION CLAIM
         ========================================================= */
      {
        id: 'recycling_claim',
        q: 'Are you certified for recycling?',
        phrases: [
          'are you certified',
          'do you have recycling certification',
          'do you have e waste certification',
          'are you government authorised',
          'are you government authorized',
          'do you have an epr certificate',
          'do you have epr',
          'are you an authorised e waste recycler',
          'are you an authorized e waste recycler'
        ],
        keywords: [
          ['certified', 'recycling'],
          ['recycling', 'certification'],
          ['government', 'authorised'],
          ['government', 'authorized'],
          ['epr', 'certificate'],
          ['epr']
        ],
        a: "EcoBin Waste currently operates as a collection and scrap aggregation business and does not claim to be a certified recycler or authorised recycling facility. We do not make certification claims that we cannot verify."
      }

    ];


    /* =========================================================
       SAFE DEFAULT
       ========================================================= */

    var DEFAULT_REPLY =
      "I don't have a confirmed answer for that question yet. I don't want to give you incorrect information. Please tap WhatsApp and our team can answer your question directly.";


    /* =========================================================
       CHAT ELEMENTS
       ========================================================= */

    var chatBody = document.getElementById('chatBody');
    var chatQuick = document.getElementById('chatQuick');
    var chatWindowEl = document.getElementById('chatWindow');
    var chatStarted = false;


    /* =========================================================
       NORMALIZE QUESTION
       ========================================================= */

    function normalizeText(text){
      return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }


    /* =========================================================
       WORD-SAFE MATCH
       Prevents:
       collect -> collection
       ac -> package
       etc.
       ========================================================= */

    function containsWord(text, word){
      var normalizedWord = normalizeText(word);

      if (!normalizedWord) return false;

      var pattern = new RegExp(
        '(^|\\s)' +
        normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
        '(\\s|$)'
      );

      return pattern.test(text);
    }


    /* =========================================================
       MATCH A FAQ INTENT
       Higher score = stronger match
       ========================================================= */

    function scoreFAQ(item, text){

      var score = 0;
      var normalized = normalizeText(text);

      /* Exact/strong phrase match */
      for (var i = 0; i < item.phrases.length; i++){
        var phrase = normalizeText(item.phrases[i]);

        if (normalized === phrase){
          score += 100;
        } else if (normalized.indexOf(phrase) !== -1){
          score += 25;
        }
      }


      /* Keyword-group match */
      for (var j = 0; j < item.keywords.length; j++){

        var group = item.keywords[j];
        var groupMatched = true;

        for (var k = 0; k < group.length; k++){
          if (!containsWord(normalized, group[k])){
            groupMatched = false;
            break;
          }
        }

        if (groupMatched){
          score += 10;
        }
      }

      return score;
    }


    /* =========================================================
       FIND BEST ANSWER
       IMPORTANT:
       - Does NOT return the first keyword match.
       - Compares ALL FAQ intents.
       - Requires a reasonable confidence score.
       - If uncertain, uses DEFAULT_REPLY.
       ========================================================= */

    function findAnswer(text){

      var bestFAQ = null;
      var bestScore = 0;
      var secondBestScore = 0;

      for (var i = 0; i < FAQ.length; i++){

        var score = scoreFAQ(FAQ[i], text);

        if (score > bestScore){
          secondBestScore = bestScore;
          bestScore = score;
          bestFAQ = FAQ[i];
        } else if (score > secondBestScore){
          secondBestScore = score;
        }
      }


      /*
       * Safety rules:
       *
       * 1. No match = unknown.
       * 2. Weak match = unknown.
       * 3. If two intents are close, do not guess.
       */

      if (!bestFAQ || bestScore < 10){
        return DEFAULT_REPLY;
      }

      if (
        secondBestScore >= 10 &&
        (bestScore - secondBestScore) < 8
      ){
        return DEFAULT_REPLY;
      }

      return bestFAQ.a;
    }


    /* =========================================================
       ADD CHAT MESSAGE
       ========================================================= */

    function addMsg(role, text){

      var div = document.createElement('div');

      div.className = 'chat-msg ' + role;

      div.textContent = text;

      chatBody.appendChild(div);

      chatBody.scrollTop = chatBody.scrollHeight;
    }


    /* =========================================================
       QUICK QUESTIONS
       ========================================================= */

    function renderQuickButtons(){

      chatQuick.innerHTML = '';

      FAQ.forEach(function(item){

        var btn = document.createElement('button');

        btn.type = 'button';

        btn.textContent = item.q;

        btn.onclick = function(){
          askQuestion(item.q);
        };

        chatQuick.appendChild(btn);

      });
    }


    /* =========================================================
       ASK QUESTION
       ========================================================= */

    function askQuestion(text){

      try{

        addMsg('user', text);

        trackEvent('chat_question', {
          question: text
        });

        setTimeout(function(){

          try{

            addMsg(
              'bot',
              findAnswer(text)
            );

          }catch(e){

            console.error(
              'Chat reply failed:',
              e
            );

          }

        }, 300);

      }catch(e){

        console.error(
          'askQuestion failed:',
          e
        );

      }
    }


    /* =========================================================
       OPEN / CLOSE CHAT
       ========================================================= */

    if (chatBody && chatQuick && chatWindowEl){

      toggleChat = function(){

        try{

          var opening =
            !chatWindowEl.classList.contains('open');

          chatWindowEl.classList.toggle('open');


          if (opening && !chatStarted){

            chatStarted = true;

            addMsg(
              'bot',
              "Hi! I'm the Ecobin Waste helper. Ask me anything, or tap a question below."
            );

            renderQuickButtons();

            trackEvent(
              'chat_opened',
              {}
            );
          }

        }catch(e){

          console.error(
            'toggleChat failed:',
            e
          );

        }

      };


      /* =========================================================
         SEND TYPED QUESTION
         ========================================================= */

      sendChatText = function(){

        try{

          var input =
            document.getElementById('chatInput');

          var text =
            input.value.trim();

          if (!text) return;

          askQuestion(text);

          input.value = '';

        }catch(e){

          console.error(
            'sendChatText failed:',
            e
          );

        }

      };

    }else{

      console.error(
        'Chat widget elements missing from DOM — chat disabled.'
      );

    }

  }catch(e){

    console.error(
      'Chat init failed:',
      e
    );

  }



    // ============================================================
  // BookingAPI — Google Apps Script booking backend
  // Phase 1 + Phase 2
  // Website booking form → Google Apps Script → Google Sheet
  // ============================================================
  var BookingAPI = (function(){

    var BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwsyClT12xizLIUIbFXGUgCfVPhpgW2WoADutFuFdwC623kfcfmSM6RFnG505ZV7eU/exec';

    async function submit(payload){

      var response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'createBooking',
          payload: payload
        })
      });

      if (!response.ok) {
        throw new Error('Booking server could not be reached. Please try again.');
      }

      var result;

      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Booking server returned an invalid response. Please try again.');
      }

      if (!result.success) {
        throw new Error(result.error || 'Booking could not be created.');
      }

      return result;
    }

    return {
      submit: submit
    };

  })();
  



  // ---- Booking form: validation, photo preview, submit, success panel ----
  try{
    var pickupForm = document.getElementById('pickupForm');
    var previewUrls = [];

    // Prevent selecting a past pickup date. Backend independently rejects
    // past dates too (validatePayload in Code.gs) — this is convenience,
    // not the actual security boundary.
    var pickupDateInput = document.getElementById('in-pickupdate');
    if (pickupDateInput){
      var now = new Date();
      var todayStr = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2) + '-' + ('0' + now.getDate()).slice(-2);
      pickupDateInput.setAttribute('min', todayStr);
    }

    // Photo picker preview. The current live booking path is WhatsApp, so
    // files are previewed locally but are not uploaded or converted into
    // hidden payload data. The customer attaches the same photos directly
    // in WhatsApp after the pre-filled message opens.
    var photoInput = document.getElementById('in-photos');
    if (photoInput){
      photoInput.addEventListener('change', function(){
        var files = Array.prototype.slice.call(photoInput.files).slice(0, 3);
        var preview = document.getElementById('filePreview');
        previewUrls.forEach(function(url){ URL.revokeObjectURL(url); });
        previewUrls = [];
        preview.innerHTML = '';
        files.forEach(function(file){
          if (!file.type || file.type.indexOf('image/') !== 0) return;
          var url = URL.createObjectURL(file);
          previewUrls.push(url);
          var img = document.createElement('img');
          img.src = url;
          img.alt = 'Selected e-waste photo preview';
          preview.appendChild(img);
        });
      });
    }

    if (pickupForm){
      pickupForm.addEventListener('submit', async function(e){
        e.preventDefault();
        var statusEl = document.getElementById('formStatus');
        var submitBtn = document.getElementById('submitBtn');
        try{
          // Honeypot: if this hidden field got filled, silently drop (bot)
          if (document.getElementById('in-website').value){
            statusEl.textContent = '';
            return;
          }

          var name = document.getElementById('in-name').value.trim();
          var phone = document.getElementById('in-phone').value.replace(/\D/g, '');
          var email = document.getElementById('in-email').value.trim();
          var address = document.getElementById('in-address').value.trim();
          var area = document.getElementById('in-area').value;
          var wasteTypes = Array.prototype.slice.call(document.querySelectorAll('#wasteTypeGroup input:checked')).map(function(el){ return el.value; });
          var quantity = document.getElementById('in-quantity').value;
          var pickupDate = document.getElementById('in-pickupdate').value;
          var pickupTimeEl = document.querySelector('input[name="pickupTimeRadio"]:checked');
          var pickupTime = pickupTimeEl ? pickupTimeEl.value : '';

          var valid = true;
          function setError(fieldId, ok){
            var el = document.getElementById(fieldId);
            el.classList.toggle('error', !ok);
            if (!ok) valid = false;
          }
          setError('f-name', name.length > 1);
          setError('f-phone', /^[6-9]\d{9}$/.test(phone.replace(/\D/g,'')));
          setError('f-address', address.length > 4);
          setError('f-area', area !== '');
          setError('f-wastetype', wasteTypes.length > 0);
          setError('f-quantity', quantity !== '');
          setError('f-pickupdate', pickupDate !== '');
          setError('f-pickuptime', pickupTime !== '');

          if (!valid){
            statusEl.textContent = 'Please fill in the highlighted fields.';
            statusEl.dataset.state = 'error';
            return;
          }

          submitBtn.disabled = true;
          statusEl.dataset.state = 'loading';
          statusEl.textContent = 'Submitting your booking...';

          var payload = {
            name: name, phone: phone, email: email, address: address, area: area,
            wasteType: wasteTypes.join(', '), quantity: quantity,
            pickupDate: pickupDate, pickupTime: pickupTime
          };

          statusEl.textContent = 'Opening WhatsApp with your pickup details…';
          const response = await fetch('https://script.google.com/macros/s/AKfycbwsyClT12xizLIUIbFXGUgCfVPhpgW2WoADutFuFdwC623kfcfmSM6RFnG505ZV7eU/exec', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8'
  },
  body: JSON.stringify({
    action: 'createBooking',
    payload: payload
  })
});

const result = await response.json();

if (!result.success) {
  throw new Error(result.error || 'Booking submission failed.');
}
          trackEvent('booking_whatsapp_opened', { area: area, quantity: quantity });

        }catch(err){
          console.error('Booking submit failed:', err);
          statusEl.dataset.state = 'error';
          statusEl.textContent = err.message + ' — or tap WhatsApp above to book directly.';
          trackEvent('booking_error', { message: err.message });
        }finally{
          submitBtn.disabled = false;
        }
      });
    }
  }catch(e){ console.error('Booking form init failed:', e); }
