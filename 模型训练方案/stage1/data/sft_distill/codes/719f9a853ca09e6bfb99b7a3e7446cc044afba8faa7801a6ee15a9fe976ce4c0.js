class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = 12345; // 默认 seed
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    this.add.rectangle(400, 300, 800, 600, 0x1a1a2e);

    // 创建紫色障碍物纹理
    this.createObstacleTexture();

    // 生成障碍物
    this.generateObstacles(this.currentSeed);

    // 显示 seed 信息
    this.seedText = this.add.text(20, 20, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 添加说明文字
    this.add.text(20, 60, 'Press R to regenerate with same seed', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    this.add.text(20, 85, 'Press N for new random seed', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    // 添加障碍物信息显示
    this.infoText = this.add.text(20, 550, '', {
      fontSize: '14px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    this.updateInfoText();

    // 键盘输入
    this.input.keyboard.on('keydown-R', () => {
      this.regenerateObstacles(this.currentSeed);
    });

    this.input.keyboard.on('keydown-N', () => {
      this.currentSeed = Math.floor(Math.random() * 1000000);
      this.regenerateObstacles(this.currentSeed);
    });

    // 添加状态验证变量
    this.obstacleCount = 5;
    this.layoutHash = this.calculateLayoutHash();
  }

  createObstacleTexture() {
    // 使用 Graphics 创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRect(0, 0, 100, 100);
    
    // 添加边框
    graphics.lineStyle(3, 0x8e44ad, 1);
    graphics.strokeRect(0, 0, 100, 100);
    
    // 添加内部装饰
    graphics.fillStyle(0x8e44ad, 0.5);
    graphics.fillRect(10, 10, 80, 80);
    
    graphics.generateTexture('obstacle', 100, 100);
    graphics.destroy();
  }

  generateObstacles(seed) {
    // 清除旧障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    // 设置随机种子
    Phaser.Math.RND.sow([seed]);

    // 生成 5 个障碍物
    for (let i = 0; i < 5; i++) {
      // 使用确定性随机数生成位置和尺寸
      const x = Phaser.Math.RND.between(100, 700);
      const y = Phaser.Math.RND.between(150, 500);
      const width = Phaser.Math.RND.between(60, 150);
      const height = Phaser.Math.RND.between(60, 150);
      const rotation = Phaser.Math.RND.between(0, 360) * Math.PI / 180;

      // 创建障碍物
      const obstacle = this.add.rectangle(x, y, width, height, 0x9b59b6);
      obstacle.setStrokeStyle(3, 0x8e44ad);
      obstacle.setRotation(rotation);

      // 添加阴影效果
      const shadow = this.add.rectangle(x + 5, y + 5, width, height, 0x000000, 0.3);
      shadow.setRotation(rotation);
      shadow.setDepth(-1);

      // 添加标签
      const label = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      // 存储障碍物信息
      this.obstacles.push({
        rect: obstacle,
        shadow: shadow,
        label: label,
        id: i + 1,
        x: Math.round(x),
        y: Math.round(y),
        width: width,
        height: height,
        rotation: Math.round(rotation * 180 / Math.PI)
      });
    }

    // 更新信息显示
    this.updateInfoText();
    this.layoutHash = this.calculateLayoutHash();
  }

  regenerateObstacles(seed) {
    this.currentSeed = seed;
    this.seedText.setText(`Seed: ${this.currentSeed}`);
    this.generateObstacles(seed);
  }

  updateInfoText() {
    let info = 'Obstacles:\n';
    this.obstacles.forEach(obs => {
      info += `#${obs.id}: pos(${obs.x},${obs.y}) size(${obs.width}x${obs.height}) rot(${obs.rotation}°)\n`;
    });
    this.infoText.setText(info);
  }

  calculateLayoutHash() {
    // 计算布局哈希值用于验证确定性
    let hash = 0;
    this.obstacles.forEach(obs => {
      hash += obs.x + obs.y + obs.width + obs.height + obs.rotation;
    });
    return hash;
  }

  update(time, delta) {
    // 可选：添加轻微的脉动效果来验证障碍物存在
    const pulse = Math.sin(time * 0.002) * 0.05 + 1;
    this.obstacles.forEach(obs => {
      obs.rect.setScale(pulse);
      obs.shadow.setScale(pulse);
    });
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  seed: [12345] // 设置全局固定 seed
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证变量
window.gameState = {
  getSeed: () => game.scene.scenes[0].currentSeed,
  getObstacleCount: () => game.scene.scenes[0].obstacleCount,
  getLayoutHash: () => game.scene.scenes[0].layoutHash,
  getObstacles: () => game.scene.scenes[0].obstacles.map(obs => ({
    id: obs.id,
    x: obs.x,
    y: obs.y,
    width: obs.width,
    height: obs.height,
    rotation: obs.rotation
  }))
};