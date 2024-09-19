const DAOCliente = require('../database/DAOCliente')
const { adminNome, clienteNome } = require('../helpers/getSessionNome')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const ServiceEmail = require('../modules/ServiceEmail')


class ClienteController {

    static async getEntrar(req, res) {
        res.render('cliente/entrar', { user: clienteNome(req, res), mensagem: "" })
    }

    static async postEntrar(req, res) {
        let { email, senha } = req.body
        DAOCliente.login(email, senha).then(cliente => {
            if (cliente) {
                if (bcrypt.compareSync(senha, cliente.senha)) {
                    req.session.cliente = { cpf: cliente.cpf, nome: cliente.nome, email: cliente.email }
                    console.log(req.session.cliente.nome, "fez login...");
                    res.redirect('/')
                } else {

                    return res.render('cliente/entrar', { user: clienteNome(req, res), mensagem: 'Usuário ou senha inválidos.' })
                }
            } else {
                return res.render('cliente/entrar', { user: clienteNome(req, res), mensagem: 'Usuário ou senha inválidos.' })
            }
        })

    }

    static async getNovo(req, res) {
        res.render('cliente/novo', { user: clienteNome(req, res), mensagem: '' })
    }

    static async postNovo(req, res) {

        let { nome, email, senha, senhaRepita, cpf, telefone, dataNascimento, cep,
            logradouro, complemento, bairro, localidade, uf, numeroDaCasa } = req.body

        cpf = cpf.replace(/\D/g, '')
        telefone = telefone.replace(/\D/g, '')
        cep = cep.replace(/\D/g, '')

        if (senha.length < 8) {
            return res.render('erro', { mensagem: "Erro. Senha com menos de 8 dígitos." })
        }

        if (senha !== senhaRepita) {
            return res.render('erro', { mensagem: 'Erro. Senhas diferentes.' })
        }

        // Logica para criptografar a senha que será inserida no banco de dados
        let salt = bcrypt.genSaltSync(10)
        senha = bcrypt.hashSync(senha, salt)

        /**
         * Se o cliente já existe é feito um update em seus dados para ele se tornar cadastrado
         * aproveitando o mesmo id que ele usava
        */

        let cliente = await DAOCliente.verificaSeClienteExiste(cpf)
        if (cliente) {
            cliente = await DAOCliente.updateClienteComReservaMasNaoEraCadastrado(nome, email, senha, cpf, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
            if (!cliente) {
                return res.render('erro', { mensagem: 'Erro ao inserir cliente' })
            }
        } else {
            cliente = await DAOCliente.insert(nome, email, senha, cpf, telefone, dataNascimento, cep, logradouro, complemento, bairro, localidade, uf, numeroDaCasa)
            if (!cliente) {
                return res.render('erro', { mensagem: 'Erro ao inserir cliente' })
            }
        }

        if (cliente) {
            req.session.cliente = { cpf: cliente.cpf, nome: cliente.nome, email: cliente.email }
            console.log(cliente.nome, "criado...");
            return res.redirect('/')
        } else {
            return res.render('erro', { mensagem: 'Erro ao inserir cliente' })
        }
    }

    static async getSair(req, res) {
        console.log(req.session.cliente.nome, 'fez logout...');
        req.session.cliente = undefined
        res.redirect('/')
    }

    static async getExiste(req, res) {
        /**
         * USADO PARA CONSULTAR PELO CPF DO CLIENTE QUE SERÁ CRIADO E SE ELE EXISTIR PREENCHER 
         * OS CAMPOS DE INPUTS DA PÁGINA DE CADASTRO DE CLIENTE
        */
        let cpf = req.params.cpf
        DAOCliente.verificaSeClienteExiste(cpf).then(cliente => {
            if (cliente) {
                res.json(cliente);
            }

        })
    }

    static async getLista(req, res) {

        const clientes = await DAOCliente.getAll()
        if (!clientes) {
            return res.render('erro', { mensagem: "Erro na listagem de clientes." })
        }
        return res.render('cliente/admin/lista', { user: adminNome(req, res), clientes: clientes, mensagem: '' })

    }

    static async getRecuperaSenha(req, res) {
        return res.render('cliente/recuperaSenha', { user: clienteNome(req, res), mensagem: '' })
    }

    static async postRecuperaSenha(req, res) {

        let { email } = req.body

        // Verificar se o email existe no banco de dados
        const cliente = await DAOCliente.getOneByEmail(email)
        if (!cliente) {
            return res.render('cliente/recuperaSenha', { mensagem: 'Este e-mail não existe!', user: clienteNome(req, res) })
        }

        // Gerar um token único para o usuário
        const token = crypto.randomBytes(32).toString('hex');

        // Definir o prazo de validade do token (por exemplo, 1 hora)
        const tokenExpiry = Date.now() + 3600000; // 1 hora em milissegundos

        // Salvar o token e o prazo de validade no banco de dados
        cliente.resetPasswordToken = token
        cliente.resetPasswordExpires = tokenExpiry
        await DAOCliente.save(cliente)

        // Enviar o email para o usuário com o link de redefinição de senha
        const resetUrl = `https://7bfb-179-105-28-196.ngrok-free.app/cliente/redefine-senha/${token}`;
        const dadosEmail = {
            'clienteEmail': email,
            'resetUrl': resetUrl
        }
        await ServiceEmail.resetPassword(dadosEmail)

        return res.render('cliente/recuperaSenha', { mensagem: 'E-mail enviado com sucesso!', user: clienteNome(req, res) })

    }

    static async getRedefineSenha(req, res) {
        let { token } = req.params

        // Encontrar o usuário pelo token e verificar se ele não expirou
        const cliente = await DAOCliente.getOneByToken(token)
        if (!cliente) {
            return res.render('erro', { mensagem: "Token expirado!" })
        }

        return res.render('cliente/redefineSenha', { user: clienteNome(req, res), mensagem: "", token: token })
    }

    static async postRedefineSenha(req, res) {
        let { token, senha, senhaRepita } = req.body

        if (senha.length < 8) {
            return res.render('erro', { mensagem: "Erro. Senha com menos de 8 dígitos." })
        }

        if (senha !== senhaRepita) {
            return res.render('erro', { mensagem: 'Erro. Senhas diferentes.' })
        }

        // Encontrar o usuário pelo token e verificar se ele não expirou
        const cliente = await DAOCliente.getOneByToken(token)
        if (!cliente) {
            return res.render('erro', { mensagem: "Token expirado!" })
        }

        // Atualizar a senha do usuário
        let salt = bcrypt.genSaltSync(10)
        cliente.senha = bcrypt.hashSync(senha, salt) // Criptografando a senha
        cliente.resetPasswordToken = null; // Invalida o token
        cliente.resetPasswordExpires = null;

        await DAOCliente.save(cliente)

        return res.render('cliente/redefineSenha', { user: clienteNome(req, res), mensagem: "Senha redefinida com sucesso!", token: '' })
        // return res.render('cliente/recuperaSenha', { user: clienteNome(req, res), mensagem: "Senha redefinida com sucesso", token: '' })
    }

}



module.exports = ClienteController
