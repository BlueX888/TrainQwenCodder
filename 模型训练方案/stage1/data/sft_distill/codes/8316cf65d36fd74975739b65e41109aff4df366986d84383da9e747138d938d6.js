class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    // 状态变量：用于验证闪烁效果
    this.flashComplete = false;
    this.flashStartTime = 0;
    this.flashDuration = 2000;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 记录闪烁开始时间
    this.flashStartTime = this.time.now;

    // 创建背景和一些可视化元素，以便观察闪烁效果
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);
    
    // 绘制一些装饰图形
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillCircle(200, 200, 50);
    
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(400, 150, 100, 100);
    
    graphics.fillStyle(0x2ecc71, 1);
    graphics.fillCircle(600, 400, 60);

    // 添加文本提示
    const text = this.add.text(400, 300, 'Scene Flash Effect', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    text.setOrigin(0.5);

    const statusText = this.add.text(400, 350, 'Flashing...', {
      fontSize: '24px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });
    statusText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 执行闪烁效果
    // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制效果, 回调函数, 回调上下文
    camera.flash(
      this.flashDuration,  // 持续2秒
      255,                 // 红色通道强度
      255,                 // 绿色通道强度
      255,                 // 蓝色通道强度
      false,               // 不强制中断其他效果
      (cam, progress) => {
        // 闪烁完成回调
        if (progress === 1) {
          this.flashComplete = true;
          statusText.setText('Flash Complete!');
          statusText.setColor('#00ff00');
          
          console.log('Flash effect completed');
          console.log('Duration:', this.time.now - this.flashStartTime, 'ms');
        }
      }
    );

    // 添加进度显示
    const progressText = this.add.text(400, 450, '', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    progressText.setOrigin(0.5);

    // 更新进度显示
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.flashComplete) {
          const elapsed = this.time.now - this.flashStartTime;
          const progress = Math.min((elapsed / this.flashDuration) * 100, 100);
          progressText.setText(`Progress: ${progress.toFixed(1)}%`);
        }
      },
      loop: true
    });

    // 添加重启按钮（点击屏幕重新触发闪烁）
    const restartText = this.add.text(400, 550, 'Click to restart flash', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);

    this.input.on('pointerdown', () => {
      if (this.flashComplete) {
        // 重置状态
        this.flashComplete = false;
        this.flashStartTime = this.time.now;
        statusText.setText('Flashing...');
        statusText.setColor('#ffff00');
        
        // 再次触发闪烁
        camera.flash(this.flashDuration, 255, 255, 255);
      }
    });

    // 输出状态信息到控制台
    console.log('Flash effect started');
    console.log('Duration:', this.flashDuration, 'ms');
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