(function () {
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return '₮' + Math.round(n).toLocaleString('en-US'); };

  // Утасны цэс
  var nav = $('nav');
  $('burger').addEventListener('click', function () { nav.classList.toggle('open'); });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') nav.classList.remove('open');
    if (e.target.closest('.dd > button')) e.target.closest('.dd').classList.toggle('open');
  });

  // Гүйлгэхэд гарч ирэх анимейшн
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // FAQ: нэг удаад нэгийг л нээнэ
  document.querySelectorAll('.faq details').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      document.querySelectorAll('.faq details[open]').forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  // Үнийн тооцоолуур
  var form = $('quoteForm');
  function calc() {
    var base = +$('type').value;
    var pages = +$('pages').value;
    var extras = 0;
    form.querySelectorAll('#extras input:checked').forEach(function (c) { extras += +c.dataset.price; });
    var sub = base + pages + extras;
    var rush = sub * (+$('timeline').value - 1);
    var total = sub + rush;
    $('lBase').textContent = fmt(base);
    $('lPages').textContent = fmt(pages);
    $('lExtras').textContent = fmt(extras);
    $('lRush').textContent = fmt(rush);
    $('total').textContent = fmt(total);
    $('range').textContent = 'Ойролцоогоор: ' + fmt(total * 0.85) + ' – ' + fmt(total * 1.2);
    $('estimate').value = fmt(total);
  }
  form.addEventListener('change', calc);
  calc();

  // Илгээх (send.php руу)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('formMsg');
    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    msg.className = 'form-msg';
    msg.textContent = 'Илгээж байна…';
    fetch(form.action, { method: 'POST', body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        msg.className = 'form-msg ' + (d.ok ? 'ok' : 'err');
        msg.textContent = d.message;
        if (d.ok) { form.reset(); calc(); }
      })
      .catch(function () {
        msg.className = 'form-msg err';
        msg.textContent = 'Илгээж чадсангүй. Имэйлээр шууд холбогдоно уу.';
      })
      .finally(function () { btn.disabled = false; });
  });

  $('year').textContent = new Date().getFullYear();
})();
