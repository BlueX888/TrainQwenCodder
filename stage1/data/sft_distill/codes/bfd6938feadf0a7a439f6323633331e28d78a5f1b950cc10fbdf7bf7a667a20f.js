// LoadingScene - 资源加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingComplete = false; // 可验证状态
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 创建进度文本
    const percentText = this.add.text(width / 2, height / 2 + 50, '0%', {
      fontSize: '24px',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 创建进度条背景（灰色）
    const progressBarBg = this.add.graphics();
    progressBarBg.fillStyle(0x222222, 0.8);
    progressBarBg.fillRect(width / 2 - 200, height / 2 - 15, 400, 30);

    // 创建进度条（蓝色）
    const progressBar = this.add.graphics();

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      // 清除之前的进度条
      progressBar.clear();
      
      // 绘制蓝色进度条
      progressBar.fillStyle(0x0088ff, 1);
      progressBar.fillRect(width / 2 - 200, height / 2 - 15, 400 * value, 30);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
    });

    // 监听加载完成事件
    this.load.on('complete', () => {
      this.loadingComplete = true;
      progressBar.destroy();
      progressBarBg.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟资源加载 - 创建虚拟纹理以触发加载进度
    // 使用Graphics生成多个纹理来模拟加载过程
    for (let i = 0; i < 10; i++) {
      const tempGraphics = this.add.graphics();
      tempGraphics.fillStyle(0xff0000, 1);
      tempGraphics.fillRect(0, 0, 64, 64);
      tempGraphics.generateTexture(`asset_${i}`, 64, 64);
      tempGraphics.destroy();
    }

    // 使用图片占位符模拟加载（Phaser会处理这些作为加载项）
    // 由于不依赖外部资源，我们使用base64占位图
    const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    for (let i = 0; i < 5; i++) {
      this.load.image(`placeholder_${i}`, placeholder);
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 显示加载完成信息
    const completeText = this.add.text(width / 2, height / 2, 'Loading Complete!', {
      fontSize: '28px',
      color: '#00ff00'
    });
    completeText.setOrigin(0.5, 0.5);

    // 延迟1秒后切换到主场景
    this.time.delayedCall(1000, () => {
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    // 可验证状态
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameStartTime = 0;
  }

  create() {
    this.gameStartTime = this.time.now;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 标题文本
    const titleText = this.add.text(width / 2, 80, 'Main Scene', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5, 0.5);

    // 状态显示面板
    const statusPanel = this.add.graphics();
    statusPanel.fillStyle(0x16213e, 0.8);
    statusPanel.fillRect(width / 2 - 200, 150, 400, 200);
    statusPanel.lineStyle(2, 0x0088ff, 1);
    statusPanel.strokeRect(width / 2 - 200, 150, 400, 200);

    // 显示可验证状态
    this.scoreText = this.add.text(width / 2, 180, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.scoreText.setOrigin(0.5, 0.5);

    this.levelText = this.add.text(width / 2, 220, `Level: ${this.level}`, {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.levelText.setOrigin(0.5, 0.5);

    this.healthText = this.add.text(width / 2, 260, `Health: ${this.health}`, {
      fontSize: '24px',
      color: '#00ff00'
    });
    this.healthText.setOrigin(0.5, 0.5);

    this.timeText = this.add.text(width / 2, 300, 'Time: 0s', {
      fontSize: '24px',
      color: '#ffaa00'
    });
    this.timeText.setOrigin(0.5, 0.5);

    // 创建一个简单的交互元素
    const interactiveBox = this.add.graphics();
    interactiveBox.fillStyle(0x0088ff, 1);
    interactiveBox.fillRect(width / 2 - 50, 400, 100, 50);
    
    const buttonText = this.add.text(width / 2, 425, 'Click Me!', {
      fontSize: '20px',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5, 0.5);

    // 创建交互区域
    const interactiveZone = this.add.zone(width / 2, 425, 100, 50);
    interactiveZone.setInteractive();

    interactiveZone.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
      
      // 每100分升一级
      if (this.score % 100 === 0 && this.score > 0) {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
      }
    });

    interactiveZone.on('pointerover', () => {
      interactiveBox.clear();
      interactiveBox.fillStyle(0x00aaff, 1);
      interactiveBox.fillRect(width / 2 - 50, 400, 100, 50);
    });

    interactiveZone.on('pointerout', () => {
      interactiveBox.clear();
      interactiveBox.fillStyle(0x0088ff, 1);
      interactiveBox.fillRect(width / 2 - 50, 400, 100, 50);
    });

    // 提示文本
    const hintText = this.add.text(width / 2, 500, 'Scene loaded successfully!\nClick the button to increase score', {
      fontSize: '16px',
      color: '#888888',
      align: 'center'
    });
    hintText.setOrigin(0.5, 0.5);
  }

  update(time, delta) {
    // 更新游戏时间
    const elapsedSeconds = Math.floor((time - this.gameStartTime) / 1000);
    this.timeText.setText(`Time: ${elapsedSeconds}s`);

    // 模拟健康值随时间缓慢恢复
    if (this.health < 100) {
      this.health = Math.min(100, this.health + delta * 0.01);
      this.healthText.setText(`Health: ${Math.floor(this.health)}`);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene] // 场景顺序：先加载LoadingScene
};

// 创建游戏实例
new Phaser.Game(config);