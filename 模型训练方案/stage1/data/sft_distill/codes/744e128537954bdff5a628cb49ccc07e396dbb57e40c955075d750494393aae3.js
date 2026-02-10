class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacles = [];
    this.currentSeed = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 获取配置中的 seed
    this.currentSeed = this.sys.game.config.seed[0] || 12345;
    
    // 使用 seed 初始化随机数生成器
    this.sys.game.config.seed = [this.currentSeed];
    Phaser.Math.RND.sow([this.currentSeed]);
    
    // 创建青色障碍物纹理
    this.createObstacleTexture();
    
    // 生成 8 个障碍物
    this.generateObstacles();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 添加背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    // 添加重置按钮提示
    const resetText = this.add.text(10, 560, 'Press R to regenerate with new seed', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 监听 R 键重新生成
    this.input.keyboard.on('keydown-R', () => {
      this.currentSeed = Date.now() % 100000;
      this.scene.restart();
    });
  }

  createObstacleTexture() {
    const graphics = this.add.graphics();
    
    // 绘制青色矩形障碍物
    graphics.fillStyle(0x00CED1, 1); // 青色
    graphics.fillRect(0, 0, 80, 80);
    
    // 添加边框
    graphics.lineStyle(3, 0x00FFFF, 1);
    graphics.strokeRect(0, 0, 80, 80);
    
    // 添加一些装饰线条
    graphics.lineStyle(2, 0x00FFFF, 0.5);
    graphics.lineBetween(10, 10, 70, 70);
    graphics.lineBetween(70, 10, 10, 70);
    
    // 生成纹理
    graphics.generateTexture('obstacle', 80, 80);
    graphics.destroy();
  }

  generateObstacles() {
    // 清空之前的障碍物
    this.obstacles = [];
    
    // 定义游戏区域边界
    const padding = 100;
    const minX = padding;
    const maxX = 800 - padding - 80;
    const minY = padding;
    const maxY = 600 - padding - 80;
    
    // 生成 8 个障碍物
    for (let i = 0; i < 8; i++) {
      // 使用确定性随机数生成位置
      const x = Phaser.Math.RND.between(minX, maxX);
      const y = Phaser.Math.RND.between(minY, maxY);
      
      // 随机生成缩放比例（0.7 到 1.3）
      const scale = Phaser.Math.RND.realInRange(0.7, 1.3);
      
      // 随机生成旋转角度
      const rotation = Phaser.Math.RND.angle();
      
      // 创建障碍物
      const obstacle = this.add.image(x, y, 'obstacle');
      obstacle.setScale(scale);
      obstacle.setRotation(rotation);
      
      // 添加发光效果
      obstacle.setTint(0x00FFFF);
      
      // 存储障碍物信息
      this.obstacles.push({
        sprite: obstacle,
        x: x,
        y: y,
        scale: scale,
        rotation: rotation,
        index: i
      });
      
      // 添加障碍物编号
      const label = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
    }
  }

  displaySeedInfo() {
    // 显示当前 seed
    const seedText = this.add.text(400, 30, `SEED: ${this.currentSeed}`, {
      fontSize: '32px',
      color: '#00FFFF',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    seedText.setOrigin(0.5);
    
    // 显示障碍物数量
    const countText = this.add.text(400, 70, `Obstacles: ${this.obstacles.length}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 5 }
    });
    countText.setOrigin(0.5);
    
    // 显示障碍物位置信息（用于验证确定性）
    let infoY = 110;
    this.obstacles.forEach((obs, index) => {
      if (index < 4) { // 只显示前 4 个的详细信息
        const info = this.add.text(10, infoY, 
          `#${index + 1}: X=${Math.round(obs.x)} Y=${Math.round(obs.y)} S=${obs.scale.toFixed(2)}`, {
          fontSize: '14px',
          color: '#00CED1',
          backgroundColor: '#000000',
          padding: { x: 5, y: 3 }
        });
        infoY += 25;
      }
    });
  }

  update(time, delta) {
    // 添加轻微的脉动效果（基于时间，确保确定性）
    this.obstacles.forEach((obs, index) => {
      const pulse = Math.sin(time * 0.001 + index) * 0.05 + 1;
      obs.sprite.setAlpha(pulse);
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  seed: [12345], // 固定初始 seed
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);