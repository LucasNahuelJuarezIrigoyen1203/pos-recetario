<script lang="ts">
  let { form } = $props();
</script>
<h1>Ingresar</h1>
<form method="post" class="row" style="flex-direction:column;align-items:stretch;max-width:340px">
  <input name="email" type="email" placeholder="Email" autocomplete="username" required />
  <input name="password" type="password" placeholder="Contraseña" autocomplete="current-password" required />
  {#if form?.error}<p class="err">{form.error}</p>{/if}
  <button class="btn">Ingresar</button>
</form>
