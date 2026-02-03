// 固定 seed 用于确定性生成
const SEED = ['phaser3', 'obstacles', '2024'];

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: SEED,
  scene: {
    preload: preload,
    create: create
  }
};

// 全局信号对象
window.__signals__ = {
  seed: SEED.join('-'),
  obstacles: [],
  timestamp: Date.now()
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用配置的 seed 初始化随机数生成器
  this.game.config.seed = SEED;
  Phaser.Math.RND.sow(SEED);
  
  // 显示当前 seed
  const seedText = this.add.text(10, 10, `SEED: ${SEED.join('-')}`, {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  seedText.setDepth(100);
  
  // 显示标题
  const titleText = this.add.text(400, 50, 'Deterministic Obstacle Generation', {
    fontSize: '24px',
    color: '#ffff00',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 显示说明
  const infoText = this.add.text(400, 90, 'Same seed = Same layout (10 yellow obstacles)', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  infoText.setOrigin(0.5);
  
  // 生成区域边界
  const generateArea = {
    x: 50,
    y: 150,
    width: 700,
    height: 400
  };
  
  // 绘制生成区域边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0x666666, 1);
  borderGraphics.strokeRect(
    generateArea.x,
    generateArea.y,
    generateArea.width,
    generateArea.height
  );
  
  // 存储障碍物数据
  const obstacles = [];
  const obstacleCount = 10;
  
  // 生成 10 个黄色障碍物
  for (let i = 0; i < obstacleCount; i++) {
    // 使用 Phaser.Math.RND 生成确定性随机值
    const width = Phaser.Math.RND.between(40, 100);
    const height = Phaser.Math.RND.between(40, 100);
    
    // 确保障碍物完全在生成区域内
    const x = Phaser.Math.RND.between(
      generateArea.x + width / 2,
      generateArea.x + generateArea.width - width / 2
    );
    const y = Phaser.Math.RND.between(
      generateArea.y + height / 2,
      generateArea.y + generateArea.height - height / 2
    );
    
    // 创建障碍物 Graphics
    const obstacle = this.add.graphics();
    obstacle.fillStyle(0xffff00, 1); // 黄色
    obstacle.fillRect(-width / 2, -height / 2, width, height);
    
    // 添加边框
    obstacle.lineStyle(2, 0xffaa00, 1);
    obstacle.strokeRect(-width / 2, -height / 2, width, height);
    
    obstacle.setPosition(x, y);
    
    // 添加障碍物编号
    const label = this.add.text(x, y, `${i + 1}`, {
      fontSize: '16px',
      color: '#000000',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
    
    // 保存障碍物数据
    const obstacleData = {
      id: i + 1,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      width: width,
      height: height
    };
    obstacles.push(obstacleData);
  }
  
  // 更新全局信号
  window.__signals__.obstacles = obstacles;
  window.__signals__.obstacleCount = obstacleCount;
  window.__signals__.generateArea = generateArea;
  
  // 显示障碍物统计
  const statsText = this.add.text(10, 560, 
    `Generated ${obstacleCount} obstacles | Check console for details`, {
    fontSize: '14px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 5, y: 3 }
  });
  
  // 输出到控制台
  console.log('=== Deterministic Obstacle Generation ===');
  console.log('Seed:', SEED.join('-'));
  console.log('Obstacles:', JSON.stringify(obstacles, null, 2));
  console.log('Signals:', window.__signals__);
  
  // 添加重新生成按钮（使用相同 seed 验证确定性）
  const regenButton = this.add.text(650, 560, 'Verify (Reload)', {
    fontSize: '14px',
    color: '#ffffff',
    backgroundColor: '#0066cc',
    padding: { x: 10, y: 5 }
  });
  regenButton.setInteractive({ useHandCursor: true });
  regenButton.on('pointerdown', () => {
    location.reload();
  });
  
  regenButton.on('pointerover', () => {
    regenButton.setBackgroundColor('#0088ff');
  });
  
  regenButton.on('pointerout', () => {
    regenButton.setBackgroundColor('#0066cc');
  });
}

// 启动游戏
new Phaser.Game(config);