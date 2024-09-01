const Sequelize = require('sequelize');
const conexao = require('../database/conexao.js');

const Cliente = require('./Cliente.js');
const Reboque = require('./Reboque.js');
const Pagamento = require('./Pagamento.js');

const Reserva = conexao.define('reserva', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    // Definindo o campo reboqueId que será parte do índice único
    reboqueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Reboque,
            key: 'id'
        }
    },
    situacao: {
        type: Sequelize.TEXT
    }
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['dataSaida', 'dataChegada', 'reboqueId']
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
