class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = null;
    this.obstacles = [];
    this.obstacleCount = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置固定 seed（可以修改这个值来生成不同的布局）
    this.currentSeed = ['phaser', 'deterministic', '12345'];
    
    // 初始化随机数生成器
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);
    
    // 使用 Graphics 创建红色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
    
    // 生成 15 个障碍物
    this.obstacles = [];
    const obstaclePositions = [];
    
    for (let i = 0; i < 15; i++) {
      let x, y;
      let validPosition = false;
      let attempts = 0;
      
      // 确保障碍物不重叠（使用确定性随机）
      while (!validPosition && attempts < 100) {
        x = Phaser.Math.RND.between(50, 750);
        y = Phaser.Math.RND.between(100, 550);
        
        validPosition = true;
        for (let pos of obstaclePositions) {
          const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (distance < 60) {
            validPosition = false;
            break;
          }
        }
        attempts++;
      }
      
      // 创建障碍物
      const obstacle = this.add.image(x, y, 'obstacle');
      obstacle.setOrigin(0.5, 0.5);
      this.obstacles.push(obstacle);
      obstaclePositions.push({ x, y });
      
      // 添加障碍物编号
      const label = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5, 0.5);
    }
    
    this.obstacleCount = this.obstacles.length;
    
    // 显示 seed 信息
    const seedText = this.add.text(10, 10, `Seed: ${JSON.stringify(this.currentSeed)}`, {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setOrigin(0, 0);
    
    // 显示障碍物数量
    const countText = this.add.text(10, 45, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    countText.setOrigin(0, 0);
    
    // 添加说明文本
    const infoText = this.add.text(400, 580, 'Same seed = Same layout (deterministic generation)', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setOrigin(0.5, 1);
    
    // 添加边框
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(5, 5, 790, 590);
    
    // 验证确定性：输出障碍物位置哈希
    const positionHash = this.calculatePositionHash();
    console.log('Position Hash (for verification):', positionHash);
    console.log('Obstacle Count:', this.obstacleCount);
    console.log('Seed:', this.currentSeed);
  }

  update(time, delta) {
    // 无需每帧更新
  }
  
  // 计算位置哈希用于验证确定性
  calculatePositionHash() {
    let hash = 0;
    for (let obstacle of this.obstacles) {
      hash += Math.floor(obstacle.x) * 1000 + Math.floor(obstacle.y);
    }
    return hash;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  parent: 'game-container',
  scene: GameScene,
  seed: ['phaser', 'deterministic', '12345'] // 固定 seed
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证状态（可通过控制台访问）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    seed: scene.currentSeed,
    obstacleCount: scene.obstacleCount,
    obstacles: scene.obstacles.map(o => ({ x: Math.floor(o.x), y: Math.floor(o.y) })),
    positionHash: scene.calculatePositionHash()
  };
};

console.log('Game initialized. Call window.getGameState() to verify deterministic generation.');