const btnSend = document.getElementById("btnSend");

btnSend?.addEventListener("click", async () => {

    const nome = document.getElementById("nome")?.value;
    const email = document.getElementById("email")?.value;
    const telefone = document.getElementById("telefone")?.value;
    const servico = document.getElementById("servico")?.value;
    const mensagem = document.getElementById("mensagem")?.value;

    if (!nome || !email || !mensagem) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/pedidos`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    email,
                    telefone,
                    servico,
                    mensagem
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            const formWrap =
                document.getElementById("formWrap");

            const formSuccess =
                document.getElementById("formSuccess");

            formWrap.style.display = "none";
            formSuccess.style.display = "block";

        } else {
            alert("Erro ao enviar.");
        }

    } catch (error) {

        console.error(error);

        alert("Erro ao conectar com servidor.");

    }

});