const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  },
  seed: ['DETERMINISTIC_SEED_12345'] // 固定种子
};

// 全局信号对象，用于验证
window.__signals__ = {
  seed: 'DETERMINISTIC_SEED_12345',
  obstacles: [],
  timestamp: Date.now()
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  
  // 获取配置的 seed
  const seedValue = config.seed[0];
  
  // 设置随机数生成器的种子
  Phaser.Math.RND.sow([seedValue]);
  
  // 显示 seed 信息
  const seedText = scene.add.text(20, 20, `Seed: ${seedValue}`, {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 添加说明文字
  const infoText = scene.add.text(20, 50, 'Deterministic Obstacle Generation', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  
  // 生成 5 个黄色障碍物
  const obstacles = [];
  const obstacleCount = 5;
  const minSize = 40;
  const maxSize = 100;
  const padding = 50; // 边界留白
  
  for (let i = 0; i < obstacleCount; i++) {
    // 使用 Phaser.Math.RND 生成确定性随机数
    const width = Phaser.Math.RND.between(minSize, maxSize);
    const height = Phaser.Math.RND.between(minSize, maxSize);
    const x = Phaser.Math.RND.between(padding, config.width - padding - width);
    const y = Phaser.Math.RND.between(100 + padding, config.height - padding - height);
    
    // 创建 Graphics 对象绘制障碍物
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xFFD700, 1); // 黄色
    graphics.fillRect(x, y, width, height);
    
    // 添加边框使障碍物更明显
    graphics.lineStyle(3, 0xFFAA00, 1);
    graphics.strokeRect(x, y, width, height);
    
    // 添加障碍物编号
    const label = scene.add.text(x + width / 2, y + height / 2, `#${i + 1}`, {
      fontSize: '16px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5, 0.5);
    
    // 保存障碍物信息
    const obstacleData = {
      id: i + 1,
      x: x,
      y: y,
      width: width,
      height: height
    };
    obstacles.push(obstacleData);
    
    // 记录到 signals
    window.__signals__.obstacles.push(obstacleData);
  }
  
  // 添加重新生成按钮（使用相同 seed 验证确定性）
  const buttonGraphics = scene.add.graphics();
  buttonGraphics.fillStyle(0x4CAF50, 1);
  buttonGraphics.fillRoundedRect(20, config.height - 70, 200, 50, 10);
  
  const buttonText = scene.add.text(120, config.height - 45, 'Regenerate (Same Seed)', {
    fontSize: '14px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  buttonText.setOrigin(0.5, 0.5);
  
  // 创建交互区域
  const buttonZone = scene.add.zone(120, config.height - 45, 200, 50);
  buttonZone.setInteractive({ useHandCursor: true });
  
  buttonZone.on('pointerdown', () => {
    // 重新启动场景，验证确定性
    scene.scene.restart();
  });
  
  // 添加新 seed 按钮
  const newSeedButtonGraphics = scene.add.graphics();
  newSeedButtonGraphics.fillStyle(0x2196F3, 1);
  newSeedButtonGraphics.fillRoundedRect(240, config.height - 70, 150, 50, 10);
  
  const newSeedButtonText = scene.add.text(315, config.height - 45, 'New Seed', {
    fontSize: '14px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  newSeedButtonText.setOrigin(0.5, 0.5);
  
  const newSeedButtonZone = scene.add.zone(315, config.height - 45, 150, 50);
  newSeedButtonZone.setInteractive({ useHandCursor: true });
  
  newSeedButtonZone.on('pointerdown', () => {
    // 生成新的随机 seed
    const newSeed = 'SEED_' + Date.now();
    config.seed = [newSeed];
    window.__signals__.seed = newSeed;
    window.__signals__.obstacles = [];
    scene.scene.restart();
  });
  
  // 输出验证日志
  console.log('=== Deterministic Generation Verification ===');
  console.log('Seed:', seedValue);
  console.log('Obstacles:', JSON.stringify(obstacles, null, 2));
  console.log('Signals:', window.__signals__);
  
  // 添加统计信息显示
  const statsText = scene.add.text(config.width - 20, 20, 
    `Obstacles: ${obstacleCount}\nTotal Area: ${obstacles.reduce((sum, o) => sum + o.width * o.height, 0)}px²`, 
    {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'right'
    }
  );
  statsText.setOrigin(1, 0);
}

// 创建游戏实例
const game = new Phaser.Game(config);