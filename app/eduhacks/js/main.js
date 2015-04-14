/**
 * main.js
 * http://www.hackerstolz.de
 *
 * Copyright Hackerstolz e.V.
 * http://www.hackerstolz.de
 */
(function() {

    'use strict';

    var support = {
            animations: Modernizr.cssanimations
        },
        container = document.getElementById('content'),
        header = container.querySelector('div.intro'),
        loader = new PathLoader(document.getElementById('intro-loader-circle')),
        animEndEventNames = {
            'WebkitAnimation': 'webkitAnimationEnd',
            'OAnimation': 'oAnimationEnd',
            'msAnimation': 'MSAnimationEnd',
            'animation': 'animationend'
        },
        // animation end event name
        animEndEventName = animEndEventNames[Modernizr.prefixed('animation')],
        //backgroundSlides = document.querySelectorAll('.background-slideshow li'),
        //backgroundSlideIndex = 0,
        navButtons = document.querySelectorAll('#navbar li'),
        navButtonList = Array.prototype.slice.call(navButtons),
        navButtonIndex = 0,
        animInItems = document.querySelectorAll('.anim-in-l, .anim-in-r, .anim-in-b, .anim-in-t'),
        contentAreas = document.querySelectorAll('header, section'),
        language = document.getElementById('language-setting'),
        textElementsList = document.querySelectorAll('[data-txt]'),
        eventCountdown = document.getElementById('event-countdown'),
        footer = document.querySelector('.count-down'),
        hideLangageList;

    function init() {
        //setInterval(startBgrSlideshow, 15000);

        var onEndInitialAnimation = function() {
            if (support.animations) {
                this.removeEventListener(animEndEventName, onEndInitialAnimation);
            }
            startLoading();
        };

        // disable scrolling
        window.addEventListener('scroll', noscroll);

        // initial animation
        classie.add(container, 'loading');
        if (support.animations) {
            container.addEventListener(animEndEventName, onEndInitialAnimation);
        } else {
            onEndInitialAnimation();
        }

        // translate
        translate();
        if (language) {
            Array.prototype.slice.call(language.children).forEach(function(o, i, a) {
                o.addEventListener('click', function(e) {
                    if (e.currentTarget.nodeName === 'A') {
                        languageDialog();
                    } else {
                        selectLanguage(e);
                    }
                });
            });
        };

        // Start countdown clock
        var EventDate = new Date(2015, 3, 18, 9, 0); // Why is 3 as month correct???
        //var EventDate = new Date(2015, 3, 15, 0, 18);
        var ClockInterval = setInterval(function() {
            var Today = new Date();
            var TimeLeft = Math.floor((EventDate.getTime() / 1000) - (Today.getTime() / 1000));
            if (TimeLeft > 0) {
                var days = Math.floor(TimeLeft / 60 / 60 / 24);
                var hours = Math.floor(TimeLeft / 60 / 60 % 24);
                var minutes = Math.floor(TimeLeft / 60 % 60);
                var seconds = Math.floor(TimeLeft % 60);
                eventCountdown.innerHTML = '<span>' + days + '</span>' +
                    '<span>' + hours + '</span>' +
                    '<span>' + minutes + '</span>' +
                    '<span>' + seconds + '</span>';
            } else {
                ClockInterval = null;
                eventCountdown.innerHTML = '<span>0</span>' +
                    '<span>0</span>' +
                    '<span>0</span>' +
                    '<span>0</span>';
            }
        }, 1000);

        // Initialize Picture Caroussel
        // Der Bootstrap Scheiss hier ist mega inperformant!!! Das sollte ersetzt werden durch CSS3 Features
        // var carousel = $('#carousel-impressions').carousel({
        //   interval: false,
        //   keyboard: false
        // });
        var carousel = $('#carousel-impressions').carousel();
        $('#carousel-impressions .left').click(function() {
            carousel.carousel('prev');
        });

        $('#carousel-impressions .right').click(function() {
            carousel.carousel('next');
        });
    }

    function startLoading() {
        // simulate loading something..
        var simulationFn = function(instance) {
            var progress = 0,
                interval = setInterval(function() {
                    progress = Math.min(progress + Math.random() * 0.1, 1);

                    instance.setProgress(progress);

                    // reached the end
                    if (progress === 1) {
                        classie.remove(container, 'loading');
                        classie.add(container, 'loaded');
                        clearInterval(interval);

                        var onEndHeaderAnimation = function(ev) {
                            if (support.animations) {
                                if (ev.target !== header) return;
                                this.removeEventListener(animEndEventName, onEndHeaderAnimation);
                            }

                            classie.add(document.body, 'layout-switch');
                            window.removeEventListener('scroll', noscroll);

                            // add event listeners
                            for (var i = 0; i < navButtons.length; i++) {
                                navButtons[i].addEventListener('click', onNavButtonClicked);
                            }
                            window.addEventListener('scroll', scroll);
                        };

                        if (support.animations) {
                            header.addEventListener(animEndEventName, onEndHeaderAnimation);
                        } else {
                            onEndHeaderAnimation();
                        }
                    }
                }, 80);
        };

        loader.setProgressFn(simulationFn);
    }

    function onNavButtonClicked(ev) {
        classie.remove(navButtons[navButtonIndex], 'active');
        navButtonIndex = navButtonList.indexOf(ev.currentTarget);
        classie.add(navButtons[navButtonIndex], 'active');
    }

    function translate() {
        var text_key;
        var textElement;
        for (var i = 0; i < textElementsList.length; i++) {
            textElement = textElementsList[i];
            text_key = textElement.getAttribute("data-txt");
            if (text_key) {
                textElement.innerHTML = _[text_key][l];
            }
        }
    }

    function languageDialog() {
        if (language.className === '') {
            language.className = 'language-select';
            clearTimeout(hideLangageList);
            hideLangageList = setTimeout(languageDialog, 4000);
        } else {
            language.className = '';
        }
    }

    function selectLanguage(e) {
        if (e.currentTarget.classList.contains('language-selected')) {
            e.preventDefault();
        } else {
            e.currentTarget.parentNode.querySelector('.language-selected').className = '';
            e.currentTarget.className = 'language-selected';

            // Update global language and translate
            l = e.currentTarget.getAttribute('data-language');
            translate();
        };
        clearTimeout(hideLangageList);
        hideLangageList = setTimeout(languageDialog, 4000);
    }

    function noscroll() {
        window.scrollTo(0, 0);
    }

    var lastScrollTop = 0;

    function scroll(e) {

        // Hide Footer/Header
        var st = window.pageYOffset;
        if (st > lastScrollTop + 10) {
            // downscroll code
            classie.add(footer, 'slidedown');
        } else if (st < lastScrollTop - 10) {
            // upscroll code
            classie.remove(footer, 'slidedown');
        }
        lastScrollTop = st;

        var bodyRect = document.body.getBoundingClientRect(),
            viewYPosBottom = window.pageYOffset + window.innerHeight;

        // start entrance animation
        for (var i = 0; i < animInItems.length; i++) {
            if (!classie.has(animInItems[i], 'start-fx')) {
                var element = animInItems[i],
                    elemRect = element.getBoundingClientRect(),
                    elemTop = elemRect.top - bodyRect.top;

                // start animation when element passed one quarter of viewport
                if (elemTop - viewYPosBottom < window.innerHeight * -1 / 4) {
                    classie.add(element, 'start-fx');
                }
            }
        }

        // mark respective nav button
        var sectionId;
        for (var j = 0; j < contentAreas.length; j++) {
            var element = contentAreas[j],
                elemRect = element.getBoundingClientRect(),
                elemTop = elemRect.top - bodyRect.top + 20;
            // mark nav button if top of section is whithin viewport
            if (elemTop < viewYPosBottom && elemTop > window.pageYOffset) {
                sectionId = contentAreas[j].id;
                break;
            }
        }
        for (var k = 0; k < navButtons.length; k++) {
            if (navButtonList.indexOf(navButtons[k]) != navButtonIndex) {
                var navButtonId = navButtons[k].getAttribute('data-id');
                if (navButtonId === sectionId) {
                    classie.remove(navButtons[navButtonIndex], 'active');
                    navButtonIndex = k;
                    classie.add(navButtons[k], 'active');
                    break;
                }
            }
        }
    }

    init();

})();
