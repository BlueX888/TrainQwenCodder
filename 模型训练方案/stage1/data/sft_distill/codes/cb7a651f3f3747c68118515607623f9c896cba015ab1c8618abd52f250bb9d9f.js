// 确定性障碍物生成系统
class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.currentSeed = null;
    this.obstacleCount = 0;
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置固定 seed 以确保确定性生成
    this.currentSeed = ['phaser3', 'deterministic', 'seed'];
    this.game.config.seed = this.currentSeed;
    
    // 重新初始化随机数生成器
    Phaser.Math.RND.sow(this.currentSeed);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 生成 15 个障碍物
    this.generateObstacles(15);

    // 显示 seed 信息
    this.displaySeedInfo();

    // 显示障碍物统计信息
    this.displayStats();

    // 添加重新生成按钮提示
    this.addRegenerateHint();

    // 监听空格键重新生成（使用新的 seed）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateWithNewSeed();
    });

    // 监听 R 键重置为原始 seed
    this.input.keyboard.on('keydown-R', () => {
      this.resetToOriginalSeed();
    });
  }

  generateObstacles(count) {
    // 清除现有障碍物
    this.obstacles.forEach(obs => obs.destroy());
    this.obstacles = [];
    this.obstacleCount = 0;

    // 定义生成区域（留出边距）
    const margin = 50;
    const minWidth = 30;
    const maxWidth = 100;
    const minHeight = 30;
    const maxHeight = 100;

    // 生成障碍物
    for (let i = 0; i < count; i++) {
      // 使用 Phaser.Math.RND 生成确定性随机值
      const x = Phaser.Math.RND.between(margin, 800 - margin - maxWidth);
      const y = Phaser.Math.RND.between(margin, 600 - margin - maxHeight);
      const width = Phaser.Math.RND.between(minWidth, maxWidth);
      const height = Phaser.Math.RND.between(minHeight, maxHeight);

      // 创建障碍物
      const obstacle = this.add.graphics();
      obstacle.fillStyle(0xffffff, 1); // 白色
      obstacle.fillRect(x, y, width, height);

      // 添加边框以增强视觉效果
      obstacle.lineStyle(2, 0xcccccc, 1);
      obstacle.strokeRect(x, y, width, height);

      // 存储障碍物信息
      obstacle.setData('position', { x, y, width, height });
      obstacle.setData('index', i);

      this.obstacles.push(obstacle);
      this.obstacleCount++;
    }
  }

  displaySeedInfo() {
    // 显示当前 seed
    const seedText = this.add.text(20, 20, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    const seedString = Array.isArray(this.currentSeed) 
      ? this.currentSeed.join(', ') 
      : String(this.currentSeed);

    seedText.setText(`Current Seed: [${seedString}]`);
  }

  displayStats() {
    // 显示障碍物统计信息
    const statsText = this.add.text(20, 50, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    statsText.setText(`Obstacles Generated: ${this.obstacleCount} / 15`);

    // 显示详细位置信息（用于验证确定性）
    const detailText = this.add.text(20, 80, '', {
      fontSize: '12px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      wordWrap: { width: 760 }
    });

    let detailInfo = 'First 3 Obstacle Positions:\n';
    for (let i = 0; i < Math.min(3, this.obstacles.length); i++) {
      const pos = this.obstacles[i].getData('position');
      detailInfo += `#${i + 1}: (${Math.round(pos.x)}, ${Math.round(pos.y)}) ${Math.round(pos.width)}x${Math.round(pos.height)}\n`;
    }

    detailText.setText(detailInfo);
  }

  addRegenerateHint() {
    // 添加操作提示
    const hintText = this.add.text(20, 550, 
      'Press SPACE: Generate with new random seed\nPress R: Reset to original seed', 
      {
        fontSize: '14px',
        color: '#aaaaaa',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
  }

  regenerateWithNewSeed() {
    // 生成新的随机 seed
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    this.currentSeed = ['seed', timestamp, randomNum];
    
    // 重新启动场景
    this.scene.restart();
  }

  resetToOriginalSeed() {
    // 重置为原始 seed
    this.currentSeed = ['phaser3', 'deterministic', 'seed'];
    this.scene.restart();
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  seed: ['phaser3', 'deterministic', 'seed'], // 初始固定 seed
  scene: ObstacleScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    seed: scene.currentSeed,
    obstacleCount: scene.obstacleCount,
    obstacles: scene.obstacles.map(obs => obs.getData('position')),
    isValid: scene.obstacleCount === 15
  };
};

console.log('Deterministic Obstacle Generation System Initialized');
console.log('Use window.getGameState() to verify state');