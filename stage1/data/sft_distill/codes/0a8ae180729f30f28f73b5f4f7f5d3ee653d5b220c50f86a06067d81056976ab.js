// 固定 seed 用于确定性生成
const SEED = ['phaser3', 'deterministic', '12345'];

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  seed: SEED, // 设置固定种子
  scene: {
    preload: preload,
    create: create
  }
};

// 游戏状态变量（用于验证）
let gameState = {
  seed: SEED.join('-'),
  obstacleCount: 3,
  obstacles: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化随机数生成器，使用配置中的 seed
  const rng = new Phaser.Math.RandomDataGenerator(this.game.config.seed);
  
  // 存储障碍物数据
  const obstacles = [];
  
  // 生成 3 个青色障碍物
  for (let i = 0; i < 3; i++) {
    // 使用确定性随机数生成位置和尺寸
    const x = rng.between(100, 700);
    const y = rng.between(150, 500);
    const width = rng.between(80, 150);
    const height = rng.between(60, 120);
    
    // 创建障碍物图形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(x, y, width, height);
    
    // 添加边框使障碍物更明显
    graphics.lineStyle(3, 0x00cccc, 1);
    graphics.strokeRect(x, y, width, height);
    
    // 存储障碍物信息
    const obstacleData = {
      id: i + 1,
      x: x,
      y: y,
      width: width,
      height: height
    };
    obstacles.push(obstacleData);
    
    // 在障碍物上显示编号
    const label = this.add.text(x + width / 2, y + height / 2, `#${i + 1}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
  }
  
  // 更新游戏状态
  gameState.obstacles = obstacles;
  
  // 显示 Seed 信息
  const seedText = this.add.text(20, 20, `Seed: ${gameState.seed}`, {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#00ffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 显示障碍物详细信息
  let infoY = 60;
  this.add.text(20, infoY, 'Obstacles (Deterministic Layout):', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  infoY += 35;
  obstacles.forEach((obs, index) => {
    const info = `#${obs.id}: pos(${obs.x}, ${obs.y}) size(${obs.width}×${obs.height})`;
    this.add.text(20, infoY, info, {
      fontSize: '14px',
      fontFamily: 'Courier',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 3 }
    });
    infoY += 25;
  });
  
  // 显示提示信息
  this.add.text(400, 550, 'Same seed = Same layout (Refresh to verify)', {
    fontSize: '16px',
    fontFamily: 'Arial',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  }).setOrigin(0.5);
  
  // 在控制台输出状态用于验证
  console.log('Game State:', gameState);
  console.log('Obstacles generated with seed:', SEED);
  console.log('Obstacle details:', obstacles);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出游戏状态供外部验证
if (typeof window !== 'undefined') {
  window.gameState = gameState;
}