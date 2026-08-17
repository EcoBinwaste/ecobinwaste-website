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
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.querySelectorAll('.theme-toggle, .mobile-theme-btn').forEach(function(btn){
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      });
    }catch(e){ console.error('Theme apply failed:', e); }
  }
  applyTheme();
  function toggleTheme(){
    try{
      isDark = !isDark;
      try{ localStorage.setItem('ecobin-theme', isDark ? 'dark' : 'light'); }catch(storageErr){}
      applyTheme();
      trackEvent('theme_toggle', { theme: isDark ? 'dark' : 'light' });
    }catch(e){ console.error('Theme toggle failed:', e); }
  }

  // ---- Mobile menu ----
  var toggleMobileMenu = function(){};
  try{
    var mainNav = document.querySelector('nav.main-nav');
    var menuBtn = document.getElementById('menuToggle');
    if (mainNav && menuBtn){
      toggleMobileMenu = function(){
        var isOpen = mainNav.classList.toggle('mobile-open');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      };
      // Clicking a nav link closes the menu (required for a usable mobile menu).
      mainNav.querySelectorAll('a[data-nav]').forEach(function(link){
        link.addEventListener('click', function(){
          mainNav.classList.remove('mobile-open');
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.setAttribute('aria-label', 'Open menu');
        });
      });
      // Escape key closes the menu (keyboard accessibility).
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && mainNav.classList.contains('mobile-open')){
          mainNav.classList.remove('mobile-open');
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.setAttribute('aria-label', 'Open menu');
          menuBtn.focus();
        }
      });
    }
  }catch(e){ console.error('Mobile menu init failed:', e); }



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



  // ---- FAQ auto-chat (fully isolated so nothing else can break it) ----
  var toggleChat = function(){ console.error('Chat not initialized.'); };
  var sendChatText = function(){};
  try{
    var FAQ = [
      { keywords: ['free','cost','price','charge','money'], q: 'Is pickup free?', a: "Most e-waste is picked up free, with no minimum quantity. For bulk or high-value scrap we may buy it instead — ask us which applies to your items." },
      { keywords: ['pay','buy','sell','scrap value','purchase'], q: 'Do you buy scrap?', a: "Yes — for larger quantities or valuable scrap, we may quote a fair purchase price instead of a free pickup. Send details on WhatsApp and we'll let you know." },
      { keywords: ['area','kalyan','dombivali','ulhasnagar','navi mumbai','thane','location','where','cover'], q: 'Which areas do you cover?', a: "We currently serve Kalyan, Dombivali, Ulhasnagar and Navi Mumbai. If you're just outside these, message us anyway — we're expanding." },
      // Future Feature:
      // Enable Disposal Certificate chatbot answer after official recycling partner and certificate process is available.
      // Original: { keywords: ['certificate','proof','compliance','audit','document'], q: 'How do I get a disposal certificate?', a: "Every pickup comes with a disposal certificate automatically — no extra request needed." },
      { keywords: ['certificate','proof','document','acknowledgement','receipt'], q: 'What do I get after a pickup?', a: "A Collection Acknowledgement — a simple document confirming we collected the listed e-waste items from you on the specified date. No extra request needed." },
      { keywords: ['collect','accept','laptop','computer','battery','printer','fridge','ac','appliance','what','items'], q: 'What do you collect?', a: "Anything with a plug, battery or circuit board — laptops, desktops, monitors, printers, servers, phones, cables, batteries, ACs, fridges and other appliances." },
      { keywords: ['book','schedule','pickup','how','process','work','visit'], q: 'How do I book a pickup?', a: "Use the booking form on this page, or tap the WhatsApp button and send your society/office name and rough quantity. We'll confirm a pickup date." },
      { keywords: ['contact','number','phone','call','whatsapp'], q: 'How do I contact you?', a: "Call or WhatsApp us anytime at +91 87368 71481 — same number for both." },
      { keywords: ['bulk','society','corporate','office','school','client'], q: 'Do you work with societies and corporates?', a: "Yes — housing societies, IT offices, schools and corporates are our main focus." },
    ];
    var DEFAULT_REPLY = "I don't have an exact answer for that yet — tap WhatsApp and we'll answer directly.";
    var chatBody = document.getElementById('chatBody');
    var chatQuick = document.getElementById('chatQuick');
    var chatWindowEl = document.getElementById('chatWindow');
    var chatStarted = false;

    function addMsg(role, text){
      var div = document.createElement('div');
      div.className = 'chat-msg ' + role;
      div.textContent = text;
      chatBody.appendChild(div);
      chatBody.scrollTop = chatBody.scrollHeight;
    }
    function renderQuickButtons(){
      chatQuick.innerHTML = '';
      FAQ.forEach(function(item){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = item.q;
        btn.onclick = function(){ askQuestion(item.q); };
        chatQuick.appendChild(btn);
      });
    }
    function findAnswer(text){
      var lower = text.toLowerCase();
      for (var i = 0; i < FAQ.length; i++){
        for (var j = 0; j < FAQ[i].keywords.length; j++){
          if (lower.indexOf(FAQ[i].keywords[j]) !== -1) return FAQ[i].a;
        }
      }
      return DEFAULT_REPLY;
    }
    function askQuestion(text){
      try{
        addMsg('user', text);
        trackEvent('chat_question', { question: text });
        setTimeout(function(){
          try{ addMsg('bot', findAnswer(text)); }catch(e){ console.error('Chat reply failed:', e); }
        }, 300);
      }catch(e){ console.error('askQuestion failed:', e); }
    }

    if (chatBody && chatQuick && chatWindowEl){
      toggleChat = function(){
        try{
          var opening = !chatWindowEl.classList.contains('open');
          chatWindowEl.classList.toggle('open');
          if (opening && !chatStarted){
            chatStarted = true;
            addMsg('bot', "Hi! I'm the Ecobin Waste helper. Ask me anything, or tap a question below.");
            renderQuickButtons();
            trackEvent('chat_opened', {});
          }
        }catch(e){ console.error('toggleChat failed:', e); }
      };
      sendChatText = function(){
        try{
          var input = document.getElementById('chatInput');
          var text = input.value.trim();
          if (!text) return;
          askQuestion(text);
          input.value = '';
        }catch(e){ console.error('sendChatText failed:', e); }
      };
    } else {
      console.error('Chat widget elements missing from DOM — chat disabled.');
    }
  }catch(e){ console.error('Chat init failed:', e); }



  // ============================================================
  // BookingAPI — the public booking channel used by the website.
  // Current production path is WhatsApp: it is complete, live, and
  // requires no hidden endpoint or temporary technical configuration.
  // The Google Apps Script backend remains a separate, deployable
  // backend for the future booking/admin workflow.
  // ============================================================
  var BookingAPI = (function(){
    function getWhatsAppNumber(){
      return (window.ECOBIN_CONFIG && window.ECOBIN_CONFIG.WHATSAPP_NUMBER) || '918736871481';
    }

    async function submit(payload){
      var waNumber = getWhatsAppNumber();
      var waText = [
        'Hi, I would like to book an e-waste pickup.',
        '',
        'Name: ' + payload.name,
        'Phone: ' + payload.phone,
        'Email: ' + (payload.email || 'Not provided'),
        'Address: ' + payload.address,
        'Area: ' + payload.area,
        'Waste type: ' + payload.wasteType,
        'Quantity: ' + payload.quantity,
        'Preferred date: ' + payload.pickupDate,
        'Preferred time: ' + payload.pickupTime,
        '',
        'I will attach e-waste photos in WhatsApp if needed.'
      ].join('\n');
      window.location.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waText);
      return null;
    }

    return { submit: submit };
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
          await BookingAPI.submit(payload);
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
