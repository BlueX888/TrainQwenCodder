const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: [12345], // 固定 seed 确保确定性
  scene: {
    preload,
    create,
    update
  }
};

// 状态信号变量
let obstacleData = [];
let currentSeed = 12345;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用固定 seed 初始化随机数生成器
  this.game.config.seed = [currentSeed];
  Phaser.Math.RND.sow([currentSeed]);
  
  // 显示当前 seed
  const seedText = this.add.text(400, 30, `Seed: ${currentSeed}`, {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  seedText.setOrigin(0.5);
  
  // 添加说明文本
  const infoText = this.add.text(400, 70, 'Press SPACE to regenerate with new seed', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  infoText.setOrigin(0.5);
  
  // 清空障碍物数据
  obstacleData = [];
  
  // 生成 3 个紫色障碍物
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  
  for (let i = 0; i < 3; i++) {
    // 使用确定性随机生成位置和尺寸
    const x = Phaser.Math.RND.between(50, 700);
    const y = Phaser.Math.RND.between(150, 500);
    const width = Phaser.Math.RND.between(60, 150);
    const height = Phaser.Math.RND.between(60, 150);
    
    // 绘制障碍物
    graphics.fillRect(x, y, width, height);
    
    // 添加边框
    graphics.lineStyle(3, 0x8e44ad, 1);
    graphics.strokeRect(x, y, width, height);
    
    // 添加标签
    const label = this.add.text(x + width / 2, y + height / 2, `#${i + 1}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
    
    // 记录障碍物数据（状态信号）
    obstacleData.push({
      id: i + 1,
      x: x,
      y: y,
      width: width,
      height: height
    });
  }
  
  // 显示障碍物信息
  let infoY = 120;
  obstacleData.forEach(obstacle => {
    const detailText = this.add.text(20, infoY, 
      `Obstacle ${obstacle.id}: (${obstacle.x}, ${obstacle.y}) ${obstacle.width}x${obstacle.height}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    infoY += 25;
  });
  
  // 添加键盘输入处理
  this.input.keyboard.on('keydown-SPACE', () => {
    // 生成新的 seed
    currentSeed = Math.floor(Math.random() * 1000000);
    this.scene.restart();
  });
  
  // 添加提示：按 R 键使用特定 seed
  const resetText = this.add.text(400, 560, 'Press R to reset to seed 12345', {
    fontSize: '14px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  });
  resetText.setOrigin(0.5);
  
  this.input.keyboard.on('keydown-R', () => {
    currentSeed = 12345;
    this.scene.restart();
  });
  
  // 输出到控制台用于验证
  console.log('Current Seed:', currentSeed);
  console.log('Obstacle Data:', obstacleData);
}

function update(time, delta) {
  // 本场景无需每帧更新逻辑
}

// 创建游戏实例
new Phaser.Game(config);