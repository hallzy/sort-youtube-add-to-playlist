(
    () =>
    {
        let saveToPlaylistEl;

        const resetMargin = el =>
        {
            el && (el.style.marginBottom = null);
        }

        // Last visible playlist should have a margin of 0px
        const lastMargin = el =>
        {
            el && (el.style.marginBottom = '0px');
        }

        const sort = (a, b) =>
        {
            const aText = a.textContent.trim().toLowerCase();
            const bText = b.textContent.trim().toLowerCase();
            return aText.localeCompare(bText);
        }

        const sortReverse = (b, a) =>
        {
            const aText = a.textContent.trim().toLowerCase();
            const bText = b.textContent.trim().toLowerCase();
            return aText.localeCompare(bText);
        }

        const getPlaylists = () =>
        {
            return saveToPlaylistEl.querySelectorAll('#playlists ytd-playlist-add-to-option-renderer');
        }

        const createSortButton = () =>
        {
            const sortButton = document.createElement('button');
            sortButton.textContent = 'No Order';
            sortButton.classList.add('playlist-sort__sort-button');
            sortButton.classList.add('playlist-sort-el');

            const defaultOrder = Array.from(getPlaylists());

            sortButton.addEventListener
            (
                'click',
                () =>
                {
                    const playlists = getPlaylists();
                    const playlistsContainer = playlists[0].parentElement;

                    let sortedPlaylists;

                    const currentContent = sortButton.textContent;
                    switch(currentContent)
                    {
                        case 'No Order':
                            sortButton.textContent = 'A-Z ↓';
                            sortedPlaylists = Array.from(playlists).sort(sort);
                            break;
                        case 'A-Z ↓':
                            sortButton.textContent = 'A-Z ↑';
                            sortedPlaylists = Array.from(playlists).sort(sortReverse);
                            break;
                        case 'A-Z ↑':
                            sortButton.textContent = 'No Order';
                            sortedPlaylists = defaultOrder;
                            break;
                        default:
                            console.error("Unknown sort order type for playlist sorter");
                            return;
                    }

                    // Remove all playlists from the list
                    playlistsContainer.textContent = '';

                    // Track the last playlist that is visible
                    let lastPlaylist;

                    sortedPlaylists.forEach
                    (
                        playlist =>
                        {
                            // Add playlist to the list
                            playlistsContainer.appendChild(playlist);

                            resetMargin(playlist);

                            if (!playlist.hidden)
                            {
                                lastPlaylist = playlist;
                            }
                        }
                    );

                    // Last visible playlist should have no margin
                    lastMargin(lastPlaylist);
                }
            );

            return sortButton;
        }

        const createFilterInput = () =>
        {
            const filterInput = document.createElement('input');
            filterInput.classList.add('playlist-sort__filter-input');
            filterInput.classList.add('playlist-sort-el');
            filterInput.type = 'text';
            filterInput.placeholder = 'Filter Playlists';

            filterInput.addEventListener
            (
                'input',
                e =>
                {
                    const searchTokens = e.target.value.toLowerCase().split(' ').map(token => token.trim()).filter(token => token !== '');
                    const playlists = getPlaylists();
                    let lastItem;

                    // No search, so show everything
                    if (searchTokens.length === 0)
                    {
                        Array.from(playlists).forEach
                        (
                            playlist =>
                            {
                                playlist.hidden = false;
                                resetMargin(playlist);
                                lastItem = playlist;
                            }
                        );
                    }
                    else
                    {
                        Array.from(playlists).forEach
                        (
                            playlist =>
                            {
                                const playlistName = playlist.textContent.trim().toLowerCase();
                                resetMargin(playlist);

                                const shouldHide = !searchTokens.every(token => playlistName.includes(token));
                                playlist.hidden = shouldHide;

                                if (!shouldHide)
                                {
                                    lastItem = playlist;
                                }
                            }
                        );
                    }

                    lastMargin(lastItem);
                }
            );

            return filterInput;
        }

        const createCSS = () =>
        {
            const css = document.createElement('style');
            css.innerHTML = `
                .playlist-sort-el
                {
                    border: 1px solid #303030;
                    padding: 8px 16px;
                    border-radius: 2px;
                    background: #0e0f0f;
                    color: #e8e6e3;
                }

                .playlist-sort__filter-input
                {

                }

                .playlist-sort__sort-button
                {
                    margin-right: 1ch;
                    cursor: pointer;
                    width: 90px;
                }
            `;

            return css;
        }

        const saveToPlaylistObserver = new MutationObserver
        (
            (mutationRecords, observer) =>
            {
                saveToPlaylistEl = document.querySelector('tp-yt-paper-dialog ytd-add-to-playlist-renderer');

                if (!saveToPlaylistEl)
                {
                    return;
                }
                observer.disconnect();

                const modalTitle = saveToPlaylistEl.querySelector('#header #title');
                modalTitle.textContent = '';

                modalTitle.appendChild(createSortButton());
                modalTitle.appendChild(createFilterInput());
                modalTitle.appendChild(createCSS());
            }
        );
        saveToPlaylistObserver.observe
        (
            document,
            {
                childList:  true,
                subtree:    true,
            }
        );
    }
)();
