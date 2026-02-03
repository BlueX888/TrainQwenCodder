const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  },
  // 设置全局随机种子
  seed: ['obstacle-layout-seed-42']
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 固定 seed 确保确定性生成
  const seed = 42;
  
  // 重置随机数生成器，使用固定种子
  this.game.config.seed = [seed.toString()];
  Phaser.Math.RND.sow([seed.toString()]);
  
  // 障碍物配置
  const obstacleCount = 12;
  const obstacleWidth = 60;
  const obstacleHeight = 60;
  const purpleColor = 0x9b59b6; // 紫色
  
  // 边界留白
  const margin = 80;
  const minX = margin;
  const maxX = 800 - margin - obstacleWidth;
  const minY = margin + 50; // 顶部留空显示信息
  const maxY = 600 - margin - obstacleHeight;
  
  // 存储障碍物信息用于验证
  const obstacles = [];
  
  // 生成 12 个障碍物
  for (let i = 0; i < obstacleCount; i++) {
    // 使用 Phaser 的随机数生成器，确保确定性
    const x = Phaser.Math.RND.between(minX, maxX);
    const y = Phaser.Math.RND.between(minY, maxY);
    
    // 创建 Graphics 对象绘制紫色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(purpleColor, 1);
    graphics.fillRect(x, y, obstacleWidth, obstacleHeight);
    
    // 添加边框使障碍物更明显
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRect(x, y, obstacleWidth, obstacleHeight);
    
    // 在障碍物中心添加编号
    const centerX = x + obstacleWidth / 2;
    const centerY = y + obstacleHeight / 2;
    const label = this.add.text(centerX, centerY, (i + 1).toString(), {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
    
    // 记录障碍物信息
    obstacles.push({ id: i + 1, x, y });
  }
  
  // 显示 seed 信息
  const seedText = this.add.text(20, 20, `Seed: ${seed}`, {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 显示障碍物数量验证
  const countText = this.add.text(20, 60, `Obstacles: ${obstacles.length}/12`, {
    fontSize: '20px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 显示提示信息
  const infoText = this.add.text(400, 20, 'Same seed = Same layout', {
    fontSize: '18px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setOrigin(0.5, 0);
  
  // 添加重新生成按钮区域（点击屏幕底部）
  const buttonBg = this.add.graphics();
  buttonBg.fillStyle(0x444444, 1);
  buttonBg.fillRect(300, 550, 200, 40);
  
  const buttonText = this.add.text(400, 570, 'Click to regenerate', {
    fontSize: '16px',
    color: '#ffffff'
  });
  buttonText.setOrigin(0.5);
  
  // 添加交互区域
  const buttonZone = this.add.zone(400, 570, 200, 40);
  buttonZone.setInteractive();
  
  buttonZone.on('pointerdown', () => {
    // 重新加载场景以重新生成（相同 seed 会生成相同布局）
    this.scene.restart();
  });
  
  buttonZone.on('pointerover', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x666666, 1);
    buttonBg.fillRect(300, 550, 200, 40);
  });
  
  buttonZone.on('pointerout', () => {
    buttonBg.clear();
    buttonBg.fillStyle(0x444444, 1);
    buttonBg.fillRect(300, 550, 200, 40);
  });
  
  // 在控制台输出障碍物坐标用于验证确定性
  console.log('Obstacle positions (seed=' + seed + '):');
  obstacles.forEach(obs => {
    console.log(`  #${obs.id}: (${obs.x}, ${obs.y})`);
  });
  
  // 存储状态信号用于验证
  this.obstacleCount = obstacles.length;
  this.currentSeed = seed;
  this.obstaclePositions = obstacles;
}

// 创建游戏实例
new Phaser.Game(config);