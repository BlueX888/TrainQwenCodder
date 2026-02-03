class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = ['phaser3', 'deterministic', 'obstacles'];
    this.obstacles = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    this.math.RND.sow(this.currentSeed);

    // 显示当前种子信息
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed.join(', ')}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 添加说明文本
    this.add.text(10, 50, 'Press SPACE to regenerate with new seed', {
      fontSize: '14px',
      color: '#cccccc'
    });

    this.add.text(10, 75, 'Press R to reset with original seed', {
      fontSize: '14px',
      color: '#cccccc'
    });

    // 生成 3 个青色障碍物
    this.generateObstacles();

    // 显示障碍物信息（可验证状态）
    this.displayObstacleInfo();

    // 添加键盘控制
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateWithNewSeed();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetWithOriginalSeed();
    });
  }

  generateObstacles() {
    // 清除之前的障碍物
    this.obstacles.forEach(obs => {
      if (obs.graphics) {
        obs.graphics.destroy();
      }
      if (obs.text) {
        obs.text.destroy();
      }
    });
    this.obstacles = [];

    // 生成 3 个障碍物的确定性布局
    for (let i = 0; i < 3; i++) {
      // 使用 RND.between 生成确定性的位置和尺寸
      const x = this.math.RND.between(100, 700);
      const y = this.math.RND.between(150, 500);
      const width = this.math.RND.between(60, 150);
      const height = this.math.RND.between(60, 150);

      // 创建 Graphics 对象绘制青色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00FFFF, 1); // 青色 (Cyan)
      graphics.fillRect(x, y, width, height);

      // 添加边框使障碍物更明显
      graphics.lineStyle(3, 0x00CCCC, 1);
      graphics.strokeRect(x, y, width, height);

      // 添加障碍物编号
      const label = this.add.text(x + width / 2, y + height / 2, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      // 存储障碍物信息作为可验证状态
      this.obstacles.push({
        id: i + 1,
        x: x,
        y: y,
        width: width,
        height: height,
        graphics: graphics,
        text: label
      });
    }
  }

  displayObstacleInfo() {
    // 清除之前的信息显示
    if (this.infoText) {
      this.infoText.destroy();
    }

    // 显示障碍物详细信息（可验证状态）
    let infoString = 'Obstacles Info:\n';
    this.obstacles.forEach(obs => {
      infoString += `#${obs.id}: pos(${obs.x}, ${obs.y}) size(${obs.width}x${obs.height})\n`;
    });

    this.infoText = this.add.text(10, 110, infoString, {
      fontSize: '12px',
      color: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 5 },
      lineSpacing: 2
    });
  }

  regenerateWithNewSeed() {
    // 生成新的随机种子
    const timestamp = Date.now();
    this.currentSeed = ['seed', timestamp.toString()];
    
    // 重新播种
    this.math.RND.sow(this.currentSeed);
    
    // 重新生成场景
    this.scene.restart();
  }

  resetWithOriginalSeed() {
    // 重置为原始种子
    this.currentSeed = ['phaser3', 'deterministic', 'obstacles'];
    
    // 重新播种
    this.math.RND.sow(this.currentSeed);
    
    // 重新生成场景
    this.scene.restart();
  }

  update(time, delta) {
    // 本例中无需更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: DeterministicObstaclesScene,
  // 设置全局随机种子
  seed: ['phaser3', 'deterministic', 'obstacles']
};

// 创建游戏实例
new Phaser.Game(config);