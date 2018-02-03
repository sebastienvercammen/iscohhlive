// Handler when the DOM is fully loaded.
function domReady(fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

// http://youmightnotneedjquery.com 😏
domReady(() => {
    'use strict';

    const note = new Note({});

    // Keep a reference.
    var requestSuccess = false;
    const status = document.getElementById('status');

    function showSpinner() {
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
        loading.style.opacity = 1;
    }

    function hideSpinner() {
        const loading = document.getElementById('loading');
        loading.style.opacity = 0;

        // Only hide after transition end.
        setTimeout(() => {
            loading.style.display = 'none';
        }, 500);
    }

    function updateStatusText(txt) {
        status.innerText = txt;
    }

    function toggleTimes(happy) {
        if (happy) {
            status.innerText = "Yes, he's live! 😍";
            status.className = 'happytimes';
            startShow();
        } else {
            status.innerText = "No, he's offline. 😞";
            status.className = 'sadtimes';
        }
    }

    function happyTimes() {
        toggleTimes(true);
    }

    function sadTimes() {
        toggleTimes(false);
    }

    function unknownTimes() {
        updateStatusText("We don't know, sorry!");
        startShow();
        note.error('Error!', "We couldn't load the Twitch.tv status, so we just loaded the show for you. Try again later!", { 'sticky': true });
    }

    function startShow() {
        // Render within the "twitch-embed" root element.
        const embed = new Twitch.Embed('twitch-embed', {
            width: '100%',
            height: 530, // 480
            channel: 'cohhcarnage',
            theme: 'dark'
        });

        embed.addEventListener(Twitch.Embed.VIDEO_READY, () => {
            const player = embed.getPlayer();
            player.setMuted(false);
        });
    }

    function apiRequestSuccess(data, xhr) {
        // Avoid callbacks from libraries vs own added event
        // handling the event twice.
        if (requestSuccess) {
            return;
        }

        requestSuccess = true;
        console.log(data, xhr);

        const live = data.status;

        if (live === 1) {
            // Online.
            happyTimes();
        } else if (live === 0) {
            // Offline.
            sadTimes();
        } else {
            // Error, unknown or other.
            unknownTimes();
        }
    }

    function apiRequestError(data, xhr) {
        // Avoid callbacks from libraries vs own added event
        // handling the event twice.
        if (requestSuccess) {
            return;
        }

        requestSuccess = true;
        unknownTimes();

        if (xhr) {
            console.error(data, xhr.status);
        }
    }

    function getLiveStatus() {
        const timeout = 2000;
        const url = 'https://api.iscohh.live';
        pegasus.timeout = timeout; // Milliseconds.
        const request = pegasus(url);
        request.then(apiRequestSuccess, apiRequestError);

        // In case of any networking issues etc., the browser
        // might throw a generic window error instead.
        request.addEventListener('error', (ev) => {
            apiRequestError(ev, request);
        });
    }

    // 1. JS is enabled, show content (still hidden behind spinner).
    document.getElementsByTagName('main')[0].style.display = 'block';

    // 2. Get live status and show/hide the show.
    getLiveStatus();

    // 3. Hide the spinner, show it all.
    hideSpinner();
});
