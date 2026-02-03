// 确定性障碍物生成系统
class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.seed = 12345; // 固定种子，可修改此值测试不同布局
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化可验证信号
    window.__signals__ = {
      seed: this.seed,
      obstacles: [],
      timestamp: Date.now()
    };

    // 设置确定性随机种子
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed]);
    
    // 创建粉色障碍物纹理
    this.createObstacleTexture();
    
    // 生成 3 个确定性障碍物
    this.generateObstacles();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 添加重置按钮提示
    this.addResetHint();
    
    // 输出验证信息
    this.logObstacleData();
  }

  createObstacleTexture() {
    // 创建粉色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture('obstacle', 80, 80);
    graphics.destroy();
  }

  generateObstacles() {
    const config = {
      minX: 100,
      maxX: 700,
      minY: 100,
      maxY: 500,
      minWidth: 60,
      maxWidth: 120,
      minHeight: 60,
      maxHeight: 120
    };

    for (let i = 0; i < 3; i++) {
      // 使用确定性随机生成位置和尺寸
      const x = this.rnd.between(config.minX, config.maxX);
      const y = this.rnd.between(config.minY, config.maxY);
      const width = this.rnd.between(config.minWidth, config.maxWidth);
      const height = this.rnd.between(config.minHeight, config.maxHeight);
      
      // 创建障碍物
      const obstacle = this.createObstacle(x, y, width, height, i);
      this.obstacles.push(obstacle);
      
      // 记录到 signals
      window.__signals__.obstacles.push({
        id: i,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
  }

  createObstacle(x, y, width, height, id) {
    // 创建 Graphics 对象绘制粉色矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色 (Hot Pink)
    graphics.fillRect(0, 0, width, height);
    graphics.setPosition(x - width / 2, y - height / 2);
    
    // 添加边框
    graphics.lineStyle(3, 0xFF1493, 1); // 深粉色边框
    graphics.strokeRect(0, 0, width, height);
    
    // 添加 ID 标签
    const label = this.add.text(x, y, `#${id + 1}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5, 0.5);
    
    // 添加位置信息文本
    const posText = this.add.text(x, y + 25, `(${x}, ${y})`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#FFFFFF'
    });
    posText.setOrigin(0.5, 0.5);
    
    return {
      graphics: graphics,
      label: label,
      posText: posText,
      data: { id, x, y, width, height }
    };
  }

  displaySeedInfo() {
    // 显示当前 seed
    const seedText = this.add.text(400, 30, `Current Seed: ${this.seed}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FF69B4',
      fontStyle: 'bold',
      backgroundColor: '#000000',
      padding: { x: 15, y: 10 }
    });
    seedText.setOrigin(0.5, 0);
    
    // 添加说明文本
    const infoText = this.add.text(400, 70, 'Deterministic Generation - Same seed produces same layout', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    infoText.setOrigin(0.5, 0);
  }

  addResetHint() {
    // 添加操作提示
    const hintText = this.add.text(400, 570, 'Press SPACE to regenerate with new seed | Press R to reset', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#AAAAAA'
    });
    hintText.setOrigin(0.5, 1);
    
    // 添加键盘控制
    this.input.keyboard.on('keydown-SPACE', () => {
      this.seed = Math.floor(Math.random() * 100000);
      this.scene.restart();
    });
    
    this.input.keyboard.on('keydown-R', () => {
      this.seed = 12345; // 重置为初始种子
      this.scene.restart();
    });
  }

  logObstacleData() {
    // 输出验证日志
    console.log('=== Deterministic Obstacle Generation ===');
    console.log('Seed:', this.seed);
    console.log('Obstacles:', JSON.stringify(window.__signals__.obstacles, null, 2));
    console.log('Verification Hash:', this.calculateHash());
  }

  calculateHash() {
    // 简单哈希函数用于验证确定性
    const str = JSON.stringify(window.__signals__.obstacles);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  update(time, delta) {
    // 更新时间戳
    if (window.__signals__) {
      window.__signals__.updateTime = time;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ObstacleScene,
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

// 导出验证函数
window.verifyDeterminism = function(seed) {
  console.log(`Testing determinism with seed: ${seed}`);
  game.scene.scenes[0].seed = seed;
  game.scene.scenes[0].scene.restart();
  setTimeout(() => {
    console.log('Result:', window.__signals__);
  }, 100);
};