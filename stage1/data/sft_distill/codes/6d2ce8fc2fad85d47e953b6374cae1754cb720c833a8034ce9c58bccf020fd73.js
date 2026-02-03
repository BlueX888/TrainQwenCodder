class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    this.flashCompleted = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化状态信号
    window.__signals__ = {
      flashStarted: false,
      flashCompleted: false,
      flashDuration: 500,
      timestamp: Date.now()
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建一些游戏对象作为视觉参考
    this.createGameObjects();

    // 添加文本提示
    const text = this.add.text(400, 50, 'Scene Flash Effect', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    const statusText = this.add.text(400, 100, 'Flash will start now...', {
      fontSize: '20px',
      color: '#ffff00'
    });
    statusText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 标记闪烁开始
    window.__signals__.flashStarted = true;

    // 执行闪烁效果
    // flash(duration, red, green, blue, force, callback, context)
    // 白色闪烁效果，持续 500ms
    camera.flash(500, 255, 255, 255, false, (cam, progress) => {
      // 闪烁完成回调
      if (progress === 1) {
        this.flashCompleted = true;
        window.__signals__.flashCompleted = true;
        window.__signals__.completedAt = Date.now();
        
        statusText.setText('Flash completed!');
        statusText.setColor('#00ff00');
        
        // 输出日志 JSON
        console.log(JSON.stringify({
          event: 'flash_completed',
          duration: 500,
          timestamp: Date.now()
        }));
      }
    });

    // 额外的验证：延迟检查确保闪烁已完成
    this.time.delayedCall(600, () => {
      if (this.flashCompleted) {
        console.log(JSON.stringify({
          event: 'verification_passed',
          flashCompleted: true,
          elapsed: Date.now() - window.__signals__.timestamp
        }));
      }
    });

    // 添加重播按钮
    this.createReplayButton();
  }

  createGameObjects() {
    // 创建一些彩色方块作为视觉参考
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
    
    for (let i = 0; i < 4; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(colors[i], 1);
      graphics.fillRect(0, 0, 100, 100);
      
      const x = 200 + (i % 2) * 250;
      const y = 250 + Math.floor(i / 2) * 150;
      
      graphics.setPosition(x, y);
      
      // 添加简单的浮动动画
      this.tweens.add({
        targets: graphics,
        y: y - 10,
        duration: 1000 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 创建中心圆形
    const circle = this.add.graphics();
    circle.fillStyle(0xa8e6cf, 1);
    circle.fillCircle(400, 350, 40);
    
    // 圆形旋转动画
    this.tweens.add({
      targets: circle,
      angle: 360,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    });
  }

  createReplayButton() {
    // 创建重播按钮
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4a5568, 1);
    buttonBg.fillRoundedRect(325, 500, 150, 50, 10);
    
    const buttonText = this.add.text(400, 525, 'Replay Flash', {
      fontSize: '18px',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    // 添加交互
    const hitArea = new Phaser.Geom.Rectangle(325, 500, 150, 50);
    buttonBg.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    buttonBg.on('pointerdown', () => {
      // 重置状态
      this.flashCompleted = false;
      window.__signals__.flashStarted = true;
      window.__signals__.flashCompleted = false;
      window.__signals__.timestamp = Date.now();
      
      // 再次执行闪烁
      this.cameras.main.flash(500, 255, 255, 255, false, (cam, progress) => {
        if (progress === 1) {
          this.flashCompleted = true;
          window.__signals__.flashCompleted = true;
          window.__signals__.completedAt = Date.now();
          
          console.log(JSON.stringify({
            event: 'flash_replayed',
            duration: 500,
            timestamp: Date.now()
          }));
        }
      });
    });

    // 按钮悬停效果
    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x5a6678, 1);
      buttonBg.fillRoundedRect(325, 500, 150, 50, 10);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x4a5568, 1);
      buttonBg.fillRoundedRect(325, 500, 150, 50, 10);
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FlashScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化日志
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: 800,
    height: 600,
    scene: 'FlashScene'
  },
  timestamp: Date.now()
}));