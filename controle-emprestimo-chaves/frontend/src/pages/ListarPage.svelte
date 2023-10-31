<script>
    let chave = { nome: "", situacao: "disponivel", status: true };

    //Lista para mostrar as chaves
    let Listachaves = [];

    async function carregarChaves() {
        try {
            const response = await fetch(
                "http://localhost:8081/chaves/situacao/disponivel"
            ); // Adicione "http://" ao URL
            if (response.ok) {
                const chaves = await response.json();
                Listachaves = chaves;
                console.log(chaves); // Mude para "chaves" em vez de "Listachaves"
            } else {
                console.error(
                    "Erro ao carregar as chaves:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Erro ao carregar as chaves:", error);
        }
    }

    carregarChaves();

</script>
<main>
    <h2>Lista de Chaves Disponíveis:</h2>
    <ul>
        {#each Listachaves as chave}
            {#if chave.situacao == "disponivel"}
                <li>🗝️{chave.nome} - Situação: {chave.situacao} ✅</li>
            {:else}
                <li>🗝️{chave.nome} - Situação: {chave.situacao} ⛔</li>
            {/if}
        {/each}
    </ul>
</main>
<style>
    main {
        text-align: center;
        justify-content: center;
        display: block;
        background-color: rgb(34, 40, 49);
        color: rgb(238, 238, 238);
        overflow: auto;
    }

    h2 {
        font-size: 2.5em;
        font-family: "Courier New", Courier, monospace;
        color: rgb(214, 90, 49);
        font-weight: bolder;
    }

    button {
        background-color: rgb(214, 90, 49);
        color: rgb(238, 238, 238);
        padding: 1vh 2vh;
        border-radius: 5%;
        cursor: pointer;
        margin: 1vh;
        transition: background-color 0.3s;
        font-size: 1.5em;
    }

    button:hover {
        background-color: rgb(57, 62, 70);
    }

    label {
        margin-bottom: 5vh;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
        font-size: 1.3em;
    }

    input {
        padding: 1vh;
        margin: 3vh;
        border: 5px solid rgb(93, 104, 122);
        border-radius: 4px;
    }
    li {
        list-style: none;
        margin: 2vh;
        font-size: 2em;
    }
</style>