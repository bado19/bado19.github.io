const searchButton = document.getElementById('searchButton');
const pokemonNameInput = document.getElementById('pokemonName');
const resultContainer = document.getElementById('resultContainer');

searchButton.addEventListener('click', async () => {
    const pokemonName = pokemonNameInput.value.toLowerCase();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await response.json();

        // Create a template for displaying Pokémon information
        const template = `
            <h2>${data.name.toUpperCase()}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}">
            <p>Height: ${data.height}</p>
            <p>Weight: ${data.weight}</p>
            <p>Abilities: ${data.abilities.map(ability => ability.ability.name).join(', ')}</p>
        `;

        resultContainer.innerHTML = template;
    } catch (error) {
        resultContainer.innerHTML = 'Pokémon not found.';
    }
});
