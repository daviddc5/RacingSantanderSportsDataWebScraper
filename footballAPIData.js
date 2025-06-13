// This is a conceptual example for your squad page
const playerGrid = document.querySelector('.player-grid');
const teamId = 123; // Replace with Racing's actual ID
const apiKey = 'YOUR_API_KEY';

fetch(`https://api-football.com/v3/players/squad?team=${teamId}`, {
    headers: { 'x-apisports-key': apiKey }
})
.then(response => response.json())
.then(data => {
    playerGrid.innerHTML = ''; // Clear static placeholders
    data.response[0].players.forEach(player => {
        const playerCardHTML = `
            <div class="player-card">
                <div class="player-photo">
                    <img src="${player.photo}" alt="${player.name}">
                    <span class="player-number">${player.number || '?'}</span>
                </div>
                <div class="player-info">
                    <h3 class="player-name">${player.name}</h3>
                    <p class="player-position">${player.position}</p>
                </div>
            </div>
        `;
        playerGrid.insertAdjacentHTML('beforeend', playerCardHTML);
    });
});