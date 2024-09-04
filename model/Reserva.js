const Sequelize = require('sequelize');
const conexao = require('../database/conexao.js');

const Cliente = require('./Cliente.js');
const Reboque = require('./Reboque.js');
const Pagamento = require('./Pagamento.js');

const Reserva = conexao.define('reserva', {
    id: { // O ID É COMPOSTO POR reboquePlaca + codigoPagamento, DAS MODELS REBOQUE E PAGAMENTO
        type: Sequelize.STRING,
        primaryKey: true,
        // autoIncrement: true
    },
    dataSaida: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    dataChegada: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    valorDiaria: {
        type: Sequelize.DOUBLE,
        allowNull: false,
    },
    diarias: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    reboquePlaca: { 
        type: Sequelize.STRING,
        allowNull: false,
        references: {
            model: Reboque,
            key: 'placa'
        }
    },
    situacao: { // 1 - AGUARDANDO_PAGAMENTO, 2 - ANDAMENTO, 3 - CONCLUIDA, 4 - CANCELADA, 5 - ADIADA
        type: Sequelize.STRING
    }
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['dataSaida', 'dataChegada', 'reboquePlaca']
        }
    ]
});

// Relações do modelo

// um cliente tem muitas locações
Cliente.hasMany(Reserva, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
// uma locação pertence a apenas um cliente
Reserva.belongsTo(Cliente);

// um reboque tem muitas locações
Reboque.hasMany(Reserva, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});
// uma locação pertence a apenas um reboque
Reserva.belongsTo(Reboque);

// RELACIONAMENTO 1:1
Pagamento.hasOne(Reserva, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Reserva.belongsTo(Pagamento);

// Sincronização dos modelos com o banco de dados
Cliente.sync({ force: false });
Reboque.sync({ force: false });
Pagamento.sync({ force: false });
Reserva.sync({ force: false });

module.exports = Reserva;
