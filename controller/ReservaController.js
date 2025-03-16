const DAOReserva = require('../database/DAOReserva')
const DAOCliente = require('../database/DAOCliente')
const DAOReboque = require('../database/DAOReboque')
const DAOPagamento = require('../database/DAOPagamento')
const DiariaCalculo = require('../bill_modules/DiariaCalculo')
const Grafico = require('../bill_modules/Grafico')
const Login = require('../bill_modules/Login')
var {clienteNome, adminNome} = require('../helpers/getSessionNome')
const { estornoPagamento, receiveInCash, criarCobranca } = require('../helpers/API_Pagamentos')
const moment = require('moment-timezone')


class ReservaController {


    static async getClienteInformaPeriodo(req, res){
        const reboquePlaca = req.params.reboquePlaca
        const reservas = await DAOReserva.getAtivasDesteReboque(reboquePlaca)
        if(!reservas){
            return res.render('erro', {mensagem: `Erro ao buscar reservas deste reboque: ${reboquePlaca}`})
        }
        const reboque = await DAOReboque.getOne(reboquePlaca)
        if(!reboque){
            return res.render('erro', {mensagem: `Erro ao buscar reboque: ${reboquePlaca}`})
        }
        return res.render('reserva/cliente/periodo', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas})
    }
    static async postClienteFormularioReserva(req, res){
        let {reboquePlaca, dataInicio, dataFim, horaInicio, horaFim} =  req.body

        // Trata o datepickr com datas default
        if(dataInicio == '' || dataFim == ''){
            let hoje = new Date()
            let amanha = new Date()
            amanha.setDate(hoje.getDate() +1)
            dataInicio = hoje
            dataFim = amanha
        }

        if(new Date().getDay() == dataInicio && horaInicio < new Date().getHours()){
            return res.render('erro', {mensagem: "A hora de início não pode ser menor que a hora atual."})
        }

        if(dataInicio == dataFim && horaInicio > horaFim){
            return res.render('erro', {mensagem: "A hora final deve ser maior que a hora inicial."})
        }
        
        dataInicio = new Date(dataInicio)
        dataFim = new Date(dataFim)
        dataInicio.setHours(horaInicio)
        dataFim.setHours(horaFim)

        if(dataInicio > dataFim){
            return res.render('erro', {mensagem: 'Erro com as datas.'})
        }
    
        DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicio, dataFim).then( resposta => {
            DAOReboque.getOne(reboquePlaca).then(reboque => {
                if(reboque && resposta.length === 0){
                    
                    let dias = DiariaCalculo.calculaNumeroDeDias(dataInicio, dataFim)
                    let valorTotalDaReserva = DiariaCalculo.calculaTotal(dataInicio, dataFim)
                    let valorTotalDaReservaComDesconto = DiariaCalculo.calculaTotal(dataInicio, dataFim)
                    return res.render('reserva/cliente/formulario', {user: clienteNome(req, res), dias: dias, reboque: reboque, dataInicio: dataInicio, horaInicio: horaInicio, dataFim: dataFim, horaFim: horaFim, valorTotalDaReserva: valorTotalDaReserva,  valorTotalDaReservaComDesconto: valorTotalDaReservaComDesconto,})
    
                } else {
                    
                    DAOReserva.getAtivasDesteReboque(reboquePlaca).then(reservas => {
                        return res.render('reserva/cliente/periodo', {user: clienteNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponível para esta data."})
                    })
                    
                }
            })
        } )
    }
    static async postClienteConfirmaDadosFormularioReserva(req, res){
            
        let {nome, cpf, telefone, email, cep, logradouro, complemento, localidade,
        numeroDaCasa, reboquePlaca, horaInicio, horaFim, dataInicio, dataFim, formaPagamento} = req.body
        
        if(new Date().getDay() == dataInicio && horaInicio < new Date().getHours()){
            return res.render('erro', {mensagem: "A hora de início não pode ser menor que a hora atual."})
        }

        dataInicio = new Date(dataInicio)
        dataFim = new Date(dataFim)
        dataInicio.setHours(horaInicio, 0, 0)
        dataFim.setHours(horaFim, 0, 0)

        /**
         * Este é um tratamento para caso o cliente tente realizar uma reserva dentro de um periodo de indisponibilidade
        */
    
        let resposta = await DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicio, dataFim)
        if(resposta.length > 0){
            let reboque = await DAOReboque.getOne(reboquePlaca)
            let reservas = await DAOReserva.getAtivasDesteReboque(reboquePlaca)
            return res.render('reserva/cliente/periodo', {user: clienteNome(req, res), reboque: reboque, reservas: reservas, mensagem: "Indisponível para esta data."})
        }
    
        /**
         * Se o cliente que estiver acessando esta rota estiver for cliente e estiver logado, ele será usado para montar 
         *  o objeto cliente que será usado para criar uma cobrança
        */

    
        let clienteLogado = {}
        if(req.session.cliente){
            clienteLogado = await DAOCliente.getOne(req.session.cliente.cpf)
            if(!clienteLogado){
                return res.render('erro', {mensagem: "Erro ao buscar cliente"})
            }
        }
    
        /**
         * Será montado um objeto cliente com os dados ou do formulario da reserva ou do cliente cadastrado no banco de dados.
         * Quando um cliente é cadastrado e está logado ele não precisa preencher o formulario da reserva.
         * Esse objeto é motado para ser enviado para a tela de confirmação dos dados do cliente e da reserva e posteriormente 
         * serem usados para inserir no banco de dados
        */

        const cliente = {
            'nome': clienteLogado.nome ? clienteLogado.nome : nome, 
            'cpf':clienteLogado.cpf ? clienteLogado.cpf : cpf, 
            'telefone':clienteLogado.telefone ? clienteLogado.telefone : telefone, 
            'email':clienteLogado.email ? clienteLogado.email : email, 
            'cep':clienteLogado.cep ? clienteLogado.cep : cep, 
            'logradouro':clienteLogado.logradouro ? clienteLogado.logradouro : logradouro, 
            'complemento':clienteLogado.complemento ? clienteLogado.complemento : complemento, 
            'localidade':clienteLogado.localidade ? clienteLogado.localidade : localidade, 
            'numeroDaCasa':clienteLogado.numero_da_casa ? clienteLogado.numero_da_casa : numeroDaCasa,
        }
    
        /**
         * Realiza a busca do reboque que será reservado para que seus dados como valor de cada diaria 
         * para realizar calculos de descontos
        */
    
        const reboque = await DAOReboque.getOne(reboquePlaca)
        if(!reboque){
            return res.render('erro', {mensagem: "Erro ao buscar reboque"})
        }
    
    
        // CALCULA VALORES E APLICA DESCONTOS PARA CLIENTES CADASTRADOS E LOGADOS
        let dias = DiariaCalculo.calculaNumeroDeDias(dataInicio, dataFim)
        let valorTotalDaReserva = DiariaCalculo.calculaTotal(dataInicio, dataFim)
        let valorTotalDaReservaComDesconto = DiariaCalculo.calculaTotal(dataInicio, dataFim)
        
        /**
         * É montado um objeto reserva com os dados necessario para inserir no banco de dados
        */
    
        const reserva = {
            'reboquePlaca': reboquePlaca,
            'dataInicio': dataInicio,
            'dataFim': dataFim,
            'horaInicio': horaInicio,
            'horaFim': horaFim,
            'valorDiaria': req.session.cliente ? reboque.valorDiaria/dias : reboque.valorDiaria, 
            'dias': dias, 
            'valorTotalDaReserva': req.session.cliente ? valorTotalDaReservaComDesconto : valorTotalDaReserva,
            'desconto': valorTotalDaReserva - valorTotalDaReservaComDesconto,
            'formaPagamento': formaPagamento,
        }
    
        /**
         * Finalmente o servidor retorna a página de confirmação dos dados com os objetos criados
        */
    
        return res.render('reserva/cliente/confirmar', {user: clienteNome(req, res), reboque: reboque, cliente: cliente, reserva: reserva, mensagem: '' })

    }
    static async postGerarQRCode(req, res){
        
        let {nome, cpf, telefone, email, cep, logradouro, complemento, 
        localidade, numeroDaCasa, reboquePlaca, dataInicio, dataFim, formaPagamento} = req.body
    
        // Criar um identificador único para o formulário
        const formIdentifier = `${reboquePlaca}-${dataInicio}-${dataFim}`;
    
        /**
         * Verifica se não foi criada uma cobrança para essa reserva.
        */
    
        // Verificar se o formulário já foi enviado com base no identificador
        if (req.session.submittedForms && req.session.submittedForms.includes(formIdentifier)) {
            console.log("O formulário está duplicado. Envio cancelado!");
            return res.render('erro', { mensagem: 'Erro. Formulário duplicado!' });
        }
        
        // Remove caracteres não numéricos para inserir no banco de dados
        cpf = cpf.replace(/\D/g, '')
        telefone = telefone.replace(/\D/g, '')
        cep = cep.replace(/\D/g, '')
    
        // Inicializa o valor da diária com 0
        let valorDiaria = 0
    
        // BUSCAR REBOQUE NO BD
        let reboque = await DAOReboque.getOne(reboquePlaca)
        if(!reboque){
            return res.render('erro', {mensagem: 'erro ao buscar reboque'})
        }
        
        /**
         * Calcula o valos da diária com desconto para clientes com ou sem cadastro
        */
    
        let valorTotalDaReserva = DiariaCalculo.calculaTotal(dataInicio, dataFim)
        let valorTotalDaReservaComDesconto = DiariaCalculo.calculaTotal(dataInicio, dataFim)
        
        /**
         * Se o cliente estiver cadastrado e logado, será calculado o desconto nas diarias
         * O cliente que está fazendo a reserva será registrado no banco de dados com status registrado = false
        */
    
        let cliente = {}
        if(req.session.cliente){
            // O cliente está logado!
            cliente = await DAOCliente.getOne(req.session.cliente.cpf)
            if(!cliente){
                return res.render('erro', {mensagem: "Erro ao buscar cliente"})
            }
            // Aplica o desconto na reserva
            valorDiaria = valorTotalDaReservaComDesconto/dias
            valorTotalDaReserva = valorTotalDaReservaComDesconto
        } else {
            // O cliente não está logado!

            cliente = await DAOCliente.verificaSeClienteExiste(cpf)
            // console.log("Existe:",cliente,"cpf:",cpf);
            
            if(!cliente){ 
                console.log("Tentando inserir cliente sem cadastro...");
                cliente = await DAOCliente.insertClienteQueNaoQuerSeCadastrar(nome, cpf, telefone, email, cep, logradouro, complemento, localidade, numeroDaCasa)
                if(!cliente){
                    return res.render('erro', {mensagem: 'Erro ao criar cliente sem cadastro'})
                }  
            }
            // A diaria não recebe desconto
            valorDiaria = reboque.valorDiaria
        }
    
    
        // CHAMA A API DO SISTEMA DE PAGAMENTO
        let retorno;
        try{
            let data_vencimento = moment.tz( new Date(), 'America/Sao_Paulo' )
            data_vencimento = data_vencimento.format('YYYY-MM-DD')
    
            
    
            retorno = await criarCobranca(cliente.cpf, cliente.nome, telefone, email, valorTotalDaReserva, data_vencimento, dataInicio, dataFim, reboque.placa, formaPagamento)
        }catch(error){
            return res.render('erro', { mensagem: "Erro ao criar cobrança PIX."})
        }finally{
    
            // Adiciona 60 minutos como tempo de expiração da reservas caso não seja paga
            var dataExpiracao = moment.tz(new Date(), 'America/Sao_Paulo')
            dataExpiracao.add(60, 'minutes')
    
            // PAGAMENTO INSERT
            const codigoPagamento = await DAOPagamento.insert(retorno.id_cobranca, retorno.netValue, retorno.billingType, dataExpiracao)
            if(!codigoPagamento){
                return res.render('erro', { mensagem: "Erro ao criar pagamento."})
            }
    
            let situacaoReserva = 'AGUARDANDO_PAGAMENTO'
            if(formaPagamento == 'DINHEIRO'){
                situacaoReserva = 'AGUARDANDO_ACEITACAO'
            }
    
            // RESERVA INSERT
            const reserva = await DAOReserva.insert(dataInicio, dataFim, valorDiaria, dias, retorno.netValue, cliente.cpf, reboquePlaca, codigoPagamento, situacaoReserva)
            if(!reserva){
                return res.render('erro', {mensagem: 'Erro ao criar reserva.'})
            } else {
                // Marcar o formulário específico como enviado
                console.log("Marcando formulário como enviado...");
                req.session.submittedForms = req.session.submittedForms || [];
                req.session.submittedForms.push(formIdentifier);
    
                if(formaPagamento == 'PIX'){
                    return res.render('reserva/cliente/qrcode', {user: clienteNome(req, res), formaPagamento: formaPagamento, id_cobranca: retorno.id_cobranca, image: retorno.encodedImage, PIXCopiaECola: retorno.PIXCopiaECola, mensagem: ''})
                } else {
                    return res.render('reserva/cliente/sucesso', {user: clienteNome(req, res), formaPagamento: formaPagamento, mensagem: ""})
                }
                //res.redirect(`${retorno.invoiceUrl}`)
            }
    
        }
    
    }
    static async getDirecionaClienteParaSucesso(req, res){
        return res.render('reserva/cliente/sucesso', {user: clienteNome(req, res), formaPagamento: req.params.formaPagamento, mensagem: ""})    
    }


    static async getClienteListarReservas(req, res){
        let clienteCpf
        if(req.session.cliente && req.session.cliente.cpf){
            clienteCpf = req.session.cliente.cpf
        }
        let reservas = await DAOReserva.getAtivasDesteCliente(clienteCpf)
        if(reservas == ''){
            return res.render('reserva/cliente/lista', {user: clienteNome(req, res), reservas: reservas, mensagem: "Sua lista de reservas está vazia."})
        }
        return res.render('reserva/cliente/lista', {user: clienteNome(req, res), reservas: reservas, mensagem: ''})
    }
    static async getClienteDetalharReserva(req, res){
        let reserva = await DAOReserva.getOne(req.params.reservaId)
        return res.render('reserva/cliente/detalhe', {user: clienteNome(req, res), mensagem: '', reserva: reserva})
    }
    static async getClienteEditarReserva(req, res){
        let idReserva = req.params.idReserva

        const reserva = await DAOReserva.getOne(idReserva)

        console.log(`Situação da reserva: ${reserva.situacaoReserva}`);

        if (reserva.situacaoReserva == 'ANDAMENTO' || reserva.situacaoReserva == 'FINALIZADO' || reserva.situacaoReserva == 'CANCELADO') {
            return res.render('erro', {mensagem: "Erro ao obter detalhes da reserva."})
        }

        
        if(!reserva){
            return res.render('erro', {mensagem: "Erro ao obter reserva."})
        }
    
        let reboquePlaca = reserva.dataValues.reboquePlaca
    
        // NÃO PODE ALTERAR A DATA DE UMA RESERVA EM ANDAMENTO
        if(reserva.dataValues.situacaoReserva == 'ANDAMENTO'){
            return res.render('erro', {mensagem: "Erro. Não pode alterar a data de uma reserva em andamento."})
        }
        // console.log(reserva.dataValues.situacaoReserva);
        DAOReserva.getAtivasDesteReboque(reboquePlaca).then(reservas => {
            DAOReboque.getOne(reboquePlaca).then(reboque => {
                if(reboque){
                    return res.render('reserva/cliente/editar', {user: clienteNome(req, res), mensagem: "", reboque: reboque, reservas: reservas, reserva: reserva, idReserva: idReserva})
                } else {
                    return res.render('erro', {mensagem: "Erro ao mostrar reboque."})
                }
            })
        })
    }
    static async postClienteEditarReserva(req, res){
        try {
            let { idReserva, reboquePlaca, dataInicioAntiga, dataFimAntiga, dataInicioNova, dataFimNova, diarias, horaInicio, horaFim } = req.body;
    
    
            // PARSE PARA OBJETO MOMENT.TZ E CONVERTE PARA UTC
            dataInicioAntiga = moment.tz(new Date(dataInicioAntiga), 'America/Sao_Paulo');
            dataFimAntiga = moment.tz( new Date(dataFimAntiga), 'America/Sao_Paulo');
            dataInicioNova = moment.tz(dataInicioNova, 'America/Sao_Paulo');
            dataFimNova = moment.tz(dataFimNova, 'America/Sao_Paulo');
    
            // Injeta a hora na data de inicio
            dataInicioNova = moment.tz(dataInicioNova, 'America/Sao_Paulo').set({
                hour: horaInicio,
                minute: 0,
                second: 0,
                millisecond: 0
            });
    
            // Injeta a hora na data de fim
            dataFimNova = moment.tz(dataFimNova, 'America/Sao_Paulo').set({
                hour: horaFim,
                minute: 0,
                second: 0,
                millisecond: 0
            });
    
            
            // O MOMENTO DO PEDIDO DEVE SER MAIOR QUE 48 HORAS PARA FAZER A ALTERAÇÃO DA DATA DA RESERVA
            if (dataInicioAntiga.diff(moment.tz(new Date(), 'America/Sao_Paulo'), 'hours') < 0) {
                console.log("Tentativa de alteração de data da reserva negada. Menos de 48h.");
                return res.render('erro', { mensagem: 'Erro. Faltam menos de 48h para a retirada' });
            }
    
            // O PERÍODO NOVO NÃO PODE SER MAIOR QUE O ANTIGO
            if ((diarias * 24) !== dataFimNova.diff(dataInicioNova, 'hours')) {
                console.log("Tentativa de alteração de data da reserva negada. Período diferente.");
                return res.render('erro', { mensagem: 'Erro. O período deve ser o mesmo' });
            }
    
            // FORMATA AS DATAS PARA STRING PARA INSERIR NO BD
            dataInicioNova = dataInicioNova.format();
            dataFimNova = dataFimNova.format();
            
            // VERIFICA DISPONIBILIDADE
            let reservas = await DAOReserva.getVerificaDisponibilidade(reboquePlaca, dataInicioNova, dataFimNova); 
    
            // ENCONTROU UMA OU DUAS RESERVAS DENTRO DO PERÍODO ESCOLHIDO PELO CLIENTE
            if (reservas.length !== 0) {
                let autorizado = false;
    
                reservas.forEach(reserva => {
                    if (idReserva === reserva.dataValues.id) {
                        console.log("Alteração autorizada para nova data.");
                        autorizado = true;
                    }
                });
    
                if (!autorizado) {
                    console.log("Alteração não autorizada.");
                    return res.render('erro', { mensagem: 'Não foi possível alterar a data. Erro ao verificar disponibilidade' }); 
                }
            }
    
            // ACESSA O BANCO DE DADOS PARA REALIZAR A ALTERAÇÃO DAS DATAS
            let resposta = await DAOReserva.alterarPeriodo(idReserva, dataInicioNova, dataFimNova); 
            if (!resposta) {
                return res.render('erro', { mensagem: 'Erro ao alterar a data da reserva' });
            }
            console.log("Data da reserva alterada com sucesso.");
    
            // RETORNA A RESERVA ALTERADA AO CLIENTE
            let reserva = await DAOReserva.getOne(idReserva); 
            res.render('reserva/cliente/detalhe', { user: clienteNome(req, res), mensagem: '', reserva: reserva });
        } catch (error) {
            console.error("Erro ao alterar a data da reserva:", error);
            res.render('erro', { mensagem: 'Erro interno. Por favor, tente novamente mais tarde' });
        }
    }
    static async getClienteListarReservasConcluidas(req, res){
        let clienteCpf
        if(req.session.cliente && req.session.cliente.cpf){
            clienteCpf = req.session.cliente.cpf
        }
        let locacoes = await DAOReserva.getTodasDesteCliente(clienteCpf)
        console.log('Reservas erro:',locacoes);
        if(!locacoes){
            return res.render('erro', {mensagem: "Erro ao obter locações."})
        }
        return res.render('reserva/cliente/concluido', {user: clienteNome(req, res), mensagem: "", locacoes: locacoes})    
    }



    static async getAdminPainel(req, res){

        // await Login.admin(process.env.ADMIN_EMAIL_TESTE, process.env.ADMIN_SENHA_TESTE, req)

        let useragent = req.useragent

        const reservas = await DAOReserva.getAtivas();

        const dataJson = await Grafico.reservas()

        res.render('reserva/admin/painel', { user: adminNome(req, res), mensagem: '', dataJSON: dataJson, reservas: reservas, useragent: useragent });

    }
    static async postAdminAprovaPagamentoEmDinheiro(req, res){
        let {codigoPagamento, valor} = req.body

        let data_pagamento = moment.tz( new Date(), 'America/Sao_Paulo' )
        data_pagamento = data_pagamento.format('YYYY-MM-DD')
        
        const response = await receiveInCash(codigoPagamento, valor, data_pagamento)
        if(!response){
            return res.render('erro', {mensagem: 'Erro ao acessar recurso'})
        }
        await DAOReserva.atualizaSituacaoParaAprovado(codigoPagamento)
        
        return res.redirect('/reserva/admin/painel')    
    }
    static async getAdminSituacaoReserva(req, res){

        let idReserva = req.params.idReserva
        let situacao = req.params.situacao
        let resposta
        
        switch (situacao) {
            case 'APROVADO':
                resposta = await DAOReserva.atualizaSituacaoParaAndamento(idReserva)
                break
            case 'ANDAMENTO':
                resposta = await DAOReserva.atualizaSituacaoParaConcluido(idReserva)
                break
            default:
                return res.render('erro', {mensagem: "Erro ao atualizar situação da reserva"})
        }
    
        if(!resposta){
            return res.render('erro', {mensagem: "Erro ao atualizar situação da reserva"})
        }
    
        const reservas = await DAOReserva.getAtivas()
        if (!reservas) {
            return res.render('erro', { mensagem: "Erro na listagem de reservas." })
        }
        res.render('reserva/admin/painel', {user: adminNome(req, res), reservas: reservas, mensagem: "", dataJSON: await Grafico.reservas() })
    
    }



    static async getHistoricoReserva(req, res){
        DAOReserva.getRelatorioHistorico().then(reservas => {
            if (reservas) {
                res.render('reserva/admin/historico', {user: adminNome(req, res), reservas: reservas, mensagem: "" })
            } else {
                res.render('erro', { mensagem: "Erro na listagem do historico." })
            }
        })
    }
    static async postHistoricoReservas(req, res){
        let {dataInicio, dataFim} = req.body
        DAOReserva.getRelatorioHistorico(dataInicio, dataFim).then(reservas => {
            if(reservas){
                res.render('reserva/admin/historico', {user: adminNome(req, res), reservas: reservas})
            } else {
                res.render('erro', {mensagem: "Erro ao filtrar."})
            }
        })
    }
    static async getReceitaPeriodo(req, res){
        let reservas = await DAOReserva.getRelatorioLucro()
        if(reservas){
            let lucroTotal = await DAOReserva.getLucroTotal()
            res.render('reserva/admin/lucro', {user: adminNome(req, res), lucroTotal: lucroTotal, reservas: reservas, mensagem: ""})
        } else {
            res.render('erro', {mensagem: "Erro ao listar lucros."})
        }
    }
    static async postReceitaPeriodo(req, res){
        let {dataInicio, dataFim} = req.body
        let reservas = await DAOReserva.getRelatorioLucro(dataInicio, dataFim)
        // console.log("Reservas relatorio lucro: ", reservas.map(reserva => reserva.toJSON()));
        if(reservas){
            let lucroTotal = await DAOReserva.getLucroTotal(dataInicio, dataFim)
            res.render('reserva/admin/lucro', {user: adminNome(req, res), lucroTotal: lucroTotal, reservas: reservas})
        } else {
            res.render('erro', {mensagem: "Erro ao filtrar lucros."})
        }
    }

}


module.exports = ReservaController