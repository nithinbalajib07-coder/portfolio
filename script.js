document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================================================
    // 2. LENIS SMOOTH SCROLLING (COORDINATED WITH GSAP)
    // ==========================================================================
    let lenis = null;
    if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            touchMultiplier: 1.5
        });

        // Sync with GSAP ScrollTrigger if available
        if (typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }

        // Smooth scroll for internal anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        lenis.scrollTo(targetEl, { offset: -76, duration: 1.2 });
                    }
                }
            });
        });
    }

    // ==========================================================================
    // 3. UTILITY: PARTICLE CIRCLE TEXTURE FOR THREE.JS
    // ==========================================================================
    function createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(canvas);
    }

    // ==========================================================================
    // 4. CUSTOM CURSOR (FINE POINTERS ONLY, RESPECTS REDUCED MOTION)
    // ==========================================================================
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    if (hasFinePointer && !prefersReducedMotion && cursor && follower) {
        let cursorX = -100, cursorY = -100;
        let followerX = -100, followerY = -100;
        
        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        });

        function animateFollower() {
            followerX += (cursorX - followerX) * 0.14;
            followerY += (cursorY - followerY) * 0.14;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        const hoverSelectors = 'a, button, .project-card, .summary-card, .course-badge-card, .domain-pill, .shelf-tag';
        document.querySelectorAll(hoverSelectors).forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursor.classList.add('hovered');
                follower.classList.add('hovered');
            });
            item.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovered');
                follower.classList.remove('hovered');
            });
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            follower.style.opacity = '1';
        });
    }

    // ==========================================================================
    // 5. MOBILE NAVIGATION DRAWER
    // ==========================================================================
    const navToggle = document.getElementById('mobile-toggle');
    const navDrawer = document.getElementById('mobile-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    
    if (navToggle && navDrawer) {
        const toggleDrawer = (open) => {
            navToggle.classList.toggle('active', open);
            navDrawer.classList.toggle('active', open);
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
            document.body.style.overflow = open ? 'hidden' : '';
        };

        navToggle.addEventListener('click', () => {
            const isCurrentlyOpen = navDrawer.classList.contains('active');
            toggleDrawer(!isCurrentlyOpen);
        });
        
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleDrawer(false);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navDrawer.classList.contains('active')) {
                toggleDrawer(false);
                navToggle.focus();
            }
        });
    }

    // Header scrolled state
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Active link observer
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px' });
    
    sections.forEach(s => sectionObserver.observe(s));

    // ==========================================================================
    // 6. THREE.JS: GPU-ACCELERATED BACKGROUND PARTICLES
    // ==========================================================================
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas && typeof THREE !== 'undefined' && !prefersReducedMotion) {
        const bgScene = new THREE.Scene();
        const bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        bgCamera.position.z = 32;
        
        const bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true, antialias: true });
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
        bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        // 6A. Raining Energon Flakes (Both Neon Red & Royal Blue, increased to 450)
        const flakeCount = 450;
        const positions = new Float32Array(flakeCount * 3);
        const velocities = new Float32Array(flakeCount);
        const sways = new Float32Array(flakeCount);
        const colors = new Float32Array(flakeCount * 3);
        
        const colorBlue = new THREE.Color(0x1D4ED8); // Autobot Royal Blue
        const colorBlueBright = new THREE.Color(0x3B82F6);
        const colorRed = new THREE.Color(0xFF1744); // Energon Neon Red
        const colorRedBright = new THREE.Color(0xEF4444);
        
        for (let i = 0; i < flakeCount; i++) {
            const idx = i * 3;
            positions[idx] = (Math.random() - 0.5) * 85;     // Wide x spread
            positions[idx + 1] = (Math.random() - 0.5) * 75; // Y spread (falling down)
            positions[idx + 2] = (Math.random() - 0.5) * 35; // Z depth
            
            // Continuous downward rain speed
            velocities[i] = 0.07 + Math.random() * 0.12;
            sways[i] = Math.random() * Math.PI * 2;
            
            // 50% Royal Blue, 50% Neon Red with subtle vibrancy variation
            const isBlue = i % 2 === 0;
            const pColor = isBlue 
                ? (Math.random() > 0.4 ? colorBlue : colorBlueBright) 
                : (Math.random() > 0.4 ? colorRed : colorRedBright);
            
            colors[idx] = pColor.r;
            colors[idx + 1] = pColor.g;
            colors[idx + 2] = pColor.b;
        }
        
        const flakeGeometry = new THREE.BufferGeometry();
        flakeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        flakeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const flakeMaterial = new THREE.PointsMaterial({
            size: 0.38,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
            vertexColors: true,
            map: createCircleTexture()
        });
        
        const flakePoints = new THREE.Points(flakeGeometry, flakeMaterial);
        bgScene.add(flakePoints);

        // 6B. Cybertronian Swirl Vortex (Visible across all sections)
        const swirlGroup = new THREE.Group();

        // Parametric Archimedean multi-arm spiral swirl
        const armsCount = 3;
        const pointsPerArm = 65;
        const totalSwirlPoints = armsCount * pointsPerArm;
        const swirlPositions = new Float32Array(totalSwirlPoints * 3);
        const swirlColors = new Float32Array(totalSwirlPoints * 3);

        let pIdx = 0;
        for (let a = 0; a < armsCount; a++) {
            const armAngleOffset = (a * 2 * Math.PI) / armsCount;
            const armColor = a === 0 ? colorBlue : (a === 1 ? colorRed : colorBlueBright);

            for (let p = 0; p < pointsPerArm; p++) {
                const angle = (p / pointsPerArm) * Math.PI * 3.8 + armAngleOffset;
                const radius = 1.0 + (p / pointsPerArm) * 17.5;
                const idx = pIdx * 3;

                swirlPositions[idx] = Math.cos(angle) * radius;
                swirlPositions[idx + 1] = Math.sin(angle) * radius;
                swirlPositions[idx + 2] = Math.sin(p * 0.25) * 1.8;

                swirlColors[idx] = armColor.r;
                swirlColors[idx + 1] = armColor.g;
                swirlColors[idx + 2] = armColor.b;
                pIdx++;
            }
        }

        const swirlGeometry = new THREE.BufferGeometry();
        swirlGeometry.setAttribute('position', new THREE.BufferAttribute(swirlPositions, 3));
        swirlGeometry.setAttribute('color', new THREE.BufferAttribute(swirlColors, 3));

        const swirlMaterial = new THREE.PointsMaterial({
            size: 0.42,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            vertexColors: true,
            map: createCircleTexture()
        });

        const swirlParticles = new THREE.Points(swirlGeometry, swirlMaterial);
        swirlGroup.add(swirlParticles);

        // Concentric Orbital Telemetry Rings
        const outerRingGeo = new THREE.RingGeometry(17, 17.1, 72);
        const outerRingMat = new THREE.MeshBasicMaterial({
            color: 0x1D4ED8,
            transparent: true,
            opacity: 0.28,
            side: THREE.DoubleSide
        });
        const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
        swirlGroup.add(outerRing);

        const innerRingGeo = new THREE.RingGeometry(10.5, 10.58, 56);
        const innerRingMat = new THREE.MeshBasicMaterial({
            color: 0xFF1744,
            transparent: true,
            opacity: 0.24,
            side: THREE.DoubleSide
        });
        const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
        innerRing.rotation.x = -Math.PI / 3.8;
        swirlGroup.add(innerRing);

        const coreRingGeo = new THREE.RingGeometry(4.2, 4.26, 40);
        const coreRingMat = new THREE.MeshBasicMaterial({
            color: 0x3B82F6,
            transparent: true,
            opacity: 0.32,
            side: THREE.DoubleSide
        });
        const coreRing = new THREE.Mesh(coreRingGeo, coreRingMat);
        swirlGroup.add(coreRing);

        swirlGroup.rotation.x = Math.PI / 4.2;
        swirlGroup.rotation.y = Math.PI / 6.5;
        bgScene.add(swirlGroup);
        
        let targetMouseX = 0, targetMouseY = 0;
        let mouseX = 0, mouseY = 0;
        let targetSwirlScale = 1.0;
        let currentSwirlScale = 1.0;
        
        document.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX - window.innerWidth / 2) * 0.015;
            targetMouseY = (e.clientY - window.innerHeight / 2) * 0.015;
        }, { passive: true });

        // Hover over any section makes the swirl expand dynamically
        document.querySelectorAll('section').forEach(sec => {
            sec.addEventListener('mouseenter', () => {
                targetSwirlScale = 1.35;
            });
            sec.addEventListener('mouseleave', () => {
                targetSwirlScale = 1.0;
            });
        });

        function animateBg(currentTime) {
            requestAnimationFrame(animateBg);
            
            // 1. Rain flakes downward continuously
            const posAttr = flakeGeometry.attributes.position;
            const posArray = posAttr.array;
            for (let i = 0; i < flakeCount; i++) {
                const idx = i * 3;
                posArray[idx + 1] -= velocities[i]; // Fall down
                posArray[idx] += Math.sin(currentTime * 0.0016 + sways[i]) * 0.035; // Sway

                // When flake falls off bottom, recycle to top
                if (posArray[idx + 1] < -38) {
                    posArray[idx + 1] = 38;
                    posArray[idx] = (Math.random() - 0.5) * 85;
                }
            }
            posAttr.needsUpdate = true;

            // 2. Swirl rotation and parallax
            swirlGroup.rotation.z += 0.0035;
            swirlParticles.rotation.z += 0.0015;
            outerRing.rotation.z += 0.0018;
            innerRing.rotation.z -= 0.0024;
            
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Swirl expansion on section hover
            currentSwirlScale += (targetSwirlScale - currentSwirlScale) * 0.08;
            swirlGroup.scale.set(currentSwirlScale, currentSwirlScale, currentSwirlScale);

            // Swirl stays visible across all sections with subtle gentle parallax
            swirlGroup.position.x = mouseX * 0.4;
            swirlGroup.position.y = -mouseY * 0.4 + Math.sin(window.scrollY * 0.0014) * 2.2;
            
            bgRenderer.render(bgScene, bgCamera);
        }
        animateBg(performance.now());

        window.addEventListener('resize', () => {
            bgCamera.aspect = window.innerWidth / window.innerHeight;
            bgCamera.updateProjectionMatrix();
            bgRenderer.setSize(window.innerWidth, window.innerHeight);
        }, { passive: true });
    }

    // ==========================================================================
    // 7. GSAP ANIMATIONS (EDITORIAL & ACCESSIBLE)
    // ==========================================================================
    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Entrance timeline
        const heroTl = gsap.timeline();
        heroTl.from('.main-header', {
            y: -30,
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out'
        })
        .from('.institution-callout', {
            y: 15,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.4')
        .from('.hero-title', {
            y: 25,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out'
        }, '-=0.3')
        .from('.hero-subtitle', {
            y: 15,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.4')
        .from('.hero-ctas', {
            y: 15,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.hero-credential-bar', {
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out'
        }, '-=0.3')
        .from('.hero-portrait-card', {
            scale: 0.94,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out'
        }, '-=0.8');

        // Scroll reveals for section headers
        if (typeof ScrollTrigger !== 'undefined') {
            document.querySelectorAll('.section-header').forEach(sh => {
                gsap.from(sh, {
                    scrollTrigger: {
                        trigger: sh,
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    y: 25,
                    opacity: 0,
                    duration: 0.7,
                    ease: 'power3.out'
                });
            });

            // Academic summary bar (animated as a unified container so all 3 capsules remain strictly on the same level)
            if (document.querySelector('.academic-summary-bar')) {
                gsap.from('.academic-summary-bar', {
                    scrollTrigger: {
                        trigger: '.academic-summary-bar',
                        start: 'top 85%',
                        toggleActions: 'play none none none'
                    },
                    y: 20,
                    opacity: 0,
                    duration: 0.65,
                    ease: 'power2.out',
                    clearProps: 'all'
                });
            }

            // Vacant Projects Showcase
            if (document.querySelector('.vacant-card-frame')) {
                gsap.from('.vacant-card-frame', {
                    scrollTrigger: {
                        trigger: '.projects-vacant-showcase',
                        start: 'top 85%'
                    },
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out'
                });
            }
        }
    }

    // ==========================================================================
    // 9. AUTHORITATIVE ACADEMIC TRANSCRIPT DATA & ACCESSIBLE TABLIST
    // ==========================================================================
    const academicSemesters = [
        {
            id: 'fall-2025-26',
            name: 'Fall Semester 2025–26',
            gpa: '9.30',
            courses: [
                { sl: 1, code: 'BACHY101', title: 'Environmental Sciences', grade: 'A' },
                { sl: 2, code: 'BACHY105', title: 'Applied Chemistry', grade: 'S' },
                { sl: 3, code: 'BACSE101', title: 'Problem Solving using Python', grade: 'S' },
                { sl: 4, code: 'BACSE103', title: 'Computation Structures', grade: 'A' },
                { sl: 5, code: 'BAEEE101', title: 'Basic Engineering', grade: 'A' },
                { sl: 6, code: 'BAMAT101', title: 'Multivariable Calculus and Differential Equations', grade: 'A' }
            ]
        },
        {
            id: 'winter-2025-26',
            name: 'Winter Semester 2025–26',
            gpa: '9.81',
            courses: [
                { sl: 1, code: 'BACSE104', title: 'Structured and Object-Oriented Programming', grade: 'S' },
                { sl: 2, code: 'BACSE105', title: 'Data Structures and Algorithms', grade: 'S' },
                { sl: 3, code: 'BACSE106', title: 'Operating Systems', grade: 'S' },
                { sl: 4, code: 'BACSE191', title: 'Basic Multidisciplinary Project', grade: 'S' },
                { sl: 5, code: 'BAENG101', title: 'Technical English Communication', grade: 'A' },
                { sl: 6, code: 'BAHUM101', title: 'India Studies', grade: 'A' },
                { sl: 7, code: 'BAMAT205', title: 'Discrete Mathematics and Linear Algebra', grade: 'S' },
                { sl: 8, code: 'BAPHY105', title: 'Engineering Physics', grade: 'S' }
            ]
        }
    ];

    const transcriptContainer = document.getElementById('transcript-container');

    function renderTranscript(filterSemester = 'fall-2025-26') {
        if (!transcriptContainer) return;

        const filtered = academicSemesters.filter(s => s.id === filterSemester);

        let html = '';

        filtered.forEach(sem => {
            const isHighlight = sem.id === 'winter-2025-26';
            html += `
            <div class="transcript-semester-block" id="sem-${sem.id}">
                <div class="semester-header-bar">
                    <h3 class="semester-header-title">${sem.name}</h3>
                    <div class="semester-meta-pills">
                        <span class="sem-pill ${isHighlight ? 'sem-pill-highlight-red' : 'sem-pill-blue'}">
                            <i data-lucide="award" aria-hidden="true"></i> GPA: ${sem.gpa}
                        </span>
                        <span class="sem-pill sem-pill-courses">
                            <i data-lucide="book-marked" aria-hidden="true"></i> ${sem.courses.length} Courses
                        </span>
                    </div>
                </div>

                <div class="academic-courses-grid">
            `;

            sem.courses.forEach(c => {
                const isSGrade = c.grade === 'S';
                html += `
                    <div class="course-badge-card">
                        <div class="course-name-group">
                            <span class="course-accent-dot ${isSGrade ? 'dot-blue' : 'dot-red'}" aria-hidden="true"></span>
                            <h4 class="course-clean-name">${c.title}</h4>
                        </div>
                        <div class="course-grade-group">
                            <span class="clean-grade-badge ${isSGrade ? 'badge-grade-s' : 'badge-grade-a'}">
                                Grade ${c.grade}
                            </span>
                        </div>
                    </div>
                `;
            });

            html += `
                </div>
            </div>
            `;
        });

        transcriptContainer.innerHTML = html;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Initial render (Fall Semester)
    renderTranscript('fall-2025-26');

    // Accessible WAI-ARIA Tab Controls (Keyboard Arrows Support)
    const tabButtons = Array.from(document.querySelectorAll('.semester-filter-btn'));
    
    function setActiveTab(button) {
        tabButtons.forEach(btn => {
            const isActive = btn === button;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            btn.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        
        button.focus();
        const selectedSemester = button.getAttribute('data-semester');
        renderTranscript(selectedSemester);
    }

    tabButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            setActiveTab(btn);
        });

        btn.addEventListener('keydown', (e) => {
            let targetIndex = -1;
            if (e.key === 'ArrowRight') {
                targetIndex = (index + 1) % tabButtons.length;
            } else if (e.key === 'ArrowLeft') {
                targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
            } else if (e.key === 'Home') {
                targetIndex = 0;
            } else if (e.key === 'End') {
                targetIndex = tabButtons.length - 1;
            }

            if (targetIndex !== -1) {
                e.preventDefault();
                setActiveTab(tabButtons[targetIndex]);
            }
        });
    });

    // ==========================================================================
    // 10. COPY EMAIL ACTION WITH ACCESSIBLE ANNOUNCEMENT
    // ==========================================================================
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const copyFeedback = document.getElementById('copy-feedback');
    const emailToCopy = 'nithinbalajibharat.2025@vitstudent.ac.in';

    if (copyEmailBtn && copyFeedback) {
        copyEmailBtn.addEventListener('click', () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(emailToCopy).then(() => {
                    showCopyFeedback();
                }).catch(() => {
                    fallbackCopy(emailToCopy);
                });
            } else {
                fallbackCopy(emailToCopy);
            }
        });

        function showCopyFeedback() {
            copyFeedback.classList.add('show');
            setTimeout(() => {
                copyFeedback.classList.remove('show');
            }, 2400);
        }

        function fallbackCopy(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showCopyFeedback();
            } catch (err) {}
            document.body.removeChild(textArea);
        }
    }

    // ==========================================================================
    // 11. OPEN GMAIL COMPOSE ACTION
    // ==========================================================================
    const sendEmailBtn = document.getElementById('send-email-btn');
    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailToCopy)}`;
            window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        });
    }

    // ==========================================================================
    // 12. PROJECT CARD REDIRECTION HANDLERS
    // ==========================================================================
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const href = card.getAttribute('href');
            // If placeholder '#' is used, prevent page jump and notify
            if (!href || href === '#' || href.trim() === '') {
                e.preventDefault();
                console.info(`[Project Redirection] Card "${card.id}" clicked. Set the target URL in href="..." in index.html to activate.`);
            }
        });
    });

    // Ensure all icons across all sections (including newly added projects) are rendered
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
