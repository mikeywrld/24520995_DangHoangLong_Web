"""Regenerate: python report/make_report.py (requires reportlab and Pillow)."""
from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'report/24520995_DangHoangLong_Lab03_Exercise_Report.pdf'
FONT=Path('/usr/share/fonts/truetype/dejavu')
if FONT.exists():
 pdfmetrics.registerFont(TTFont('Body',str(FONT/'DejaVuSans.ttf')))
 pdfmetrics.registerFont(TTFont('BodyBold',str(FONT/'DejaVuSans-Bold.ttf')))
else:
 raise RuntimeError('Install DejaVu Sans fonts before building the report.')
styles=getSampleStyleSheet()
for name in ['Normal','BodyText']: styles[name].fontName='Body';styles[name].fontSize=9.5;styles[name].leading=15
styles.add(ParagraphStyle(name='TitleA',fontName='BodyBold',fontSize=30,leading=37,textColor=colors.HexColor('#142945'),spaceAfter=20))
styles.add(ParagraphStyle(name='HeadingA',fontName='BodyBold',fontSize=21,leading=28,textColor=colors.HexColor('#142945'),spaceAfter=15))
styles.add(ParagraphStyle(name='Sub',fontName='BodyBold',fontSize=11,leading=16,textColor=colors.HexColor('#2458bb'),spaceBefore=12,spaceAfter=7))
styles.add(ParagraphStyle(name='CaptionA',fontName='Body',fontSize=8,leading=12,textColor=colors.HexColor('#526078'),spaceBefore=7,spaceAfter=9))
styles.add(ParagraphStyle(name='Kicker',fontName='BodyBold',fontSize=9,leading=14,textColor=colors.HexColor('#2458bb'),spaceAfter=12))
story=[]
def p(s,style='BodyText'): story.append(Paragraph(s,styles[style]));story.append(Spacer(1,6))
def title(k,t): p(k,'Kicker');p(t,'HeadingA')
def sub(s):p(s,'Sub')
def table(rows,widths):
 a=[[Paragraph(escape(str(c)),styles['CaptionA']) for c in row] for row in rows]
 t=Table(a,colWidths=widths,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eaf1ff')),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.4,colors.HexColor('#d8e1ef')),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.append(t);story.append(Spacer(1,10))
def shot(name,caption,maxh=290,crop=True):
 path=ROOT/'evidence'/name
 if crop:
  im=PILImage.open(path)
  # Desktop content region: crop header/footer, retaining exercise navigation.
  im=im.crop((140,270,1140,min(im.height-60,1130)))
  tmp=ROOT/'report'/('.crop-'+name);im.save(tmp);path=tmp
 im=PILImage.open(path);w,h=im.size;ratio=min(499/w,maxh/h)
 story.append(Image(str(path),width=w*ratio,height=h*ratio,hAlign='LEFT'));p(caption,'CaptionA')
def page():story.append(PageBreak())
p('WEB APPLICATION DEVELOPMENT / LAB 03','Kicker')
p('Production React 19\nExercise Report'.replace('\n','<br/>'),'TitleA')
p('Semantic components, derived state and abortable asynchronous workflows.','Sub')
table([['Student','Submission information'],['Full name','Dang Hoang Long'],['Student ID','24520995'],['Submission date','02 November 2026'],['Scope','Exercises 1-3 + Bonus Situationship FSM'],['Repository folder','Lab_03/Exercise']],[125,374])
sub('Objective and source')
p('Implement the in-class exercise contracts in the supplied 35-slide Lab 03 presentation: profile card (slides 13-14), scientist directory (18-19), PUBG Vietnam telemetry (22-23), and the creative bonus (31-32). The separate Homework 1-3 section is outside this report.')
sub('Delivered work')
p('A React 19/Vite application includes all four exercise views, engineering rules, task decomposition, an executable failure audit, automated tests, accessibility evidence and screenshots. Each exercise can be opened independently from the app navigation.')
p('<b>Source repository:</b><br/><link href="https://github.com/mikeywrld/24520995_DangHoangLong_Web" color="#2458bb">github.com/mikeywrld/24520995_DangHoangLong_Web</link>')
p('<b>Target folder after push:</b><br/><link href="https://github.com/mikeywrld/24520995_DangHoangLong_Web/tree/main/Lab_03/Exercise" color="#2458bb">Open Lab_03/Exercise after publication</link>')
p('<b>Publication status:</b> Ten local commits are prepared. GitHub write requests returned 403 (Resource not accessible by integration), and direct Git has no authenticated push credential. The source has not been published during this session. A commit-preserving patch accompanies the submission.','CaptionA')
page()
title('01 / EXERCISE 1','Semantic Developer Profile')
p('The profile composes DeveloperCard and SkillBadge. A labelled article contains a header, a description list and a list of skills. Object.entries maps metrics through keyed Fragments, so no layout wrappers or duplicate headings are required.')
shot('ex1-desktop.jpg','Figure 1. Actual production build. The browser test blocks the HTTPS avatar, demonstrating the accessible HL initials fallback.',maxh=270)
table([['Contract','Implementation'],['Zero div tags','DeveloperCard.jsx uses article, header, hgroup, dl, dt, dd, ul, li and Fragment.'],['React 19 baseline','Function components, default parameters, createRoot and StrictMode.'],['Media safety','HTTPS-only source, explicit 72 x 72 dimensions, failure fallback.'],['CSS isolation','DeveloperCard.module.css with scoped classes and --accent custom property.'],['Identity and accessibility','useId links the article and heading. Skill IDs and metric names remain stable.']],[125,374])
sub('Verification')
p('The browser test confirms the card mounts, contains zero descendant div elements and retains a named image alternative after an avatar failure. Axe reports zero automated WCAG violations. The 375px screenshot on page 7 shows the header and skills wrapping cleanly.')
page()
title('02 / EXERCISE 2','Interactive Scientist Directory')
p('The directory stores only independent inputs: people, query, minimum IQ and sort order. selectPeople calculates the visible list during render. No filtering or sorting effect exists. Search trims whitespace and compares lowercase text. Numeric input uses valueAsNumber with a zero fallback.')
shot('ex2-desktop.jpg','Figure 2. Directory after reset, with six pioneers restored and filters returned to their defaults.',maxh=315)
sub('Immutable updates and stable rows')
p('The source fixture uses stable IDs sp-1 through sp-6. Filtering and toSorted return new arrays. Delete applies prev.filter, while Reset restores a copy of the initial fixture and resets the controls. A polite live output announces the result count. Delete and Reset move focus to the search input, preventing focus loss when a row disappears.')
sub('Observed test outcomes')
p('Searching for " EINSTEIN " returns one result. A minimum IQ of 211 returns zero results. Sorting by age places William Sidis first. Deleting him leaves five results and restores search focus. Reset returns all six records. These results are recorded in evidence/browser-results.txt.')
p('The IQ scores reproduce the slide fixture as teaching data. They are not presented as verified historical measurements.','CaptionA')
page()
title('03 / EXERCISE 3','PUBG Vietnam Telemetry')
p('A local asynchronous service simulates CES, TE and GE squad data with a 900ms delay. Random mode rejects samples below 0.35. Deterministic success/failure controls make retry and error states reproducible. This is simulated telemetry, with no official KRAFTON API connection.')
shot('ex3-success.jpg','Figure 3. After rapid squad switching, Genius Esports remains selected and its payload wins.',maxh=160)
shot('ex3-error.jpg','Figure 4. Forced packet loss produces an accessible alert and a Reconnect Satellite (Retry) action.',maxh=160)
sub('Lifecycle and state integrity')
p('The view uses IDLE, LOADING, SUCCESS and ERROR. Every effect creates an AbortController and aborts it on squad/mode changes, retry or unmount. AbortError is ignored. A signal guard also prevents stale results from updating the view. Retry increments a counter to rerun the effect.')
p('Loading displays a 220px pulsing skeleton within a fixed 280px radar frame shared by all states. The fixed frame avoids panel-height jumps. Whole-application zero CLS has not been inferred from this sizing rule. Because the service uses local timers, its cancellation does not create canceled HTTP rows in DevTools Network.','CaptionA')
page()
title('04 / BONUS EXERCISE','Situationship State Machine')
p('The implementation follows the prose phase names on slide 31. Its reference code uses different names; the chosen mapping is FRIENDS = STRANGERS, OFFICIAL_LOVE = COMMITTED, and GHOSTED_EXIT = SELF_RESPECT_EXIT.')
table([['Current phase','Event / next phase'],['STRANGERS','Start dating -> DATING_NO_LOVE'],['DATING_NO_LOVE','Send message -> wait in same phase'],['DATING_NO_LOVE','Confirm mutual reply -> COMMITTED'],['DATING_NO_LOVE','Matching message timeout -> SELF_RESPECT_EXIT'],['Any phase','Stop -> SELF_RESPECT_EXIT; Reset -> STRANGERS']],[157,342])
p('Immutable effort signals store actor, steps and multiplier. Scores are derived by reduction during render. With 100 personal steps and one rival step, the scores are 100 x 0.1 = 10 and 1 x 50 = 50. The dating phase announces a red flag when personal impact is lower.')
shot('bonus-exit.jpg','Figure 5. Actual unanswered-message outcome after the full five-second production delay.',maxh=265)
p('Sending starts the reply wait. Reply, recipient change, stop, reset and navigation unmount abort pending work. TIMEOUT must match the current message ID. Tests confirm that a mutual commitment survives beyond five seconds and that unanswered messages exit. Cleanup releases timer/listener references; JavaScript garbage collection remains browser controlled.')
page()
title('05 / VERIFICATION','Automated Results and Limits')
table([['Check','Observed result'],['Production build','Vite 8.3.5 build succeeded with React 19.3.1.'],['Unit tests','11 passed, zero failed; see test-results.txt.'],['Failure audit','Three faulty candidates reproduced, then repaired behavior asserted.'],['Browser scenarios','Search/filter/sort/delete/reset, errors/retry, rapid switching and full five-second FSM behavior passed.'],['375px layout','No document horizontal overflow on all four views.'],['Form labels','All input/select controls have associated labels on all four views.'],['axe scans','Zero automated violations on each of the four exercise views.'],['Lighthouse','Accessibility: 100/100 for the initial Exercise 1 route only.'],['Console','Zero JavaScript runtime errors or warnings during scripted scenarios.']],[140,359])
sub('Reproduction')
p('<font name="BodyBold">npm ci<br/>npm run build<br/>npm test<br/>npm run audit:failures<br/>npx playwright install chromium<br/>npm run preview -- --host 127.0.0.1 --port 5173</font>')
p('In another terminal, run npm run test:browser. The browser test uses the production build and saves actual screenshots and axe results. CHROMIUM_PATH may point to an installed Chromium binary.')
sub('Evidence boundaries')
p('Lighthouse audits the first view only. Axe also scans the other views. Neither tool establishes complete WCAG conformance. Manual screen-reader review, a React DevTools Profiler recording and the instructor live defense remain student activities. Development StrictMode may invoke renders more than once; that must be distinguished from committed updates.')
p('The avatar network request is deliberately blocked during automated browser tests to exercise fallback. The recorded console claim excludes that expected resource failure. The application contains no credentials, real telemetry subscription or claim of official affiliation.')
page()
title('06 / RESPONSIVE EVIDENCE','375px Mobile Layout')
p('The browser test changes the viewport to 375 x 812 and measures document.scrollWidth against innerWidth in every exercise. Each assertion passed. These screenshots show natural full-page height, with wrapping navigation and controls.')
# Side-by-side screenshots retain native proportions at a readable width.
imgs=[]
for name in ['mobile-exercise-1.jpg','mobile-exercise-2.jpg']:
 path=ROOT/'evidence'/name;im=PILImage.open(path);w,h=im.size;ratio=min(236/w,470/h);imgs.append(Image(str(path),width=w*ratio,height=h*ratio))
t=Table([imgs],colWidths=[249.5,249.5]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP')]));story.append(t)
p('Figure 6. Exercise 1 and Exercise 2 at 375px. Source screenshots for Exercise 3 and the bonus are also included in evidence/.','CaptionA')
p('Responsive behavior uses wrapping flex layouts, a single-column filter form below 600px and fluid card padding. Focus indicators remain visible. The skeleton animation respects prefers-reduced-motion.')
page()
title('07 / ENGINEERING AUDIT','Failure Analysis and Submission Notes')
table([['Faulty candidate','Reproduction and repair'],['In-place sorting','sort changes the original row ID order. The repaired toSorted selector preserves the source.'],['Uncanceled telemetry','A slower CES result overwrites a newer GE result. Aborting the old request retains GE.'],['Leaked ghosting timeout','A pending timeout overwrites COMMITTED with exit. AbortSignal cleanup preserves commitment.']],[145,354])
p('These are isolated AI-style faulty candidates generated for controlled verification. They are explicitly labelled and excluded from production. The audit does not invent a prior DevTools discovery history. tests/failure-audit.mjs executes both faulty and repaired variants; AI_FAILURE_AUDIT.md documents reproduction, fixes and source files.')
sub('Task and Git structure')
p('TASK_DECOMPOSITION.md maps ten focused commits to setup, semantic components, responsive styles, data normalization, search, deletion/reset, async telemetry, recovery UI, bonus FSM and final verification/report. Existing Lab_01 and Lab_02 content remains outside this addition.')
sub('Live defense preparation')
p('Review MANUAL_ACCEPTANCE.md. Be ready to explain derived state, stable keys, effect dependencies and cleanup. Practice the instructor mutations: a watchlist filter, polling with pause and cleanup, and lifting selected state to App. Close AI assistants during the instructor examination.')
sub('References')
for s in [
'Course source: Lab 03: Production React 19, KRAFTON PUBG VN &amp; Situationship State Machine, 35 slides. MSc. Tran Vinh Khiem, UIT - VNUHCM. Exercise contracts: slides 13-23 and 31-32. Evaluation: slides 24-25 and 34.',
'React documentation: <link href="https://react.dev/reference/react/useEffect" color="#2458bb">react.dev/reference/react/useEffect</link> - synchronization, dependencies and cleanup.',
'React documentation: <link href="https://react.dev/reference/react/useId" color="#2458bb">react.dev/reference/react/useId</link> - accessible unique IDs.',
'Vite documentation: <link href="https://vite.dev/guide/" color="#2458bb">vite.dev/guide/</link> - development and production build workflow.'
]:p(s,'CaptionA')
def chrome(canvas,doc):
 canvas.saveState();w,h=doc.pagesize
 canvas.setFillColor(colors.HexColor('#2458bb'));canvas.rect(0,h-8,w,8,fill=1,stroke=0)
 canvas.setFont('Body',8);canvas.setFillColor(colors.HexColor('#526078'))
 canvas.drawString(48,28,'Dang Hoang Long / 24520995 / Lab 03')
 canvas.drawRightString(w-48,28,f'{doc.page} / 8');canvas.restoreState()
doc=SimpleDocTemplate(str(OUT),pagesize=(595.28,841.89),leftMargin=48,rightMargin=48,topMargin=42,bottomMargin=48,title='Lab 03 Exercise Report - Dang Hoang Long - 24520995',author='Dang Hoang Long')
doc.build(story,onFirstPage=chrome,onLaterPages=chrome)
for f in (ROOT/'report').glob('.crop-*'):f.unlink()
print(OUT)
