<!-- ListarPage.svelte -->
<script>
    let chave = { nome: "", situacao: "disponivel", status: true };
    let filtroNome = ""; // para a busca pelo nome
    let Listachaves = [];

    async function carregarChaves() {
        // Implementação de busca no backend com filtro de nome
        let url = "http://localhost:8081/chaves";

        try {
            const response = await fetch(url);
            if (response.ok) {
                Listachaves = await response.json();
            } else {
                console.error(
                    "Erro ao carregar as chaves:",
                    response.statusText,
                );
            }
        } catch (error) {
            console.error("Erro ao carregar as chaves:", error);
        }
    }

     // Implementação de busca no backend com filtro de situação
    async function carregarChavesDisponiveis() {
        let url = "http://localhost:8081/chaves/situacao/disponivel";

        try {
            const response = await fetch(url);
            if (response.ok) {
                Listachaves = await response.json();
            } else {
                console.error(
                    "Erro ao carregar as chaves:",
                    response.statusText,
                );
            }
        } catch (error) {
            console.error("Erro ao carregar as chaves:", error);
        }
    }

    // Função atualizada para carregar chaves baseada no filtro de nome
    async function carregarChavesNome() {
        // Implementação de busca no backend com filtro de nome
        let url = "http://localhost:8081/chaves";
        if (filtroNome.trim()) {
            url += `/nome/${encodeURIComponent(filtroNome.trim())}`;
        }

        try {
            const response = await fetch(url);
            if (response.ok) {
                Listachaves = await response.json();
            } else {
                console.error(
                    "Erro ao carregar as chaves:",
                    response.statusText,
                );
            }
        } catch (error) {
            console.error("Erro ao carregar as chaves:", error);
        }
    }

    // Função para alterar a situação da chave
    async function alterarSituacaoChave(chave) {
        try {
            const response = await fetch(
                `http://localhost:8081/chaves/${chave.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...chave,
                        situacao:
                            chave.situacao === "disponivel"
                                ? "indisponivel"
                                : "disponivel",
                    }),
                },
            );

            if (response.ok) {
                carregarChaves(); // Recarrega a lista de chaves
            } else {
                console.error(
                    "Erro ao alterar a situação da chave:",
                    response.statusText,
                );
            }
        } catch (error) {
            console.error("Erro ao alterar a situação da chave:", error);
        }
    }

    // Função para reativar a chave
    async function reativarChave(chave) {
        try {
            const response = await fetch(
                `http://localhost:8081/chaves/${chave.id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...chave,
                        status:
                            chave.status === false
                                ? true
                                : false,
                    }),
                },
            );

            if (response.ok) {
                carregarChaves(); // Recarrega a lista de chaves
            } else {
                console.error(
                    "Erro ao alterar a situação da chave:",
                    response.statusText,
                );
            }
        } catch (error) {
            console.error("Erro ao alterar a situação da chave:", error);
        }
    }

    // Função para desativar (remover) uma chave
    async function desativarChave(chave) {
        try {
            const response = await fetch(
                `http://localhost:8081/chaves/${chave.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(chave),
                },
            );

            if (response.ok) {
                carregarChaves(); // Recarrega a lista de chaves
            } else {
                console.error(
                    "Erro ao desativar a chave:",
                    response.statusText,
                );
            }
        } catch (error) {
            console.error("Erro ao desativar a chave:", error);
        }
    }

    carregarChavesDisponiveis()
</script>

<main>
    <h2>Lista de Chaves Disponíveis:</h2>
    <br>
    <button on:click={carregarChavesDisponiveis}>Disponíveis</button>
    <button on:click={carregarChaves}>Todas</button>
    <br>
    <input
        type="text"
        bind:value={filtroNome}
        placeholder="Digite o nome da chave"
        onchange="carregarChavesNome"
    />
    <button on:click={carregarChavesNome}>Buscar</button>

    <ul>
        {#each Listachaves as chave}
            <li>
                🗝️ {chave.nome} - Situação: {chave.situacao}

                {#if chave.status === true}
                    {#if chave.situacao === "disponivel"}
                        ✅
                        <button on:click={() => alterarSituacaoChave(chave)}
                            >Alterar</button
                        >
                        <button on:click={() => desativarChave(chave)}
                            >Desativar</button
                        >
                    {:else}
                        ⛔
                        <button on:click={() => alterarSituacaoChave(chave)}
                            >Alterar</button
                        >
                        <button on:click={() => desativarChave(chave)}
                            >Desativar</button
                        >
                    {/if}
                {:else}
                    ⚪
                    <button on:click={() => reativarChave(chave)}
                        >Reativar</button
                    >
                {/if}
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