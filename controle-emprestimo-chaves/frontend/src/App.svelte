<script>
    //Essa eh a tag script. Aqui serão adicionadas todas as lógicas necessárias ao projeto
    //Essa eh o objeto que vai receber todas as chaves
    let chave = { nome: "",
                  situacao: "disponivel",
                  status: true};
    //Lista para mostrar as chaves
    let Listachaves = [];

    async function carregarChaves() {
        try {
            const response = await fetch("http://localhost:8081/chaves"); // Adicione "http://" ao URL
            if (response.ok) {
                const chaves = await response.json();
                Listachaves = chaves
                console.log(chaves); // Mude para "chaves" em vez de "Listachaves"
            } else {
                console.error("Erro ao carregar as chaves:", response.statusText);
            }
        } catch (error) {
            console.error("Erro ao carregar as chaves:", error);
        }
    }

    carregarChaves()

</script>

<h2>Todas as chaves:</h2>
<ul>
    {#each Listachaves as chave}
        <li>{chave.nome}</li>
    {/each}
</ul>

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

    label, select {
        display: block;
        margin-bottom: 10px;
        width: 30vw;
    }

    input {
        padding: 1vh;
        margin: 3vh;
        border: 3px solid rgb(38, 87, 124);
        border-radius: 4px;
    }
</style>
