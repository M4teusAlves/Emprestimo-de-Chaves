
<script>
    //Importando as páginas como se fossem componentes
    import InserirPage from "./pages/InserirPage.svelte";
    import ListarPage from "./pages/ListarPage.svelte";
    import HomePage from "./pages/HomePage.svelte";
    let page = 'HomePage';
  
    function navigate(to) {
      page = to;
    }
  </script>
  
  <body>
    <h1>IFTM - Empréstimo de Chaves</h1>
    <nav>
      <button on:click={() => navigate('HomePage')}>Início</button>
        <button on:click={() => navigate('InserirPage')}>Inserir Chave</button>
        <button on:click={() => navigate('ListarPage')}>Lista de Chaves</button>
      </nav>
      
      {#if page === 'HomePage'}
        <HomePage />
        {:else if page === 'ListarPage'}
        <ListarPage />
        {:else if page === 'InserirPage'}
        <InserirPage />
      {/if}
  </body>

  <style>
    *{
      border: 0;
      margin: 0;
      padding: 0;
    }
    body {
        text-align: center;
        justify-content: center;
        display: block;
        background-color: rgb(34, 40, 49);
        color: rgb(238, 238, 238);
        overflow: auto;
    }

    h1{
      margin-bottom: 20px;
    }

    button{
        color:rgb(214, 90, 49);
        background-color: rgb(34, 40, 49);
        text-decoration: none;
        border: 3px solid rgb(214, 90, 49)  ;
        padding: 15px;
        transition: background-color 0.3s;
    }

    button:hover{
      background-color: rgb(214, 90, 49);
      color: white;
      cursor: pointer;
    }
  </style>