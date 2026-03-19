const nav=document.getElementById('nav'),navToggle=document.getElementById('navToggle'),navLinks=document.getElementById('navLinks');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>50));
navToggle.addEventListener('click',()=>{
  navLinks.classList.toggle('open');
  const s=navToggle.querySelectorAll('span');
  if(navLinks.classList.contains('open')){s[0].style.transform='rotate(45deg) translate(5px,5px)';s[1].style.opacity='0';s[2].style.transform='rotate(-45deg) translate(5px,-5px)'}
  else{s[0].style.transform='';s[1].style.opacity='';s[2].style.transform=''}
});
navLinks.querySelectorAll('a').forEach(l=>l.addEventListener('click',()=>{
  navLinks.classList.remove('open');
  const s=navToggle.querySelectorAll('span');s[0].style.transform='';s[1].style.opacity='';s[2].style.transform='';
}));
document.getElementById('contactForm').addEventListener('submit',e=>{
  e.preventDefault();
  document.getElementById('contactSuccess').classList.add('show');
  e.target.reset();
  setTimeout(()=>document.getElementById('contactSuccess').classList.remove('show'),5000);
});
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)'}});
},{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.section').forEach(s=>{s.style.opacity='0';s.style.transform='translateY(30px)';s.style.transition='opacity 0.6s ease,transform 0.6s ease';obs.observe(s)});
