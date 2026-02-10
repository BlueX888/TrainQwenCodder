class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.currentSeed = 12345; // 固定种子，可修改测试
    this.obstacles = [];
    this.obstacleCount = 12;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 创建蓝色障碍物纹理
    this.createObstacleTexture();

    // 生成 12 个障碍物
    this.generateObstacles();

    // 显示当前 seed
    this.displaySeedInfo();

    // 添加重置按钮说明
    const instructionText = this.add.text(10, 60, 'Press SPACE to regenerate with new seed\nPress R to reset with same seed', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 键盘事件
    this.input.keyboard.on('keydown-SPACE', () => {
      this.currentSeed = Math.floor(Math.random() * 1000000);
      this.scene.restart();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    // 验证状态信号
    this.obstacleData = this.obstacles.map(obs => ({
      x: obs.x,
      y: obs.y,
      width: obs.displayWidth,
      height: obs.displayHeight
    }));

    console.log('Seed:', this.currentSeed);
    console.log('Obstacle positions:', this.obstacleData);
  }

  createObstacleTexture() {
    const graphics = this.add.graphics();
    
    // 绘制蓝色矩形
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillRect(0, 0, 60, 60);
    
    // 添加边框使其更明显
    graphics.lineStyle(2, 0x0044cc, 1);
    graphics.strokeRect(0, 0, 60, 60);
    
    // 生成纹理
    graphics.generateTexture('obstacle', 60, 60);
    graphics.destroy();
  }

  generateObstacles() {
    const padding = 80; // 边界留白
    const minWidth = 40;
    const maxWidth = 100;
    const minHeight = 40;
    const maxHeight = 100;

    for (let i = 0; i < this.obstacleCount; i++) {
      // 使用确定性随机数生成位置和尺寸
      const x = Phaser.Math.RND.between(padding, this.scale.width - padding);
      const y = Phaser.Math.RND.between(padding + 100, this.scale.height - padding);
      const width = Phaser.Math.RND.between(minWidth, maxWidth);
      const height = Phaser.Math.RND.between(minHeight, maxHeight);

      // 创建物理障碍物
      const obstacle = this.physics.add.sprite(x, y, 'obstacle');
      obstacle.setDisplaySize(width, height);
      obstacle.setImmovable(true);
      obstacle.body.setSize(width, height);
      
      // 添加标签显示序号
      const label = this.add.text(x, y, (i + 1).toString(), {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      this.obstacles.push(obstacle);
    }
  }

  displaySeedInfo() {
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示障碍物数量
    const countText = this.add.text(10, 40, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false // 设为 true 可查看物理边界
    }
  },
  scene: ObstacleScene,
  seed: ['12345'] // 初始种子
};

// 创建游戏实例
const game = new Phaser.Game(config);