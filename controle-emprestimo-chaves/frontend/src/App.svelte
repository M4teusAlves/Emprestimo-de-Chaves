<script>
    //Essa eh a tag script. Aqui serão adicionadas todas as lógicas necessárias ao projeto
    //Essa eh o objeto que vai receber todas as chaves
    let chave = { nome: "" };
    //Lista para mostrar as chaves
    let Listachaves = [];

    async function inserirChave(chave) {
        try {
            const response = await fetch("/chaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(chave),
            });

            if (response.ok) {
                console.log("Chave adicionada com sucesso!");
                //Atualizando a lista
                carregarChaves();
            } else {
                console.error(
                    "Erro ao adicionar a chave:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Erro ao adicionar a chave:", error);
        }
    }

    async function carregarChaves() {
        try {
            const response = await fetch("/chaves");
            if (response.ok) {
                const chaves = await response.json();
                console.log(Listachaves);
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
</script>

    <main>
    <h2>Inserir Nova Chave</h2>

    <form on:submit|preventDefault={inserirChave}>
        <label>
            Nome:
            <input type="text" bind:value={chave.nome} />
        </label>

        <button type="submit">Inserir</button>
    </form>

    <br>
    <br>
    
    <h2>Todas as chaves:</h2>
    <ul>
        {#each Listachaves as chave}
            <li>{chave.nome}</li>
        {/each}
    </ul>
</main>

<style>
    main{
        text-align: center;
        justify-content: center;
        display: block;
        background-color: rgb(235, 228, 209);
    }
    button {
        background-color: rgb(38, 87, 124);
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        transition: background-color 0.3s;
    }

    button:hover {
        background-color: rgb(229, 86, 4);
    }

    label {
        margin-bottom: 10vh;
        font-family:Arial, Helvetica, sans-serif;
        font-weight: bold;
    }

    input {
        padding: 1vh;
        margin: 3vh;
        border: 3px solid rgb(38, 87, 124);
        border-radius: 4px;
    }
</style>
