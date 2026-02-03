// 固定 seed 配置
const FIXED_SEED = ['phaser3', 'deterministic', 'pink', 'obstacles'];

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: FIXED_SEED,
  scene: {
    preload: preload,
    create: create
  }
};

// 全局信号对象，用于验证确定性
window.__signals__ = {
  seed: FIXED_SEED.join('-'),
  obstacles: [],
  timestamp: Date.now()
};

function preload() {
  // 无需加载外部资源
}

function create() {
  const scene = this;
  
  // 确保使用配置的 seed
  scene.game.config.seed = FIXED_SEED;
  
  // 显示标题
  const titleText = scene.add.text(400, 30, 'Deterministic Obstacle Generation', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  titleText.setOrigin(0.5, 0.5);
  
  // 显示当前 seed
  const seedText = scene.add.text(400, 70, `Seed: ${FIXED_SEED.join('-')}`, {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffff00',
    align: 'center'
  });
  seedText.setOrigin(0.5, 0.5);
  
  // 提示信息
  const infoText = scene.add.text(400, 100, 'Same seed = Same layout every time', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#aaaaaa',
    align: 'center'
  });
  infoText.setOrigin(0.5, 0.5);
  
  // 生成 3 个粉色障碍物
  const obstacles = [];
  const obstacleCount = 3;
  const pinkColor = 0xff69b4; // 粉色
  
  // 使用 Phaser 的随机数生成器（基于 seed）
  const rnd = scene.game.config.seed ? Phaser.Math.RND : scene.game.config.seed;
  
  // 重置随机数生成器状态（确保每次运行结果一致）
  Phaser.Math.RND.init(FIXED_SEED);
  
  for (let i = 0; i < obstacleCount; i++) {
    // 使用确定性随机生成位置和尺寸
    const x = Phaser.Math.RND.between(100, 700);
    const y = Phaser.Math.RND.between(150, 500);
    const width = Phaser.Math.RND.between(60, 120);
    const height = Phaser.Math.RND.between(60, 120);
    
    // 创建 Graphics 对象绘制障碍物
    const graphics = scene.add.graphics();
    graphics.fillStyle(pinkColor, 1);
    graphics.fillRect(x - width / 2, y - height / 2, width, height);
    
    // 添加边框
    graphics.lineStyle(3, 0xffffff, 0.8);
    graphics.strokeRect(x - width / 2, y - height / 2, width, height);
    
    // 添加障碍物编号
    const labelText = scene.add.text(x, y, `#${i + 1}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    labelText.setOrigin(0.5, 0.5);
    
    // 记录障碍物信息
    const obstacleData = {
      id: i + 1,
      x: x,
      y: y,
      width: width,
      height: height
    };
    
    obstacles.push(obstacleData);
    
    // 显示坐标信息
    const coordText = scene.add.text(x, y + height / 2 + 20, 
      `(${x}, ${y})\n${width}x${height}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#cccccc',
      align: 'center'
    });
    coordText.setOrigin(0.5, 0);
  }
  
  // 输出到全局信号对象
  window.__signals__.obstacles = obstacles;
  
  // 显示验证信息
  const verifyText = scene.add.text(400, 560, 
    'Check console: window.__signals__.obstacles', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#00ff00',
    align: 'center'
  });
  verifyText.setOrigin(0.5, 0.5);
  
  // 输出到控制台用于验证
  console.log('=== Deterministic Generation Results ===');
  console.log('Seed:', window.__signals__.seed);
  console.log('Obstacles:', JSON.stringify(window.__signals__.obstacles, null, 2));
  console.log('========================================');
  
  // 添加重新生成按钮（验证确定性）
  const buttonBg = scene.add.graphics();
  buttonBg.fillStyle(0x4444ff, 1);
  buttonBg.fillRoundedRect(320, 520, 160, 40, 10);
  buttonBg.lineStyle(2, 0xffffff, 1);
  buttonBg.strokeRoundedRect(320, 520, 160, 40, 10);
  
  const buttonText = scene.add.text(400, 540, 'Regenerate', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  buttonText.setOrigin(0.5, 0.5);
  
  // 使按钮可交互
  buttonBg.setInteractive(
    new Phaser.Geom.Rectangle(320, 520, 160, 40),
    Phaser.Geom.Rectangle.Contains
  );
  
  buttonBg.on('pointerdown', () => {
    scene.scene.restart();
  });
  
  buttonBg.on('pointerover', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x6666ff, 1);
    buttonBg.fillRoundedRect(320, 520, 160, 40, 10);
    buttonBg.lineStyle(2, 0xffffff, 1);
    buttonBg.strokeRoundedRect(320, 520, 160, 40, 10);
  });
  
  buttonBg.on('pointerout', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x4444ff, 1);
    buttonBg.fillRoundedRect(320, 520, 160, 40, 10);
    buttonBg.lineStyle(2, 0xffffff, 1);
    buttonBg.strokeRoundedRect(320, 520, 160, 40, 10);
  });
}

// 启动游戏
new Phaser.Game(config);