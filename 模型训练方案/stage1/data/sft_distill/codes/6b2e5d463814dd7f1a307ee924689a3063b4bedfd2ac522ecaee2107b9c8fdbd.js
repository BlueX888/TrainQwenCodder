class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = 12345; // 固定种子
    this.obstacleCount = 0;
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机数生成器的种子，确保确定性
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 创建蓝色障碍物纹理
    this.createObstacleTexture();

    // 生成 12 个障碍物
    this.generateObstacles();

    // 显示 seed 信息
    this.displaySeedInfo();

    // 显示障碍物统计信息
    this.displayObstacleInfo();

    // 添加重新生成按钮说明
    this.add.text(10, 550, 'Press SPACE to regenerate with new seed', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 监听空格键重新生成
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateWithNewSeed();
    });
  }

  createObstacleTexture() {
    // 创建多种尺寸的蓝色障碍物纹理
    const sizes = [40, 60, 80];
    
    sizes.forEach(size => {
      const graphics = this.add.graphics();
      
      // 绘制蓝色矩形
      graphics.fillStyle(0x0066ff, 1);
      graphics.fillRect(0, 0, size, size);
      
      // 添加边框
      graphics.lineStyle(2, 0x0044cc, 1);
      graphics.strokeRect(0, 0, size, size);
      
      // 生成纹理
      graphics.generateTexture(`obstacle_${size}`, size, size);
      graphics.destroy();
    });
  }

  generateObstacles() {
    // 清除之前的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];
    this.obstacleCount = 0;

    const numObstacles = 12;
    const padding = 100; // 边界留白
    const minDistance = 100; // 障碍物之间最小距离

    for (let i = 0; i < numObstacles; i++) {
      let x, y, size;
      let validPosition = false;
      let attempts = 0;
      const maxAttempts = 50;

      // 尝试找到不重叠的位置
      while (!validPosition && attempts < maxAttempts) {
        // 使用确定性随机数生成位置
        x = Phaser.Math.RND.between(padding, 800 - padding);
        y = Phaser.Math.RND.between(padding, 600 - padding);
        
        // 随机选择尺寸
        const sizeIndex = Phaser.Math.RND.between(0, 2);
        size = [40, 60, 80][sizeIndex];

        // 检查与现有障碍物的距离
        validPosition = true;
        for (let obstacle of this.obstacles) {
          const distance = Phaser.Math.Distance.Between(
            x, y, 
            obstacle.x, obstacle.y
          );
          
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      // 创建障碍物
      const obstacle = this.add.sprite(x, y, `obstacle_${size}`);
      obstacle.setOrigin(0.5, 0.5);
      
      // 添加随机旋转角度（确定性）
      const rotation = Phaser.Math.RND.between(0, 360);
      obstacle.setAngle(rotation);

      // 存储障碍物信息
      obstacle.setData('size', size);
      obstacle.setData('index', i);

      this.obstacles.push(obstacle);
      this.obstacleCount++;

      // 添加交互效果
      obstacle.setInteractive();
      obstacle.on('pointerover', () => {
        obstacle.setTint(0x00ffff);
      });
      obstacle.on('pointerout', () => {
        obstacle.clearTint();
      });
    }
  }

  displaySeedInfo() {
    // 显示当前种子值
    if (this.seedText) {
      this.seedText.destroy();
    }

    this.seedText = this.add.text(10, 10, `Current Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  displayObstacleInfo() {
    // 显示障碍物统计信息
    if (this.infoText) {
      this.infoText.destroy();
    }

    this.infoText = this.add.text(10, 50, 
      `Obstacles Generated: ${this.obstacleCount}/12`, {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示障碍物位置信息（用于验证确定性）
    let positionsText = 'Positions (x,y):\n';
    this.obstacles.slice(0, 4).forEach((obs, i) => {
      positionsText += `#${i+1}: (${Math.round(obs.x)}, ${Math.round(obs.y)})\n`;
    });

    if (this.positionsText) {
      this.positionsText.destroy();
    }

    this.positionsText = this.add.text(10, 90, positionsText, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  regenerateWithNewSeed() {
    // 生成新的种子
    this.currentSeed = Math.floor(Math.random() * 1000000);
    
    // 重置随机数生成器
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 重新生成障碍物
    this.generateObstacles();
    
    // 更新显示信息
    this.displaySeedInfo();
    this.displayObstacleInfo();
  }

  update(time, delta) {
    // 可以在这里添加动画效果
    // 例如让障碍物轻微浮动
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  seed: ['12345'], // 初始种子
  scene: DeterministicObstaclesScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证
game.getObstacleCount = function() {
  const scene = game.scene.getScene('DeterministicObstaclesScene');
  return scene ? scene.obstacleCount : 0;
};

game.getCurrentSeed = function() {
  const scene = game.scene.getScene('DeterministicObstaclesScene');
  return scene ? scene.currentSeed : null;
};

game.getObstaclePositions = function() {
  const scene = game.scene.getScene('DeterministicObstaclesScene');
  if (!scene) return [];
  return scene.obstacles.map(obs => ({
    x: Math.round(obs.x),
    y: Math.round(obs.y),
    size: obs.getData('size'),
    angle: Math.round(obs.angle)
  }));
};