class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = null;
    this.obstacleCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 获取当前使用的 seed
    this.currentSeed = this.game.config.seed[0] || 'default';
    
    // 创建蓝色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.generateTexture('obstacleTexture', 60, 60);
    graphics.destroy();

    // 创建静态物理组用于障碍物
    const obstacles = this.physics.add.staticGroup();

    // 使用确定性随机生成 12 个障碍物位置
    const obstaclePositions = this.generateObstaclePositions(12);
    
    // 创建障碍物
    obstaclePositions.forEach(pos => {
      const obstacle = obstacles.create(pos.x, pos.y, 'obstacleTexture');
      obstacle.setOrigin(0.5, 0.5);
      obstacle.refreshBody();
      this.obstacleCount++;
    });

    // 显示 seed 信息
    this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    // 显示障碍物数量
    this.add.text(10, 45, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    // 添加提示信息
    this.add.text(400, 550, 'Press R to regenerate with new seed', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(100);

    // 添加键盘事件：按 R 键重新生成
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    // 绘制网格辅助线（可选，帮助可视化）
    this.drawGrid();
  }

  /**
   * 使用确定性随机生成障碍物位置
   * @param {number} count - 障碍物数量
   * @returns {Array} 位置数组
   */
  generateObstaclePositions(count) {
    const positions = [];
    const minDistance = 100; // 障碍物之间的最小距离
    const margin = 80; // 距离边界的最小距离
    const maxAttempts = 100; // 每个障碍物的最大尝试次数

    for (let i = 0; i < count; i++) {
      let attempts = 0;
      let validPosition = false;
      let x, y;

      while (!validPosition && attempts < maxAttempts) {
        // 使用 Phaser 的随机数生成器（基于 seed）
        x = Phaser.Math.RND.between(margin, 800 - margin);
        y = Phaser.Math.RND.between(margin, 600 - margin);

        // 检查是否与现有位置冲突
        validPosition = true;
        for (let pos of positions) {
          const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      // 如果找到有效位置，添加到数组
      if (validPosition) {
        positions.push({ x, y });
      } else {
        // 如果无法找到有效位置，使用网格布局作为后备
        const gridX = (i % 4) * 180 + 120;
        const gridY = Math.floor(i / 4) * 180 + 120;
        positions.push({ x: gridX, y: gridY });
      }
    }

    return positions;
  }

  /**
   * 绘制网格辅助线
   */
  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.3);

    // 绘制垂直线
    for (let x = 0; x <= 800; x += 100) {
      graphics.lineBetween(x, 0, x, 600);
    }

    // 绘制水平线
    for (let y = 0; y <= 600; y += 100) {
      graphics.lineBetween(0, y, 800, y);
    }
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
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene,
  // 设置固定 seed 以确保确定性生成
  seed: ['12345']  // 修改此值会生成不同的布局
};

const game = new Phaser.Game(config);

// 导出状态验证函数（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config, GameScene };
}