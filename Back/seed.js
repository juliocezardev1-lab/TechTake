// ========================================
// SCRIPT DE SEED - POPULAR BANCO COM PACOTES
// Executar: node Back/seed.js
// ========================================

const db = require('./models/db');

// Dados dos pacotes do catálogo
const pacotes = [
    {
        nome: 'Social Creator',
        configuracao_tecnica: 'FHD/4K (9:16), 12MP',
        destaque_servico: 'Agilidade total: Clips prontos para postar (Reels/TikTok)',
        investimento_min: 150,
        investimento_max: 200,
        descricao: 'Perfeito para criadores de conteúdo que precisam de agilidade total. Entregamos clips prontos para postar em redes sociais.'
    },
    {
        nome: 'Performance & Music',
        configuracao_tecnica: 'UHD 60FPS, Zoom 3X, 10X, Vídeo PRO',
        destaque_servico: 'Closes detalhados e controle de iluminação de palco',
        investimento_min: 250,
        investimento_max: 400,
        descricao: 'Ideal para eventos com performances musicais. Oferecemos closes detalhados e controle total de iluminação.'
    },
    {
        nome: 'Business & Profissional',
        configuracao_tecnica: 'UHD (4K), Fotos 50MP, Estabilizado',
        destaque_servico: 'Imagem cristalina para valorizar qualquer negócio ou marca',
        investimento_min: 550,
        investimento_max: 800,
        descricao: 'Para empresas e marcas que querem se destacar. Qualidade cinematográfica em 4K com fotos em alta resolução.'
    },
    {
        nome: 'Fine Art & Produto',
        configuracao_tecnica: 'Fotos 200MP, Vídeo 8K, Tripé',
        destaque_servico: 'Máxima definição para impressões e catálogos de luxo',
        investimento_min: 900,
        investimento_max: 1200,
        descricao: 'Para produtos de luxo e arte. Máxima definição em 8K com fotos em 200MP para impressões de grande formato.'
    },
    {
        nome: 'Eventos / Institucional',
        configuracao_tecnica: 'UHD 30/60FPS, Cobertura completa',
        destaque_servico: 'Edição narrativa de alto impacto para projetos completos',
        investimento_min: 1300,
        investimento_max: 2000,
        descricao: 'Para eventos e instituições. Cobertura completa com edição narrativa de alto impacto.'
    }
];

// Dados de pacotes com drone
const pacotes_drone = [
    {
        pacote_id: 2, // Performance & Music
        configuracao_tecnica: 'Drone Cam. 27mm',
        destaque_servico: '1 Vídeo de Drone',
        investimento: 200
    },
    {
        pacote_id: 3, // Business & Profissional
        configuracao_tecnica: 'Drone Cam. 27mm + Formatos de Gravação',
        destaque_servico: '2 Videos de Drone',
        investimento: 400
    },
    {
        pacote_id: 4, // Fine Art & Produto
        configuracao_tecnica: 'Drone Cam. 27mm + Cam. 70mm (3x) + Formatos de Gravação',
        destaque_servico: '2 Videos Normais + 1 Vídeo 3X',
        investimento: 600
    },
    {
        pacote_id: 5, // Eventos / Institucional
        configuracao_tecnica: 'Drone Cam. 27mm + Cam. 70mm (3x) + Formatos de Gravação',
        destaque_servico: '5 Videos Normais + 3 Videos 3X',
        investimento: 800
    }
];

// Função para inserir pacotes
function seedDatabase() {
    console.log('🚀 Iniciando seed do banco de dados...\n');

    // Inserir pacotes normais
    pacotes.forEach((pacote, index) => {
        db.run(
            `INSERT OR IGNORE INTO pacotes (nome, configuracao_tecnica, destaque_servico, investimento_min, investimento_max, descricao) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                pacote.nome,
                pacote.configuracao_tecnica,
                pacote.destaque_servico,
                pacote.investimento_min,
                pacote.investimento_max,
                pacote.descricao
            ],
            (err) => {
                if (err) {
                    console.error(`❌ Erro ao inserir pacote "${pacote.nome}":`, err.message);
                } else {
                    console.log(`✅ Pacote criado: ${pacote.nome}`);
                }
            }
        );
    });

    // Inserir pacotes com drone
    pacotes_drone.forEach((drone, index) => {
        db.run(
            `INSERT OR IGNORE INTO pacotes_drone (pacote_id, configuracao_tecnica, destaque_servico, investimento) 
             VALUES (?, ?, ?, ?)`,
            [
                drone.pacote_id,
                drone.configuracao_tecnica,
                drone.destaque_servico,
                drone.investimento
            ],
            (err) => {
                if (err) {
                    console.error(`❌ Erro ao inserir pacote drone para pacote_id ${drone.pacote_id}:`, err.message);
                } else {
                    console.log(`✅ Pacote drone criado para ID ${drone.pacote_id}`);
                }
            }
        );
    });

    // Criar usuário admin (senha será: admin@123)
    const bcrypt = require('bcrypt');
    const email = 'admin@buxaaudiovisual.com';

    // Verificar se admin já existe
    db.get('SELECT * FROM admin WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('❌ Erro ao verificar admin:', err.message);
        } else if (!row) {
            bcrypt.hash('Admin@2024!Secure', 10, (err, hash) => {
                if (err) {
                    console.error('❌ Erro ao hashear senha:', err.message);
                } else {
                    db.run(
                        `INSERT INTO admin (email, senha) VALUES (?, ?)`,
                        [email, hash],
                        (err) => {
                            if (err) {
                                console.error('❌ Erro ao criar admin:', err.message);
                            } else {
                                console.log(`✅ Admin criado: ${email}`);
                            }
                        }
                    );
                }
            });
        } else {
            console.log(`⚠️  Admin já existe: ${email}`);
        }
    });

    setTimeout(() => {
        console.log('\n✅ Seed concluído!');
        console.log('\n📋 Credenciais de Admin:');
        console.log('   Email: admin@buxaaudiovisual.com');
        console.log('   Senha: Admin@2024!Secure');
        console.log('\n🌐 Acesse: http://localhost:3000/admin-login\n');
        process.exit(0);
    }, 2000);
}

// Executar seed
seedDatabase();
