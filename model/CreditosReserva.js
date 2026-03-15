const Sequelize = require('sequelize');
const conexao = require('../database/conexao.js');

const Reserva = require('./Reserva.js');
const Cliente = require('./Cliente.js');

const CreditosReserva = conexao.define('creditos_reserva', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reservaId: {
        type: Sequelize.STRING, 
        allowNull: false,
        references: {
            model: Reserva,
            key: 'id'
        }
    },
    clienteCpf: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
            model: Cliente,
            key: 'cpf'
        }
    },
    creditos: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});


// uma reserva tem um crédito associado
Reserva.hasOne(CreditosReserva, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CreditosReserva.belongsTo(Reserva, { foreignKey: 'reservaId' });

// um cliente pode ter muitos créditos de reserva
Cliente.hasMany(CreditosReserva, {
    foreignKey: 'clienteCpf',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
CreditosReserva.belongsTo(Cliente, { foreignKey: 'clienteCpf' });

CreditosReserva.sync({ force: false });

module.exports = CreditosReserva;