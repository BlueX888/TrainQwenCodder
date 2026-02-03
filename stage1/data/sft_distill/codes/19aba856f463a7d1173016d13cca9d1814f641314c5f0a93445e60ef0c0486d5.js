// LoadingScene - 显示加载进度
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
    this.loadingProgress = 0; // 状态信号：加载进度
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建进度条背景（深蓝色）
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222266, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 60);

    // 创建进度条填充（亮蓝色）
    const progressBar = this.add.graphics();

    // 添加加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 60, 'Loading...', {
      font: '24px Arial',
      color: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);

    // 添加百分比文本
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '20px Arial',
      color: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);

    // 监听加载进度事件
    this.load.on('progress', (value) => {
      this.loadingProgress = Math.floor(value * 100);
      percentText.setText(this.loadingProgress + '%');
      
      // 更新进度条
      progressBar.clear();
      progressBar.fillStyle(0x4444ff, 1);
      progressBar.fillRect(
        width / 4 + 10,
        height / 2 - 20,
        (width / 2 - 20) * value,
        40
      );
    });

    // 加载完成事件
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // 模拟加载一些虚拟资源（使用 Graphics 生成纹理）
    // 创建一些假的加载任务来演示进度条
    for (let i = 0; i < 10; i++) {
      // 使用 dataURL 模拟资源加载
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xff0000 + i * 0x001100, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.generateTexture(`asset_${i}`, 32, 32);
      graphics.destroy();
    }

    // 添加一些延迟来模拟真实的加载过程
    this.load.image('dummy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  }

  create() {
    // 显示加载完成信息
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const completeText = this.add.text(width / 2, height / 2, 'Loading Complete!', {
      font: '28px Arial',
      color: '#00ff00'
    });
    completeText.setOrigin(0.5, 0.5);

    // 延迟1.5秒后切换到主场景
    this.time.delayedCall(1500, () => {
      this.scene.start('MainScene', { loadProgress: this.loadingProgress });
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0; // 状态信号：分数
    this.level = 1; // 状态信号：关卡
    this.health = 100; // 状态信号：生命值
    this.loadedSuccessfully = false; // 状态信号：加载成功标志
  }

  init(data) {
    // 接收来自 LoadingScene 的数据
    if (data.loadProgress === 100) {
      this.loadedSuccessfully = true;
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示标题
    const titleText = this.add.text(width / 2, 80, 'Main Scene', {
      font: 'bold 36px Arial',
      color: '#ffffff'
    });
    titleText.setOrigin(0.5, 0.5);

    // 显示加载状态
    const statusText = this.add.text(width / 2, 140, 
      `Load Status: ${this.loadedSuccessfully ? 'SUCCESS' : 'FAILED'}`, {
      font: '20px Arial',
      color: this.loadedSuccessfully ? '#00ff00' : '#ff0000'
    });
    statusText.setOrigin(0.5, 0.5);

    // 创建状态面板
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0x333366, 0.9);
    panelGraphics.fillRoundedRect(width / 2 - 150, 200, 300, 150, 10);

    // 显示状态信号
    this.scoreText = this.add.text(width / 2, 230, `Score: ${this.score}`, {
      font: '22px Arial',
      color: '#ffff00'
    });
    this.scoreText.setOrigin(0.5, 0.5);

    this.levelText = this.add.text(width / 2, 270, `Level: ${this.level}`, {
      font: '22px Arial',
      color: '#00ffff'
    });
    this.levelText.setOrigin(0.5, 0.5);

    this.healthText = this.add.text(width / 2, 310, `Health: ${this.health}`, {
      font: '22px Arial',
      color: '#ff6666'
    });
    this.healthText.setOrigin(0.5, 0.5);

    // 创建一个可交互的按钮
    const button = this.add.graphics();
    button.fillStyle(0x4444ff, 1);
    button.fillRoundedRect(width / 2 - 100, 400, 200, 50, 10);
    button.setInteractive(
      new Phaser.Geom.Rectangle(width / 2 - 100, 400, 200, 50),
      Phaser.Geom.Rectangle.Contains
    );

    const buttonText = this.add.text(width / 2, 425, 'Increase Score', {
      font: '20px Arial',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5, 0.5);

    // 按钮点击事件
    button.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
      
      // 每100分升级
      if (this.score % 100 === 0) {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
      }
    });

    // 添加一些装饰性的粒子效果
    for (let i = 0; i < 5; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x00ffff, 0.6);
      particle.fillCircle(0, 0, 5);
      particle.setPosition(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(500, height - 50)
      );

      // 简单的浮动动画
      this.tweens.add({
        targets: particle,
        y: particle.y - 20,
        alpha: 0.2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        delay: i * 400
      });
    }

    // 添加说明文本
    const infoText = this.add.text(width / 2, height - 40, 
      'Click the button to increase score!', {
      font: '16px Arial',
      color: '#aaaaaa'
    });
    infoText.setOrigin(0.5, 0.5);

    console.log('MainScene created successfully');
    console.log(`Initial state - Score: ${this.score}, Level: ${this.level}, Health: ${this.health}`);
  }

  update(time, delta) {
    // 可选：添加健康值缓慢恢复逻辑
    if (this.health < 100 && time % 1000 < delta) {
      this.health = Math.min(100, this.health + 1);
      this.healthText.setText(`Health: ${this.health}`);
    }
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene]
};

// 创建游戏实例
const game = new Phaser.Game(config);