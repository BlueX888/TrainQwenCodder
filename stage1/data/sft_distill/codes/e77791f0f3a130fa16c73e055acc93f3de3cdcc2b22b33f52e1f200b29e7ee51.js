class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacles = []; // 存储障碍物信息用于状态验证
    this.currentSeed = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 获取当前使用的 seed
    this.currentSeed = this.game.config.seed[0];
    
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 添加说明文本
    this.add.text(10, 50, 'Fixed seed generates 3 purple obstacles', {
      fontSize: '18px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示：相同 seed 会生成相同布局
    this.add.text(10, 85, 'Same seed = Same layout', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 生成 3 个紫色障碍物
    this.generateObstacles();

    // 显示障碍物信息用于验证
    this.displayObstacleInfo();

    // 添加重置按钮（使用相同 seed 重新生成）
    const resetButton = this.add.text(10, this.scale.height - 50, 'Press R to regenerate', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入：按 R 重新生成（使用相同 seed）
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });
  }

  generateObstacles() {
    // 清空之前的障碍物数据
    this.obstacles = [];

    // 定义游戏区域边界（留出边距）
    const margin = 100;
    const minX = margin;
    const maxX = this.scale.width - margin;
    const minY = 150;
    const maxY = this.scale.height - margin;

    // 生成 3 个障碍物
    for (let i = 0; i < 3; i++) {
      // 使用确定性随机数生成位置和大小
      const x = Phaser.Math.RND.between(minX, maxX);
      const y = Phaser.Math.RND.between(minY, maxY);
      const width = Phaser.Math.RND.between(60, 150);
      const height = Phaser.Math.RND.between(60, 150);

      // 创建 Graphics 对象绘制障碍物
      const graphics = this.add.graphics();
      
      // 设置紫色填充
      graphics.fillStyle(0x9933ff, 1);
      graphics.fillRect(x - width / 2, y - height / 2, width, height);

      // 添加边框
      graphics.lineStyle(3, 0xcc66ff, 1);
      graphics.strokeRect(x - width / 2, y - height / 2, width, height);

      // 添加障碍物编号
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5, 0.5);

      // 存储障碍物信息
      this.obstacles.push({
        id: i + 1,
        x: Math.round(x),
        y: Math.round(y),
        width: width,
        height: height,
        graphics: graphics,
        label: label
      });
    }
  }

  displayObstacleInfo() {
    // 显示障碍物详细信息用于验证确定性
    let infoText = 'Obstacles Info:\n';
    this.obstacles.forEach(obstacle => {
      infoText += `#${obstacle.id}: (${obstacle.x}, ${obstacle.y}) ${obstacle.width}x${obstacle.height}\n`;
    });

    this.add.text(this.scale.width - 300, 10, infoText, {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'left'
    });
  }

  update(time, delta) {
    // 本示例不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: ['12345'], // 固定 seed，相同 seed 会生成相同的障碍物布局
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证函数（可选，用于测试）
if (typeof window !== 'undefined') {
  window.getObstaclesState = function() {
    const scene = game.scene.scenes[0];
    return {
      seed: scene.currentSeed,
      obstacles: scene.obstacles.map(o => ({
        id: o.id,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height
      }))
    };
  };
}