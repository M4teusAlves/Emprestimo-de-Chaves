
<script>
    //Importando as páginas como se fossem componentes
    import InserirPage from "./pages/InserirPage.svelte";
    import ListarPage from "./pages/ListarPage.svelte";
    let page = 'InserirPage';
  
    function navigate(to) {
      page = to;
    }
  </script>
  <body>
    <h1>IFTM - Empréstimo de Chaves</h1>
    <nav>
        <a on:click={() => navigate('InserirPage')}>Inserir Chave</a>
        <a on:click={() => navigate('ListarPage')}>Lista de Chaves</a>
      </nav>
      
      {#if page === 'InserirPage'}
        <InserirPage />
      {:else if page === 'ListarPage'}
        <ListarPage />
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

    a{
        color:rgb(214, 90, 49);
        text-decoration: none;
        border: 3px solid rgb(214, 90, 49)  ;
        padding: 15px;
    }

    a:hover{
      background-color: rgb(214, 90, 49);
      color: white;
      cursor: pointer;
    }
  </style>


 
