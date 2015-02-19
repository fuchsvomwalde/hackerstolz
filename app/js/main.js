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
        contentAreas = document.querySelectorAll('header, section');

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

    /*function startBgrSlideshow() {
        classie.remove(backgroundSlides[backgroundSlideIndex], 'current');
        backgroundSlideIndex = (backgroundSlideIndex + 1) % (backgroundSlides.length);
        classie.add(backgroundSlides[backgroundSlideIndex], 'current');
    }*/

    function noscroll() {
        window.scrollTo(0, 0);
    }

    function scroll() {

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
                debugger
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
