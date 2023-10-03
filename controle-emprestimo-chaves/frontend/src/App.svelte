<script>
    let rentedKeys = []; // Lista de chaves já alugadas
    let availableKeys = ["Chave Sala 1", "Chave Sala 2", "Chave Sala 3", "Chave Sala 4"]; // Exemplo de chaves disponíveis
    let selectedKey = ""; // Chave selecionada pelo usuário

    let renterInfo = {
        name: "",
        email: "",
    };

    let returnerInfo = {
        name: "",
        email: "",
    };

    function rentKey() {
        if (renterInfo.name && renterInfo.email && selectedKey) {
            // Verifica se a chave já foi alugada
            if (!rentedKeys.includes(selectedKey)) {
                rentedKeys = [...rentedKeys, selectedKey];
                availableKeys = availableKeys.filter(key => key !== selectedKey);
                selectedKey = "";
            }
        }
    }

    function returnKey(key) {
        if (returnerInfo.name && returnerInfo.email) {
            rentedKeys = rentedKeys.filter(k => k !== key);
            availableKeys = [...availableKeys, key];
        }
    }
</script>

<body>
    <div class="container">
        <h2>Alugar/Devolver Chave</h2>
      
        <h3>Alugar Chave</h3>
        <form on:submit|preventDefault={rentKey}>
            <label>
                Nome do Alugador:
                <input
                    bind:value={renterInfo.name}
                    placeholder="Digite seu nome"
                    required
                />
            </label>
            <label>
                Email do Alugador:
                <input
                    bind:value={renterInfo.email}
                    type="email"
                    placeholder="Digite seu email"
                    required
                />
            </label>
            <label>
                Selecione uma chave disponível:
                <select bind:value={selectedKey} required>
                    <option disabled value="">Escolha uma chave disponível...</option>
                    {#each availableKeys as key}
                        <option value={key}>{key}</option>
                    {/each}
                </select>
            </label>
            <button type="submit">Alugar chave</button>
        </form>
        <h3>Devolver Chave</h3>
        <form on:submit|preventDefault={returnKey(selectedKey)}>
            <label>
                Nome do Devolvedor:
                <input
                    bind:value={returnerInfo.name}
                    placeholder="Digite seu nome"
                    required
                />
            </label>
            <label>
                Email do Devolvedor:
                <input
                    bind:value={returnerInfo.email}
                    type="email"
                    placeholder="Digite seu email"
                    required
                />
            </label>

					{#if rentedKeys.length > 0}
            <h3>Chaves Alugadas</h3>
            <ul>
                {#each rentedKeys as key}
                    <li>
                        {key} 
                        <button on:click={() => returnKey(key)}>Devolver</button>
                    </li>
                {/each}
            </ul>
        {/if}
					
        </form>
    </div>
</body>

<style>
    .container {
        max-width: 600px;
        margin: 40px auto;
        padding: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: rgb(235, 228, 209);
        border-radius: 8px;
    }

    button {
        background-color: rgb(38, 87, 124);
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
        transition: all 0.5s;
    }

    button:hover {
        background-color: rgb(229, 86, 4);
    }

    label,
    select {
        display: block;
        margin-bottom: 10px;
    }

    input,
    select {
        width: 100%;
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid rgb(38, 87, 124);
        border-radius: 4px;
    }
</style>
