class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = 12345; // 固定种子
    this.obstacles = []; // 存储障碍物信息用于验证
    this.obstacleCount = 15; // 障碍物数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    Phaser.Math.RND.sow([this.currentSeed]);

    // 显示当前种子值
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 显示障碍物数量
    const countText = this.add.text(10, 45, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    countText.setDepth(100);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 生成 15 个白色障碍物
    this.generateObstacles();

    // 显示障碍物位置信息（用于验证确定性）
    this.displayObstacleInfo();

    // 添加提示信息
    const infoText = this.add.text(400, 580, 'Press SPACE to regenerate with same seed', {
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center'
    });
    infoText.setOrigin(0.5, 1);

    // 按空格键重新生成（验证确定性）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.restart();
    });

    // 按 R 键使用新的随机种子
    this.input.keyboard.on('keydown-R', () => {
      this.currentSeed = Math.floor(Math.random() * 1000000);
      this.scene.restart();
    });

    // 添加按键提示
    const randomText = this.add.text(400, 560, 'Press R to use random seed', {
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center'
    });
    randomText.setOrigin(0.5, 1);
  }

  generateObstacles() {
    // 清空之前的障碍物数据
    this.obstacles = [];

    // 定义障碍物生成区域（避免与UI重叠）
    const minX = 50;
    const maxX = 750;
    const minY = 100;
    const maxY = 550;

    // 障碍物尺寸范围
    const minWidth = 30;
    const maxWidth = 100;
    const minHeight = 30;
    const maxHeight = 100;

    for (let i = 0; i < this.obstacleCount; i++) {
      // 使用确定性随机数生成位置和尺寸
      const width = Phaser.Math.Between(minWidth, maxWidth);
      const height = Phaser.Math.Between(minHeight, maxHeight);
      const x = Phaser.Math.Between(minX, maxX - width);
      const y = Phaser.Math.Between(minY, maxY - height);

      // 创建障碍物图形
      const obstacle = this.add.graphics();
      obstacle.fillStyle(0xffffff, 1); // 白色
      obstacle.fillRect(x, y, width, height);

      // 添加边框使障碍物更明显
      obstacle.lineStyle(2, 0xcccccc, 1);
      obstacle.strokeRect(x, y, width, height);

      // 存储障碍物信息
      this.obstacles.push({
        id: i,
        x: x,
        y: y,
        width: width,
        height: height
      });

      // 在障碍物上显示编号
      const label = this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '12px',
        color: '#000000',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5, 0.5);
    }
  }

  displayObstacleInfo() {
    // 显示前3个障碍物的详细信息用于验证确定性
    let infoY = 80;
    const infoText = this.add.text(10, infoY, 'First 3 obstacles (for verification):', {
      fontSize: '12px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    for (let i = 0; i < Math.min(3, this.obstacles.length); i++) {
      const obs = this.obstacles[i];
      infoY += 18;
      const detailText = this.add.text(10, infoY, 
        `#${obs.id + 1}: x=${obs.x}, y=${obs.y}, w=${obs.width}, h=${obs.height}`, {
        fontSize: '10px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 5, y: 2 }
      });
    }
  }

  update(time, delta) {
    // 不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: DeterministicObstaclesScene,
  // 关闭物理系统以提高性能（本例不需要物理）
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);