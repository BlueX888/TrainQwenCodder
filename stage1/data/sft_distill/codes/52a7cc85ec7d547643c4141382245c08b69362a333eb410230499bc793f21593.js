class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = ['phaser3', 'deterministic', 'layout'];
    this.obstacleCount = 0;
    this.obstacles = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 显示当前 seed 信息
    const seedText = this.add.text(20, 20, `Seed: ${this.currentSeed.join(', ')}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明文字
    const infoText = this.add.text(20, 60, 'Deterministic Layout - Same seed = Same obstacles', {
      fontSize: '14px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 生成 5 个粉色障碍物
    this.generateObstacles();

    // 显示障碍物数量
    const countText = this.add.text(20, 100, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '16px',
      color: '#ff69b4',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加重新生成按钮（使用相同 seed）
    const regenButton = this.add.text(20, 140, 'Regenerate (Same Seed)', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    regenButton.on('pointerdown', () => {
      this.scene.restart();
    });

    regenButton.on('pointerover', () => {
      regenButton.setBackgroundColor('#555555');
    });

    regenButton.on('pointerout', () => {
      regenButton.setBackgroundColor('#333333');
    });

    // 添加更改种子按钮
    const changeSeedButton = this.add.text(20, 180, 'Change Seed', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    changeSeedButton.on('pointerdown', () => {
      // 生成新的随机种子
      this.currentSeed = [
        'seed' + Math.floor(Math.random() * 10000),
        'test' + Math.floor(Math.random() * 10000)
      ];
      this.scene.restart();
    });

    changeSeedButton.on('pointerover', () => {
      changeSeedButton.setBackgroundColor('#555555');
    });

    changeSeedButton.on('pointerout', () => {
      changeSeedButton.setBackgroundColor('#333333');
    });

    // 显示障碍物详细信息
    this.displayObstacleInfo();
  }

  generateObstacles() {
    const graphics = this.add.graphics();
    
    // 定义粉色
    const pinkColor = 0xff69b4;
    
    // 游戏区域范围
    const minX = 250;
    const maxX = 750;
    const minY = 250;
    const maxY = 550;
    
    // 生成 5 个障碍物
    for (let i = 0; i < 5; i++) {
      // 使用确定性随机数生成位置和尺寸
      const x = Phaser.Math.RND.between(minX, maxX);
      const y = Phaser.Math.RND.between(minY, maxY);
      const width = Phaser.Math.RND.between(40, 120);
      const height = Phaser.Math.RND.between(40, 120);
      
      // 随机选择形状类型（0: 矩形, 1: 圆形）
      const shapeType = Phaser.Math.RND.between(0, 1);
      
      // 绘制障碍物
      graphics.fillStyle(pinkColor, 1);
      graphics.lineStyle(3, 0xff1493, 1);
      
      if (shapeType === 0) {
        // 矩形
        graphics.fillRect(x - width / 2, y - height / 2, width, height);
        graphics.strokeRect(x - width / 2, y - height / 2, width, height);
        
        this.obstacles.push({
          id: i + 1,
          type: 'Rectangle',
          x: x,
          y: y,
          width: width,
          height: height
        });
      } else {
        // 圆形
        const radius = Math.min(width, height) / 2;
        graphics.fillCircle(x, y, radius);
        graphics.strokeCircle(x, y, radius);
        
        this.obstacles.push({
          id: i + 1,
          type: 'Circle',
          x: x,
          y: y,
          radius: radius
        });
      }
      
      // 添加障碍物编号
      this.add.text(x, y, `#${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.obstacleCount++;
    }
  }

  displayObstacleInfo() {
    let infoY = 250;
    
    this.add.text(20, 220, 'Obstacle Details:', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.obstacles.forEach((obstacle) => {
      let info = `#${obstacle.id} ${obstacle.type} at (${Math.round(obstacle.x)}, ${Math.round(obstacle.y)})`;
      
      if (obstacle.type === 'Rectangle') {
        info += ` ${obstacle.width}x${obstacle.height}`;
      } else {
        info += ` r=${Math.round(obstacle.radius)}`;
      }
      
      this.add.text(30, infoY, info, {
        fontSize: '11px',
        color: '#ff69b4',
        backgroundColor: '#000000',
        padding: { x: 5, y: 2 }
      });
      
      infoY += 20;
    });
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: DeterministicObstaclesScene,
  seed: ['phaser3', 'deterministic', 'layout'] // 初始种子
};

// 创建游戏实例
const game = new Phaser.Game(config);