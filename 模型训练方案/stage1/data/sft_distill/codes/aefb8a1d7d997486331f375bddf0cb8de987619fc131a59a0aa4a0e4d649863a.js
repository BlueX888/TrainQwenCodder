const SEED = 12345; // 固定种子，可修改此值验证确定性

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: [SEED], // 设置全局随机种子
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 游戏状态变量（可验证信号）
let obstacleCount = 0;
let currentSeed = SEED;
let seedText;
let statusText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 重新初始化随机数生成器，确保确定性
  this.game.config.seed = [currentSeed];
  Phaser.Math.RND.sow([currentSeed]);
  
  // 显示当前 seed
  seedText = this.add.text(10, 10, `Seed: ${currentSeed}`, {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  seedText.setDepth(100);
  
  // 显示障碍物数量状态
  statusText = this.add.text(10, 45, `Obstacles: 0/15`, {
    fontSize: '18px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setDepth(100);
  
  // 创建粉色障碍物纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 60, 60);
  graphics.generateTexture('obstacle', 60, 60);
  graphics.destroy();
  
  // 创建静态物理组用于障碍物
  const obstacles = this.physics.add.staticGroup();
  
  // 生成 15 个障碍物
  const OBSTACLE_COUNT = 15;
  const positions = []; // 存储已生成的位置，避免重叠
  
  obstacleCount = 0;
  
  for (let i = 0; i < OBSTACLE_COUNT; i++) {
    let x, y, width, height;
    let attempts = 0;
    let validPosition = false;
    
    // 尝试找到不重叠的位置
    while (!validPosition && attempts < 50) {
      // 使用 Phaser.Math.RND 生成确定性随机值
      x = Phaser.Math.RND.between(80, 720);
      y = Phaser.Math.RND.between(100, 520);
      width = Phaser.Math.RND.between(40, 80);
      height = Phaser.Math.RND.between(40, 80);
      
      // 检查是否与已有障碍物重叠
      validPosition = true;
      for (let pos of positions) {
        const dx = Math.abs(x - pos.x);
        const dy = Math.abs(y - pos.y);
        const minDist = (width + pos.width) / 2 + 20; // 增加间距
        
        if (dx < minDist && dy < minDist) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    }
    
    if (validPosition) {
      // 创建障碍物精灵
      const obstacle = obstacles.create(x, y, 'obstacle');
      obstacle.setDisplaySize(width, height);
      obstacle.setTint(0xff69b4); // 确保粉色
      obstacle.refreshBody(); // 更新物理体
      
      // 记录位置
      positions.push({ x, y, width, height });
      obstacleCount++;
      
      // 添加标签显示索引（用于验证确定性）
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      label.setDepth(10);
    }
  }
  
  // 更新状态文本
  statusText.setText(`Obstacles: ${obstacleCount}/15`);
  
  // 添加说明文本
  const instructions = this.add.text(400, 560, 
    'Press SPACE to regenerate with new seed | Press R to reset with same seed', 
    {
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center'
    }
  );
  instructions.setOrigin(0.5);
  
  // 添加键盘控制
  this.input.keyboard.on('keydown-SPACE', () => {
    currentSeed = Date.now() % 1000000; // 生成新种子
    this.scene.restart();
  });
  
  this.input.keyboard.on('keydown-R', () => {
    // 保持当前种子重新生成
    this.scene.restart();
  });
  
  // 输出验证信息到控制台
  console.log(`=== Obstacle Generation Report ===`);
  console.log(`Seed: ${currentSeed}`);
  console.log(`Obstacles Generated: ${obstacleCount}`);
  console.log(`Positions:`, positions.map((p, i) => 
    `#${i + 1}: (${Math.round(p.x)}, ${Math.round(p.y)}) ${Math.round(p.width)}x${Math.round(p.height)}`
  ));
}

function update(time, delta) {
  // 游戏循环（当前不需要更新逻辑）
}

// 启动游戏
new Phaser.Game(config);