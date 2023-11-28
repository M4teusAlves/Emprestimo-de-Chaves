<script>
    //Essa eh a tag script. Aqui serÃ£o adicionadas todas as lÃ³gicas necessÃ¡rias ao projeto
    //Essa eh o objeto que vai receber todas as chaves
    let chave = { nome: "", situacao: "disponivel", status: true };

    //Lista para mostrar as chaves
    let Listachaves = [];
    let modoEdicao = false;

    async function inserirChave() {
        // Verifica se a chave com o mesmo nome já existe na lista
        if (
            Listachaves.some(
                (existingChave) => existingChave.nome === chave.nome
            )
        ) {
            alert("Uma chave com esse nome já existe.");
            return; // Impede a inserção da chave duplicada
        }
        if (chave.nome.trim() === "") {
            alert("Por favor, digite um nome para a chave.");
            return; // Impede a inserção da chave vazia
        }

        try {
            const response = await fetch("http://localhost:8081/chaves", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(chave),
            });

            if (response.ok) {
                alert("Chave adicionada com sucesso!");
                const key = await response.json();

                console.log(key);
                // Atualizando a lista
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

    // Função para selecionar a chave para edição
    function selecionarChaveParaEdicao(chaveSelecionada) {
        chave = { ...chaveSelecionada };
        modoEdicao = true;
    }

    async function atualizarChave() {
        if (chave.nome.trim() === "") {
            alert("Por favor, digite um nome para a chave.");
            return; // Impede a atualização com nome vazio
        }

        try {
            const response = await fetch(`http://localhost:8081/chaves/${chave.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chave),
            });

            if (response.ok) {
                alert("Chave atualizada com sucesso!");
                chave = { nome: "", situacao: "disponivel", status: true };
                modoEdicao = false;
                carregarChaves();
            } else {
                console.error("Erro ao atualizar a chave:", response.statusText);
            }
        } catch (error) {
            console.error("Erro ao atualizar a chave:", error);
        }
    }

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
    <h2>{modoEdicao ? 'Editar' : 'Inserir'} Chave</h2>

    <form on:submit|preventDefault={modoEdicao ? atualizarChave : inserirChave}>
        <label>
            Nome:
            <input type="text" bind:value={chave.nome} />
        </label>
        <button type="submit">{modoEdicao ? 'Atualizar' : 'Inserir'}</button>
    </form>

    <!-- Seção para listar as chaves e editar -->
    <h2>Lista de Chaves</h2>
    <ul>
        {#each Listachaves as chaveItem}
            <li>
                🗝️ {chaveItem.nome}
                <button on:click={() => selecionarChaveParaEdicao(chaveItem)}>Editar</button>
            </li>
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